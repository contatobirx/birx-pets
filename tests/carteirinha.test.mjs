import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,css,tutorJs]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-carteirinha.js",import.meta.url),"utf8"),
  readFile(new URL("../public/css/carteirinha.css",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor.js",import.meta.url),"utf8")
]);

test("a Sprint 2.19 oferece carteirinha digital por pet",()=>{
  assert.match(html,/data-modulo="carteirinha"/);
  assert.match(html,/id="modalCarteirinha"/);
  assert.match(html,/Imprimir ou salvar PDF/);
  assert.match(tutorJs,/orbitek:abrir-carteirinha/);
  assert.match(js,/api\/saude-listar/);
  assert.match(js,/api\/medicamentos/);
  assert.match(js,/\/assets\/login.png/);
});

test("a carteirinha possui visual próprio para PDF",()=>{
  assert.match(css,/@media print/);
  assert.match(css,/@page/);
  assert.match(js,/window\.print\(\)/);
  for(const section of ["Identificação","Tutor responsável","Cuidados importantes","Vacinas","Medicamentos em uso","Em uma emergência"])assert.match(js,new RegExp(section));
});
