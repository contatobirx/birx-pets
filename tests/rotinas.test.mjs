import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const [html,js,api,css,migration]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),readFile(new URL("../public/js/tutor-rotinas.js",import.meta.url),"utf8"),readFile(new URL("../functions/api/rotinas.js",import.meta.url),"utf8"),readFile(new URL("../public/css/tutor.css",import.meta.url),"utf8"),readFile(new URL("../database/025_rotinas_cuidados.sql",import.meta.url),"utf8")
]);
test("a Sprint 3.12 organiza cuidados recorrentes por pet",()=>{assert.match(html,/data-modulo="rotinas"/);for(const id of["modalRotinas","listaRotinasHoje","formRotina","rotinaFrequencia","rotinaHorarios","rotinaDias","listaRotinas"])assert.match(html,new RegExp(`id="${id}"`));assert.match(html,/tutor-rotinas\.js\?v=3\.12/);assert.match(js,/orbitek_pet_ativo/);assert.match(js,/concluida/);assert.match(js,/ignorada/);assert.match(css,/Sprint 3\.12/)});
test("as rotinas são privadas e geram notificações sem duplicar ocorrências",()=>{assert.match(api,/sessoes_tutor/);assert.match(api,/LOWER\(email\)=LOWER\(\?\)/);assert.match(api,/INSERT OR IGNORE INTO pet_rotina_ocorrencias/);assert.match(api,/INSERT OR IGNORE INTO notificacoes_tutor/);assert.match(api,/America\/Sao_Paulo/);assert.match(api,/frequencia==="semanal"/);assert.match(migration,/UNIQUE\(rotina_id, prevista_em\)/);assert.match(migration,/CREATE TABLE IF NOT EXISTS pet_rotinas/)});
