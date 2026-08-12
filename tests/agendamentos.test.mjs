import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,api,migration,tutorJs]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-agendamentos.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/agendamentos.js",import.meta.url),"utf8"),
  readFile(new URL("../database/018_create_agendamentos.sql",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor.js",import.meta.url),"utf8")
]);

test("a Sprint 2.18 oferece agendamentos por pet",()=>{
  assert.match(html,/data-modulo="agendamentos"/);
  for(const id of ["modalAgendamentos","agendamentoTipo","agendamentoTitulo","agendamentoDataHora","agendamentoClinica","agendamentoVeterinario","agendamentoEndereco","agendamentoStatus"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(tutorJs,/orbitek:abrir-agendamentos/);
  assert.match(js,/api\/agendamentos/);
});

test("agendamentos são protegidos, entram na timeline e geram lembretes",()=>{
  assert.match(api,/sessoes_tutor/);
  assert.match(api,/LOWER\(email\)=LOWER/);
  assert.match(api,/pet_timeline/);
  assert.match(api,/notificacoes_tutor/);
  assert.match(api,/48\*60\*60\*1000/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS pet_agendamentos/);
  assert.match(migration,/consulta.*retorno.*exame.*vacina.*outro/);
});
