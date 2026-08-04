import{quoteDelivery}from"../_shared/loja-frete.js";
const HEADERS={"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:HEADERS});
const clean=(value,max=80)=>String(value??"").trim().slice(0,max);

export async function onRequestPost({request,env}){
  try{
    const body=await request.json().catch(()=>({})),rawItems=Array.isArray(body.itens)?body.itens.slice(0,15):[],quantities=new Map();
    for(const item of rawItems){const slug=clean(item.slug),quantity=Math.min(10,Math.max(1,Number.parseInt(item.quantidade,10)||0));if(slug)quantities.set(slug,Math.min(10,(quantities.get(slug)||0)+quantity))}
    if(!quantities.size)return json({sucesso:false,mensagem:"Adicione um produto antes de calcular a entrega."},400);
    const slugs=[...quantities.keys()],result=await env.DB.prepare(`SELECT slug,preco_centavos AS precoCentavos FROM loja_produtos WHERE ativo=1 AND slug IN (${slugs.map(()=>"?").join(",")})`).bind(...slugs).all();
    if((result.results||[]).length!==slugs.length)return json({sucesso:false,mensagem:"Um produto do carrinho não está disponível."},409);
    const subtotal=(result.results||[]).reduce((sum,item)=>sum+Number(item.precoCentavos)*quantities.get(item.slug),0),quote=await quoteDelivery(env,body.cep,subtotal);
    return json({sucesso:true,subtotalCentavos:subtotal,...quote});
  }catch(error){console.error("frete POST",error);return json({sucesso:false,mensagem:error.message||"Não foi possível calcular a entrega."},400)}
}

export async function onRequest(context){if(context.request.method==="POST")return onRequestPost(context);return json({sucesso:false,mensagem:"Método não permitido."},405)}
