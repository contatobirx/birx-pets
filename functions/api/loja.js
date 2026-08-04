const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(value,max=200)=>String(value??"").trim().slice(0,max);
const digits=value=>String(value??"").replace(/\D/g,"");
const money=cents=>(Number(cents||0)/100).toFixed(2);
const field=(id,value)=>`${id}${String(String(value).length).padStart(2,"0")}${value}`;

async function setup(env){
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS loja_produtos(id INTEGER PRIMARY KEY AUTOINCREMENT,slug TEXT NOT NULL UNIQUE,nome TEXT NOT NULL,descricao TEXT NOT NULL,categoria TEXT NOT NULL,imagem_url TEXT,icone TEXT,preco_centavos INTEGER NOT NULL,estoque INTEGER NOT NULL DEFAULT 0,ativo INTEGER NOT NULL DEFAULT 1,destaque INTEGER NOT NULL DEFAULT 0,ordem INTEGER NOT NULL DEFAULT 0,criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS loja_cupons(id INTEGER PRIMARY KEY AUTOINCREMENT,codigo TEXT NOT NULL UNIQUE,tipo TEXT NOT NULL DEFAULT 'percentual',valor INTEGER NOT NULL,minimo_centavos INTEGER NOT NULL DEFAULT 0,limite_usos INTEGER,usos INTEGER NOT NULL DEFAULT 0,parceiro_id INTEGER,ativo INTEGER NOT NULL DEFAULT 1,valido_ate TEXT,criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS loja_pedidos(id INTEGER PRIMARY KEY AUTOINCREMENT,codigo TEXT NOT NULL UNIQUE,nome TEXT NOT NULL,email TEXT NOT NULL,telefone TEXT NOT NULL,cep TEXT NOT NULL,logradouro TEXT NOT NULL,numero TEXT NOT NULL,complemento TEXT,bairro TEXT NOT NULL,cidade TEXT NOT NULL,estado TEXT NOT NULL,subtotal_centavos INTEGER NOT NULL,desconto_centavos INTEGER NOT NULL DEFAULT 0,frete_centavos INTEGER NOT NULL DEFAULT 0,total_centavos INTEGER NOT NULL,forma_pagamento TEXT NOT NULL DEFAULT 'pix',status_pagamento TEXT NOT NULL DEFAULT 'aguardando',status_pedido TEXT NOT NULL DEFAULT 'novo',cupom_codigo TEXT,referencia_parceiro TEXT,pix_txid TEXT,pix_copia_cola TEXT,codigo_rastreio TEXT,observacoes TEXT,origem_hash TEXT,estoque_devolvido INTEGER NOT NULL DEFAULT 0,pago_em TEXT,enviado_em TEXT,criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS loja_pedido_itens(id INTEGER PRIMARY KEY AUTOINCREMENT,pedido_codigo TEXT NOT NULL,produto_id INTEGER NOT NULL,produto_slug TEXT NOT NULL,nome TEXT NOT NULL,preco_centavos INTEGER NOT NULL,quantidade INTEGER NOT NULL,total_centavos INTEGER NOT NULL)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS loja_pedido_eventos(id INTEGER PRIMARY KEY AUTOINCREMENT,pedido_codigo TEXT NOT NULL,tipo TEXT NOT NULL,titulo TEXT NOT NULL,descricao TEXT,criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  ]);
}

function normalizePix(value,max){
  return clean(value,max).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9 $%*+\-./:]/g,"").toUpperCase().slice(0,max);
}

function crc16(payload){
  let crc=0xFFFF;
  for(let i=0;i<payload.length;i++){
    crc^=payload.charCodeAt(i)<<8;
    for(let bit=0;bit<8;bit++)crc=(crc&0x8000)?((crc<<1)^0x1021)&0xFFFF:(crc<<1)&0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4,"0");
}

function pixPayload(env,totalCentavos,txid){
  const key=clean(env.PIX_CHAVE,77),name=normalizePix(env.PIX_RECEBEDOR,25),city=normalizePix(env.PIX_CIDADE,15);
  if(!key||!name||!city)return "";
  const baseAccount=field("00","BR.GOV.BCB.PIX")+field("01",key),description=field("02","PEDIDO BIRX PETS"),account=baseAccount.length+description.length<=99?baseAccount+description:baseAccount;
  const additional=field("05",normalizePix(txid,25)||"***");
  const base=field("00","01")+field("01","12")+field("26",account)+field("52","0000")+field("53","986")+field("54",money(totalCentavos))+field("58","BR")+field("59",name)+field("60",city)+field("62",additional)+"6304";
  return base+crc16(base);
}

function orderCode(){
  const now=new Date(),day=now.toISOString().slice(0,10).replaceAll("-",""),bytes=crypto.getRandomValues(new Uint8Array(4));
  return `BIRX-${day}-${[...bytes].map(x=>x.toString(36).padStart(2,"0")).join("").toUpperCase().slice(0,6)}`;
}

