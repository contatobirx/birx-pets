import { authorized, clean, json, number, unauthorized } from "../admin-shared.js";

export async function onRequestGet({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const produtoId=Number(new URL(request.url).searchParams.get('produto_id'))||0;
  const where=produtoId?'WHERE m.ativo=1 AND m.produto_id=?':'WHERE m.ativo=1';
  const stmt=env.DB.prepare(`SELECT m.*,p.nome AS produto_nome,p.codigo AS produto_codigo FROM modelos_3d m JOIN produtos p ON p.id=m.produto_id ${where} ORDER BY p.nome COLLATE NOCASE,m.id DESC`);
  const result=produtoId?await stmt.bind(produtoId).all():await stmt.all();
  return json({sucesso:true,modelos:result.results||[]});
}

function data(body){return{produto_id:Number(body.produto_id),nome:clean(body.nome,140),versao:clean(body.versao,40)||null,arquivo_nome:clean(body.arquivo_nome,180)||null,arquivo_url:clean(body.arquivo_url,500)||null,peso_g:Math.max(0,number(body.peso_g)),tempo_minutos:Math.max(0,Math.trunc(number(body.tempo_minutos))),impressora:clean(body.impressora,120)||null,bico_mm:Math.max(0,number(body.bico_mm)),material_tipo:clean(body.material_tipo,60)||null,observacoes:clean(body.observacoes,800)||null}}

export async function onRequestPost({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const d=data(await request.json().catch(()=>({})));
  if(!d.produto_id||!d.nome)return json({sucesso:false,mensagem:'Informe produto e nome do modelo.'},400);
  const p=await env.DB.prepare(`SELECT id FROM produtos WHERE id=? AND ativo=1`).bind(d.produto_id).first();if(!p)return json({sucesso:false,mensagem:'Produto não encontrado.'},404);
  const r=await env.DB.prepare(`INSERT INTO modelos_3d (produto_id,nome,versao,arquivo_nome,arquivo_url,peso_g,tempo_minutos,impressora,bico_mm,material_tipo,observacoes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(d.produto_id,d.nome,d.versao,d.arquivo_nome,d.arquivo_url,d.peso_g,d.tempo_minutos,d.impressora,d.bico_mm,d.material_tipo,d.observacoes).run();
  return json({sucesso:true,id:r.meta?.last_row_id,mensagem:'Modelo 3D cadastrado.'},201);
}

export async function onRequestPut({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const body=await request.json().catch(()=>({})),id=Number(body.id),d=data(body);if(!id||!d.produto_id||!d.nome)return json({sucesso:false,mensagem:'Modelo inválido.'},400);
  const r=await env.DB.prepare(`UPDATE modelos_3d SET produto_id=?,nome=?,versao=?,arquivo_nome=?,arquivo_url=?,peso_g=?,tempo_minutos=?,impressora=?,bico_mm=?,material_tipo=?,observacoes=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND ativo=1`).bind(d.produto_id,d.nome,d.versao,d.arquivo_nome,d.arquivo_url,d.peso_g,d.tempo_minutos,d.impressora,d.bico_mm,d.material_tipo,d.observacoes,id).run();
  if(!r.meta?.changes)return json({sucesso:false,mensagem:'Modelo não encontrado.'},404);return json({sucesso:true,mensagem:'Modelo atualizado.'});
}

export async function onRequestDelete({request,env}){if(!(await authorized(request,env)))return unauthorized(env);const id=Number(new URL(request.url).searchParams.get('id'));if(!id)return json({sucesso:false,mensagem:'Modelo inválido.'},400);const r=await env.DB.prepare(`UPDATE modelos_3d SET ativo=0,atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND ativo=1`).bind(id).run();if(!r.meta?.changes)return json({sucesso:false,mensagem:'Modelo não encontrado.'},404);return json({sucesso:true,mensagem:'Modelo arquivado.'})}

export async function onRequest(context){if(context.request.method==='GET')return onRequestGet(context);if(context.request.method==='POST')return onRequestPost(context);if(context.request.method==='PUT')return onRequestPut(context);if(context.request.method==='DELETE')return onRequestDelete(context);return json({sucesso:false,mensagem:'Método não permitido.'},405)}
