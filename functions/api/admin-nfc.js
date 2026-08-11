import { adminAutorizado } from "../_lib/admin-auth.js";
import { registrarAuditoriaAdmin } from "../_lib/admin-audit.js";

const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(v,max=200)=>String(v??'').trim().slice(0,max);
async function digest(v){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))}
async function key(env){const secret=clean(env.NFC_MASTER_KEY,1000);if(!secret)throw new Error('NFC_MASTER_KEY_NOT_CONFIGURED');return crypto.subtle.importKey('raw',await digest(secret),{name:'AES-GCM'},false,['encrypt','decrypt'])}
const hex=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
const unhex=s=>new Uint8Array((s.match(/../g)||[]).map(x=>parseInt(x,16)));
async function encrypt(env,text){const iv=crypto.getRandomValues(new Uint8Array(12)),data=new TextEncoder().encode(text),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(env),data));return`${hex(iv)}.${hex(cipher)}`}
async function decrypt(env,value){const[ivHex,cipherHex]=String(value||'').split('.');if(!ivHex||!cipherHex)throw new Error('NFC_SECRET_INVALID');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unhex(ivHex)},await key(env),unhex(cipherHex));return new TextDecoder().decode(plain)}
async function setup(env){const cols=await env.DB.prepare('PRAGMA table_info(tags)').all(),names=new Set((cols.results||[]).map(x=>x.name));for(const[name,type]of[['nfc_uid','TEXT'],['nfc_secret','TEXT'],['nfc_protegida_em','TEXT']])if(!names.has(name))await env.DB.prepare(`ALTER TABLE tags ADD COLUMN ${name} ${type}`).run()}
export async function onRequestPost({request,env}){
  if(!await adminAutorizado(request,env))return json({sucesso:false,autenticado:false,mensagem:'Sessão administrativa inválida ou expirada.'},401);
  try{
    await setup(env);
    const body=await request.json().catch(()=>({})),acao=clean(body.acao,30),codigo=clean(body.codigo,40).toUpperCase();
    if(!codigo)return json({sucesso:false,mensagem:'Código da tag inválido.'},400);
    const tag=await env.DB.prepare('SELECT codigo,ativada,nfc_uid,nfc_secret,nfc_protegida_em FROM tags WHERE codigo=? LIMIT 1').bind(codigo).first();
    if(!tag)return json({sucesso:false,mensagem:'Tag não encontrada.'},404);
    if(acao==='preparar'){
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:'Uma tag já ativada não pode ser preparada por esta rotina.'},409);
      await key(env);
      let pwdHex,packHex,credencialNova=false;
      if(tag.nfc_secret){
        if(tag.nfc_protegida_em)return json({sucesso:false,mensagem:'Esta tag já foi gravada e protegida. Use a rotina de regravação.'},409);
        const saved=JSON.parse(await decrypt(env,tag.nfc_secret));
        pwdHex=clean(saved.pwd,8).toUpperCase();packHex=clean(saved.pack,4).toUpperCase();
      }else{
        pwdHex=hex(crypto.getRandomValues(new Uint8Array(4)));packHex=hex(crypto.getRandomValues(new Uint8Array(2)));
        const secret=await encrypt(env,JSON.stringify({pwd:pwdHex,pack:packHex}));
        await env.DB.prepare('UPDATE tags SET nfc_secret=? WHERE codigo=? AND ativada=0').bind(secret,codigo).run();credencialNova=true;
      }
      await registrarAuditoriaAdmin(env,request,{acao:'nfc.preparar',alvo:codigo,detalhes:{credencialNova}});
      return json({sucesso:true,codigo,url:`https://pets.birx.com.br/q/${encodeURIComponent(codigo)}`,pwd:pwdHex,pack:packHex});
    }
    if(acao==='confirmar'){
      const uid=clean(body.uid,40).toUpperCase();if(!uid)return json({sucesso:false,mensagem:'UID não informado pela gravadora.'},400);
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:'Uma tag ativada não pode ser alterada por esta rotina.'},409);
      const conflito=await env.DB.prepare('SELECT codigo FROM tags WHERE nfc_uid=? AND codigo<>? LIMIT 1').bind(uid,codigo).first();
      if(conflito)return json({sucesso:false,mensagem:'Este UID NFC já está associado a outra BIRX ID.'},409);
      const resultado=await env.DB.prepare("UPDATE tags SET nfc_uid=?,preparo_status='gravada',gravada_em=CURRENT_TIMESTAMP,nfc_protegida_em=CURRENT_TIMESTAMP WHERE codigo=? AND ativada=0").bind(uid,codigo).run();
      if(Number(resultado.meta?.changes||0)!==1)return json({sucesso:false,mensagem:'A tag não pôde ser confirmada.'},409);
      await registrarAuditoriaAdmin(env,request,{acao:'nfc.confirmar',alvo:codigo,detalhes:{uid,uidAnterior:tag.nfc_uid||null}});
      return json({sucesso:true,mensagem:'Gravação NFC confirmada.',uid});
    }
    return json({sucesso:false,mensagem:'Ação inválida.'},400);
  }catch(error){
    console.error('admin-nfc',error);
    if(String(error.message).includes('NFC_MASTER_KEY_NOT_CONFIGURED'))return json({sucesso:false,mensagem:'A gravação NFC está temporariamente indisponível.'},503);
    if(String(error.message).includes('OperationError')||String(error.message).includes('NFC_SECRET_INVALID'))return json({sucesso:false,mensagem:'Não foi possível abrir as credenciais NFC desta tag.'},409);
    return json({sucesso:false,mensagem:'Não foi possível concluir a preparação NFC.'},500);
  }
}
export async function onRequest(context){if(context.request.method==='POST')return onRequestPost(context);return json({sucesso:false,mensagem:'Método não permitido.'},405)}
