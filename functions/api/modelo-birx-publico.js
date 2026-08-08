const KEY = "modelos-3d/TAG-NFC/v1/1786151028678-NOVO-BIRX.3mf";

function bucket(env) {
  return env.MODELOS_3D || env.R2 || env.BUCKET || env.ASSETS_R2 || null;
}

export async function onRequestGet({ env }) {
  try {
    const r2 = bucket(env);
    if (!r2) return new Response("R2 não configurado.", { status: 503 });
    const object = await r2.get(KEY);
    if (!object) return new Response("Modelo BIRX não encontrado.", { status: 404 });
    const headers = new Headers();
    headers.set("Content-Type", "model/3mf");
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
    if (object.httpEtag) headers.set("ETag", object.httpEtag);
    if (object.size) headers.set("Content-Length", String(object.size));
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("modelo-birx-publico", error);
    return new Response("Não foi possível carregar o modelo BIRX.", { status: 500 });
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return new Response("Método não permitido.", { status: 405 });
}
