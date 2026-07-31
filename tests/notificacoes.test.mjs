import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { enviarAlerta } from "../functions/_shared/notificacoes.js";

test("alertas não tentam enviar sem a chave do serviço de e-mail", async () => {
  const enviado = await enviarAlerta({ env: {}, pet: { email: "tutor@example.com" }, tipo: "leitura" });
  assert.equal(enviado, false);
});

test("a Sprint 2.8 conecta leitura, localização, preferências e antirrepetição", async () => {
  const [tag, localizacao, conta, pagina, migracao, email] = await Promise.all([
    readFile(new URL("../functions/api/tag.js", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/localizacoes.js", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/conta.js", import.meta.url), "utf8"),
    readFile(new URL("../public/conta.html", import.meta.url), "utf8"),
    readFile(new URL("../database/012_notificacoes.sql", import.meta.url), "utf8"),
    readFile(new URL("../functions/_shared/notificacoes.js", import.meta.url), "utf8")
  ]);
  assert.match(tag, /tipo: "leitura"/);
  assert.match(tag, /acessoDoProprioTutor/);
  assert.match(localizacao, /tipo: "localizacao"/);
  assert.match(conta, /salvar-notificacoes/);
  assert.match(pagina, /Notificações por e-mail/);
  assert.match(migracao, /UNIQUE\(tag_codigo, tipo, janela, destinatario\)/);
  assert.match(email, /Abrir localização no mapa/);
});
