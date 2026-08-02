import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequestGet } from "../functions/api/perdidos.js";

test("o diretório retorna somente os campos públicos previstos", async () => {
  const banco = { prepare() { return { bind() { return { all: async () => ({ results: [{ tag_codigo:"ORB-1", nome:"Bento", especie:"Cachorro", cidade:"Curitiba", estado:"PR", latitude_aproximada:-25.43, longitude_aproximada:-49.27 }] }) }; } }; } };
  const resposta = await onRequestGet({ request: new Request("https://pets.birx.com.br/api/perdidos"), env: { DB: banco } });
  const dados = await resposta.json();
  assert.equal(resposta.status, 200);
  assert.equal(dados.pets[0].nome, "Bento");
  assert.equal(dados.pets[0].latitudeAproximada, -25.43);
  assert.equal("whatsapp" in dados.pets[0], false);
  assert.equal("email" in dados.pets[0], false);
});

test("a Sprint 2.5 expõe o diretório e o controle voluntário do tutor", async () => {
  const [pagina, painel, landing] = await Promise.all([
    readFile(new URL("../public/perdidos.html", import.meta.url), "utf8"),
    readFile(new URL("../public/tutor.html", import.meta.url), "utf8"),
    readFile(new URL("../public/index.html", import.meta.url), "utf8")
  ]);
  assert.match(pagina, /Animais desaparecidos/);
  assert.match(pagina, /Perto de mim/);
  assert.match(pagina, /Todos os animais aparecem automaticamente/);
  assert.match(pagina, /Mostrar todos/);
  assert.match(pagina, /posições exibidas são aproximadas/);
  assert.doesNotMatch(pagina, /mapaPerdidos/);
  assert.match(painel, /publicarPerdidoDestaque/);
  assert.match(landing, /href="\/perdidos"/);
});