async function sourceHash(request){
  const source=clean(request.headers.get("CF-Connecting-IP")||request.headers.get("X-Forwarded-For")||"desconhecida",100);
  const data=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(source));
  return [...new Uint8Array(data)].map(x=>x.toString(16).padStart(2,"0")).join("");
}

async function sendOrderEmail(env,order,items){
  if(!env.RESEND_API_KEY||!env.EMAIL_REMETENTE)return;
  const rows=items.map(item=>`<tr><td style="padding:8px 0">${item.quantidade}x ${item.nome}</td><td style="padding:8px 0;text-align:right">R$ ${money(item.totalCentavos).replace(".",",")}</td></tr>`).join("");
  const tracking=`https://pets.birx.com.br/pedido?codigo=${encodeURIComponent(order.codigo)}&email=${encodeURIComponent(order.email)}`;
  const html=`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#14213d"><p style="color:#2563eb;font-weight:800">BIRX PETS</p><h1>Recebemos seu pedido</h1><p>Olá, ${order.nome}. Seu pedido <strong>${order.codigo}</strong> foi criado.</p><table style="width:100%;border-collapse:collapse">${rows}<tr><td style="padding:14px 0;border-top:1px solid #ddd"><strong>Total</strong></td><td style="padding:14px 0;border-top:1px solid #ddd;text-align:right"><strong>R$ ${money(order.totalCentavos).replace(".",",")}</strong></td></tr></table><p>Forma de pagamento: Pix. A produção e o envio começam após a confirmação.</p><p><a href="${tracking}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:13px 18px;border-radius:10px">Acompanhar pedido</a></p><small>Suporte: contato@pets.birx.com.br • (41) 98831-5017</small></div>`;
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:env.EMAIL_REMETENTE,to:[order.email],subject:`Pedido ${order.codigo} | BIRX Pets`,html})});
  if(!response.ok)console.error("loja email",await response.text());
}

export async function onRequestGet({env}){
  try{
    await setup(env);
    const result=await env.DB.prepare(`SELECT id,slug,nome,descricao,categoria,imagem_url AS imagemUrl,icone,preco_centavos AS precoCentavos,estoque,destaque FROM loja_produtos WHERE ativo=1 ORDER BY ordem,id`).all();
    const freeFrom=Math.max(0,Number.parseInt(env.LOJA_FRETE_GRATIS_CENTAVOS,10)||14900),shipping=Math.max(0,Number.parseInt(env.LOJA_FRETE_CENTAVOS,10)||1290);
    return json({sucesso:true,produtos:result.results||[],configuracao:{freteCentavos:shipping,freteGratisAPartirCentavos:freeFrom,pixConfigurado:Boolean(env.PIX_CHAVE&&env.PIX_RECEBEDOR&&env.PIX_CIDADE),whatsapp:"5541988315017",email:"contato@pets.birx.com.br"}});
  }catch(error){console.error("loja GET",error);return json({sucesso:false,mensagem:"Não foi possível carregar a loja."},500)}
}

