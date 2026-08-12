import { authorized, json, number, unauthorized } from "../admin-shared.js";

async function calcular(env, produtoId) {
  const produto = await env.DB.prepare(`SELECT id,nome,preco_venda FROM produtos WHERE id=? AND ativo=1`).bind(produtoId).first();
  if (!produto) return null;

  const comp = await env.DB.prepare(`
    SELECT COALESCE(SUM(pm.quantidade * m.custo_medio),0) AS custo_materiais
      FROM produto_materiais pm
      JOIN materiais m ON m.id=pm.material_id
     WHERE pm.produto_id=? AND m.ativo=1
  `).bind(produtoId).first();
  const cfg = await env.DB.prepare(`SELECT custo_extra,taxa_percentual,margem_percentual,preco_manual FROM produto_precificacao WHERE produto_id=?`).bind(produtoId).first();

  const custoMateriais = Number(comp?.custo_materiais || 0);
  const custoExtra = Number(cfg?.custo_extra || 0);
  const taxaPercentual = Number(cfg?.taxa_percentual || 0);
  const margemPercentual = Number(cfg?.margem_percentual || 0);
  const custoBase = custoMateriais + custoExtra;
  const denominador = 1 - (taxaPercentual + margemPercentual) / 100;
  const precoSugerido = denominador > 0 ? custoBase / denominador : 0;
  const precoVenda = cfg?.preco_manual != null ? Number(cfg.preco_manual) : Number(produto.preco_venda || precoSugerido);
  const taxaValor = precoVenda * taxaPercentual / 100;
  const lucro = precoVenda - custoBase - taxaValor;
  const margemReal = precoVenda > 0 ? lucro / precoVenda * 100 : 0;

  return { produto, custo_materiais: custoMateriais, custo_extra: custoExtra, custo_base: custoBase, taxa_percentual: taxaPercentual, margem_percentual: margemPercentual, preco_sugerido: precoSugerido, preco_venda: precoVenda, lucro, margem_real: margemReal };
}

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const produtoId = Number(new URL(request.url).searchParams.get("produto_id"));
  if (!produtoId) return json({ sucesso: false, mensagem: "Produto inválido." }, 400);
  const dados = await calcular(env, produtoId);
  if (!dados) return json({ sucesso: false, mensagem: "Produto não encontrado." }, 404);
  return json({ sucesso: true, ...dados });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const body = await request.json().catch(() => ({}));
  const produtoId = Number(body.produto_id);
  if (!produtoId) return json({ sucesso: false, mensagem: "Produto inválido." }, 400);

  const custoExtra = Math.max(0, number(body.custo_extra));
  const taxa = Math.max(0, number(body.taxa_percentual));
  const margem = Math.max(0, number(body.margem_percentual));
  const precoManual = body.preco_manual === "" || body.preco_manual == null ? null : Math.max(0, number(body.preco_manual));
  if (taxa + margem >= 100) return json({ sucesso: false, mensagem: "Taxa + margem deve ser menor que 100%." }, 400);

  await env.DB.prepare(`
    INSERT INTO produto_precificacao (produto_id,custo_extra,taxa_percentual,margem_percentual,preco_manual,atualizado_em)
    VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(produto_id) DO UPDATE SET
      custo_extra=excluded.custo_extra,
      taxa_percentual=excluded.taxa_percentual,
      margem_percentual=excluded.margem_percentual,
      preco_manual=excluded.preco_manual,
      atualizado_em=CURRENT_TIMESTAMP
  `).bind(produtoId,custoExtra,taxa,margem,precoManual).run();

  const dados = await calcular(env, produtoId);
  if (dados) await env.DB.prepare(`UPDATE produtos SET custo=?,preco_venda=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(dados.custo_base,dados.preco_venda,produtoId).run();
  return json({ sucesso: true, ...(dados || {}), mensagem: "Precificação atualizada." });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
