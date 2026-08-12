Exit code: 0
Wall time: 1.7 seconds
Output:
function json(dados,status=200){return new Response(JSON.stringify(dados),{status,headers:{'Content-Type':'application/json; charset=UTF-8','Cache-Control':'no-store'}})}
function limpar(v,max=120){return String(v??'').trim().slice(0,max)}
async function sha1(valor){const dados=new TextEncoder().encode(valor),hash=await crypto.subtle.digest('SHA-1',dados);return Array.from(new Uint8Array(hash)).map(byte=>byte.toString(16).padStart(2,'0')).join('')}

export async function onRequestPost({request,env}){
  try{
    const {CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET}=env;
    if(!CLOUDINARY_CLOUD_NAME||!CLOUDINARY_API_KEY||!CLOUDINARY_API_SECRET)return json({sucesso:false,mensagem:'A prÃ©via estÃ¡ temporariamente indisponÃ­vel.'},503);
    const form=await request.formData();
    const arquivo=form.get('imagem');
    const nome=limpar(form.get('nome'),8).toUpperCase();
    if(!arquivo||typeof arquivo.arrayBuffer!=='function'||arquivo.type!=='image/png')return json({sucesso:false,mensagem:'PrÃ©via invÃ¡lida.'},400);
    if(arquivo.size<=0||arquivo.size>4*1024*1024)return json({sucesso:false,mensagem:'A prÃ©via excedeu o tamanho permitido.'},400);
    if(!nome||!/^[A-ZÃ€-Ã0-9 -]{1,8}$/i.test(nome))return json({sucesso:false,mensagem:'O nome da personalizaÃ§Ã£o deve ter atÃ© 8 caracteres.'},400);

    const timestamp=Math.floor(Date.now()/1000);
    const pasta='birx-pets/personalizacoes';
    const publicId=`previa-${timestamp}-${crypto.randomUUID().slice(0,8)}`;
    const assinatura=await sha1(`folder=${pasta}&public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`);
    const dados=new FormData();
    dados.append('file',arquivo);
    dados.append('api_key',CLOUDINARY_API_KEY);
    dados.append('timestamp',String(timestamp));
    dados.append('signature',assinatura);
    dados.append('folder',pasta);
    dados.append('public_id',publicId);

    const resposta=await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,{method:'POST',body:dados});
    const cloud=await resposta.json().catch(()=>({}));
    if(!resposta.ok||!cloud.secure_url){console.error('Erro ao enviar prÃ©via:',cloud);return json({sucesso:false,mensagem:'NÃ£o foi possÃ­vel gerar a prÃ©via do pedido.'},502)}
    return json({sucesso:true,url:cloud.secure_url},201);
  }catch(erro){console.error('Erro em personalizacao-preview:',erro);return json({sucesso:false,mensagem:'NÃ£o foi possÃ­vel gerar a prÃ©via do pedido.'},500)}
}

export function onRequestGet(){return json({sucesso:false,mensagem:'MÃ©todo nÃ£o permitido.'},405)}

