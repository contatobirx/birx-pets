Exit code: 0
Wall time: 1.4 seconds
Output:
import { adminAutorizado } from "../_lib/admin-auth.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

function unauthorized() {
  return json({
    sucesso: false,
    autenticado: false,
    mensagem: "SessÃ£o administrativa invÃ¡lida ou expirada.",
  }, 401);
}

export async function onRequestGet({ request, env }) {
  if (!(await adminAutorizado(request, env))) return unauthorized();

  try {
    const [materiais, compras, produtos, tags, alertas] = await Promise.all([
      env.DB.prepare(`
        SELECT
          COUNT(*) AS total,
          COALESCE(SUM(m.estoque * m.custo_medio), 0) AS valor_estoque,
          COALESCE(SUM(CASE
            WHEN (m.estoque - COALESCE(r.reservado, 0)) <= m.estoque_minimo THEN 1
            ELSE 0
          END), 0) AS abaixo_minimo
        FROM materiais m
        LEFT JOIN (
          SELECT material_id, SUM(quantidade) AS reservado
          FROM ordem_material_reservas
          GROUP BY material_id
        ) r ON r.material_id = m.id
        WHERE m.ativo = 1
      `).first(),
      env.DB.prepare(`
        SELECT COALESCE(SUM(total_final), 0) AS valor_mes
        FROM compras
        WHERE substr(data_compra, 1, 7) = strftime('%Y-%m', 'now')
      `).first(),
      env.DB.prepare(`
        SELECT COALESCE(SUM(estoque), 0) AS estoque
        FROM produtos
        WHERE ativo = 1
      `).first(),
      env.DB.prepare(`
        SELECT COALESCE(SUM(CASE
          WHEN COALESCE(ativada, 0) = 0
            AND COALESCE(preparo_status, 'estoque') = 'estoque'
          THEN 1
          ELSE 0
        END), 0) AS disponiveis
        FROM tags
      `).first(),
      env.DB.prepare(`
        SELECT
          m.id,
          m.nome,
          m.estoque,
          m.estoque_minimo,
          m.unidade,
          COALESCE(r.reservado, 0) AS reservado,
          MAX(0, m.estoque - COALESCE(r.reservado, 0)) AS disponivel
        FROM materiais m
        LEFT JOIN (
          SELECT material_id, SUM(quantidade) AS reservado
          FROM ordem_material_reservas
          GROUP BY material_id
        ) r ON r.material_id = m.id
        WHERE m.ativo = 1
          AND (m.estoque - COALESCE(r.reservado, 0)) <= m.estoque_minimo
        ORDER BY disponivel ASC
        LIMIT 8
      `).all(),
    ]);

    return json({
      sucesso: true,
      materiais: materiais || {},
      compras: compras || {},
      produtos: produtos || {},
      tags: tags || {},
      alertas: alertas.results || [],
    });
  } catch (error) {
    console.error("admin-dashboard GET", error);
    return json({
      sucesso: false,
      mensagem: "NÃ£o foi possÃ­vel carregar o resumo administrativo.",
    }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "MÃ©todo nÃ£o permitido." }, 405);
}

