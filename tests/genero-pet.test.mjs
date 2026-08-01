import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [tutor,pet,perdidos,emergencia,cartaz,status,agents]=await Promise.all([
  readFile(new URL("../public/js/tutor.js",import.meta.url),"utf8"),
  readFile(new URL("../public/js/pet.js",import.meta.url),"utf8"),
  readFile(new URL("../public/js/perdidos.js",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-emergencia.js",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-cartaz.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/tutor-status.js",import.meta.url),"utf8"),
  readFile(new URL("../AGENTS.md",import.meta.url),"utf8"),
]);

test("textos dinâmicos respeitam pets do sexo feminino",()=>{
  assert.match(tutor,/protegida/);
  assert.match(tutor,/encontrada/);
  assert.match(pet,/desaparecida/);
  assert.match(pet,/Estou.*segura/s);
  assert.match(perdidos,/PERDIDA/);
  assert.match(emergencia,/desaparecida/);
  assert.match(cartaz,/desaparecida/);
  assert.match(status,/petFemea/);
});

test("a regra de linguagem por sexo fica registrada no projeto",()=>{
  assert.match(agents,/Linguagem conforme o sexo do pet/);
  assert.match(agents,/protegida.*perdida.*desaparecida.*encontrada.*segura/s);
});
