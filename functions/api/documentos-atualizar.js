import { obterSessaoTutor } from "../_lib/auth.js";

const CABECALHOS_JSON={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function responder(dados,status=200,extras={}){return new Response(JSON.stringify(dados),{status,headers:{...CABECALHOS_JSON,...extras}})}
function texto(valor,limite=1000){return String(valor??"").trim().slice(0,limite)}
async function garantirMetadados(env){const colunas=await env.DB.prepare("PRAGMA table_info(documentos_pet)").all();const nomes=new Set((colunas.results||[]).map(i=>i.name));for(const[nome,tipo]of[["data_documento","TEXT"],["profissional","TEXT"],["observacoes","TEXT"]])if(!nomes.has(nome))await env.DB.prepare(`ALTER TABLE documentos_pet ADD COLUMN ${nome} ${tipo}`).run()}
async function documentoDoTutor(env,id,tagCodigo,email){return env.DB.prepare(`SELECT d.id,d.tag_codigo FROM documentos_pet d INNER JOIN pets p ON UPPER(p.tag_codigo)=UPPER(d.tag_codigo) WHERE d.id=? AND UPPER(d.tag_codigo)=UPPER(?) AND LOWER(p.email)=LOWER(?) LIMIT 1`).bind(id,tagCodigo,email).first()}
const CATEGORIAS=new Set(["Carteira de vacinação","Receita","Exame","Laudo","Foto","Outro"]);

export async function onRequestPost({request,env}){
  try{
    const sessao=await obterSessaoTutor(request,env);
    if(!sessao)return responder({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou."},401);
    const corpo=await request.json().catch(()=>({}));
    const id=Number.parseInt(corpo.id,10),tagCodigo=texto(corpo.tagCodigo,100),categoria=texto(corpo.categoria,60),titulo=texto(corpo.titulo,120),dataDocumento=texto(corpo.dataDocumento,10),profissional=texto(corpo.profissional,120),observacoes=texto(corpo.observacoes,1000);
    if(!id||!tagCodigo||!categoria||!titulo)return responder({sucesso:false,mensagem:"Dados incompletos."},400);
    if(!CATEGORIAS.has(categoria))return responder({sucesso:false,mensagem:"Categoria inválida."},400);
    if(dataDocumento&&!/^\d{4}-\d{2}-\d{2}$/.test(dataDocumento))return responder({sucesso:false,mensagem:"Data inválida."},400);

    const documento=await documentoDoTutor(env,id,tagCodigo,sessao.email);
    if(!documento)return responder({sucesso:false,mensagem:"Documento não encontrado."},404);

    await garantirMetadados(env);
    const atualizacao=await env.DB.prepare(`UPDATE documentos_pet SET categoria=?,titulo=?,data_documento=NULLIF(?,''),profissional=NULLIF(?,''),observacoes=NULLIF(?,''),atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND UPPER(tag_codigo)=UPPER(?) AND EXISTS(SELECT 1 FROM pets p WHERE UPPER(p.tag_codigo)=UPPER(documentos_pet.tag_codigo) AND LOWER(p.email)=LOWER(?))`).bind(categoria,titulo,dataDocumento,profissional,observacoes,id,tagCodigo,sessao.email).run();
    if(!atualizacao.meta?.changes)return responder({sucesso:false,mensagem:"Documento não encontrado."},404);
    return responder({sucesso:true,mensagem:"Documento atualizado com sucesso."});
  }catch(erro){console.error("Erro em /api/documentos-atualizar:",erro);return responder({sucesso:false,mensagem:"Não foi possível atualizar o documento."},500)}
}

export async function onRequest(context){if(context.request.method!=="POST")return responder({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"POST"});return onRequestPost(context)}
