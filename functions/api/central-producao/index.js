import { authorized, clean, json, number, unauthorized } from "../admin-shared.js";

async function list(env){
  const [ordens,impressoras]=await Promise.all([
    env.DB.prepare(`SELECT o.*,p.nome AS produto_nome,m.nome AS modelo_nome,m.versao,m.arquivo_nome,m.principal,m.cor_recomendada,m.preview_r2_key,i.nome AS impressora_nome FROM ordens_impressao o JOIN produtos p ON p.id=o.produto_id LEFT JOIN modelos_3d m ON m.id=o.modelo_3d_id LEFT JOIN impressoras_3d i ON i.id=o.impressora_id ORDER BY CASE o.status WHEN 'imprimindo' THEN 0 WHEN 'fila' THEN 1 WHEN 'pausada' THEN 2 ELSE 3 END,o.id DESC LIMIT 200`).all(),
    env.DB.prepare(`SELECT * FROM impressoras_3d WHERE ativo=1 ORDER BY nome COLLATE NOCASE`).all()
  ]);
  return json({sucesso:true,ordens:ordens.results||[],impressoras:impressoras.results||[]});
}

export async function onRequestGet({request,env}){if(!(await authorized(request,env)))return unauthorized(env);return list(env)}

export async function onRequestPost({request,env}){
  if(!(await authorized(request,env)))return unauthorized(env);
  const b=await request.json().catch(()=>({}));
  const produtoId=Number(b.produto_id),impressoraId=Number(b.impressora_id)||null,quantidade=Math.max(1,Math.trunc(number(b.quantidade,1)));
  let modeloId=Number(b.modelo_3d_id)||null;
  if(!produtoId)return json({sucesso:false,mensagem:'Selecione o produto.'},400);
  const produto=await env.DB.prepare(`SELECT id FROM produtos WHERE id=? AND ativo=1`).bind(produtoId).first();if(!produto)return json({sucesso:false,mensagem:'Produto não encontrado.'},404);
  if(!modeloId){const principal=await env.DB.prepare(`SELECT id FROM modelos_3d WHERE produto_id=? AND ativo=1 AND principal=1 ORDER BY id DESC LIMIT 1`).bind(produtoId).first();modeloId=principal?.id||null}
  let modelo=null;if(modeloId){modelo=await env.DB.prepare(`SELECT id,peso_g,tempo_minutos FROM modelos_3d WHERE id=? AND produto_id=? AND ativo=1`).bind(modeloId,produtoId).first();if(!modelo)return json({sucesso:false,mensagem:'Modelo 3D inválido para este produto.'},400)}
  if(impressoraId){const imp=await env.DB.prepare(`SELECT id,status FROM impressoras_3d WHERE id=? AND ativo=1`).bind(impressoraId).first();if(!imp)return json({sucesso:false,mensagem:'Impressora não encontrada.'},404)}
  const peso=number(modelo?.peso_g)*quantidade,tempo=Math.trunc(number(modelo?.tempo_minutos)*quantidade);
  const r=await env.DB.prepare(`INSERT INTO ordens_impressao (produto_id,modelo_3d_id,impressora_id,quantidade,status,peso_previsto_g,tempo_previsto_min,observacoes) VALUES (?,?,?,?,?,?,?,?)`).bind(produtoId,modeloId,impressoraId,quantidade,'fila',peso,tempo,clean(b.observacoes,800)||null).run();
  return json({sucesso:true,id:r.meta?.last_row_id,modelo_3d_id:modeloId,mensagem:modeloId?'Ordem criada com o modelo principal/selecionado.':'Ordem criada sem modelo 3D.'},201);
}

export async function onRequestPut({request,env}){
  if(!(await authorized(request,env)))return unauthorized(env);
  const b=await request.json().catch(()=>({})),id=Number(b.id),status=clean(b.status,20),impressoraId=Number(b.impressora_id)||null;
  if(!id||!['fila','imprimindo','pausada','concluida','cancelada','falhou'].includes(status))return json({sucesso:false,mensagem:'Ordem ou status inválido.'},400);
  const atual=await env.DB.prepare(`SELECT id,impressora_id,status FROM ordens_impressao WHERE id=?`).bind(id).first();if(!atual)return json({sucesso:false,mensagem:'Ordem não encontrada.'},404);
  if(impressoraId){const ocupada=await env.DB.prepare(`SELECT id FROM ordens_impressao WHERE impressora_id=? AND status='imprimindo' AND id<>?`).bind(impressoraId,id).first();if(ocupada&&status==='imprimindo')return json({sucesso:false,mensagem:'Essa impressora já está imprimindo outra ordem.'},409)}
  const iniciado=status==='imprimindo'?'COALESCE(iniciado_em,CURRENT_TIMESTAMP)':'iniciado_em';
  const concluido=status==='concluida'?'CURRENT_TIMESTAMP':'concluido_em';
  await env.DB.prepare(`UPDATE ordens_impressao SET status=?,impressora_id=?,iniciado_em=${iniciado},concluido_em=${concluido},atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(status,impressoraId,id).run();
  const ids=[atual.impressora_id,impressoraId].filter(Boolean);
  for(const impId of [...new Set(ids)]){const rodando=await env.DB.prepare(`SELECT id FROM ordens_impressao WHERE impressora_id=? AND status='imprimindo' LIMIT 1`).bind(impId).first();await env.DB.prepare(`UPDATE impressoras_3d SET status=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(rodando?'imprimindo':'livre',impId).run()}
  return json({sucesso:true,mensagem:'Ordem atualizada.'});
}

export async function onRequest(c){if(c.request.method==='GET')return onRequestGet(c);if(c.request.method==='POST')return onRequestPost(c);if(c.request.method==='PUT')return onRequestPut(c);return json({sucesso:false,mensagem:'Método não permitido.'},405)}
