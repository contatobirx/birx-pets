import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,api,css,roadmap]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-bem-estar.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/bem-estar.js",import.meta.url),"utf8"),
  readFile(new URL("../public/css/tutor-bem-estar.css",import.meta.url),"utf8"),
  readFile(new URL("../ROADMAP.md",import.meta.url),"utf8")
]);

test("Sprint 4.9 resume cinco áreas do acompanhamento",()=>{
  assert.match(roadmap,/Sprint 4\.9 — Índice de Bem-estar/);
  assert.match(html,/data-modulo="bem-estar"/);
  assert.match(html,/id="modalBemEstar"/);
  for(const area of["vacinas","medicamentos","peso","alimentacao","rotina"])assert.match(api,new RegExp(`id:\"${area}\"`));
  assert.match(css,/Sprint 4\.9 — Índice de bem-estar/);
});

test("cada indicador explica dados, cálculo e ação",()=>{
  for(const field of["dadosUsados","calculo","pontos","acaoTexto"])assert.match(api,new RegExp(field));
  assert.match(js,/Ver dados usados e cálculo/);
  assert.match(js,/data-abrir-modulo/);
  assert.match(api,/até 20 pontos cada/);
});

test("o índice mostra tendências sem diagnosticar e cita fontes confiáveis",()=>{
  assert.match(html,/não avalia a saúde do animal/);
  assert.match(html,/não prevê doenças/);
  assert.match(api,/O índice não classifica essa variação como boa ou ruim/);
  assert.match(api,/WSAVA/);
  assert.match(api,/FDA — Center for Veterinary Medicine/);
  assert.match(api,/AAHA/);
  assert.match(js,/noopener noreferrer/);
});

test("a API protege os dados pelo tutor e pela tag",()=>{
  assert.match(api,/LOWER\(email\)=LOWER\(\?\)/);
  assert.match(api,/token_hash=\?/);
  assert.match(api,/Pet não encontrado ou sem permissão/);
  assert.match(api,/Cache-Control/);
});
