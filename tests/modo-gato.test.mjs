import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,api,sql,css,roadmap,partners]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-modo-gato.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/modo-gato.js",import.meta.url),"utf8"),
  readFile(new URL("../database/035_modo_gato.sql",import.meta.url),"utf8"),
  readFile(new URL("../public/css/tutor-modo-gato.css",import.meta.url),"utf8"),
  readFile(new URL("../ROADMAP.md",import.meta.url),"utf8"),
  readFile(new URL("../public/js/rede-parceiros.js",import.meta.url),"utf8")
]);

test("Sprint 4.8 oferece uma experiência exclusiva para gatos",()=>{
  assert.match(roadmap,/Sprint 4\.8 — Modo Gato/);
  assert.match(html,/data-modulo="modo-gato" hidden/);
  assert.match(html,/id="modalModoGato"/);
  for(const field of["gatoAcessoRua","gatoMoradia","gatoConvivencia","gatoQuantidade","gatoCastrado","gatoTelas","gatoMicrochip","gatoCaixasAreia","gatoPontosAgua"])assert.match(html,new RegExp(`id="${field}"`));
  assert.match(css,/Sprint 4\.8 — Modo Gato/);
});

test("Modo Gato preserva cães e valida que o pet pertence ao tutor",()=>{
  assert.match(js,/isCat/);
  assert.match(js,/button\.hidden=!isCat\(pet\)/);
  assert.match(api,/LOWER\(email\)=LOWER\(\?\)/);
  assert.match(api,/LOWER\(especie\) IN \('gato','felino','felina'\)/);
  assert.match(sql,/tag_codigo TEXT PRIMARY KEY/);
});

test("Modo Gato integra recomendações, lembretes e busca segura",()=>{
  for(const term of["caixas de areia","pontos de água","Brincadeira e enriquecimento","microchip","castração"])assert.match(api,new RegExp(term,"i"));
  assert.match(js,/\/api\/rotinas/);
  assert.match(html,/Ver avistamentos e mapa/);
  assert.match(html,/Não persiga o gato/);
  assert.match(html,/\/parceiros\?servico=felinos/);
  assert.match(partners,/new URLSearchParams\(location\.search\)\.get\("servico"\)/);
  assert.match(html,/Linha BIRX Cat/);
});
