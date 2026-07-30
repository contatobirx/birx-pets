const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...HEADERS,...extra}})}
function cookies(request){const out={};for(const part of (request.headers.get("Cookie")||"").split(";")){const i=part.indexOf("=");if(i<0)continue;const k=part.slice(0,i).trim();const v=part.slice(i+1).trim();if(!k)continue;try{out[k]=decodeURIComponent(v)}catch{out[k]=v}}return out}
function token(request){const c=cookies(request);for(const n of ["sessao_tutor","tutor_session","orbitek_session","orbitek_sessao","session"])if(c[n])return c[n];return ""}
async function sha256(v){const b=new TextEncoder().encode(v);const h=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function nowSql(){return new Date().toISOString().replace("T"," ").slice(0,19)}
async function session(request,env){const t=token(request);if(!t)return null;const s=await env.DB.prepare(`SELECT id,email FROM sessoes_tutor WHERE token_hash=? AND expira_em>? LIMIT 1`).bind(await sha256(t),nowSql()).first();return s?{id:s.id,email:String(s.email||"").trim().toLowerCase()}:null}
function text(v,n=1000){return String(v??"").trim().slice(0,n)}
const TYPES=new Set(["vacina","consulta","medicamento","peso","foto","observacao","cadastro","tag","perdido","encontrado","outro"]);
function validDate(v){const t=text(v,25);if(!t)return null;const d=new Date(t);return Number.isNaN(d.getTime())?null:d.toISOString()}
export async function onRequestPost({request,env}){
  try{
    const s=await session(request,env);if(!s)return json({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou. Entre novamente."},401);
    const body=await request.json().catch(()=>({}));const tag=text(body.tagCodigo,100);const tipo=text(body.tipo,30).toLowerCase();const titulo=text(body.titulo,120);const descricao=text(body.descricao,1000);const dataEvento=validDate(body.dataEvento)||new Date().toISOString();
    if(!tag||!tipo||!titulo)return json({sucesso:false,mensagem:"Informe a tag, o tipo e o título do evento."},400);
    if(!TYPES.has(tipo))return json({sucesso:false,mensagem:"Tipo de evento inválido."},400);
    const pet=await env.DB.prepare(`SELECT id,nome FROM pets WHERE UPPER(tag_codigo)=UPPER(?) AND LOWER(email)=LOWER(?) LIMIT 1`).bind(tag,s.email).first();
    if(!pet)return json({sucesso:false,mensagem:"Pet não encontrado ou sem permissão de acesso."},403);
    const r=await env.DB.prepare(`INSERT INTO pet_timeline(tag_codigo,tipo,titulo,descricao,data_evento,automatico,criado_por) VALUES(?,?,?,?,?,0,?)`).bind(tag,tipo,titulo,descricao||null,dataEvento,s.email).run();
    return json({sucesso:true,mensagem:"Evento adicionado à timeline.",id:r.meta?.last_row_id||null},201);
  }catch(e){console.error("Erro em /api/timeline-salvar:",e);return json({sucesso:false,mensagem:e.message||"Erro interno ao salvar o evento."},500)}
}
export async function onRequest(ctx){if(ctx.request.method!=="POST")return json({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"POST"});return onRequestPost(ctx)}
