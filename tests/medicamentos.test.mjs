import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../public/tutor.html", import.meta.url), "utf8");
const js = await readFile(new URL("../public/js/tutor-medicamentos.js", import.meta.url), "utf8");
const api = await readFile(new URL("../functions/api/medicamentos.js", import.meta.url), "utf8");
const migration = await readFile(new URL("../database/015_create_medicamentos.sql", import.meta.url), "utf8");

test("a aba Medicamentos oferece cadastro completo por pet", () => {
  assert.doesNotMatch(html, /Medicamentos<\/strong><small>Em desenvolvimento/);
  for (const id of ["modalMedicamentos", "medicamentoNome", "medicamentoDosagem", "medicamentoFrequencia", "medicamentoHorarios", "medicamentoInicio", "medicamentoFim", "medicamentoVeterinario", "medicamentoObservacoes"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(js, /orbitek:abrir-medicamentos/);
  assert.match(js, /method: "DELETE"/);
});

test("medicamentos são protegidos por sessão, tutor e tag", () => {
  assert.match(api, /sessoes_tutor/);
  assert.match(api, /LOWER\(email\)=LOWER\(\?\)/);
  assert.match(api, /pet_timeline/);
  assert.match(api, /Medicamento \$\{nome\} iniciado/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS pet_medicamentos/);
  assert.match(migration, /tag_codigo TEXT NOT NULL/);
});
