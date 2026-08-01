import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,api,css,migration]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-peso.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/pesos.js",import.meta.url),"utf8"),
  readFile(new URL("../public/css/tutor.css",import.meta.url),"utf8"),
  readFile(new URL("../database/022_pet_pesos.sql",import.meta.url),"utf8"),
]);

test("a Sprint 3.7 acompanha o peso do pet selecionado",()=>{
  assert.match(html,/data-modulo="peso"/);
  for(const id of["modalPeso","pesoAtual","pesoVariacao","pesoGrafico","listaPesos","pesoKg","pesoData","pesoObservacoes"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(js,/orbitek_pet_ativo/);
  assert.match(js,/api\/pesos/);
  assert.match(js,/polyline/);
  assert.match(css,/acompanhamento de peso/);
});

test("os pesos são protegidos por tutor e entram na timeline",()=>{
  assert.match(api,/sessoes_tutor/);
  assert.match(api,/LOWER\(email\)=LOWER\(\?\)/);
  assert.match(api,/weight<0\.1\|\|weight>300/);
  assert.match(api,/INSERT INTO pet_pesos/);
  assert.match(api,/pet_timeline/);
  assert.match(api,/DELETE FROM pet_pesos/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS pet_pesos/);
});
