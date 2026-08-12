import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequestGet, onRequestPost } from "../functions/api/conta.js";

test("a área da conta exige uma sessão válida", async () => {
  const env = { DB: { prepare() { throw new Error("o banco não deve ser consultado sem cookie"); } } };
  const respostaGet = await onRequestGet({ request: new Request("https://pets.birx.com.br/api/conta"), env });
  const respostaPost = await onRequestPost({ request: new Request("https://pets.birx.com.br/api/conta", { method: "POST" }), env });
  assert.equal(respostaGet.status, 401);
  assert.equal(respostaPost.status, 401);
});

test("a Sprint 2.7 oferece conta, sessões, exclusão e termos", async () => {
  const [conta, script, tutor, termos, migracao, google, email] = await Promise.all([
    readFile(new URL("../public/conta.html", import.meta.url), "utf8"),
    readFile(new URL("../public/js/conta.js", import.meta.url), "utf8"),
    readFile(new URL("../public/tutor.html", import.meta.url), "utf8"),
    readFile(new URL("../public/termos.html", import.meta.url), "utf8"),
    readFile(new URL("../database/011_conta_tutor.sql", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/auth-google-callback.js", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/login-verificar.js", import.meta.url), "utf8")
  ]);
  assert.match(conta, /\/assets\/login\.png/);
  assert.match(conta, /Sessões conectadas/);
  assert.match(script, /encerrar-outras/);
  assert.match(script, /solicitar-exclusao/);
  assert.match(tutor, /href="\/conta"/);
  assert.match(termos, /Termos de Uso/);
  assert.match(migracao, /solicitacoes_exclusao/);
  assert.match(google, /'google'/);
  assert.match(email, /'email'/);
});
