import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{deliveryOptions}from"../functions/_shared/loja-frete.js";

const files=await Promise.all(["../public/loja.html","../public/js/loja.js","../public/pedido.html","../public/js/pedido.js","../public/admin-loja.html","../public/js/admin-loja.js","../functions/api/frete.js","../functions/api/loja.js","../functions/api/pedido.js","../functions/api/comprovante-pagamento.js","../database/037_pagamentos_entregas.sql","../docs/SPRINT-4.11.md"].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
const[shop,shopJs,tracking,trackingJs,admin,adminJs,shippingApi,shopApi,trackingApi,proofApi,migration,roadmap]=files;

test("a Sprint 4.11 calcula entrega por CEP no servidor",()=>{
  assert.match(roadmap,/Sprint 4\.11 — Pagamentos e Entregas/);
  assert.match(shop,/id="statusFrete"/);
  assert.match(shopJs,/\/api\/frete/);
  assert.match(shippingApi,/loja_produtos/);
  assert.match(shopApi,/quoteDelivery/);
  assert.match(shopApi,/modalidade_entrega/);
  const option=deliveryOptions({LOJA_FRETE_CENTAVOS:"1290"},{estado:"PR",cidade:"Curitiba"},5000)[0];
  assert.equal(option.valorCentavos,1290);
  assert.deepEqual([option.prazoMinDias,option.prazoMaxDias],[3,7]);
});

test("frete grátis e retirada são recalculados sem confiar no navegador",()=>{
  const env={LOJA_FRETE_CENTAVOS:"1290",LOJA_FRETE_GRATIS_CENTAVOS:"14900",LOJA_RETIRADA_ATIVA:"true",LOJA_RETIRADA_ENDERECO:"Curitiba - PR"};
  const options=deliveryOptions(env,{estado:"SP",cidade:"São Paulo"},20000);
  assert.equal(options[0].valorCentavos,0);
  assert.equal(options[1].modalidade,"retirada");
  assert.equal(options[1].valorCentavos,0);
  assert.match(shopApi,/quote\.opcoes\.find/);
});

test("o cliente envia comprovante protegido e acompanha a conferência",()=>{
  assert.match(tracking,/id="formComprovante"/);
  assert.match(trackingJs,/comprovante-pagamento/);
  for(const type of["image/jpeg","image/png","image/webp","application/pdf"])assert.match(proofApi,new RegExp(type.replace("/","\\/")));
  assert.match(proofApi,/5\*1024\*1024/);
  assert.match(proofApi,/formData\(\)\}catch\{return json/);
  assert.match(proofApi,/LOWER\(email\)=\?/);
  assert.match(proofApi,/statusPagamento!=="aguardando"/);
  assert.match(migration,/comprovante_url/);
  assert.match(trackingApi,/comprovanteEnviado/);
});

test("o painel administrativo destaca comprovantes e prazos",()=>{
  assert.match(admin,/resumoComprovantes/);
  assert.match(adminJs,/Ver comprovante/);
  assert.match(adminJs,/prazoEntregaMinDias/);
  assert.match(adminJs,/rel="noopener noreferrer"/);
});
