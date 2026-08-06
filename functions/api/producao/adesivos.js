import { authorized, clean, json, unauthorized } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);

  try {
    const requestUrl = new URL(request.url);
    const batch = clean(requestUrl.searchParams.get("lote"), 60);

    if (!batch) {
      return json({ sucesso: false, mensagem: "Selecione o lote que será exportado." }, 400);
    }

    const result = await env.DB.prepare(
      `SELECT codigo, COALESCE(modelo, 'nfc') AS modelo, lote
         FROM tags
        WHERE LOWER(TRIM(COALESCE(lote, ''))) = LOWER(TRIM(?))
          AND COALESCE(modelo, 'nfc') <> 'essential'
        ORDER BY id ASC
        LIMIT 1000`,
    ).bind(batch).all();

    const tags = (result.results || []).map((tag) => ({
      codigo: tag.codigo,
      modelo: tag.modelo,
      lote: tag.lote,
      link: `${requestUrl.origin}/q/${encodeURIComponent(tag.codigo)}`,
    }));

    if (!tags.length) {
      return json({
        sucesso: false,
        mensagem: `Nenhuma tag NFC foi encontrada no lote “${batch}”.`,
      }, 404);
    }

    return json({ sucesso: true, lote: batch, quantidade: tags.length, tags });
  } catch (error) {
    console.error("producao/adesivos GET", error);
    return json({ sucesso: false, mensagem: "Não foi possível carregar os adesivos." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
