const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(value,max=180)=>String(value??"").trim().slice(0,max);
async function digest(value,algorithm="SHA-1"){const data=await crypto.subtle.digest(algorithm,new TextEncoder().encode(value));return[...new Uint8Array(data)].map(byte=>byte.toString(16).padStart(2,"0")).join("")}

async function upload(env,file,code){
  if(!env.CLOUDINARY_CLOUD_NAME||!env.CLOUDINARY_API_KEY||!env.CLOUDINARY_API_SECRET)throw new Error("O envio de comprovantes ainda não está configurado.");
  const timestamp=Math.floor(Date.now()/1000),folder="birx-pets/comprovantes",publicId=`${code.toLowerCase()}-${timestamp}`,signature=await digest(`folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`),form=new FormData();
  form.append("file",file);form.append("api_key",env.CLOUDINARY_API_KEY);form.append("timestamp",String(timestamp));form.append("signature",signature);form.append("folder",folder);form.append("public_id",publicId);
  const resource=file.type==="application/pdf"?"raw":"image",response=await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resource}/upload`,{method:"POST",body:form}),data=await response.json();
  if(!response.ok||!data.secure_url)throw new Error(data?.error?.message||"Não foi possível enviar o comprovante.");
  return{url:data.secure_url,publicId:data.public_id};
}

async function notifyTeam(env,order){
  if(!env.RESEND_API_KEY||!env.EMAIL_REMETENTE)return;
  const destination=clean(env.EMAIL_ADMIN_LOJA,160)||"contato@pets.birx.com.br",tracking=`https://pets.birx.com.br/admin-loja`;
  await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:env.EMAIL_REMETENTE,to:[destination],subject:`Comprovante recebido | ${order.codigo}`,html:`<div style="font-family:Arial,sans-serif"><h1>Novo comprovante de Pix</h1><p>O cliente ${order.nome} enviou um comprovante para o pedido <strong>${order.codigo}</strong>.</p><p><a href="${tracking}">Abrir administração da loja</a></p></div>`})});
}

export async function onRequestPost({request,env}){
  try{
    const form=await request.formData(),code=clean(form.get("codigo"),40).toUpperCase(),email=clean(form.get("email"),160).toLowerCase(),file=form.get("arquivo");
    if(!code||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({sucesso:false,mensagem:"Informe o pedido e o e-mail da compra."},400);
    if(!file||!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size<1||file.size>5*1024*1024)return json({sucesso:false,mensagem:"Envie uma imagem ou PDF de até 5 MB."},400);
    const order=await env.DB.prepare(`SELECT codigo,nome,email,status_pagamento AS statusPagamento,comprovante_url AS comprovanteUrl FROM loja_pedidos WHERE codigo=? AND LOWER(email)=? LIMIT 1`).bind(code,email).first();
    if(!order)return json({sucesso:false,mensagem:"Pedido não encontrado."},404);
    if(order.statusPagamento!=="aguardando")return json({sucesso:false,mensagem:"Este pedido não está aguardando pagamento."},409);
    if(order.comprovanteUrl)return json({sucesso:false,mensagem:"Um comprovante já foi enviado para este pedido."},409);
    const proof=await upload(env,file,code);
    await env.DB.batch([env.DB.prepare(`UPDATE loja_pedidos SET comprovante_url=?,comprovante_public_id=?,comprovante_enviado_em=CURRENT_TIMESTAMP,atualizado_em=CURRENT_TIMESTAMP WHERE codigo=?`).bind(proof.url,proof.publicId,code),env.DB.prepare(`INSERT INTO loja_pedido_eventos(pedido_codigo,tipo,titulo,descricao) VALUES(?,'pagamento','Comprovante enviado','A equipe BIRX fará a conferência do pagamento.')`).bind(code)]);
    await notifyTeam(env,order).catch(error=>console.error("comprovante email",error));
    return json({sucesso:true,mensagem:"Comprovante enviado. A BIRX fará a conferência."},201);
  }catch(error){console.error("comprovante POST",error);return json({sucesso:false,mensagem:error.message||"Não foi possível enviar o comprovante."},500)}
}

export async function onRequest(context){if(context.request.method==="POST")return onRequestPost(context);return json({sucesso:false,mensagem:"Método não permitido."},405)}
