import { authorized, clean, json, unauthorized } from "../admin-shared.js";

const hex=(buffer)=>[...new Uint8Array(buffer)].map(b=>b.toString(16).padStart(2,'0')).join('');
async function sha256(value){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
function token(){const b=new Uint8Array(32);crypto.getRandomValues(b);return btoa(String.fromCharCode(...b)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}

export async function onRequestPost({request,env}){
  if(!(await authorized(request,env)))return unauthorized(env);
  const body=await request.json().catch(()=>({}));const id=Number(body.id),tipo=clean(body.integracao_tipo,30)||'bridge';
  if(!id)return json({sucesso:false,mensagem:'Impressora inválida.'},400);
  const imp=await env.DB.prepare(`SELECT id,nome FROM impressoras_3d WHERE id=? AND ativo=1`).bind(id).first();
  if(!imp)return json({sucesso:false,mensagem:'Impressora não encontrada.'},404);
  const raw=token(),hash=await sha256(raw);
  await env.DB.prepare(`UPDATE impressoras_3d SET integracao_tipo=?,telemetria_token_hash=?,telemetria_ultimo_contato=NULL,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(tipo,hash,id).run();
  return json({sucesso:true,token:raw,impressora_id:id,mensagem:'Chave criada. Copie agora: ela não será exibida novamente.'});
}

export async function onRequestDelete({request,env}){
  if(!(await authorized(request,env)))return unauthorized(env);
  const id=Number(new URL(request.url).searchParams.get('id'));if(!id)return json({sucesso:false,mensagem:'Impressora inválida.'},400);
  await env.DB.prepare(`UPDATE impressoras_3d SET integracao_tipo='manual',telemetria_token_hash=NULL,telemetria_ultimo_contato=NULL,telemetria_status=NULL,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
  return json({sucesso:true,mensagem:'Integração removida.'});
}

export async function onRequest(c){if(c.request.method==='POST')return onRequestPost(c);if(c.request.method==='DELETE')return onRequestDelete(c);return json({sucesso:false,mensagem:'Método não permitido.'},405)}
