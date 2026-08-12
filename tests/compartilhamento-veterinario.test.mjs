import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [tutorHtml,tutorJs,publicHtml,publicJs,api,publicApi,migration]=await Promise.all([
  readFile(new URL("../public/tutor.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/tutor-compartilhar-vet.js",import.meta.url),"utf8"),
  readFile(new URL("../public/resumo-compartilhado.html",import.meta.url),"utf8"),
  readFile(new URL("../public/js/resumo-compartilhado.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/compartilhamentos-vet.js",import.meta.url),"utf8"),
  readFile(new URL("../functions/api/resumo-compartilhado.js",import.meta.url),"utf8"),
  readFile(new URL("../database/024_compartilhamentos_veterinarios.sql",import.meta.url),"utf8"),
]);

test("a Sprint 3.11 cria links temporários escolhendo os dados",()=>{
  assert.match(tutorHtml,/data-modulo="compartilhar-vet"/);
  for(const id of["modalCompartilharVet","formCompartilharVet","compartilharVetValidade","compartilharVetResultado","listaCompartilhamentosVet"])assert.match(tutorHtml,new RegExp(`id="${id}"`));
  assert.match(tutorHtml,/24 horas/);
  assert.match(tutorHtml,/7 dias/);
  assert.match(tutorJs,/incluir_\$\{field\}/);
  assert.match(tutorJs,/api\/compartilhamentos-vet/);
  assert.match(tutorJs,/wa\.me/);
});

test("os links são protegidos, revogáveis e registram acessos",()=>{
  assert.match(api,/crypto\.getRandomValues/);
  assert.match(api,/token_hash/);
  assert.match(api,/sessoes_tutor/);
  assert.match(api,/LOWER\(email\)=LOWER\(\?\)/);
  assert.match(api,/status='revogado'/);
  assert.match(publicApi,/expira_em>CURRENT_TIMESTAMP/);
  assert.match(publicApi,/acessos=acessos\+1/);
  assert.match(publicApi,/ultimo_acesso_em=CURRENT_TIMESTAMP/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS compartilhamentos_veterinarios/);
});

test("o veterinário recebe uma página somente leitura sem contatos de confiança",()=>{
  assert.match(publicHtml,/noindex,nofollow/);
  assert.match(publicHtml,/Acesso temporário e somente para leitura/);
  assert.match(publicJs,/credentials:"omit"/);
  assert.match(publicJs,/window\.print\(\)/);
  assert.doesNotMatch(publicApi,/pet_contatos_confianca/);
  assert.match(tutorHtml,/Contatos de confiança e localização do modo perdido nunca são compartilhados/);
});
