# Sprint 4.10 — Loja BIRX

## Entrega

A BIRX Pets passa a vender BIRX IDs, BIRX Cat, kits e produtos impressos em 3D dentro do próprio ecossistema. O catálogo, o estoque e os valores são lidos do banco D1, evitando confiar em preços enviados pelo navegador.

## Compra

- catálogo comercial com filtros;
- carrinho persistente no dispositivo;
- checkout com contato, CEP e endereço de entrega;
- cálculo de subtotal, desconto e frete no servidor;
- pagamento por Pix, sem coleta de dados de cartão;
- confirmação do pedido por e-mail;
- proteção contra excesso de pedidos e validação de estoque.

Se `PIX_CHAVE`, `PIX_RECEBEDOR` e `PIX_CIDADE` estiverem configuradas na Cloudflare, o pedido gera um Pix copia e cola no padrão BR Code com valor e identificação próprios. Sem essas variáveis, o pedido continua rastreável e o pagamento é encaminhado ao atendimento.

## Acompanhamento e operação

O cliente consulta o pedido usando o código e o mesmo e-mail da compra. A página apresenta itens, valores, entrega, pagamento, andamento, eventos e rastreio.

O painel `/admin-loja` usa a chave administrativa `TAG_ADMIN_TOKEN` e permite:

- confirmar ou atualizar pagamentos;
- colocar pedidos em separação, envio, entrega ou cancelamento;
- registrar o código de rastreio;
- atualizar preços, disponibilidade e estoque;
- criar, ativar e pausar cupons;
- acompanhar os indicadores da operação.

## Variáveis opcionais

- `PIX_CHAVE`: chave Pix cadastrada para a BIRX;
- `PIX_RECEBEDOR`: nome do recebedor, com até 25 caracteres;
- `PIX_CIDADE`: cidade do recebedor, com até 15 caracteres;
- `LOJA_FRETE_CENTAVOS`: frete padrão, em centavos; padrão de R$ 12,90;
- `LOJA_FRETE_GRATIS_CENTAVOS`: valor mínimo para frete grátis; padrão de R$ 149,00.

O painel e o acompanhamento funcionam antes da configuração do Pix, permitindo testar todo o fluxo sem realizar uma cobrança.
