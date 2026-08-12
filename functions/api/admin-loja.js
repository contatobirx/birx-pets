const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(value,max=180)=>String(value??"").trim().slice(0,max);
async function digest(value){const data=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return[...new Uint8Array(data)].map(byte=>byte.toString(16).padStart(2,"0")).join("")}
async function authorized(request,env){const supplied=clean(request.headers.get("X-BIRX-Admin"),500),expected=clean(env.TAG_ADMIN_TOKEN,500);return Boolean(supplied&&expected&&(await digest(supplied))===(await digest(expected)))}

async function sendStatusEmail(env,order,title,message){
  if(!env.RESEND_API_KEY||!env.EMAIL_REMETENTE)return;
  const tracking=`https://pets.birx.com.br/pedido?codigo=${encodeURIComponent(order.codigo)}&email=${encodeURIComponent(order.email)}`;
  const html=`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#14213d"><p style="color:#2563eb;font-weight:800">BIRX PETS</p><h1>${title}</h1><p>Olá, ${order.nome}. ${message}</p><p><strong>Pedido:</strong> ${order.codigo}</p><p><a href="${tracking}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:13px 18px;border-radius:10px">Acompanhar pedido</a></p><small>Suporte: contato@pets.birx.com.br • (41) 98831-5017</small></div>`;
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:env.EMAIL_REMETENTE,to:[order.email],subject:`${title} | ${order.codigo}`,html})});
  if(!response.ok)console.error("admin-loja email",await response.text());
}

export async function onRequestGet({request,env}){
  if(!await authorized(request,env))return json({sucesso:false,mensagem:env.TAG_ADMIN_TOKEN?"Chave administrativa inválida.":"Configure TAG_ADMIN_TOKEN na Cloudflare."},401);
  try{
    const url=new URL(request.url),search=clean(url.searchParams.get("busca"),100),like=`%${search}%`;
    const [orders,products,coupons,summary]=await Promise.all([
      env.DB.prepare(`SELECT codigo,nome,email,telefone,cidade,estado,total_centavos AS totalCentavos,status_pagamento AS statusPagamento,status_pedido AS statusPedido,codigo_rastreio AS codigoRastreio,referencia_parceiro AS referenciaParceiro,modalidade_entrega AS modalidadeEntrega,frete_descricao AS freteDescricao,prazo_entrega_min_dias AS prazoEntregaMinDias,prazo_entrega_max_dias AS prazoEntregaMaxDias,comprovante_url AS comprovanteUrl,comprovante_enviado_em AS comprovanteEnviadoEm,criado_em AS criadoEm FROM loja_pedidos WHERE ?='' OR codigo LIKE ? OR nome LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 200`).bind(search,like,like,like).all(),
      env.DB.prepare(`SELECT id,slug,nome,categoria,preco_centavos AS precoCentavos,estoque,ativo,destaque FROM loja_produtos ORDER BY ordem,id`).all(),
      env.DB.prepare(`SELECT id,codigo,tipo,valor,minimo_centavos AS minimoCentavos,limite_usos AS limiteUsos,usos,ativo,valido_ate AS validoAte FROM loja_cupons ORDER BY id DESC`).all(),
      env.DB.prepare(`SELECT COUNT(*) AS pedidos,SUM(CASE WHEN status_pagamento='pago' THEN total_centavos ELSE 0 END) AS recebido,SUM(CASE WHEN status_pagamento='aguardando' THEN 1 ELSE 0 END) AS aguardando,SUM(CASE WHEN status_pedido='enviado' THEN 1 ELSE 0 END) AS enviados,SUM(CASE WHEN status_pagamento='aguardando' AND comprovante_enviado_em IS NOT NULL THEN 1 ELSE 0 END) AS comprovantes FROM loja_pedidos`).first()
    ]);
    return json({sucesso:true,pedidos:orders.results||[],produtos:products.results||[],cupons:coupons.results||[],resumo:{pedidos:Number(summary?.pedidos||0),recebidoCentavos:Number(summary?.recebido||0),aguardando:Number(summary?.aguardando||0),enviados:Number(summary?.enviados||0),comprovantes:Number(summary?.comprovantes||0)}});
  }catch(error){console.error("admin-loja GET",error);return json({sucesso:false,mensagem:"Não foi possível carregar a administração da loja."},500)}
}

