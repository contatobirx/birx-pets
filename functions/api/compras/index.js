import { authorized, clean, json, number, unauthorized } from "../admin-shared.js";

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const result = await env.DB.prepare(`
    SELECT c.id,c.numero_nf,c.data_compra,c.total_itens,c.frete,c.impostos,c.desconto,c.total_final,c.observacoes,
           f.nome AS fornecedor_nome, COUNT(ci.id) AS quantidade_itens
      FROM compras c
      LEFT JOIN fornecedores f ON f.id=c.fornecedor_id
      LEFT JOIN compra_itens ci ON ci.compra_id=c.id
     GROUP BY c.id
     ORDER BY c.data_compra DESC,c.id DESC
     LIMIT 200`).all();
  return json({ sucesso: true, compras: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const body = await request.json().catch(() => ({}));
  const fornecedorId = Number(body.fornecedor_id) || null;
  const dataCompra = clean(body.data_compra, 20);
  const itens = Array.isArray(body.itens) ? body.itens : [];
  if (!dataCompra || !itens.length) return json({ sucesso: false, mensagem: "Informe a data e pelo menos um item." }, 400);

  const normalizados = itens.map((item) => ({
    material_id: Number(item.material_id),
    quantidade: number(item.quantidade),
    valor_unitario: number(item.valor_unitario),
  })).filter((item) => item.material_id > 0 && item.quantidade > 0 && item.valor_unitario >= 0);
  if (!normalizados.length) return json({ sucesso: false, mensagem: "Os itens da compra são inválidos." }, 400);

  const frete = Math.max(0, number(body.frete));
  const impostos = Math.max(0, number(body.impostos));
  const desconto = Math.max(0, number(body.desconto));
  const totalItens = normalizados.reduce((sum, item) => sum + item.quantidade * item.valor_unitario, 0);
  const totalFinal = Math.max(0, totalItens + frete + impostos - desconto);
  const fatorCusto = totalItens > 0 ? totalFinal / totalItens : 1;

  let compraId = null;
  try {
    const compra = await env.DB.prepare(`INSERT INTO compras (fornecedor_id,numero_nf,data_compra,frete,desconto,impostos,total_itens,total_final,observacoes) VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(fornecedorId, clean(body.numero_nf, 80), dataCompra, frete, desconto, impostos, totalItens, totalFinal, clean(body.observacoes, 1000)).run();
    compraId = compra.meta?.last_row_id;
    if (!compraId) throw new Error("Não foi possível identificar a compra criada.");

    const statements = [];
    for (const item of normalizados) {
      const material = await env.DB.prepare(`SELECT id,nome,estoque,custo_medio FROM materiais WHERE id=? AND ativo=1`).bind(item.material_id).first();
      if (!material) throw new Error(`Material ${item.material_id} não encontrado.`);
      const saldoAnterior = number(material.estoque);
      const saldoNovo = saldoAnterior + item.quantidade;
      const custoPosto = item.valor_unitario * fatorCusto;
      const valorAnterior = saldoAnterior * number(material.custo_medio);
      const custoMedioNovo = saldoNovo > 0 ? (valorAnterior + item.quantidade * custoPosto) / saldoNovo : custoPosto;
      const totalItem = item.quantidade * item.valor_unitario;

      statements.push(env.DB.prepare(`INSERT INTO compra_itens (compra_id,material_id,quantidade,valor_unitario,total) VALUES (?,?,?,?,?)`).bind(compraId,item.material_id,item.quantidade,item.valor_unitario,totalItem));
      statements.push(env.DB.prepare(`UPDATE materiais SET estoque=?,custo_medio=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(saldoNovo,custoMedioNovo,item.material_id));
      statements.push(env.DB.prepare(`INSERT INTO estoque_movimentos (material_id,tipo,quantidade,saldo_anterior,saldo_novo,valor_unitario,origem,referencia,observacoes) VALUES (?,?,?,?,?,?,?,?,?)`).bind(item.material_id,"entrada",item.quantidade,saldoAnterior,saldoNovo,custoPosto,"compra",String(compraId),`Compra${body.numero_nf ? ` NF ${clean(body.numero_nf,80)}` : ""}`));
    }
    await env.DB.batch(statements);
    return json({ sucesso: true, id: compraId, total_final: totalFinal, mensagem: "Compra registrada e estoque atualizado." }, 201);
  } catch (error) {
    if (compraId) await env.DB.prepare(`DELETE FROM compras WHERE id=?`).bind(compraId).run().catch(() => {});
    return json({ sucesso: false, mensagem: error.message || "Não foi possível registrar a compra." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
