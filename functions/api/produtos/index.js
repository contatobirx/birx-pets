import { authorized, clean, json, number, unauthorized } from "../admin-shared.js";

export async function onRequestGet({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const result=await env.DB.prepare(`SELECT id,nome,codigo,categoria,estoque,estoque_minimo,custo,preco_venda,observacoes,criado_em,atualizado_em FROM produtos WHERE ativo=1 ORDER BY nome COLLATE NOCASE`).all();
  return json({sucesso:true,produtos:result.results||[]});
}

export async function onRequestPost({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const body=await request.json().catch(()=>({}));
  const nome=clean(body.nome,140); if(!nome) return json({sucesso:false,mensagem:"Informe o nome do produto."},400);
  const codigo=clean(body.codigo,60)||null;
  if(codigo){ const existente=await env.DB.prepare(`SELECT id FROM produtos WHERE codigo=? AND ativo=1`).bind(codigo).first(); if(existente) return json({sucesso:false,mensagem:"Já existe um produto com esse código."},409); }
  const result=await env.DB.prepare(`INSERT INTO produtos (nome,codigo,categoria,estoque,estoque_minimo,custo,preco_venda,observacoes) VALUES (?,?,?,?,?,?,?,?)`)
    .bind(nome,codigo,clean(body.categoria,80)||"Birx ID",Math.max(0,number(body.estoque)),Math.max(0,number(body.estoque_minimo)),Math.max(0,number(body.custo)),Math.max(0,number(body.preco_venda)),clean(body.observacoes,800)).run();
  return json({sucesso:true,id:result.meta?.last_row_id,mensagem:"Produto cadastrado."},201);
}

export async function onRequestPut({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const body=await request.json().catch(()=>({})); const id=Number(body.id); const nome=clean(body.nome,140);
  if(!id||!nome) return json({sucesso:false,mensagem:"Produto inválido."},400);
  const codigo=clean(body.codigo,60)||null;
  if(codigo){ const existente=await env.DB.prepare(`SELECT id FROM produtos WHERE codigo=? AND ativo=1 AND id<>?`).bind(codigo,id).first(); if(existente) return json({sucesso:false,mensagem:"Já existe outro produto com esse código."},409); }
  const result=await env.DB.prepare(`UPDATE produtos SET nome=?,codigo=?,categoria=?,estoque_minimo=?,custo=?,preco_venda=?,observacoes=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND ativo=1`)
    .bind(nome,codigo,clean(body.categoria,80)||"Birx ID",Math.max(0,number(body.estoque_minimo)),Math.max(0,number(body.custo)),Math.max(0,number(body.preco_venda)),clean(body.observacoes,800),id).run();
  if(!result.meta?.changes) return json({sucesso:false,mensagem:"Produto não encontrado."},404);
  return json({sucesso:true,mensagem:"Produto atualizado."});
}

export async function onRequestDelete({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const id=Number(new URL(request.url).searchParams.get("id")); if(!id) return json({sucesso:false,mensagem:"Produto inválido."},400);
  const result=await env.DB.prepare(`UPDATE produtos SET ativo=0,atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND ativo=1`).bind(id).run();
  if(!result.meta?.changes) return json({sucesso:false,mensagem:"Produto não encontrado."},404);
  return json({sucesso:true,mensagem:"Produto arquivado."});
}

export async function onRequest(context){
  if(context.request.method==="GET") return onRequestGet(context);
  if(context.request.method==="POST") return onRequestPost(context);
  if(context.request.method==="PUT") return onRequestPut(context);
  if(context.request.method==="DELETE") return onRequestDelete(context);
  return json({sucesso:false,mensagem:"Método não permitido."},405);
}
