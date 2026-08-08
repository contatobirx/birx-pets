const PREFIX = "modelos-3d/TAG-NFC/";

function bucket(env) {
  return env.MODELOS_3D || env.R2 || env.BUCKET || env.ASSETS_R2 || null;
}

async function findModel(r2) {
  const listed = await r2.list({ prefix: PREFIX, limit: 1000 });
  const objects = listed.objects || [];
  const separated = objects
    .filter((o) => /separados\.3mf$/i.test(o.key) || /separados/i.test(o.key))
    .sort((a, b) => new Date(b.uploaded || 0) - new Date(a.uploaded || 0));
  if (separated[0]) return separated[0].key;

  const legacy = objects
    .filter((o) => /\.3mf$/i.test(o.key))
    .sort((a, b) => new Date(b.uploaded || 0) - new Date(a.uploaded || 0));
  return legacy[0]?.key || null;
}

export async function onRequestGet({ env }) {
  try {
    const r2 = bucket(env);
    if (!r2) return new Response("R2 não configurado.", { status: 503 });
    const key = await findModel(r2);
    if (!key) return new Response("Modelo BIRX não encontrado.", { status: 404 });
    const object = await r2.get(key);
    if (!object) return new Response("Modelo BIRX não encontrado.", { status: 404 });
    const headers = new Headers();
    headers.set("Content-Type", "model/3mf");
    headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
    headers.set("X-BIRX-Model-Key", key);
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
