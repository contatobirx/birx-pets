import { clean, json } from "../admin-shared.js";

const enc = new TextEncoder();
const b64 = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const fromB64 = (text) => Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/') + '='.repeat((4-text.length%4)%4)), c => c.charCodeAt(0));

async function sign(payload, secret){
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
  return b64(sig);
}

async function verify(token, secret){
  const [payload,sig]=String(token||'').split('.'); if(!payload||!sig) return null;
  const expected=await sign(payload,secret); if(expected!==sig) return null;
  const data=JSON.parse(new TextDecoder().decode(fromB64(payload))); if(!data.exp||Date.now()>data.exp) return null;
  return data;
}

export async function onRequestPost({request,env}){
  const body=await request.json().catch(()=>({}));
  const usuario=clean(body.usuario,120), senha=String(body.senha||'');
  const expectedUser=clean(env.ADMIN_USER||'admin',120);
  const expectedPass=String(env.ADMIN_PASSWORD||'');
  const secret=String(env.ADMIN_SESSION_SECRET||'');
  if(!expectedPass||!secret) return json({sucesso:false,mensagem:'Configure ADMIN_PASSWORD e ADMIN_SESSION_SECRET na Cloudflare.'},500);
  if(usuario!==expectedUser||senha!==expectedPass) return json({sucesso:false,mensagem:'Usuário ou senha inválidos.'},401);
  const payload=b64(enc.encode(JSON.stringify({u:usuario,exp:Date.now()+8*60*60*1000})));
  const token=`${payload}.${await sign(payload,secret)}`;
  return new Response(JSON.stringify({sucesso:true,usuario}),{status:200,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store','Set-Cookie':`birx_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`}});
}

export async function onRequestGet({request,env}){
  const cookie=request.headers.get('Cookie')||'';
  const token=(cookie.match(/(?:^|;\s*)birx_admin=([^;]+)/)||[])[1];
  const secret=String(env.ADMIN_SESSION_SECRET||'');
  const data=secret?await verify(token,secret):null;
  return json(data?{sucesso:true,autenticado:true,usuario:data.u}:{sucesso:true,autenticado:false});
}

export async function onRequestDelete(){
  return new Response(JSON.stringify({sucesso:true}),{status:200,headers:{'Content-Type':'application/json; charset=UTF-8','Set-Cookie':'birx_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}});
}

export async function validateAdminSession(request,env){
  const cookie=request.headers.get('Cookie')||'';
  const token=(cookie.match(/(?:^|;\s*)birx_admin=([^;]+)/)||[])[1];
  const secret=String(env.ADMIN_SESSION_SECRET||'');
  return Boolean(secret && await verify(token,secret));
}

export async function onRequest(context){
  if(context.request.method==='GET') return onRequestGet(context);
  if(context.request.method==='POST') return onRequestPost(context);
  if(context.request.method==='DELETE') return onRequestDelete(context);
  return json({sucesso:false,mensagem:'Método não permitido.'},405);
}
