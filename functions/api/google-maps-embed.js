const html = (message, status = 503) => new Response(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f7fc;color:#516079;font:600 14px Arial,sans-serif;text-align:center}p{max-width:360px;padding:24px}</style></head><body><p>${message}</p></body></html>`, {
  status,
  headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store" }
});

const clean = value => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 220);

export async function onRequestGet({ request, env }) {
  const key = clean(env.GOOGLE_MAPS_EMBED_KEY);
  if (!key) return html("O Google Maps ainda não foi configurado.");

  const url = new URL(request.url);
  const query = clean(url.searchParams.get("q")) || "clínica veterinária Brasil";
  const parameters = new URLSearchParams({
    key,
    q: query,
    language: "pt-BR",
    region: "BR"
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://www.google.com/maps/embed/v1/search?${parameters}`,
      "Cache-Control": "private, max-age=300",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
  });
}

export async function onRequest(context) {
  if (context.request.method !== "GET") return html("Método não permitido.", 405);
  return onRequestGet(context);
}
