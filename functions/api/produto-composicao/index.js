import { authorized, json, number, unauthorized } from "../admin-shared.js";

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const produtoId = Number(new URL(request.url).searchParams.get("produto_id"));
  if (!produtoId) return json({ sucesso: false, mensagem: "Produto inválido." }, 400);

  const result = await env.DB.prepare(`
    SELECT pm.material_id, pm.quantidade, m.nome, m.unidade, m.custo_medio,
           (pm.quantidade * m.custo_medio) AS custo_item
      FROM produto_materiais pm
      JOIN materiais m ON m.id = pm.material_id
     WHERE pm.produto_id = ? AND m.ativo = 1
     ORDER BY m.nome COLLATE NOCASE
  `).bind(produtoId).all();

  const itens = result.results || [];
  const custoMateriais = itens.reduce((s, i) => s + Number(i.custo_item || 0), 0);
  return json({ sucesso: true, itens, custo_materiais: custoMateriais });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const body = await request.json().catch(() => ({}));
  const produtoId = Number(body.produto_id);
  const itens = Array.isArray(body.itens) ? body.itens : [];
  if (!produtoId) return json({ sucesso: false, mensagem: "Produto inválido." }, 400);

  const produto = await env.DB.prepare(`SELECT id FROM produtos WHERE id=? AND ativo=1`).bind(produtoId).first();
  if (!produto) return json({ sucesso: false, mensagem: "Produto não encontrado." }, 404);

  const normalizados = itens
    .map(i => ({ material_id: Number(i.material_id), quantidade: number(i.quantidade) }))
    .filter(i => i.material_id > 0 && i.quantidade > 0);

  const statements = [env.DB.prepare(`DELETE FROM produto_materiais WHERE produto_id=?`).bind(produtoId)];
  for (const item of normalizados) {
    statements.push(env.DB.prepare(`INSERT INTO produto_materiais (produto_id, material_id, quantidade) VALUES (?,?,?)`).bind(produtoId, item.material_id, item.quantidade));
  }
  await env.DB.batch(statements);

  return json({ sucesso: true, mensagem: "Composição atualizada." });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
