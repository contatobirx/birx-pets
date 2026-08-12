import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequestGet as iniciarGoogle } from "../functions/api/auth-google-start.js";
import { onRequestGet as concluirGoogle } from "../functions/api/auth-google-callback.js";

test("o login Google usa o fluxo oficial e protege o estado", async () => {
  const resposta = await iniciarGoogle({
    request: new Request("https://pets.birx.com.br/api/auth-google-start"),
    env: { GOOGLE_CLIENT_ID: "cliente-teste", GOOGLE_CLIENT_SECRET: "segredo-teste" }
  });

  const destino = new URL(resposta.headers.get("Location"));
  const cookie = resposta.headers.get("Set-Cookie");
  assert.equal(resposta.status, 302);
  assert.equal(destino.origin, "https://accounts.google.com");
  assert.equal(destino.pathname, "/o/oauth2/v2/auth");
  assert.equal(destino.searchParams.get("client_id"), "cliente-teste");
  assert.equal(destino.searchParams.get("redirect_uri"), "https://pets.birx.com.br/api/auth-google-callback");
  assert.equal(destino.searchParams.get("response_type"), "code");
  assert.equal(destino.searchParams.get("scope"), "openid email profile");
  assert.ok(destino.searchParams.get("state"));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
});

test("o login Google informa quando as credenciais ainda não foram configuradas", async () => {
  const resposta = await iniciarGoogle({
    request: new Request("https://pets.birx.com.br/api/auth-google-start"),
    env: {}
  });
  assert.equal(resposta.status, 302);
  assert.equal(resposta.headers.get("Location"), "https://pets.birx.com.br/login?erro=google-nao-configurado");
});

test("o retorno do Google rejeita estado ausente antes de consultar serviços externos", async () => {
  const resposta = await concluirGoogle({
    request: new Request("https://pets.birx.com.br/api/auth-google-callback?code=abc&state=errado", {
      headers: { Cookie: "orbitek_oauth_state=correto" }
    }),
    env: { GOOGLE_CLIENT_ID: "cliente", GOOGLE_CLIENT_SECRET: "segredo" }
  });
  assert.equal(resposta.status, 302);
  assert.equal(resposta.headers.get("Location"), "https://pets.birx.com.br/login?erro=google-state-invalido");
});

test("a tela mantém o e-mail como alternativa e apresenta privacidade", async () => {
  const [login, privacidade] = await Promise.all([
    readFile(new URL("../public/login.html", import.meta.url), "utf8"),
    readFile(new URL("../public/privacidade.html", import.meta.url), "utf8")
  ]);
  assert.match(login, /Continuar com Google/);
  assert.match(login, /id="formEmail"/);
  assert.match(login, /href="\/privacidade"/);
  assert.match(privacidade, /\/assets\/login\.png/);
  assert.match(privacidade, /Login com Google/);
});
