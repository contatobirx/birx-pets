import { obterSessaoTutor } from "../_lib/auth.js";

const CABECALHOS_JSON={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function responder(dados,status=200,extras={}){return new Response(JSON.stringify(dados),{status,headers:{...CABECALHOS_JSON,...extras}})}
function texto(valor,limite=1000){return String(valor??"").trim().slice(0,limite)}

export async function onRequestPost({request,env}){
  try{
    const sessao=await obterSessaoTutor(request,env);
    if(!sessao)return responder({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou. Entre novamente."},401);
    const corpo=await request.json().catch(()=>({}));
    const id=Number.parseInt(corpo.id,10),tagCodigo=texto(corpo.tagCodigo,100);
    if(!id||!tagCodigo)return responder({sucesso:false,mensagem:"Registro e código da tag são obrigatórios."},400);
    const resultado=await env.DB.prepare(`DELETE FROM saude_pet WHERE id=? AND tipo='Vacina' AND UPPER(tag_codigo)=UPPER(?) AND EXISTS(SELECT 1 FROM pets p WHERE UPPER(p.tag_codigo)=UPPER(saude_pet.tag_codigo) AND LOWER(p.email)=LOWER(?))`).bind(id,tagCodigo,sessao.email).run();
    if(Number(resultado.meta?.changes||0)!==1)return responder({sucesso:false,mensagem:"Registro não encontrado."},404);
    return responder({sucesso:true,mensagem:"Vacina excluída com sucesso."});
  }catch(erro){console.error("Erro em /api/saude-excluir:",erro);return responder({sucesso:false,mensagem:"Não foi possível excluir a vacina."},500)}
}
export async function onRequest(context){if(context.request.method!=="POST")return responder({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"POST"});return onRequestPost(context)}