export async function onRequestPost({request,env}){
  try{
    await setup(env);
    const body=await request.json().catch(()=>({})),customer=body.cliente||{},address=body.endereco||{},rawItems=Array.isArray(body.itens)?body.itens.slice(0,15):[];
    const name=clean(customer.nome,120),email=clean(customer.email,160).toLowerCase(),phone=digits(customer.telefone).slice(0,13),cep=digits(address.cep).slice(0,8),street=clean(address.logradouro,160),number=clean(address.numero,30),extra=clean(address.complemento,100),district=clean(address.bairro,100),city=clean(address.cidade,100),state=clean(address.estado,2).toUpperCase(),notes=clean(body.observacoes,500),reference=clean(body.referenciaParceiro,60).toUpperCase(),couponCode=clean(body.cupom,40).toUpperCase();
    if(name.length<3||!/^\S+@\S+\.\S+$/.test(email)||phone.length<10)return json({sucesso:false,mensagem:"Informe nome, e-mail e telefone válidos."},400);
    if(cep.length!==8||!street||!number||!district||!city||!/^[A-Z]{2}$/.test(state))return json({sucesso:false,mensagem:"Preencha o endereço completo para entrega."},400);
    const quantities=new Map();
    for(const item of rawItems){const slug=clean(item.slug,80),quantity=Math.min(10,Math.max(1,Number.parseInt(item.quantidade,10)||0));if(slug)quantities.set(slug,Math.min(10,(quantities.get(slug)||0)+quantity))}
    if(!quantities.size)return json({sucesso:false,mensagem:"Seu carrinho está vazio."},400);
    const recent=await env.DB.prepare("SELECT COUNT(*) AS total FROM loja_pedidos WHERE origem_hash=? AND criado_em>=datetime('now','-1 hour')").bind(await sourceHash(request)).first();
    if(Number(recent?.total||0)>=5)return json({sucesso:false,mensagem:"Muitos pedidos foram enviados recentemente. Fale com o suporte BIRX."},429);
    const slugs=[...quantities.keys()],placeholders=slugs.map(()=>"?").join(","),result=await env.DB.prepare(`SELECT id,slug,nome,preco_centavos AS precoCentavos,estoque FROM loja_produtos WHERE ativo=1 AND slug IN (${placeholders})`).bind(...slugs).all(),products=result.results||[];
    if(products.length!==slugs.length)return json({sucesso:false,mensagem:"Um dos produtos não está mais disponível."},409);
    const items=[];
    for(const product of products){const quantity=quantities.get(product.slug);if(Number(product.estoque)<quantity)return json({sucesso:false,mensagem:`Estoque insuficiente para ${product.nome}.`},409);items.push({produtoId:product.id,slug:product.slug,nome:product.nome,precoCentavos:Number(product.precoCentavos),quantidade:quantity,totalCentavos:Number(product.precoCentavos)*quantity})}
    const subtotal=items.reduce((sum,item)=>sum+item.totalCentavos,0);
    let discount=0,coupon=null;
    if(couponCode){coupon=await env.DB.prepare(`SELECT id,codigo,tipo,valor,minimo_centavos AS minimoCentavos,limite_usos AS limiteUsos,usos FROM loja_cupons WHERE UPPER(codigo)=? AND ativo=1 AND (valido_ate IS NULL OR datetime(valido_ate)>=CURRENT_TIMESTAMP) LIMIT 1`).bind(couponCode).first();if(!coupon||subtotal<Number(coupon.minimoCentavos)||coupon.limiteUsos!==null&&Number(coupon.usos)>=Number(coupon.limiteUsos))return json({sucesso:false,mensagem:"Cupom inválido, expirado ou indisponível para este pedido."},400);discount=coupon.tipo==="percentual"?Math.floor(subtotal*Math.min(100,Number(coupon.valor))/100):Math.min(subtotal,Number(coupon.valor));}
    const shippingValue=Math.max(0,Number.parseInt(env.LOJA_FRETE_CENTAVOS,10)||1290),freeFrom=Math.max(0,Number.parseInt(env.LOJA_FRETE_GRATIS_CENTAVOS,10)||14900),shipping=subtotal-discount>=freeFrom?0:shippingValue,total=subtotal-discount+shipping,code=orderCode(),txid=code.replace(/[^A-Z0-9]/g,"").slice(0,25),pix=pixPayload(env,total,txid),origin=await sourceHash(request);
    const statements=[env.DB.prepare(`INSERT INTO loja_pedidos(codigo,nome,email,telefone,cep,logradouro,numero,complemento,bairro,cidade,estado,subtotal_centavos,desconto_centavos,frete_centavos,total_centavos,cupom_codigo,referencia_parceiro,pix_txid,pix_copia_cola,observacoes,origem_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(code,name,email,phone,cep,street,number,extra||null,district,city,state,subtotal,discount,shipping,total,coupon?.codigo||null,reference||null,txid,pix||null,notes||null,origin),env.DB.prepare(`INSERT INTO loja_pedido_eventos(pedido_codigo,tipo,titulo,descricao) VALUES(?,'pedido','Pedido recebido','Aguardando a confirmação do pagamento por Pix.')`).bind(code)];
    for(const item of items){statements.push(env.DB.prepare(`INSERT INTO loja_pedido_itens(pedido_codigo,produto_id,produto_slug,nome,preco_centavos,quantidade,total_centavos) VALUES(?,?,?,?,?,?,?)`).bind(code,item.produtoId,item.slug,item.nome,item.precoCentavos,item.quantidade,item.totalCentavos));statements.push(env.DB.prepare("UPDATE loja_produtos SET estoque=estoque-?,atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND estoque>=?").bind(item.quantidade,item.produtoId,item.quantidade))}
    if(coupon)statements.push(env.DB.prepare("UPDATE loja_cupons SET usos=usos+1 WHERE id=?").bind(coupon.id));
    await env.DB.batch(statements);
    const order={codigo:code,nome:name,email,totalCentavos:total};
    await sendOrderEmail(env,order,items).catch(error=>console.error("loja email",error));
    return json({sucesso:true,mensagem:"Pedido criado com sucesso.",pedido:{codigo:code,totalCentavos:total,statusPagamento:"aguardando",pixCopiaECola:pix,pixConfigurado:Boolean(pix),acompanhamento:`/pedido?codigo=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`,whatsapp:`https://wa.me/5541988315017?text=${encodeURIComponent(`Olá! Preciso de ajuda com o pedido ${code}.`)}`}},201);
  }catch(error){console.error("loja POST",error);return json({sucesso:false,mensagem:"Não foi possível concluir o pedido. Revise os dados ou fale com a BIRX."},500)}
}

export async function onRequest(context){if(context.request.method==="GET")return onRequestGet(context);if(context.request.method==="POST")return onRequestPost(context);return json({sucesso:false,mensagem:"Método não permitido."},405)}
