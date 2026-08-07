export const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
};

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

export const clean = (value, max = 160) => String(value ?? "").trim().slice(0, max);

export const number = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const enc = new TextEncoder();
const fromB64 = (text) => Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/') + '='.repeat((4-text.length%4)%4)), c => c.charCodeAt(0));
const b64 = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');

async function digest(value) {
  const data = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return [...new Uint8Array(data)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(payload, secret){
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
  return b64(sig);
}

async function sessionAuthorized(request, env){
  const secret=String(env.ADMIN_SESSION_SECRET||''); if(!secret) return false;
  const cookie=request.headers.get('Cookie')||'';
  const token=(cookie.match(/(?:^|;\s*)birx_admin=([^;]+)/)||[])[1];
  const [payload,sig]=String(token||'').split('.'); if(!payload||!sig) return false;
  if(await sign(payload,secret)!==sig) return false;
  try { const data=JSON.parse(new TextDecoder().decode(fromB64(payload))); return Boolean(data.exp && Date.now()<=data.exp); } catch { return false; }
}

export async function authorized(request, env) {
  if (await sessionAuthorized(request, env)) return true;
  const supplied = clean(request.headers.get("X-BIRX-Admin"), 500);
  const expected = clean(env.TAG_ADMIN_TOKEN, 500);
  return Boolean(supplied && expected && (await digest(supplied)) === (await digest(expected)));
}

export function unauthorized(env) {
  return json({
    sucesso: false,
    mensagem: "Acesso administrativo não autorizado.",
  }, 401);
}
