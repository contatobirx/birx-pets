import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const files=await Promise.all([
  "../public/loja.html","../public/js/loja.js","../public/css/loja.css",
  "../public/pedido.html","../public/js/pedido.js","../public/admin-loja.html","../public/js/admin-loja.js",
  "../functions/api/loja.js","../functions/api/pedido.js","../functions/api/admin-loja.js","../database/036_loja.sql"
].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
const[shop,shopJs,shopCss,tracking,trackingJs,admin,adminJs,shopApi,trackingApi,adminApi,migration]=files;

test("a Sprint 4.10 cria catálogo comercial e carrinho persistente",()=>{
  assert.match(shop,/Loja Oficial BIRX/i);
  assert.match(shop,/data-filtro="birx-id"/);
  assert.match(shop,/data-filtro="impressos-3d"/);
  assert.match(shopJs,/birx_loja_carrinho/);
  assert.match(shopJs,/try\{localStorage\.setItem.+\}catch\{\}renderCart\(\)/);
  assert.match(shopJs,/config\.freteGratisAPartirCentavos/);
  assert.match(shopCss,/product-grid/);
  for(const slug of["birx-id-essential","birx-id-nfc","birx-id-smart","birx-cat","kit-protecao","pa-dosadora","porta-racao","porta-remedios","organizador-pet"])assert.match(migration,new RegExp(slug));
});

test("o checkout calcula valores no servidor e protege o estoque",()=>{
  assert.match(shop,/id="formCheckout"/);
  assert.match(shop,/Pagamento por Pix/);
  assert.match(shopJs,/api\/loja/);
  assert.match(shopApi,/preco_centavos AS precoCentavos/);
  assert.match(shopApi,/Estoque insuficiente/);
  assert.match(shopApi,/UPDATE loja_produtos SET estoque=estoque-\?/);
  assert.match(shopApi,/Muitos pedidos foram enviados recentemente/);
  assert.doesNotMatch(shopApi,/body\.preco/);
});

test("o Pix segue o BR Code e tem alternativa de atendimento",()=>{
  for(const variable of["PIX_CHAVE","PIX_RECEBEDOR","PIX_CIDADE"])assert.match(shopApi,new RegExp(variable));
  assert.match(shopApi,/BR\.GOV\.BCB\.PIX/);
  assert.match(shopApi,/crc16/);
  assert.match(shopJs,/pixAtendimento/);
  assert.match(shop,/Não solicitamos dados de cartão/);
});

test("cada pedido pode ser acompanhado com código e e-mail",()=>{
  assert.match(tracking,/Acompanhe seu pedido/);
  assert.match(trackingJs,/api\/pedido\?codigo=/);
  assert.match(trackingApi,/WHERE codigo=\? AND LOWER\(email\)=\?/);
  assert.match(trackingApi,/loja_pedido_eventos/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS loja_pedidos/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS loja_pedido_itens/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS loja_pedido_eventos/);
});

test("o painel administrativo confirma pagamento, envio, estoque e cupons",()=>{
  assert.match(admin,/Operação da loja/);
  assert.match(admin,/Produtos e estoque/);
  assert.match(admin,/Cupons/);
  assert.match(adminJs,/acao:"pagamento"/);
  assert.match(adminJs,/acao:"pedido"/);
  assert.match(adminApi,/X-BIRX-Admin/);
  assert.match(adminApi,/Pagamento confirmado/);
  assert.match(adminApi,/codigo_rastreio/);
  assert.match(adminApi,/loja_cupons/);
  assert.match(adminApi,/estoque_devolvido/);
});

test("a loja envia confirmação por e-mail e oferece suporte oficial",()=>{
  assert.match(shopApi,/RESEND_API_KEY/);
  assert.match(shopApi,/Pedido .* \| BIRX Pets/);
  assert.match(shopApi,/contato@pets\.birx\.com\.br/);
  assert.match(shopApi,/5541988315017/);
});
