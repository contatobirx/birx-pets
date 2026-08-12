import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const [html,js,navigation,css]=await Promise.all([readFile(new URL("../public/t.html",import.meta.url),"utf8"),readFile(new URL("../public/js/pet.js",import.meta.url),"utf8"),readFile(new URL("../public/js/core/navigation.js",import.meta.url),"utf8"),readFile(new URL("../public/css/pet.css",import.meta.url),"utf8")]);
test("o perfil público possui botão voltar contextual",()=>{assert.match(html,/id="voltarPerfil"/);assert.match(js,/Voltar ao painel/);assert.match(js,/Voltar para animais perdidos/);assert.match(js,/Voltar para o início/);assert.match(css,/botao-voltar-perfil/)});
test("o app abre o perfil na mesma tela",()=>{assert.match(navigation,/window\.location\.href = url/);assert.doesNotMatch(navigation,/window\.open\(url/);assert.match(html,/pet\.js\?v=3\.7\.1/)});
