import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,css]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-calendario.js",import.meta.url),"utf8"),
  readFile(new URL("../public/css/tutor.css",import.meta.url),"utf8"),
]);

test("a Sprint 3.8 reúne os cuidados em uma agenda mensal",()=>{
  assert.match(html,/data-modulo="calendario"/);
  for(const id of["modalCalendario","calendarioMes","calendarioAnterior","calendarioProximo","calendarioGrid","calendarioLista","exportarCalendario"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(js,/api\/agendamentos/);
  assert.match(js,/api\/saude-listar/);
  assert.match(js,/api\/medicamentos/);
  assert.match(css,/Agenda inteligente/);
});

test("a agenda permite exportar eventos para calendários do celular",()=>{
  assert.match(js,/BEGIN:VCALENDAR/);
  assert.match(js,/BEGIN:VEVENT/);
  assert.match(js,/text\/calendar/);
  assert.match(js,/\.ics/);
  assert.match(js,/orbitek_pet_ativo/);
});
