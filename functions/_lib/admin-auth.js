const COOKIE = "birx_admin";
const DURACAO_MS = 4 * 60 * 60 * 1000;

function clean(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

async function sha256Bytes(value) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")))
  );
}

function hex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(i + 1).trim()); }
    catch { return part.slice(i + 1).trim(); }
  }
  return "";
}

async function hmacKey(env) {
  const secret = clean(env.TAG_ADMIN_TOKEN, 500);
  if (!secret) return null;
  return crypto.subtle.importKey(
    "raw",
    await sha256Bytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(env, payload) {
  const key = await hmacKey(env);
  if (!key) return "";
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}

export async function validarChaveAdmin(chave, env) {
  const supplied = clean(chave, 500);
  const expected = clean(env.TAG_ADMIN_TOKEN, 500);
  if (!supplied || !expected) return false;
  const [a, b] = await Promise.all([sha256Bytes(supplied), sha256Bytes(expected)]);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function criarCookieAdmin(env, request) {
  const exp = Date.now() + DURACAO_MS;
  const nonce = hex(crypto.getRandomValues(new Uint8Array(12)));
  const payload = `${exp}.${nonce}`;
  const signature = await sign(env, payload);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${encodeURIComponent(`${payload}.${signature}`)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(DURACAO_MS / 1000)}${secure}`;
}

export function limparCookieAdmin(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function adminAutorizado(request, env) {
  if (!env.TAG_ADMIN_TOKEN) return false;
  const value = getCookie(request, COOKIE);
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [expRaw, nonce, signature] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Date.now() || !nonce || !signature) return false;
  const expected = await sign(env, `${expRaw}.${nonce}`);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
