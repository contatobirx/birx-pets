import { adminAutorizado, criarCookieAdmin, limparCookieAdmin, validarChaveAdmin } from "../_lib/admin-auth.js";

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export async function onRequestGet({ request, env }) {
  const autenticado = await adminAutorizado(request, env);
  return json({ sucesso: true, autenticado });
}

export async function onRequestPost({ request, env }) {
  if (!env.TAG_ADMIN_TOKEN) {
    return json({ sucesso: false, mensagem: "Configure TAG_ADMIN_TOKEN na Cloudflare." }, 503);
  }

  const body = await request.json().catch(() => ({}));
  if (!(await validarChaveAdmin(body.chave, env))) {
    return json({ sucesso: false, mensagem: "Chave administrativa inválida." }, 401);
  }

  return json(
    { sucesso: true, autenticado: true, mensagem: "Acesso administrativo liberado." },
    200,
    { "Set-Cookie": await criarCookieAdmin(env, request) }
  );
}

export async function onRequestDelete({ request }) {
  return json(
    { sucesso: true, autenticado: false },
    200,
    { "Set-Cookie": limparCookieAdmin(request) }
  );
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
