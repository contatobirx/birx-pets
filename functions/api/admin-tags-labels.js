import { authorized, clean, json, unauthorized } from "./producao/_shared.js";

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);

  const url = new URL(request.url);
  const lote = clean(url.searchParams.get("lote"), 60);
  if (!lote) return json({ sucesso: false, mensagem: "Informe o lote." }, 400);

  try {
    const result = await env.DB.prepare(
      `SELECT codigo, COALESCE(modelo, 'nfc') AS modelo, lote
         FROM tags
        WHERE LOWER(TRIM(COALESCE(lote, ''))) = LOWER(TRIM(?))
          AND COALESCE(modelo, 'nfc') <> 'essential'
        ORDER BY id ASC
        LIMIT 1000`,
    ).bind(lote).all();

    const tags = (result.results || []).map((tag) => ({
      ...tag,
      link: `${url.origin}/q/${encodeURIComponent(tag.codigo)}`,
    }));

    return json({ sucesso: true, lote, quantidade: tags.length, tags });
  } catch (error) {
    console.error("admin-tags-labels GET", error);
    return json({ sucesso: false, mensagem: "Não foi possível carregar as tags." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
