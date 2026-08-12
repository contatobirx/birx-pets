import { obterSessaoTutor, petPertenceAoTutor } from "../_lib/auth.js";
const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...HEADERS,...extra}})}
function text(v,n=1000){return String(v??"").trim().slice(0,n)}
const TYPES=new Set(["vacina","consulta","medicamento","peso","foto","observacao","cadastro","tag","perdido","encontrado","outro"]);
function validDate(v){const t=text(v,25);if(!t)return null;const d=new Date(t);return Number.isNaN(d.getTime())?null:d.toISOString()}
export async function onRequestPost({request,env}){
  try{
    const s=await obterSessaoTutor(request,env);if(!s)return json({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou. Entre novamente."},401);
    const body=await request.json().catch(()=>({}));const tag=text(body.tagCodigo,100);const tipo=text(body.tipo,30).toLowerCase();const titulo=text(body.titulo,120);const descricao=text(body.descricao,1000);const dataEvento=validDate(body.dataEvento)||new Date().toISOString();
    if(!tag||!tipo||!titulo)return json({sucesso:false,mensagem:"Informe a tag, o tipo e o título do evento."},400);
    if(!TYPES.has(tipo))return json({sucesso:false,mensagem:"Tipo de evento inválido."},400);
    if(!await petPertenceAoTutor(env,tag,s.email))return json({sucesso:false,mensagem:"Pet não encontrado ou sem permissão de acesso."},403);
    const r=await env.DB.prepare(`INSERT INTO pet_timeline(tag_codigo,tipo,titulo,descricao,data_evento,automatico,criado_por) SELECT ?,?,?,?,?,0,? WHERE EXISTS(SELECT 1 FROM pets WHERE UPPER(tag_codigo)=UPPER(?) AND LOWER(email)=LOWER(?))`).bind(tag,tipo,titulo,descricao||null,dataEvento,s.email,tag,s.email).run();
    if(Number(r.meta?.changes||0)!==1)return json({sucesso:false,mensagem:"Não foi possível adicionar o evento."},409);
    return json({sucesso:true,mensagem:"Evento adicionado à timeline.",id:r.meta?.last_row_id||null},201);
  }catch(e){console.error("Erro em /api/timeline-salvar:",e);return json({sucesso:false,mensagem:"Não foi possível salvar o evento."},500)}
}
export async function onRequest(ctx){if(ctx.request.method!=="POST")return json({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"POST"});return onRequestPost(ctx)}
