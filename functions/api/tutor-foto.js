import { obterSessaoTutor, petPertenceAoTutor } from "../_lib/auth.js";

const CABECALHOS_JSON = {"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function responder(dados,status=200,extras={}){return new Response(JSON.stringify(dados),{status,headers:{...CABECALHOS_JSON,...extras}})}
async function hashSha1(valor){const dados=new TextEncoder().encode(valor);const hash=await crypto.subtle.digest("SHA-1",dados);return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("")}
function limparCodigo(valor){return String(valor||"").trim().toLowerCase().replace(/[^a-z0-9-_]/g,"-").slice(0,120)}

export async function onRequestPost({request,env}){
  try{
    if(!env.DB)return responder({sucesso:false,mensagem:"Serviço temporariamente indisponível."},503);
    const sessao=await obterSessaoTutor(request,env);
    if(!sessao)return responder({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou. Entre novamente."},401);

    const {CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET}=env;
    if(!CLOUDINARY_CLOUD_NAME||!CLOUDINARY_API_KEY||!CLOUDINARY_API_SECRET){console.error("Cloudinary não configurada em tutor-foto");return responder({sucesso:false,mensagem:"Serviço de imagens temporariamente indisponível."},503)}

    const formulario=await request.formData();
    const arquivo=formulario.get("foto");
    const tagCodigo=String(formulario.get("tagCodigo")||formulario.get("codigoTag")||"").trim().toUpperCase();
    if(!tagCodigo)return responder({sucesso:false,mensagem:"Código da tag não informado."},400);
    if(!arquivo||typeof arquivo.arrayBuffer!=="function")return responder({sucesso:false,mensagem:"Nenhuma foto foi enviada."},400);

    const tiposPermitidos=["image/jpeg","image/png","image/webp"];
    if(!tiposPermitidos.includes(arquivo.type))return responder({sucesso:false,mensagem:"Envie uma imagem JPG, PNG ou WEBP."},400);
    if(arquivo.size>5*1024*1024)return responder({sucesso:false,mensagem:"A foto deve ter no máximo 5 MB."},400);

    const pet=await petPertenceAoTutor(env,tagCodigo,sessao.email);
    if(!pet)return responder({sucesso:false,mensagem:"Pet não encontrado."},404);

    const timestamp=Math.floor(Date.now()/1000),pasta="orbitek-pets",publicId=limparCodigo(tagCodigo);
    const assinatura=await hashSha1(`folder=${pasta}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`);
    const dadosCloudinary=new FormData();
    dadosCloudinary.append("file",arquivo);dadosCloudinary.append("api_key",CLOUDINARY_API_KEY);dadosCloudinary.append("timestamp",String(timestamp));dadosCloudinary.append("signature",assinatura);dadosCloudinary.append("folder",pasta);dadosCloudinary.append("public_id",publicId);dadosCloudinary.append("overwrite","true");

    const respostaCloudinary=await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,{method:"POST",body:dadosCloudinary});
    const resultadoCloudinary=await respostaCloudinary.json().catch(()=>({}));
    if(!respostaCloudinary.ok||!resultadoCloudinary.secure_url){console.error("Erro Cloudinary tutor-foto:",resultadoCloudinary);return responder({sucesso:false,mensagem:"Não foi possível enviar a foto."},502)}

    const atualizacao=await env.DB.prepare(`UPDATE pets SET foto_url=? WHERE id=? AND LOWER(email)=LOWER(?)`).bind(resultadoCloudinary.secure_url,pet.id,sessao.email).run();
    if(!atualizacao.success||!atualizacao.meta?.changes)throw new Error("PHOTO_UPDATE_NOT_CONFIRMED");

    return responder({sucesso:true,mensagem:"Foto atualizada com sucesso.",fotoUrl:resultadoCloudinary.secure_url},201);
  }catch(erro){console.error("Erro em /api/tutor-foto:",erro);return responder({sucesso:false,mensagem:"Não foi possível atualizar a foto."},500)}
}

export async function onRequest(context){if(context.request.method!=="POST")return responder({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"POST"});return onRequestPost(context)}
