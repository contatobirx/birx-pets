import { obterSessaoTutor, petPertenceAoTutor } from "../_lib/auth.js";
const HEADERS = {"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...HEADERS,...extra}})}
function text(v,n=1000){return String(v??"").trim().slice(0,n)}
export async function onRequestGet({request,env}){
  try{
    const s=await obterSessaoTutor(request,env);if(!s)return json({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou. Entre novamente."},401);
    const tag=text(new URL(request.url).searchParams.get("tagCodigo"),100);if(!tag)return json({sucesso:false,mensagem:"Código da tag não informado."},400);
    if(!await petPertenceAoTutor(env,tag,s.email))return json({sucesso:false,mensagem:"Pet não encontrado ou sem permissão de acesso."},403);
    const result=await env.DB.prepare(`SELECT id,tag_codigo AS tagCodigo,tipo,titulo,descricao,data_evento AS dataEvento,automatico,criado_por AS criadoPor,criado_em AS criadoEm FROM pet_timeline WHERE UPPER(tag_codigo)=UPPER(?) ORDER BY datetime(data_evento) DESC,id DESC LIMIT 300`).bind(tag).all();
    return json({sucesso:true,eventos:result.results||[]});
  }catch(e){console.error("Erro em /api/timeline-listar:",e);return json({sucesso:false,mensagem:"Não foi possível carregar a timeline."},500)}
}
export async function onRequest(ctx){if(ctx.request.method!=="GET")return json({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"GET"});return onRequestGet(ctx)}