export async function onRequestPost({request,env}){
  if(!await authorized(request,env))return json({sucesso:false,mensagem:env.TAG_ADMIN_TOKEN?"Chave administrativa inválida.":"Configure TAG_ADMIN_TOKEN na Cloudflare."},401);
  try{
    const body=await request.json().catch(()=>({})),action=clean(body.acao,40);
    if(action==="pagamento"){
      const code=clean(body.codigo,40).toUpperCase(),status=clean(body.status,30);
      if(!["aguardando","pago","cancelado","reembolsado"].includes(status))return json({sucesso:false,mensagem:"Status de pagamento inválido."},400);
      const order=await env.DB.prepare("SELECT codigo,nome,email,status_pagamento AS statusPagamento FROM loja_pedidos WHERE codigo=? LIMIT 1").bind(code).first();
      if(!order)return json({sucesso:false,mensagem:"Pedido não encontrado."},404);
      await env.DB.batch([env.DB.prepare(`UPDATE loja_pedidos SET status_pagamento=?,pago_em=CASE WHEN ?='pago' THEN COALESCE(pago_em,CURRENT_TIMESTAMP) ELSE pago_em END,atualizado_em=CURRENT_TIMESTAMP WHERE codigo=?`).bind(status,status,code),env.DB.prepare(`INSERT INTO loja_pedido_eventos(pedido_codigo,tipo,titulo,descricao) VALUES(?,'pagamento',?,?)`).bind(code,status==="pago"?"Pagamento confirmado":status==="reembolsado"?"Pagamento reembolsado":"Pagamento atualizado",`Status do pagamento: ${status}.`)]);
      if(status==="pago"&&order.statusPagamento!=="pago")await sendStatusEmail(env,order,"Pagamento confirmado","O pagamento foi confirmado e seu pedido seguirá para preparação.").catch(console.error);
      return json({sucesso:true,mensagem:"Pagamento atualizado."});
    }
    if(action==="pedido"){
      const code=clean(body.codigo,40).toUpperCase(),status=clean(body.status,30),tracking=clean(body.codigoRastreio,100);
      if(!["novo","separando","enviado","entregue","cancelado"].includes(status))return json({sucesso:false,mensagem:"Status do pedido inválido."},400);
      const order=await env.DB.prepare("SELECT codigo,nome,email,status_pedido AS statusPedido,estoque_devolvido AS estoqueDevolvido FROM loja_pedidos WHERE codigo=? LIMIT 1").bind(code).first();if(!order)return json({sucesso:false,mensagem:"Pedido não encontrado."},404);
      if(order.statusPedido==="cancelado"&&status!=="cancelado")return json({sucesso:false,mensagem:"Um pedido cancelado não pode ser reaberto. Crie um novo pedido."},409);
      const titles={novo:"Pedido recebido",separando:"Pedido em preparação",enviado:"Pedido enviado",entregue:"Pedido entregue",cancelado:"Pedido cancelado"};
      const statements=[env.DB.prepare(`UPDATE loja_pedidos SET status_pedido=?,codigo_rastreio=NULLIF(?,''),enviado_em=CASE WHEN ?='enviado' THEN COALESCE(enviado_em,CURRENT_TIMESTAMP) ELSE enviado_em END,estoque_devolvido=CASE WHEN ?='cancelado' THEN 1 ELSE estoque_devolvido END,atualizado_em=CURRENT_TIMESTAMP WHERE codigo=?`).bind(status,tracking,status,status,code),env.DB.prepare(`INSERT INTO loja_pedido_eventos(pedido_codigo,tipo,titulo,descricao) VALUES(?,'pedido',?,?)`).bind(code,titles[status],tracking?`Código de rastreio: ${tracking}`:`Status do pedido: ${status}.`)];
      if(status==="cancelado"&&!Number(order.estoqueDevolvido)){const items=await env.DB.prepare("SELECT produto_id AS produtoId,quantidade FROM loja_pedido_itens WHERE pedido_codigo=?").bind(code).all();for(const item of items.results||[])statements.push(env.DB.prepare("UPDATE loja_produtos SET estoque=estoque+?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?").bind(item.quantidade,item.produtoId))}
      await env.DB.batch(statements);
      if(["enviado","entregue"].includes(status))await sendStatusEmail(env,order,titles[status],status==="enviado"?`Seu pedido foi enviado${tracking?` com o rastreio ${tracking}`:""}.`:"Seu pedido foi marcado como entregue.").catch(console.error);
      return json({sucesso:true,mensagem:"Pedido atualizado."});
    }
    if(action==="produto"){
      const id=Number.parseInt(body.id,10),price=Math.round(Number(body.preco)*100),stock=Number.parseInt(body.estoque,10),active=body.ativo?1:0;
      if(!id||!Number.isInteger(price)||price<1||price>100000000||!Number.isInteger(stock)||stock<0||stock>100000)return json({sucesso:false,mensagem:"Preço ou estoque inválido."},400);
      await env.DB.prepare("UPDATE loja_produtos SET preco_centavos=?,estoque=?,ativo=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?").bind(price,stock,active,id).run();return json({sucesso:true,mensagem:"Produto atualizado."});
    }
    if(action==="cupom"){
      const code=clean(body.codigo,30).toUpperCase().replace(/[^A-Z0-9_-]/g,""),type=body.tipo==="fixo"?"fixo":"percentual",value=type==="percentual"?Math.round(Number(body.valor)):Math.round(Number(body.valor)*100),minimum=Math.max(0,Math.round(Number(body.minimo||0)*100)),limit=body.limite?Math.max(1,Number.parseInt(body.limite,10)):null,validUntil=clean(body.validoAte,10)||null;
      if(code.length<3||!Number.isInteger(value)||value<1||type==="percentual"&&value>100)return json({sucesso:false,mensagem:"Informe um cupom válido."},400);
      await env.DB.prepare(`INSERT INTO loja_cupons(codigo,tipo,valor,minimo_centavos,limite_usos,ativo,valido_ate) VALUES(?,?,?,?,?,1,?) ON CONFLICT(codigo) DO UPDATE SET tipo=excluded.tipo,valor=excluded.valor,minimo_centavos=excluded.minimo_centavos,limite_usos=excluded.limite_usos,ativo=1,valido_ate=excluded.valido_ate`).bind(code,type,value,minimum,limit,validUntil).run();return json({sucesso:true,mensagem:"Cupom salvo."});
    }
    if(action==="cupom-status"){
      const id=Number.parseInt(body.id,10);if(!id)return json({sucesso:false,mensagem:"Cupom inválido."},400);await env.DB.prepare("UPDATE loja_cupons SET ativo=CASE WHEN ativo=1 THEN 0 ELSE 1 END WHERE id=?").bind(id).run();return json({sucesso:true,mensagem:"Cupom atualizado."});
    }
    return json({sucesso:false,mensagem:"Ação inválida."},400);
  }catch(error){console.error("admin-loja POST",error);return json({sucesso:false,mensagem:"Não foi possível atualizar a loja."},500)}
}

export async function onRequest(context){if(context.request.method==="GET")return onRequestGet(context);if(context.request.method==="POST")return onRequestPost(context);return json({sucesso:false,mensagem:"Método não permitido."},405)}
