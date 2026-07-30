const HEADERS = {"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...HEADERS,...extra}})}
function cookies(request){const out={};for(const part of (request.headers.get("Cookie")||"").split(";")){const i=part.indexOf("=");if(i<0)continue;const k=part.slice(0,i).trim();const v=part.slice(i+1).trim();if(!k)continue;try{out[k]=decodeURIComponent(v)}catch{out[k]=v}}return out}
function token(request){const c=cookies(request);for(const n of ["sessao_tutor","tutor_session","orbitek_session","orbitek_sessao","session"])if(c[n])return c[n];return ""}
async function sha256(v){const b=new TextEncoder().encode(v);const h=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function nowSql(){return new Date().toISOString().replace("T"," ").slice(0,19)}
async function session(request,env){const t=token(request);if(!t)return null;const s=await env.DB.prepare(`SELECT id,email FROM sessoes_tutor WHERE token_hash=? AND expira_em>? LIMIT 1`).bind(await sha256(t),nowSql()).first();return s?{id:s.id,email:String(s.email||"").trim().toLowerCase()}:null}
function text(v,n=1000){return String(v??"").trim().slice(0,n)}
export async function onRequestGet({request,env}){
  try{
    const s=await session(request,env);if(!s)return json({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou. Entre novamente."},401);
    const tag=text(new URL(request.url).searchParams.get("tagCodigo"),100);if(!tag)return json({sucesso:false,mensagem:"Código da tag não informado."},400);
    const pet=await env.DB.prepare(`SELECT id FROM pets WHERE UPPER(tag_codigo)=UPPER(?) AND LOWER(email)=LOWER(?) LIMIT 1`).bind(tag,s.email).first();
    if(!pet)return json({sucesso:false,mensagem:"Pet não encontrado ou sem permissão de acesso."},403);
    const result=await env.DB.prepare(`SELECT id,tag_codigo AS tagCodigo,tipo,titulo,descricao,data_evento AS dataEvento,automatico,criado_por AS criadoPor,criado_em AS criadoEm FROM pet_timeline WHERE UPPER(tag_codigo)=UPPER(?) ORDER BY datetime(data_evento) DESC,id DESC`).bind(tag).all();
    return json({sucesso:true,eventos:result.results||[]});
  }catch(e){console.error("Erro em /api/timeline-listar:",e);return json({sucesso:false,mensagem:e.message||"Erro interno ao listar a timeline."},500)}
}
export async function onRequest(ctx){if(ctx.request.method!=="GET")return json({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"GET"});return onRequestGet(ctx)}
