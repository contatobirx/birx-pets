import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,qrJs,api,migration,shortRoute]=await Promise.all([
  readFile(new URL("../public/admin-tags.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/admin-tags.js",import.meta.url),"utf8"),
  readFile(new URL("../public/js/admin-tags-qr.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/admin-tags.js",import.meta.url),"utf8"),
  readFile(new URL("../database/020_preparo_tags.sql",import.meta.url),"utf8"),
  readFile(new URL("../functions/q/[serial].js",import.meta.url),"utf8")
]);

test("a Sprint 2.21 prepara tags antes da venda",()=>{
  assert.match(html,/Preparação de Tags/);
  for(const model of ["essential","nfc","nfc-identificacao"])assert.match(html,new RegExp(`value="${model}"`));
  assert.match(js,/NDEFReader/);
  assert.match(js,/recordType:"url"/);
  assert.match(js,/\/q\/\$\{encodeURIComponent\(code\)\}/);
  for(const status of ["estoque","gravada","testada","vendida","ativada"])assert.match(js,new RegExp(status));
});

test("tags digitais usam o mesmo link no NFC e no QR Code",()=>{
  assert.match(html,/Link NFC \+ QR/);
  assert.match(html,/id="modalQrTag"/);
  assert.match(html,/qrcodejs/);
  assert.match(qrJs,/\/q\/\$\{encodeURIComponent\(tagCode\)\}/);
  assert.match(qrJs,/correctLevel:window\.QRCode\.CorrectLevel\.M/);
  assert.match(qrJs,/width:600,height:600/);
  assert.match(shortRoute,/tag\/\[serial\]\.js/);
  assert.match(qrJs,/download=`QR-\$\{current\.code\}\.png`/);
  assert.match(qrJs,/Essential/);
});

test("a administração exige segredo e evita códigos duplicados",()=>{
  assert.match(api,/TAG_ADMIN_TOKEN/);
  assert.match(api,/X-Orbitek-Admin/);
  assert.match(api,/crypto\.getRandomValues/);
  assert.match(api,/INSERT INTO tags/);
  assert.match(api,/ativada/);
  assert.match(migration,/preparo_status/);
});
