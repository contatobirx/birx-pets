import { adminAutorizado } from "../../_lib/admin-auth.js";

export const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
};

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

export const clean = (value, max = 120) =>
  String(value ?? "").trim().slice(0, max);

export async function authorized(request, env) {
  return adminAutorizado(request, env);
}

export function unauthorized(env) {
  return json(
    {
      sucesso: false,
      autenticado: false,
      mensagem: env.TAG_ADMIN_TOKEN
        ? "Sessão administrativa inválida ou expirada."
        : "Configure TAG_ADMIN_TOKEN na Cloudflare.",
    },
    401,
  );
}

export function safeFilename(value) {
  return (
    clean(value, 60)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "LOTE"
  );
}
