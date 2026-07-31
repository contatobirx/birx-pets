import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequestGet as consultarTag } from "../functions/api/tag.js";

test("a landing page oferece uma tag demonstrativa", async () => {
  const pagina = await readFile(new URL("../public/index.html", import.meta.url), "utf8");

  assert.match(pagina, /href="\/t\.html\?tag=DEMO"/);
  assert.match(pagina, />\s*Testar uma tag\s*</);
});

test("a tag DEMO funciona sem consultar dados de clientes", async () => {
  const resposta = await consultarTag({
    request: new Request("https://orbitekoficial.com.br/api/tag?tag=DEMO"),
    env: {
      DB: {
        prepare() {
          throw new Error("a demonstração não deve consultar o banco");
        }
      }
    }
  });
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(dados.demonstracao, true);
  assert.equal(dados.status, "ativa");
  assert.equal(dados.pet.nome, "Bento");
});

test("a landing page não mantém destinos sociais incompletos", async () => {
  const pagina = await readFile(new URL("../public/index.html", import.meta.url), "utf8");

  assert.doesNotMatch(pagina, /https:\/\/wa\.me\/55(?:\D|$)/);
  assert.doesNotMatch(pagina, />Instagram<\/a>/);
});

test("a Sprint 2.3 disponibiliza produtos e catálogo com a logo oficial", async () => {
  const [landing, produtos, catalogo] = await Promise.all([
    readFile(new URL("../public/index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/produtos.html", import.meta.url), "utf8"),
    readFile(new URL("../public/catalogo.html", import.meta.url), "utf8")
  ]);

  assert.match(landing, /href="\/produtos"/);
  assert.match(landing, /href="\/catalogo"/);

  for (const pagina of [produtos, catalogo]) {
    assert.match(pagina, /src="\/assets\/login\.png"/);
    assert.doesNotMatch(pagina, /logo-orbitek-pets\.svg/);
    assert.match(pagina, /ESSENTIAL/);
    assert.match(pagina, /NFC CONNECT/);
    assert.match(pagina, /SMART NFC/);
  }
});

test("o catálogo descreve corretamente os três modelos físicos", async () => {
  const catalogo = await readFile(new URL("../public/catalogo.html", import.meta.url), "utf8");

  assert.match(catalogo, /tag-essential\.png/);
  assert.match(catalogo, /Tag Essential com nome e telefone gravados/);
  assert.match(catalogo, /tag-nfc\.png/);
  assert.match(catalogo, /Sem nome, telefone ou QR Code/);
  assert.match(catalogo, /tag-nfc-identificacao\.png/);
  assert.match(catalogo, /Nome e telefone gravados/);
  assert.match(catalogo, /Leitura por aproximação/);
});
