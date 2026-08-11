import { obterSessaoTutor, petPertenceAoTutor } from "../_lib/auth.js";

const CABECALHOS_JSON={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function responder(dados,status=200,extras={}){return new Response(JSON.stringify(dados),{status,headers:{...CABECALHOS_JSON,...extras}})}
async function hash(valor,algoritmo="SHA-256"){const bytes=new TextEncoder().encode(valor);const digest=await crypto.subtle.digest(algoritmo,bytes);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("")}
function texto(valor,limite=1000){return String(valor??"").trim().slice(0,limite)}
function slug(valor){return String(valor||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100)}
async function garantirMetadados(env){const colunas=await env.DB.prepare("PRAGMA table_info(documentos_pet)").all();const nomes=new Set((colunas.results||[]).map(i=>i.name));for(const[nome,tipo]of[["data_documento","TEXT"],["profissional","TEXT"],["observacoes","TEXT"]])if(!nomes.has(nome))await env.DB.prepare(`ALTER TABLE documentos_pet ADD COLUMN ${nome} ${tipo}`).run()}
const CATEGORIAS=new Set(["Carteira de vacinação","Receita","Exame","Laudo","Foto","Outro"]);

export async function onRequestPost({request,env}){
  try{
    const sessao=await obterSessaoTutor(request,env);
    if(!sessao)return responder({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou."},401);
    const cloudName=env.CLOUDINARY_CLOUD_NAME,apiKey=env.CLOUDINARY_API_KEY,apiSecret=env.CLOUDINARY_API_SECRET;
    if(!cloudName||!apiKey||!apiSecret){console.error("Cloudinary não configurada em documentos-upload");return responder({sucesso:false,mensagem:"Serviço de documentos temporariamente indisponível."},503)}

    const formulario=await request.formData();
    const tagCodigo=texto(formulario.get("tagCodigo"),100).toUpperCase(),categoria=texto(formulario.get("categoria"),60),titulo=texto(formulario.get("titulo"),120),dataDocumento=texto(formulario.get("dataDocumento"),10),profissional=texto(formulario.get("profissional"),120),observacoes=texto(formulario.get("observacoes"),1000),arquivo=formulario.get("arquivo");
    if(!tagCodigo||!categoria||!titulo)return responder({sucesso:false,mensagem:"Tag, categoria e título são obrigatórios."},400);
    if(!CATEGORIAS.has(categoria))return responder({sucesso:false,mensagem:"Categoria inválida."},400);
    if(dataDocumento&&!/^\d{4}-\d{2}-\d{2}$/.test(dataDocumento))return responder({sucesso:false,mensagem:"Data inválida."},400);
    if(!arquivo||typeof arquivo.arrayBuffer!=="function")return responder({sucesso:false,mensagem:"Selecione um arquivo."},400);
    if(!new Set(["image/jpeg","image/png","image/webp","application/pdf"]).has(arquivo.type))return responder({sucesso:false,mensagem:"Envie JPG, PNG, WEBP ou PDF."},400);
    if(arquivo.size>10*1024*1024)return responder({sucesso:false,mensagem:"O arquivo deve ter no máximo 10 MB."},400);

    const pet=await petPertenceAoTutor(env,tagCodigo,sessao.email);
    if(!pet)return responder({sucesso:false,mensagem:"Pet não encontrado."},404);

    const recursoTipo=arquivo.type==="application/pdf"?"raw":"image",timestamp=Math.floor(Date.now()/1000),pasta=`orbitek-pets/documentos/${slug(tagCodigo)}`,publicId=`${Date.now()}-${slug(arquivo.name.replace(/\.[^.]+$/,""))||"documento"}`;
    const assinatura=await hash(`folder=${pasta}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`,"SHA-1");
    const dadosCloudinary=new FormData();dadosCloudinary.append("file",arquivo);dadosCloudinary.append("api_key",apiKey);dadosCloudinary.append("timestamp",String(timestamp));dadosCloudinary.append("signature",assinatura);dadosCloudinary.append("folder",pasta);dadosCloudinary.append("public_id",publicId);
    const respostaCloudinary=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${recursoTipo}/upload`,{method:"POST",body:dadosCloudinary});
    const cloud=await respostaCloudinary.json().catch(()=>({}));
    if(!respostaCloudinary.ok||!cloud.secure_url){console.error("Cloudinary documentos:",cloud);return responder({sucesso:false,mensagem:"Falha ao enviar o arquivo."},502)}

    await garantirMetadados(env);
    const resultado=await env.DB.prepare(`INSERT INTO documentos_pet(tag_codigo,categoria,titulo,arquivo_url,arquivo_tipo,arquivo_public_id,recurso_tipo,nome_arquivo,tamanho_bytes,data_documento,profissional,observacoes) VALUES(?,?,?,?,?,?,?,?,?,NULLIF(?,''),NULLIF(?,''),NULLIF(?,''))`).bind(tagCodigo,categoria,titulo,cloud.secure_url,arquivo.type,cloud.public_id,recursoTipo,texto(arquivo.name,255),arquivo.size,dataDocumento,profissional,observacoes).run();
    return responder({sucesso:true,mensagem:"Documento enviado com sucesso.",id:resultado.meta?.last_row_id||null},201);
  }catch(erro){console.error("Erro em /api/documentos-upload:",erro);return responder({sucesso:false,mensagem:"Não foi possível enviar o documento."},500)}
}

export async function onRequest(context){if(context.request.method!=="POST")return responder({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"POST"});return onRequestPost(context)}
