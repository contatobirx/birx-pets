import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequestGet } from "../functions/api/fotos.js";

test("a galeria do tutor exige autenticação", async () => {
  const resposta = await onRequestGet({ request: new Request("https://orbitekoficial.com.br/api/fotos?tag=ABC"), env: { DB: {} } });
  assert.equal(resposta.status, 401);
});

test("a galeria aceita até cinco fotos e só aparece publicamente no modo perdido", async () => {
  const [banco, api, painel, perfil, tag] = await Promise.all([
    readFile(new URL("../database/014_pet_fotos.sql", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/fotos.js", import.meta.url), "utf8"),
    readFile(new URL("../public/tutor.html", import.meta.url), "utf8"),
    readFile(new URL("../public/t.html", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/tag.js", import.meta.url), "utf8")
  ]);
  assert.match(banco, /CREATE TABLE IF NOT EXISTS pet_fotos/);
  assert.match(api, /limite:5/);
  assert.match(api, /limite de cinco fotos/);
  assert.match(painel, /galeriaTutorFotos/);
  assert.match(perfil, /galeriaPublica/);
  assert.match(tag, /if \(perdido\)/);
});
