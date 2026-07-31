function cookie(request, nome) {
  for (const parte of (request.headers.get("Cookie") || "").split(";")) {
    const [chave, ...valor] = parte.trim().split("=");
    if (chave === nome) return decodeURIComponent(valor.join("="));
  }
  return null;
}

function redirecionar(request, codigo, cookies = []) {
  const headers = new Headers({ Location: new URL(`/login?erro=${codigo}`, request.url).toString() });
  cookies.forEach((valor) => headers.append("Set-Cookie", valor));
  return new Response(null, { status: 302, headers });
}

async function hash(texto) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function tokenSeguro() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateCookie = cookie(request, "orbitek_oauth_state");
  const limparState = "orbitek_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";

  if (!code || !state || !stateCookie || state !== stateCookie) return redirecionar(request, "google-state-invalido", [limparState]);
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return redirecionar(request, "google-nao-configurado", [limparState]);

  try {
    const origem = url.origin;
    const respostaToken = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: `${origem}/api/auth-google-callback`, grant_type: "authorization_code" })
    });
    const token = await respostaToken.json();
    if (!respostaToken.ok || !token.access_token) throw new Error("Falha na troca do código OAuth.");

    const respostaUsuario = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/json" } });
    const usuario = await respostaUsuario.json();
    if (!respostaUsuario.ok || !usuario.email || usuario.email_verified !== true) return redirecionar(request, "google-email-invalido", [limparState]);
    const email = String(usuario.email).trim().toLowerCase();
    const pet = await env.DB.prepare(`SELECT nome_tutor FROM pets WHERE LOWER(email) = ? LIMIT 1`).bind(email).first();
    if (!pet) return redirecionar(request, "conta-nao-encontrada", [limparState]);

    const sessao = tokenSeguro();
    const sessaoHash = await hash(sessao);
    const agora = new Date();
    const expira = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || null;
    const userAgent = request.headers.get("User-Agent") || null;
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM sessoes_tutor WHERE email = ? AND expira_em <= ?`).bind(email, agora.toISOString()),
      env.DB.prepare(`INSERT INTO sessoes_tutor (email, token_hash, criado_em, expira_em, ultimo_acesso, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(email, sessaoHash, agora.toISOString(), expira.toISOString(), agora.toISOString(), ip, userAgent)
    ]);

    const headers = new Headers({ Location: `${origem}/tutor.html` });
    headers.append("Set-Cookie", limparState);
    headers.append("Set-Cookie", `orbitek_sessao=${sessao}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`);
    return new Response(null, { status: 302, headers });
  } catch (erro) {
    console.error("Erro no login Google:", erro);
    return redirecionar(request, "google-falhou", [limparState]);
  }
}
