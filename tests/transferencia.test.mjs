import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const [html,js,api,tutor]=await Promise.all([readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),readFile(new URL("../public/js/tutor-transferencia.js",import.meta.url),"utf8"),readFile(new URL("../functions/api/transferir-pet.js",import.meta.url),"utf8"),readFile(new URL("../public/js/tutor.js",import.meta.url),"utf8")]);
test("o tutor pode transferir o pet selecionado",()=>{for(const id of["transferirPetDestaque","modalTransferirPet","transferenciaEmail","transferenciaTutor","transferenciaWhatsapp","transferenciaConfirmacao"])assert.match(html,new RegExp(`id="${id}"`));assert.match(tutor,/transferir\.dataset\.tag = pet\.tagCodigo/);assert.match(js,/api\/transferir-pet/)});
test("a transferência exige sessão, propriedade e confirmação",()=>{assert.match(api,/sessoes_tutor/);assert.match(api,/LOWER\(email\)=LOWER\(\?\)/);assert.match(api,/confirmacao/);assert.match(api,/UPDATE pets SET email=/);assert.match(api,/pet_timeline/);assert.match(api,/RESEND_API_KEY/)});
