import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,tutor,css]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-cartaz.js",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor.js",import.meta.url),"utf8"),
  readFile(new URL("../public/css/tutor.css",import.meta.url),"utf8"),
]);

test("a Sprint 3.6 gera cartaz somente para pet desaparecido",()=>{
  for(const id of["gerarCartazDestaque","modalCartazPerdido","cartazPerdido","cartazFoto","cartazQr","imprimirCartaz","compartilharCartaz"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(tutor,/gerarCartazDestaque\.hidden = !pet\.perdido/);
  assert.match(js,/Ative o modo perdido antes de gerar o cartaz/);
});

test("o cartaz inclui localização, contato, QR Code e impressão em A4",()=>{
  assert.match(js,/api\/ultima-localizacao/);
  assert.match(js,/api\/tutor/);
  assert.match(js,/new window\.QRCode/);
  assert.match(js,/navigator\.share/);
  assert.match(js,/window\.print/);
  assert.match(css,/@page\{size:A4 portrait/);
  assert.match(html,/assets\/login\.png/);
});
