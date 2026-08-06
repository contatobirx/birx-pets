import {
  authorized,
  clean,
  json,
  safeFilename,
  unauthorized,
} from "./_shared.js";

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);

  try {
    const requestUrl = new URL(request.url);
    const batch = clean(requestUrl.searchParams.get("lote"), 60);
    if (!batch) {
      return json(
        { sucesso: false, mensagem: "Selecione o lote que será exportado." },
        400,
      );
    }

    const result = await env.DB.prepare(
      `SELECT codigo, COALESCE(modelo, 'nfc') AS modelo, lote,
              CASE WHEN COALESCE(ativada, 0) = 1 THEN 'ativada'
                   ELSE COALESCE(preparo_status, 'estoque') END AS status
         FROM tags
        WHERE LOWER(TRIM(COALESCE(lote, ''))) = LOWER(TRIM(?))
        ORDER BY id ASC
        LIMIT 1000`,
    )
      .bind(batch)
      .all();

    const tags = result.results || [];
    if (!tags.length) {
      return json(
        { sucesso: false, mensagem: `Nenhuma tag encontrada no lote “${batch}”.` },
        404,
      );
    }

    const lines = ["codigo,lote,modelo,status,link"];
    for (const tag of tags) {
      const link = `${requestUrl.origin}/q/${encodeURIComponent(tag.codigo)}`;
      lines.push(
        [tag.codigo, tag.lote, tag.modelo, tag.status, link]
          .map(csvCell)
          .join(","),
      );
    }

    const filename = `BIRX-Conferencia-${safeFilename(batch)}-${tags.length}un.csv`;
    return new Response(`\uFEFF${lines.join("\r\n")}`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=UTF-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("producao/conferencia GET", error);
    return json(
      { sucesso: false, mensagem: "Não foi possível gerar a conferência." },
      500,
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
