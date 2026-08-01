import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,emergencyJs,api,css,migration]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-contatos.js",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-emergencia-contatos.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/contatos-confianca.js",import.meta.url),"utf8"),
  readFile(new URL("../public/css/tutor.css",import.meta.url),"utf8"),
  readFile(new URL("../database/023_contatos_confianca.sql",import.meta.url),"utf8"),
]);

test("a Sprint 3.9 permite gerenciar contatos de confiança por pet",()=>{
  assert.match(html,/data-modulo="contatos"/);
  for(const id of["modalContatos","contatosNomePet","listaContatos","formContato","contatoNome","contatoWhatsapp","contatoPrioridade"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/tutor-contatos\.js\?v=3\.9/);
  assert.match(js,/orbitek_pet_ativo/);
  assert.match(js,/api\/contatos-confianca/);
  assert.match(js,/contacts\.length>=5/);
  assert.match(css,/Contatos de confiança/);
});

test("os contatos são privados, limitados a cinco e integrados à emergência",()=>{
  assert.match(api,/sessoes_tutor/);
  assert.match(api,/LOWER\(email\)=LOWER\(\?\)/);
  assert.match(api,/>=5/);
  assert.match(api,/INSERT INTO pet_contatos_confianca/);
  assert.match(api,/UPDATE pet_contatos_confianca/);
  assert.match(api,/DELETE FROM pet_contatos_confianca/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS pet_contatos_confianca/);
  assert.match(html,/id="emergenciaRedeApoio"/);
  assert.match(html,/tutor-emergencia-contatos\.js\?v=3\.9/);
  assert.match(emergencyJs,/api\/contatos-confianca/);
  assert.match(emergencyJs,/orbitek_pet_ativo/);
});
