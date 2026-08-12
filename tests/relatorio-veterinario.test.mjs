import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,css]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-relatorio-vet.js",import.meta.url),"utf8"),
  readFile(new URL("../public/css/tutor.css",import.meta.url),"utf8"),
]);

test("a Sprint 3.10 cria um resumo veterinário para o pet ativo",()=>{
  assert.match(html,/data-modulo="relatorio"/);
  for(const id of["modalRelatorioVet","relatorioVetCarregando","relatorioVet","relatorioVetAcoes","imprimirRelatorioVet"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/tutor-relatorio-vet\.js\?v=3\.10/);
  assert.match(js,/orbitek_pet_ativo/);
  for(const endpoint of["api/tutor","api/saude-listar","api/medicamentos","api/pesos","api/agendamentos"])assert.match(js,new RegExp(endpoint.replace("/","\\/")));
});

test("o resumo reúne dados clínicos e pode ser salvo em PDF",()=>{
  assert.match(js,/Medicamentos em uso/);
  assert.match(js,/Vacinas/);
  assert.match(js,/Próximos compromissos/);
  assert.match(js,/Peso mais recente/);
  assert.match(js,/window\.print\(\)/);
  assert.match(js,/não substitui prontuário ou avaliação veterinária/);
  assert.match(css,/Sprint 3\.10/);
  assert.match(css,/body\.relatorio-vet-aberto/);
  assert.match(css,/@page\{size:A4 portrait/);
});
