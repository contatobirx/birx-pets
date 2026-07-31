import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const [html,js,css]=await Promise.all([readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),readFile(new URL("../public/js/tutor.js",import.meta.url),"utf8"),readFile(new URL("../public/css/tutor.css",import.meta.url),"utf8")]);
test("o app permite escolher o pet ativo",()=>{assert.match(html,/id="seletorPetAtivo"/);assert.match(html,/Pet ativo/);assert.match(js,/orbitek_pet_ativo/);assert.match(js,/function petAtivo/);assert.match(js,/prepararSeletorPetAtivo/);assert.match(css,/pet-ativo-controle/)});
test("ações rápidas usam o pet selecionado",()=>{assert.match(js,/const petOriginal = petAtivo\(\)/);assert.doesNotMatch(js,/function acionarModulo\(modulo\) \{\s*const petOriginal = estado\.pets\[0\]/);for(const action of["orbitek:abrir-carteirinha","orbitek:abrir-medicamentos","orbitek:abrir-agendamentos"])assert.match(js,new RegExp(action))});
