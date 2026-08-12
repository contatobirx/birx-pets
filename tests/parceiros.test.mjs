import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const files=await Promise.all([
  "../public/parceiro.html","../public/parceiro-painel.html","../public/admin-parceiros.html",
  "../public/js/parceiro-login.js","../public/js/parceiro-painel.js","../public/js/admin-parceiros.js",
  "../functions/api/parceiro-login.js","../functions/api/parceiro.js","../functions/api/admin-parceiros.js",
  "../database/029_parceiros.sql"
].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
const[login,panel,admin,loginJs,panelJs,adminJs,loginApi,partnerApi,adminApi,migration]=files;

test("a Sprint 4.2 cria acesso separado para parceiros",()=>{
  assert.match(login,/Painel do Parceiro/);
  assert.match(login,/assets\/login\.png/);
  assert.match(loginJs,/api\/parceiro-login/);
  assert.match(loginApi,/birx_partner_session/);
  assert.match(loginApi,/HttpOnly; Secure; SameSite=Strict/);
  assert.match(loginApi,/codigo_acesso_hash/);
  assert.doesNotMatch(loginApi,/TAG_ADMIN_TOKEN/);
});

test("o parceiro visualiza somente seu estoque e registra vendas",()=>{
  assert.match(panel,/Estoque de BIRX IDs/);
  assert.match(panelJs,/Registrar venda/);
  assert.match(panelJs,/\/q\/\$\{encodeURIComponent\(tag\.codigo\)\}/);
  assert.match(partnerApi,/e\.parceiro_id=\?/);
  assert.match(partnerApi,/Esta tag não pertence ao estoque do parceiro/);
  assert.match(partnerApi,/parceiro_vendas/);
  assert.match(partnerApi,/preparo_status='vendida'/);
});

test("a BIRX administra aprovação e distribuição sem expor códigos",()=>{
  assert.match(admin,/Novo parceiro/);
  assert.match(admin,/Distribuir estoque/);
  assert.match(adminJs,/ele não será exibido novamente/);
  assert.match(adminApi,/X-BIRX-Admin/);
  assert.match(adminApi,/codigoAcesso:code/);
  assert.doesNotMatch(adminApi,/SELECT[^\n]+codigo_acesso_hash[^\n]+FROM parceiros p LEFT/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS parceiros/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS parceiro_estoque/);
  assert.match(migration,/tag_codigo TEXT NOT NULL UNIQUE/);
});

