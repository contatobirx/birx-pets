const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(v,max=200)=>String(v??'').trim().slice(0,max);

async function digest(v){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))}
async function authorized(request,env){
  const supplied=clean(request.headers.get('X-BIRX-Writer'),500);
  const expected=clean(env.GRAVADORA_API_TOKEN,500);
  if(!supplied||!expected)return false;
  const[a,b]=await Promise.all([digest(supplied),digest(expected)]);
  return a.length===b.length&&a.every((v,i)=>v===b[i]);
}
async function key(env){
  const secret=clean(env.NFC_MASTER_KEY,1000);
  if(!secret)throw new Error('NFC_MASTER_KEY_NOT_CONFIGURED');
  return crypto.subtle.importKey('raw',await digest(secret),{name:'AES-GCM'},false,['encrypt','decrypt']);
}
const hex=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
const unhex=s=>new Uint8Array((s.match(/../g)||[]).map(x=>parseInt(x,16)));
async function encrypt(env,text){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=new TextEncoder().encode(text);
  const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(env),data));
  return `${hex(iv)}.${hex(cipher)}`;
}
async function decrypt(env,value){
  const[ivHex,cipherHex]=String(value||'').split('.');
  if(!ivHex||!cipherHex)throw new Error('NFC_SECRET_INVALID');
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unhex(ivHex)},await key(env),unhex(cipherHex));
  return new TextDecoder().decode(plain);
}
async function setup(env){
  const cols=await env.DB.prepare('PRAGMA table_info(tags)').all();
  const names=new Set((cols.results||[]).map(x=>x.name));
  for(const[name,type]of[['nfc_uid','TEXT'],['nfc_secret','TEXT'],['nfc_protegida_em','TEXT'],['preparo_status',"TEXT DEFAULT 'estoque'"],['gravada_em','TEXT'],['testada_em','TEXT'],['vendida_em','TEXT']]){
    if(!names.has(name))await env.DB.prepare(`ALTER TABLE tags ADD COLUMN ${name} ${type}`).run();
  }
}
async function credentials(env,tag){
  const saved=JSON.parse(await decrypt(env,tag.nfc_secret));
  const pwd=clean(saved.pwd,8).toUpperCase(),pack=clean(saved.pack,4).toUpperCase();
  if(!/^[0-9A-F]{8}$/.test(pwd)||!/^[0-9A-F]{4}$/.test(pack))throw new Error('NFC_SECRET_INVALID');
  return{pwd,pack};
}
async function prepareTag(env,tag){
  await key(env);
  let pwd,pack;
  if(tag.nfc_secret){
    const saved=await credentials(env,tag);pwd=saved.pwd;pack=saved.pack;
  }else{
    pwd=hex(crypto.getRandomValues(new Uint8Array(4)));
    pack=hex(crypto.getRandomValues(new Uint8Array(2)));
    const secret=await encrypt(env,JSON.stringify({pwd,pack}));
    await env.DB.prepare('UPDATE tags SET nfc_secret=? WHERE id=? AND nfc_secret IS NULL').bind(secret,tag.id).run();
    const current=await env.DB.prepare('SELECT nfc_secret FROM tags WHERE id=?').bind(tag.id).first();
    if(current?.nfc_secret!==secret){const saved=await credentials(env,current);pwd=saved.pwd;pack=saved.pack;}
  }
  return{sucesso:true,codigo:tag.codigo,url:`https://pets.birx.com.br/q/${encodeURIComponent(tag.codigo)}`,pwd,pack,modelo:tag.modelo||'nfc',lote:tag.lote||''};
}

