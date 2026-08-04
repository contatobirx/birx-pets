# Sprint 4.11 — Pagamentos e Entregas

## Entrega por CEP

O checkout consulta o CEP no servidor, confirma cidade e estado e calcula uma opção de entrega com valor e prazo. O servidor consulta novamente o CEP ao criar o pedido, usa os preços atuais dos produtos e ignora valores enviados pelo navegador.

As regiões usam o frete padrão já configurado e prazos iniciais de operação. Quando necessário, a BIRX pode definir valores diferentes na Cloudflare:

- `LOJA_FRETE_SUL_CENTAVOS`;
- `LOJA_FRETE_SUDESTE_CENTAVOS`;
- `LOJA_FRETE_CENTRO_OESTE_CENTAVOS`;
- `LOJA_FRETE_NORDESTE_CENTAVOS`;
- `LOJA_FRETE_NORTE_CENTAVOS`.

O valor mínimo para frete grátis continua em `LOJA_FRETE_GRATIS_CENTAVOS`.

## Retirada local opcional

A retirada só aparece quando as duas variáveis estiverem configuradas:

- `LOJA_RETIRADA_ATIVA=true`;
- `LOJA_RETIRADA_ENDERECO` com o endereço e as instruções de retirada.

Sem essas variáveis, o checkout oferece somente entrega.

## Pagamento por Pix

O Pix continua sendo gerado individualmente para cada pedido quando `PIX_CHAVE`, `PIX_RECEBEDOR` e `PIX_CIDADE` estiverem configuradas. Depois do pagamento, o cliente pode anexar uma imagem ou PDF de até 5 MB na página de acompanhamento.

O comprovante:

- exige o código e o mesmo e-mail da compra;
- só é aceito enquanto o pagamento está aguardando;
- é armazenado na conta Cloudinary da BIRX;
- aparece somente no painel administrativo protegido;
- gera um evento na linha do tempo do pedido;
- não confirma o pagamento automaticamente.

A equipe BIRX confere o documento e marca o pedido como pago. A confirmação bancária automática poderá ser adicionada futuramente com um provedor de pagamentos que ofereça webhook.

## Variável opcional de aviso

`EMAIL_ADMIN_LOJA` define quem recebe o aviso de novo comprovante. Sem ela, o sistema usa `contato@pets.birx.com.br`.
