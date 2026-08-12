import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html,js,listApi,uploadApi,updateApi,migration]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/documentos-listar.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/documentos-upload.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/documentos-atualizar.js",import.meta.url),"utf8"),
  readFile(new URL("../database/019_expandir_documentos.sql",import.meta.url),"utf8")
]);

test("a Sprint 2.20 organiza documentos e exames",()=>{
  for(const id of ["documentosBusca","documentosFiltroCategoria","documentoData","documentoProfissional","documentoObservacoes"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(js,/dataDocumento/);
  assert.match(js,/profissional/);
  assert.match(js,/observacoes/);
  assert.match(js,/renderizarDocumentos/);
});

test("os metadados são gravados e listados com segurança",()=>{
  for(const source of [listApi,uploadApi,updateApi])assert.match(source,/documentos_pet/);
  assert.match(listApi,/petDoTutor/);
  assert.match(listApi,/data_documento AS dataDocumento/);
  assert.match(uploadApi,/dataDocumento/);
  assert.match(updateApi,/data_documento = NULLIF/);
  for(const column of ["data_documento","profissional","observacoes"])assert.match(migration,new RegExp(column));
});
