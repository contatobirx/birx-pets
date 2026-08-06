export const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
};

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

export const clean = (value, max = 120) =>
  String(value ?? "").trim().slice(0, max);

async function digest(value) {
  const data = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(data)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function authorized(request, env) {
  const supplied = clean(request.headers.get("X-BIRX-Admin"), 500);
  const expected = clean(env.TAG_ADMIN_TOKEN, 500);
  return Boolean(
    supplied &&
      expected &&
      (await digest(supplied)) === (await digest(expected)),
  );
}

export function unauthorized(env) {
  return json(
    {
      sucesso: false,
      mensagem: env.TAG_ADMIN_TOKEN
        ? "Chave administrativa inválida."
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