export async function onRequestPost({request,env}){
  if(!env.GRAVADORA_API_TOKEN)return json({sucesso:false,mensagem:'Configure GRAVADORA_API_TOKEN na Cloudflare.'},503);
  if(!await authorized(request,env))return json({sucesso:false,mensagem:'Gravadora não autorizada.'},401);
  try{
    await setup(env);
    const body=await request.json().catch(()=>({}));
    const acao=clean(body.acao,30);

    if(acao==='status'){
      return json({sucesso:true,device:'BIRX-NFC-WIFI',api:'1.2'});
    }

    if(acao==='buscar-codigo'){
      const codigo=clean(body.codigo,40).toUpperCase();
      if(!codigo||!/^BIRX-\d{2}-\d+$/.test(codigo))return json({sucesso:false,mensagem:'Código BIRX inválido.'},400);
      const tag=await env.DB.prepare(`SELECT id,codigo,modelo,lote,nfc_secret,nfc_uid,nfc_protegida_em,
        COALESCE(preparo_status,'estoque') AS preparo_status,COALESCE(ativada,0) AS ativada
        FROM tags WHERE codigo=? LIMIT 1`).bind(codigo).first();
      if(!tag)return json({sucesso:false,mensagem:'Tag não encontrada.'},404);
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:'Esta tag já foi ativada.'},409);
      if(tag.preparo_status!=='estoque')return json({sucesso:false,mensagem:`${codigo} não está disponível em estoque. Status: ${tag.preparo_status}.`},409);
      if(!['nfc','nfc-identificacao'].includes(tag.modelo||'nfc'))return json({sucesso:false,mensagem:'Este código não pertence a uma Birx ID NFC.'},409);
      return json(await prepareTag(env,tag));
    }

    if(acao==='proxima'){
      const tag=await env.DB.prepare(`SELECT id,codigo,modelo,lote,nfc_secret,nfc_uid,nfc_protegida_em,
        COALESCE(preparo_status,'estoque') AS preparo_status
        FROM tags
        WHERE COALESCE(ativada,0)=0
          AND COALESCE(preparo_status,'estoque')='estoque'
          AND COALESCE(modelo,'nfc') IN ('nfc','nfc-identificacao')
        ORDER BY id ASC LIMIT 1`).first();
      if(!tag)return json({sucesso:false,mensagem:'Nenhuma tag NFC disponível em estoque.'},404);
      return json(await prepareTag(env,tag));
    }

    if(acao==='confirmar'){
      const codigo=clean(body.codigo,40).toUpperCase();
      const uid=clean(body.uid,40).toUpperCase();
      if(!codigo||!uid)return json({sucesso:false,mensagem:'Código ou UID não informado.'},400);
      const tag=await env.DB.prepare(`SELECT codigo,ativada,nfc_secret,nfc_uid,COALESCE(preparo_status,'estoque') AS preparo_status FROM tags WHERE codigo=? LIMIT 1`).bind(codigo).first();
      if(!tag)return json({sucesso:false,mensagem:'Código não encontrado.'},404);
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:'Esta tag já foi ativada.'},409);
      if(!tag.nfc_secret)return json({sucesso:false,mensagem:'A tag não possui credencial NFC reservada.'},409);
      if(tag.preparo_status!=='estoque'&&clean(tag.nfc_uid,40).toUpperCase()!==uid)return json({sucesso:false,mensagem:'Esta tag já foi confirmada com outro UID.'},409);
      await env.DB.prepare(`UPDATE tags SET nfc_uid=?,preparo_status='gravada',gravada_em=CURRENT_TIMESTAMP,testada_em=NULL,nfc_protegida_em=CURRENT_TIMESTAMP WHERE codigo=?`).bind(uid,codigo).run();
      return json({sucesso:true,mensagem:'Gravação confirmada.',codigo,uid});
    }

    if(acao==='identificar-zero'){
      const uid=clean(body.uid,40).toUpperCase();
      if(!uid)return json({sucesso:false,mensagem:'UID não informado.'},400);
      const tag=await env.DB.prepare(`SELECT codigo,ativada,nfc_secret,nfc_uid,nfc_protegida_em,COALESCE(preparo_status,'estoque') AS preparo_status FROM tags WHERE UPPER(nfc_uid)=? LIMIT 1`).bind(uid).first();
      if(!tag)return json({sucesso:false,mensagem:'Este UID não está vinculado a uma tag BIRX gravada.'},404);
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:`${tag.codigo} está ATIVADA e não pode ser zerada por esta rotina.`},409);
      if(!tag.nfc_secret)return json({sucesso:false,mensagem:'A credencial NFC desta tag não está disponível.'},409);
      const saved=await credentials(env,tag);
      return json({sucesso:true,codigo:tag.codigo,uid:clean(tag.nfc_uid,40).toUpperCase(),status:tag.preparo_status,pwd:saved.pwd,pack:saved.pack});
    }

    if(acao==='confirmar-zero'){
      const codigo=clean(body.codigo,40).toUpperCase();
      const uid=clean(body.uid,40).toUpperCase();
      if(!codigo||!uid)return json({sucesso:false,mensagem:'Código ou UID não informado.'},400);
      const tag=await env.DB.prepare(`SELECT codigo,ativada,nfc_uid FROM tags WHERE codigo=? LIMIT 1`).bind(codigo).first();
      if(!tag)return json({sucesso:false,mensagem:'Código não encontrado.'},404);
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:'Uma tag ativada não pode voltar ao estoque.'},409);
      if(clean(tag.nfc_uid,40).toUpperCase()!==uid)return json({sucesso:false,mensagem:'O UID zerado não corresponde ao vínculo do site. O banco não foi alterado.'},409);
      await env.DB.prepare(`UPDATE tags SET nfc_uid=NULL,nfc_secret=NULL,nfc_protegida_em=NULL,preparo_status='estoque',gravada_em=NULL,testada_em=NULL,vendida_em=NULL WHERE codigo=?`).bind(codigo).run();
      return json({sucesso:true,mensagem:'Tag zerada e código devolvido ao estoque.',codigo,uid});
    }

    return json({sucesso:false,mensagem:'Ação inválida.'},400);
  }catch(error){
    console.error('nfc-writer',error);
    if(String(error.message).includes('NFC_MASTER_KEY_NOT_CONFIGURED'))return json({sucesso:false,mensagem:'NFC_MASTER_KEY não configurada.'},503);
    if(String(error.message).includes('OperationError')||String(error.message).includes('NFC_SECRET_INVALID'))return json({sucesso:false,mensagem:'Não foi possível abrir a credencial NFC reservada.'},409);
    return json({sucesso:false,mensagem:'Falha interna da API da gravadora.'},500);
  }
}

export async function onRequest(context){
  if(context.request.method==='POST')return onRequestPost(context);
  return json({sucesso:false,mensagem:'Método não permitido.'},405);
}
