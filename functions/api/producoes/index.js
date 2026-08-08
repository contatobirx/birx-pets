import { authorized, clean, json, number, unauthorized } from "../admin-shared.js";

async function getComposition(env, produtoId) {
  const result = await env.DB.prepare(`
    SELECT pm.material_id, pm.quantidade AS quantidade_unitaria,
           m.nome AS material_nome, m.unidade, m.estoque, m.custo_medio
      FROM produto_materiais pm
      JOIN materiais m ON m.id = pm.material_id
     WHERE pm.produto_id = ? AND m.ativo = 1
     ORDER BY m.nome COLLATE NOCASE`).bind(produtoId).all();
  return result.results || [];
}

async function getExtraCost(env, produtoId) {
  const cfg = await env.DB.prepare(`SELECT custo_extra FROM produto_precificacao WHERE produto_id=?`).bind(produtoId).first();
  return number(cfg?.custo_extra);
}

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const url = new URL(request.url);
  const produtoId = Number(url.searchParams.get("produto_id"));
  if (produtoId) {
    const produto = await env.DB.prepare(`SELECT id,nome,estoque,custo,preco_venda FROM produtos WHERE id=? AND ativo=1`).bind(produtoId).first();
    if (!produto) return json({ sucesso: false, mensagem: "Produto não encontrado." }, 404);
    const composicao = await getComposition(env, produtoId);
    const custoExtra = await getExtraCost(env, produtoId);
    const custoMateriais = composicao.reduce((sum, item) => sum + number(item.quantidade_unitaria) * number(item.custo_medio), 0);
    const capacidade = composicao.length
      ? Math.floor(Math.min(...composicao.map((item) => number(item.estoque) / number(item.quantidade_unitaria))))
      : 0;
    return json({ sucesso: true, produto, composicao, capacidade, custo_materiais: custoMateriais, custo_extra: custoExtra, custo_unitario: custoMateriais + custoExtra });
  }

  const result = await env.DB.prepare(`
    SELECT pr.id, pr.quantidade, pr.custo_unitario, pr.custo_total, pr.observacoes, pr.criado_em,
           p.nome AS produto_nome, p.codigo AS produto_codigo
      FROM producoes pr
      JOIN produtos p ON p.id = pr.produto_id
     ORDER BY pr.id DESC
     LIMIT 100`).all();
  return json({ sucesso: true, producoes: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const body = await request.json().catch(() => ({}));
  const produtoId = Number(body.produto_id);
  const quantidade = number(body.quantidade);
  if (!produtoId || quantidade <= 0) return json({ sucesso: false, mensagem: "Informe produto e quantidade válidos." }, 400);

  const produto = await env.DB.prepare(`SELECT id,nome,estoque FROM produtos WHERE id=? AND ativo=1`).bind(produtoId).first();
  if (!produto) return json({ sucesso: false, mensagem: "Produto não encontrado." }, 404);

  const composicao = await getComposition(env, produtoId);
  if (!composicao.length) return json({ sucesso: false, mensagem: "Este produto ainda não possui composição cadastrada." }, 400);

  for (const item of composicao) {
    const necessario = number(item.quantidade_unitaria) * quantidade;
    if (number(item.estoque) < necessario) {
      return json({
        sucesso: false,
        mensagem: `Estoque insuficiente de ${item.material_nome}. Necessário: ${necessario} ${item.unidade}; disponível: ${item.estoque} ${item.unidade}.`,
      }, 409);
    }
  }

  const custoMateriais = composicao.reduce((sum, item) => sum + number(item.quantidade_unitaria) * number(item.custo_medio), 0);
  const custoExtra = await getExtraCost(env, produtoId);
  const custoUnitario = custoMateriais + custoExtra;
  const custoTotal = custoUnitario * quantidade;
  const observacoes = clean(body.observacoes, 800);

  const producao = await env.DB.prepare(`INSERT INTO producoes (produto_id,quantidade,custo_unitario,custo_total,observacoes) VALUES (?,?,?,?,?)`)
    .bind(produtoId, quantidade, custoUnitario, custoTotal, observacoes).run();
  const producaoId = producao.meta?.last_row_id;
  if (!producaoId) return json({ sucesso: false, mensagem: "Não foi possível criar a produção." }, 500);

  const statements = [];
  for (const item of composicao) {
    const consumo = number(item.quantidade_unitaria) * quantidade;
    const saldoAnterior = number(item.estoque);
    const saldoNovo = saldoAnterior - consumo;
    statements.push(
      env.DB.prepare(`UPDATE materiais SET estoque=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND estoque>=?`).bind(saldoNovo,item.material_id,consumo),
      env.DB.prepare(`INSERT INTO estoque_movimentos (material_id,tipo,quantidade,saldo_anterior,saldo_novo,valor_unitario,origem,referencia,observacoes) VALUES (?,?,?,?,?,?,?,?,?)`).bind(item.material_id,"saida",consumo,saldoAnterior,saldoNovo,number(item.custo_medio),"producao",String(producaoId),`Produção de ${quantidade} × ${produto.nome}`),
      env.DB.prepare(`INSERT INTO producao_itens (producao_id,material_id,quantidade_unitaria,quantidade_consumida,custo_unitario) VALUES (?,?,?,?,?)`).bind(producaoId,item.material_id,number(item.quantidade_unitaria),consumo,number(item.custo_medio))
    );
  }
  statements.push(env.DB.prepare(`UPDATE produtos SET estoque=estoque+?,custo=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(quantidade,custoUnitario,produtoId));

  try {
    const results = await env.DB.batch(statements);
    const updateResults = results.filter((_, index) => index % 3 === 0).slice(0, composicao.length);
    if (updateResults.some((r) => !r.meta?.changes)) throw new Error("O estoque mudou durante a produção. Tente novamente.");
    return json({ sucesso: true, id: producaoId, custo_unitario: custoUnitario, custo_total: custoTotal, mensagem: `${quantidade} unidade(s) produzida(s) e estoque atualizado.` }, 201);
  } catch (error) {
    await env.DB.prepare(`DELETE FROM producoes WHERE id=?`).bind(producaoId).run().catch(() => {});
    return json({ sucesso: false, mensagem: error.message || "Não foi possível concluir a produção." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
