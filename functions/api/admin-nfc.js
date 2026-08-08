const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(v,max=200)=>String(v??'').trim().slice(0,max);
async function digest(v){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))}
async function authorized(request,env){const a=clean(request.headers.get('X-BIRX-Admin'),500),b=clean(env.TAG_ADMIN_TOKEN,500);if(!a||!b)return false;const[da,db]=await Promise.all([digest(a),digest(b)]);return da.length===db.length&&da.every((v,i)=>v===db[i])}
async function key(env){const secret=clean(env.NFC_MASTER_KEY,1000);if(!secret)throw new Error('NFC_MASTER_KEY_NOT_CONFIGURED');return crypto.subtle.importKey('raw',await digest(secret),{name:'AES-GCM'},false,['encrypt','decrypt'])}
const hex=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
const unhex=s=>new Uint8Array((s.match(/../g)||[]).map(x=>parseInt(x,16)));
async function encrypt(env,text){const iv=crypto.getRandomValues(new Uint8Array(12)),data=new TextEncoder().encode(text),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(env),data));return`${hex(iv)}.${hex(cipher)}`}
async function decrypt(env,value){const[ivHex,cipherHex]=String(value||'').split('.');if(!ivHex||!cipherHex)throw new Error('NFC_SECRET_INVALID');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unhex(ivHex)},await key(env),unhex(cipherHex));return new TextDecoder().decode(plain)}
async function setup(env){const cols=await env.DB.prepare('PRAGMA table_info(tags)').all(),names=new Set((cols.results||[]).map(x=>x.name));for(const[name,type]of[['nfc_uid','TEXT'],['nfc_secret','TEXT'],['nfc_protegida_em','TEXT']])if(!names.has(name))await env.DB.prepare(`ALTER TABLE tags ADD COLUMN ${name} ${type}`).run()}
async function credentials(env,tag){const saved=JSON.parse(await decrypt(env,tag.nfc_secret));const pwd=clean(saved.pwd,8).toUpperCase(),pack=clean(saved.pack,4).toUpperCase();if(!/^[0-9A-F]{8}$/.test(pwd)||!/^[0-9A-F]{4}$/.test(pack))throw new Error('NFC_SECRET_INVALID');return{pwd,pack}}
async function getTagByCode(env,codigo){return env.DB.prepare("SELECT codigo,ativada,nfc_secret,nfc_uid,nfc_protegida_em,COALESCE(preparo_status,'estoque') AS preparo_status FROM tags WHERE codigo=? LIMIT 1").bind(codigo).first()}
export async function onRequestPost({request,env}){
  if(!await authorized(request,env))return json({sucesso:false,mensagem:'Chave administrativa inválida.'},401);
  try{
    await setup(env);
    const body=await request.json().catch(()=>({})),acao=clean(body.acao,30);

    if(acao==='identificar-uid'){
      const uid=clean(body.uid,40).toUpperCase(),codigoNdef=clean(body.codigoNdef,40).toUpperCase(),urlNdef=clean(body.urlNdef,300),protegida=body.protegida===true;
      if(!uid)return json({sucesso:false,mensagem:'UID não informado pela gravadora.'},400);
      const tag=await env.DB.prepare("SELECT codigo,ativada,nfc_secret,nfc_uid,nfc_protegida_em,COALESCE(preparo_status,'estoque') AS preparo_status FROM tags WHERE UPPER(nfc_uid)=? LIMIT 1").bind(uid).first();
      if(tag){
        if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:`${tag.codigo} está ATIVADA. Não será zerada. Use Regravar NFC para substituir uma tag perdida.`},409);
        if(!tag.nfc_secret||!tag.nfc_protegida_em)return json({sucesso:false,mensagem:`${tag.codigo} não possui credenciais protegidas completas para zerar.`},409);
        const saved=await credentials(env,tag);
        return json({sucesso:true,modo:'vinculada',codigo:tag.codigo,uid:clean(tag.nfc_uid,40).toUpperCase(),status:tag.preparo_status,pwd:saved.pwd,pack:saved.pack,codigoNdef,urlNdef,protegida});
      }
      if(codigoNdef){
        const ndefTag=await getTagByCode(env,codigoNdef);
        if(ndefTag&&ndefTag.nfc_secret){
          const saved=await credentials(env,ndefTag);
          return json({sucesso:true,modo:'duplicada',codigo:ndefTag.codigo,uid,codigoNdef,urlNdef,protegida,pwd:saved.pwd,pack:saved.pack,uidOficial:clean(ndefTag.nfc_uid,40).toUpperCase(),ativada:Number(ndefTag.ativada)===1,mensagem:'A tag contém um código BIRX conhecido, mas este UID não é o vínculo oficial.'});
        }
      }
      return json({sucesso:true,modo:'orfa',uid,codigoNdef,urlNdef,protegida,mensagem:`UID ${uid} não está no banco. A gravadora poderá zerá-la somente se estiver sem proteção.`});
    }

    const codigo=clean(body.codigo,40).toUpperCase();
    if(!codigo)return json({sucesso:false,mensagem:'Código da tag inválido.'},400);
    const tag=await getTagByCode(env,codigo);
    if(!tag)return json({sucesso:false,mensagem:'Tag não encontrada.'},404);
    const url=`https://pets.birx.com.br/q/${encodeURIComponent(codigo)}`;

    if(acao==='preparar'){
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:'Uma tag já ativada não pode ser preparada por esta rotina.'},409);
      await key(env);let pwdHex,packHex;
      if(tag.nfc_secret){if(tag.nfc_protegida_em)return json({sucesso:false,mensagem:'Esta tag já foi gravada e protegida. Use Regravar NFC ou Zerar tag aproximada.'},409);const saved=await credentials(env,tag);pwdHex=saved.pwd;packHex=saved.pack;}
      else{pwdHex=hex(crypto.getRandomValues(new Uint8Array(4)));packHex=hex(crypto.getRandomValues(new Uint8Array(2)));const secret=await encrypt(env,JSON.stringify({pwd:pwdHex,pack:packHex}));await env.DB.prepare('UPDATE tags SET nfc_secret=? WHERE codigo=?').bind(secret,codigo).run();}
      return json({sucesso:true,modo:'gravar',codigo,url,pwd:pwdHex,pack:packHex});
    }
    if(acao==='regravar'){
      if(!tag.nfc_secret)return json({sucesso:false,mensagem:'Esta tag ainda não possui credencial NFC salva para regravação.'},409);
      const saved=await credentials(env,tag);return json({sucesso:true,modo:'regravar',codigo,url,pwd:saved.pwd,pack:saved.pack,uidAnterior:clean(tag.nfc_uid,40).toUpperCase(),ativada:Number(tag.ativada)===1});
    }
    if(acao==='confirmar-regravacao'){
      const uid=clean(body.uid,40).toUpperCase();if(!uid)return json({sucesso:false,mensagem:'UID não informado pela gravadora.'},400);
      if(Number(tag.ativada)===1)await env.DB.prepare('UPDATE tags SET nfc_uid=?,gravada_em=CURRENT_TIMESTAMP,nfc_protegida_em=CURRENT_TIMESTAMP WHERE codigo=?').bind(uid,codigo).run();
      else await env.DB.prepare("UPDATE tags SET nfc_uid=?,preparo_status='gravada',gravada_em=CURRENT_TIMESTAMP,testada_em=NULL,nfc_protegida_em=CURRENT_TIMESTAMP WHERE codigo=?").bind(uid,codigo).run();
      return json({sucesso:true,mensagem:'Regravação NFC confirmada.',uid});
    }
    if(acao==='confirmar-zero'){
      const uid=clean(body.uid,40).toUpperCase();if(!uid)return json({sucesso:false,mensagem:'UID não informado pela gravadora.'},400);
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:'Uma tag ativada não pode ser devolvida ao estoque por esta rotina.'},409);
      if(tag.nfc_uid&&clean(tag.nfc_uid,40).toUpperCase()!==uid)return json({sucesso:false,mensagem:'O UID zerado não corresponde ao vínculo cadastrado. O banco não foi alterado.'},409);
      await env.DB.prepare("UPDATE tags SET nfc_uid=NULL,nfc_secret=NULL,nfc_protegida_em=NULL,preparo_status='estoque',gravada_em=NULL,testada_em=NULL,vendida_em=NULL WHERE codigo=?").bind(codigo).run();
      return json({sucesso:true,mensagem:'Tag física zerada e código devolvido ao estoque.',uid});
    }
    if(acao==='confirmar'){
      const uid=clean(body.uid,40).toUpperCase();if(!uid)return json({sucesso:false,mensagem:'UID não informado pela gravadora.'},400);
      await env.DB.prepare("UPDATE tags SET nfc_uid=?,preparo_status='gravada',gravada_em=CURRENT_TIMESTAMP,testada_em=NULL,nfc_protegida_em=CURRENT_TIMESTAMP WHERE codigo=?").bind(uid,codigo).run();
      return json({sucesso:true,mensagem:'Gravação NFC confirmada.',uid});
    }
    return json({sucesso:false,mensagem:'Ação inválida.'},400);
  }catch(error){
    console.error('admin-nfc',error);
    if(String(error.message).includes('NFC_MASTER_KEY_NOT_CONFIGURED'))return json({sucesso:false,mensagem:'Configure o segredo NFC_MASTER_KEY na Cloudflare antes de gravar tags.'},503);
    if(String(error.message).includes('OperationError')||String(error.message).includes('NFC_SECRET_INVALID'))return json({sucesso:false,mensagem:'Não foi possível abrir a credencial desta tag com a NFC_MASTER_KEY atual.'},409);
    return json({sucesso:false,mensagem:'Não foi possível concluir a operação NFC.'},500);
  }
}
export async function onRequest(context){if(context.request.method==='POST')return onRequestPost(context);return json({sucesso:false,mensagem:'Método não permitido.'},405)}