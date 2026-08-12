function tokenAleatorio() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet({ request, env }) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return Response.redirect(new URL("/login?erro=google-nao-configurado", request.url), 302);
  }

  const state = tokenAleatorio();
  const origem = new URL(request.url).origin;
  const parametros = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${origem}/api/auth-google-callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account"
  });
  const headers = new Headers({ Location: `https://accounts.google.com/o/oauth2/v2/auth?${parametros}` });
  headers.append("Set-Cookie", `orbitek_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return new Response(null, { status: 302, headers });
}
