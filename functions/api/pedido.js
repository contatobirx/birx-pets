const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(value,max=180)=>String(value??"").trim().slice(0,max);

export async function onRequestGet({request,env}){
  try{
    const url=new URL(request.url),code=clean(url.searchParams.get("codigo"),40).toUpperCase(),email=clean(url.searchParams.get("email"),160).toLowerCase();
    if(!code||!/^\S+@\S+\.\S+$/.test(email))return json({sucesso:false,mensagem:"Informe o código do pedido e o e-mail usado na compra."},400);
    const order=await env.DB.prepare(`SELECT codigo,nome,email,telefone,cep,logradouro,numero,complemento,bairro,cidade,estado,subtotal_centavos AS subtotalCentavos,desconto_centavos AS descontoCentavos,frete_centavos AS freteCentavos,total_centavos AS totalCentavos,forma_pagamento AS formaPagamento,status_pagamento AS statusPagamento,status_pedido AS statusPedido,cupom_codigo AS cupomCodigo,pix_copia_cola AS pixCopiaECola,codigo_rastreio AS codigoRastreio,criado_em AS criadoEm,pago_em AS pagoEm,enviado_em AS enviadoEm FROM loja_pedidos WHERE codigo=? AND LOWER(email)=? LIMIT 1`).bind(code,email).first();
    if(!order)return json({sucesso:false,mensagem:"Pedido não encontrado. Confira o código e o e-mail."},404);
    const [itemsResult,eventsResult]=await Promise.all([
      env.DB.prepare(`SELECT produto_slug AS slug,nome,preco_centavos AS precoCentavos,quantidade,total_centavos AS totalCentavos FROM loja_pedido_itens WHERE pedido_codigo=? ORDER BY id`).bind(code).all(),
      env.DB.prepare(`SELECT tipo,titulo,descricao,criado_em AS criadoEm FROM loja_pedido_eventos WHERE pedido_codigo=? ORDER BY id DESC`).bind(code).all()
    ]);
    return json({sucesso:true,pedido:{...order,itens:itemsResult.results||[],eventos:eventsResult.results||[],pixCopiaECola:order.statusPagamento==="aguardando"?order.pixCopiaECola:null}});
  }catch(error){console.error("pedido GET",error);return json({sucesso:false,mensagem:"Não foi possível consultar o pedido."},500)}
}

export async function onRequest(context){if(context.request.method==="GET")return onRequestGet(context);return json({sucesso:false,mensagem:"Método não permitido."},405)}
