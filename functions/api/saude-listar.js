import { obterSessaoTutor, petPertenceAoTutor } from "../_lib/auth.js";

const CABECALHOS_JSON={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function responder(dados,status=200,extras={}){return new Response(JSON.stringify(dados),{status,headers:{...CABECALHOS_JSON,...extras}})}
function texto(valor,limite=1000){return String(valor??"").trim().slice(0,limite)}

export async function onRequestGet({request,env}){
  try{
    const sessao=await obterSessaoTutor(request,env);
    if(!sessao)return responder({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou. Entre novamente."},401);
    const tagCodigo=texto(new URL(request.url).searchParams.get("tagCodigo"),100);
    if(!tagCodigo)return responder({sucesso:false,mensagem:"Código da tag não informado."},400);
    const pet=await petPertenceAoTutor(env,tagCodigo,sessao.email);
    if(!pet)return responder({sucesso:false,mensagem:"Pet não encontrado ou sem permissão de acesso."},403);
    const resultado=await env.DB.prepare(`SELECT id,tag_codigo AS tagCodigo,tipo,nome,data_aplicacao AS dataAplicacao,proxima_data AS proximaData,fabricante,lote,veterinario,observacoes,criado_em AS criadoEm FROM saude_pet WHERE UPPER(tag_codigo)=UPPER(?) AND tipo='Vacina' ORDER BY CASE WHEN proxima_data IS NOT NULL AND date(proxima_data)<date('now','localtime') THEN 0 WHEN proxima_data IS NOT NULL AND date(proxima_data)<=date('now','localtime','+30 days') THEN 1 WHEN proxima_data IS NOT NULL THEN 2 ELSE 3 END,CASE WHEN proxima_data IS NULL THEN NULL ELSE date(proxima_data) END ASC,COALESCE(date(data_aplicacao),date(criado_em)) DESC,id DESC`).bind(tagCodigo).all();
    return responder({sucesso:true,registros:resultado.results||[]});
  }catch(erro){console.error("Erro em /api/saude-listar:",erro);return responder({sucesso:false,mensagem:"Não foi possível carregar as vacinas."},500)}
}
export async function onRequest(context){if(context.request.method!=="GET")return responder({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"GET"});return onRequestGet(context)}
