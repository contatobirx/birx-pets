import { authorized, json, unauthorized } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);

  try {
    const result = await env.DB.prepare(
      `SELECT
         TRIM(lote) AS lote,
         COUNT(*) AS quantidade,
         SUM(CASE WHEN COALESCE(modelo, 'nfc') <> 'essential' THEN 1 ELSE 0 END) AS quantidadeNfc,
         SUM(CASE WHEN COALESCE(preparo_status, 'estoque') = 'estoque' AND COALESCE(ativada, 0) = 0 THEN 1 ELSE 0 END) AS estoque,
         SUM(CASE WHEN COALESCE(preparo_status, 'estoque') = 'gravada' THEN 1 ELSE 0 END) AS gravadas,
         SUM(CASE WHEN COALESCE(preparo_status, 'estoque') = 'testada' THEN 1 ELSE 0 END) AS testadas,
         SUM(CASE WHEN COALESCE(ativada, 0) = 1 THEN 1 ELSE 0 END) AS ativadas,
         MIN(data_criacao) AS criadoEm
       FROM tags
       WHERE TRIM(COALESCE(lote, '')) <> ''
       GROUP BY LOWER(TRIM(lote))
       ORDER BY MAX(id) DESC
       LIMIT 200`,
    ).all();

    return json({ sucesso: true, lotes: result.results || [] });
  } catch (error) {
    console.error("producao/lotes GET", error);
    return json(
      { sucesso: false, mensagem: "Não foi possível carregar os lotes." },
      500,
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
