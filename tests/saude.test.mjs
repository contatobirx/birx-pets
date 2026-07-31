import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tutorJs = await readFile(new URL("../public/js/tutor.js", import.meta.url), "utf8");
const tutorHtml = await readFile(new URL("../public/tutor.html", import.meta.url), "utf8");
const listarApi = await readFile(new URL("../functions/api/saude-listar.js", import.meta.url), "utf8");
const salvarApi = await readFile(new URL("../functions/api/saude-salvar.js", import.meta.url), "utf8");

test("o formulário possui um único campo e uma única lista de vacinas", () => {
  assert.equal((tutorHtml.match(/id="saudeNome"/g) || []).length, 1);
  assert.equal((tutorHtml.match(/id="listaVacinasComuns"/g) || []).length, 1);
});

test("o dashboard expõe os três contadores da Sprint 1", () => {
  for (const id of ["saudeEmDia", "saudeProximas", "saudeAtrasadas"]) {
    assert.match(tutorHtml, new RegExp(`id="${id}"`));
    assert.match(tutorJs, new RegExp(id));
  }
});

test("frontend e API aplicam prioridade atrasada, próxima, em dia e sem vencimento", () => {
  assert.match(tutorJs, /atrasada: 0, vencendo: 1, emdia: 2, neutro: 3/);
  assert.match(listarApi, /date\('now', 'localtime', '\+30 days'\)/);
  assert.match(listarApi, /ELSE 3/);
});

test("salvar saúde grava evento automático na timeline no mesmo lote", () => {
  assert.match(salvarApi, /env\.DB\.batch/);
  assert.match(salvarApi, /INSERT INTO pet_timeline/);
  assert.match(salvarApi, /automatico,criado_por/);
});

test("UX bloqueia envio duplicado e pede confirmação para excluir", () => {
  assert.match(tutorJs, /estado\.salvandoSaude/);
  assert.match(tutorJs, /querySelectorAll\("input, select, textarea, button"\)/);
  assert.match(tutorJs, /OrbitekUI\?\.confirmar/);
});
