import { authorized, clean, json, number, unauthorized } from "../admin-shared.js";

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const url = new URL(request.url);
  const materialId = Number(url.searchParams.get("material_id"));
  const where = materialId > 0 ? "WHERE e.material_id=?" : "";
  const stmt = env.DB.prepare(`SELECT e.id,e.material_id,m.nome AS material_nome,m.unidade,e.tipo,e.quantidade,e.saldo_anterior,e.saldo_novo,e.valor_unitario,e.origem,e.referencia,e.observacoes,e.criado_em FROM estoque_movimentos e JOIN materiais m ON m.id=e.material_id ${where} ORDER BY e.id DESC LIMIT 300`);
  const result = materialId > 0 ? await stmt.bind(materialId).all() : await stmt.all();
  const resumo = await env.DB.prepare(`SELECT COUNT(*) AS materiais, COALESCE(SUM(estoque*custo_medio),0) AS valor_estoque, COALESCE(SUM(CASE WHEN estoque<=estoque_minimo THEN 1 ELSE 0 END),0) AS abaixo_minimo FROM materiais WHERE ativo=1`).first();
  return json({ sucesso: true, movimentos: result.results || [], resumo: resumo || {} });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const body = await request.json().catch(() => ({}));
  const materialId = Number(body.material_id);
  const tipo = clean(body.tipo, 20);
  const quantidade = Math.abs(number(body.quantidade));
  if (!materialId || !["entrada","saida","ajuste"].includes(tipo) || quantidade < 0) return json({ sucesso:false, mensagem:"Movimentação inválida."},400);
  const material = await env.DB.prepare(`SELECT id,nome,estoque,custo_medio FROM materiais WHERE id=? AND ativo=1`).bind(materialId).first();
  if (!material) return json({ sucesso:false, mensagem:"Material não encontrado."},404);
  const anterior = number(material.estoque);
  let novo = anterior;
  let qtdRegistro = quantidade;
  if (tipo === "entrada") novo = anterior + quantidade;
  if (tipo === "saida") novo = anterior - quantidade;
  if (tipo === "ajuste") { novo = number(body.saldo_novo, anterior); qtdRegistro = novo - anterior; }
  if (novo < 0) return json({ sucesso:false, mensagem:"O estoque não pode ficar negativo."},400);
  await env.DB.batch([
    env.DB.prepare(`UPDATE materiais SET estoque=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(novo,materialId),
    env.DB.prepare(`INSERT INTO estoque_movimentos (material_id,tipo,quantidade,saldo_anterior,saldo_novo,valor_unitario,origem,referencia,observacoes) VALUES (?,?,?,?,?,?,?,?,?)`).bind(materialId,tipo,qtdRegistro,anterior,novo,number(body.valor_unitario,material.custo_medio),"manual",clean(body.referencia,120),clean(body.observacoes,600))
  ]);
  return json({ sucesso:true, saldo_novo:novo, mensagem:"Estoque atualizado."},201);
}

export async function onRequest(context){
  if(context.request.method==="GET") return onRequestGet(context);
  if(context.request.method==="POST") return onRequestPost(context);
  return json({sucesso:false,mensagem:"Método não permitido."},405);
}
