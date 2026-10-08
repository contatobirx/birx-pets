import { adminAutorizado } from "../_lib/admin-auth.js";
import { registrarAuditoriaAdmin } from "../_lib/admin-audit.js";

const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(value,max=200)=>String(value??"").trim().slice(0,max);
const hex=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,"0")).join("");
async function sha256(value){const bytes=new TextEncoder().encode(String(value||""));return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)))}
function randomHex(n){return hex(crypto.getRandomValues(new Uint8Array(n)))}
async function setup(env){
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS nfc_scanner_sessions (
      session_id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      last_code TEXT,
      last_scanned_at INTEGER,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )
  `).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_nfc_scanner_expires ON nfc_scanner_sessions(expires_at)").run();
}
async function removeExpired(env){await env.DB.prepare("DELETE FROM nfc_scanner_sessions WHERE expires_at < ?").bind(Date.now()).run()}
async function parsePair(env,pair){
  const raw=clean(pair,180),dot=raw.indexOf(".");
  if(dot<8)return null;
  const sessionId=raw.slice(0,dot),token=raw.slice(dot+1);
  if(!/^[a-f0-9]{16}$/i.test(sessionId)||!/^[a-f0-9]{48}$/i.test(token))return null;
  const row=await env.DB.prepare("SELECT session_id,token_hash,expires_at FROM nfc_scanner_sessions WHERE session_id=? LIMIT 1").bind(sessionId).first();
  if(!row||Number(row.expires_at)<=Date.now())return null;
  const expected=await sha256(raw);
  if(expected!==row.token_hash)return null;
  return row;
}
function codeFrom(value){
  const raw=clean(value,500);
  const match=raw.toUpperCase().match(/BIRX-\d{2}-\d{6}/);
  return match?match[0]:"";
}

export async function onRequestPost({request,env}){
  try{
    await setup(env);await removeExpired(env);
    const body=await request.json().catch(()=>({})),acao=clean(body.acao,30);
    if(acao==="criar"){
      if(!await adminAutorizado(request,env))return json({sucesso:false,autenticado:false,mensagem:"Sessão administrativa inválida ou expirada."},401);
      const sessionId=randomHex(8),token=randomHex(24),pair=`${sessionId}.${token}`,expiresAt=Date.now()+15*60*1000;
      await env.DB.prepare("INSERT INTO nfc_scanner_sessions(session_id,token_hash,expires_at,created_at) VALUES(?,?,?,?)").bind(sessionId,await sha256(pair),expiresAt,Date.now()).run();
      const origin=new URL(request.url).origin;
      await registrarAuditoriaAdmin(env,request,{acao:"nfc.scanner.criar",alvo:sessionId,detalhes:{expiresAt}});
      return json({sucesso:true,session_id:sessionId,pair,scanner_url:`${origin}/scanner.html#${pair}`,expires_at:expiresAt},201);
    }
    if(acao==="scan"){
      const pair=clean(body.pair,180),session=await parsePair(env,pair);
      if(!session)return json({sucesso:false,mensagem:"Pareamento inválido ou expirado."},401);
      const codigo=codeFrom(body.codigo||body.valor);
      if(!codigo)return json({sucesso:false,mensagem:"Este QR Code não parece ser de uma BIRX ID."},400);
      const tag=await env.DB.prepare("SELECT codigo,modelo,lote,ativada,COALESCE(preparo_status,'estoque') AS status FROM tags WHERE codigo=? LIMIT 1").bind(codigo).first();
      if(!tag)return json({sucesso:false,mensagem:"BIRX ID não encontrada no estoque."},404);
      if(Number(tag.ativada)===1)return json({sucesso:false,mensagem:"Esta BIRX ID já foi ativada e não pode entrar na gravação de produção."},409);
      if(tag.modelo==="essential")return json({sucesso:false,mensagem:"Esta BIRX ID é Essential e não possui NFC."},409);
      const now=Date.now();
      await env.DB.prepare("UPDATE nfc_scanner_sessions SET last_code=?,last_scanned_at=? WHERE session_id=?").bind(codigo,now,session.session_id).run();
      return json({sucesso:true,codigo,modelo:tag.modelo,lote:tag.lote||null,status:tag.status,scanned_at:now});
    }
    return json({sucesso:false,mensagem:"Ação inválida."},400);
  }catch(error){
    console.error("admin-scanner POST",error);
    return json({sucesso:false,mensagem:"Não foi possível usar o leitor móvel."},500);
  }
}

export async function onRequestGet({request,env}){
  try{
    await setup(env);await removeExpired(env);
    if(!await adminAutorizado(request,env))return json({sucesso:false,autenticado:false,mensagem:"Sessão administrativa inválida ou expirada."},401);
    const url=new URL(request.url),sessionId=clean(url.searchParams.get("session"),40);
    if(!/^[a-f0-9]{16}$/i.test(sessionId))return json({sucesso:false,mensagem:"Sessão inválida."},400);
    const row=await env.DB.prepare("SELECT session_id,last_code,last_scanned_at,expires_at FROM nfc_scanner_sessions WHERE session_id=? LIMIT 1").bind(sessionId).first();
    if(!row||Number(row.expires_at)<=Date.now())return json({sucesso:false,expirada:true,mensagem:"Pareamento expirado."},410);
    let tag=null;
    if(row.last_code)tag=await env.DB.prepare("SELECT codigo,modelo,lote,ativada,COALESCE(preparo_status,'estoque') AS status FROM tags WHERE codigo=? LIMIT 1").bind(row.last_code).first();
    return json({sucesso:true,session_id:sessionId,codigo:row.last_code||null,scanned_at:Number(row.last_scanned_at||0)||null,expires_at:Number(row.expires_at),tag:tag||null});
  }catch(error){
    console.error("admin-scanner GET",error);
    return json({sucesso:false,mensagem:"Não foi possível consultar o leitor móvel."},500);
  }
}

export async function onRequestDelete({request,env}){
  if(!await adminAutorizado(request,env))return json({sucesso:false,autenticado:false,mensagem:"Sessão administrativa inválida ou expirada."},401);
  try{
    await setup(env);
    const url=new URL(request.url),sessionId=clean(url.searchParams.get("session"),40);
    if(sessionId)await env.DB.prepare("DELETE FROM nfc_scanner_sessions WHERE session_id=?").bind(sessionId).run();
    return json({sucesso:true});
  }catch(error){return json({sucesso:false,mensagem:"Não foi possível encerrar o pareamento."},500)}
}

export async function onRequest(context){
  if(context.request.method==="GET")return onRequestGet(context);
  if(context.request.method==="POST")return onRequestPost(context);
  if(context.request.method==="DELETE")return onRequestDelete(context);
  return json({sucesso:false,mensagem:"Método não permitido."},405);
}