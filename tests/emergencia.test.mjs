import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,css]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-emergencia.js",import.meta.url),"utf8"),
  readFile(new URL("../public/css/tutor.css",import.meta.url),"utf8"),
]);

test("a Sprint 3.5 oferece uma Central de Emergência por pet",()=>{
  for(const id of["abrirEmergenciaDestaque","modalEmergencia","emergenciaDados","emergenciaMedicamentos","emergenciaLigar","emergenciaWhatsapp","emergenciaClinica","emergenciaCompartilhar"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/data-modulo="emergencia"/);
  assert.match(html,/tutor-emergencia\.js\?v=3\.7\.1/);
  assert.match(css,/Central de Emergência/);
});

test("a central usa o pet ativo e reúne dados protegidos já cadastrados",()=>{
  assert.match(js,/orbitek_pet_ativo/);
  assert.match(js,/api\/tutor/);
  assert.match(js,/api\/medicamentos/);
  assert.match(js,/item\.ativo/);
  assert.match(js,/orbitek:clinicas-proximas/);
  assert.match(js,/navigator\.share/);
  assert.match(js,/OrbitekNavigation/);
});
