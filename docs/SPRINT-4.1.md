# Sprint 4.1 - BIRX ID pronta para venda

## Família comercial

1. **BIRX ID Essential** - nome do pet e telefone gravados, sem NFC e sem QR Code.
2. **BIRX ID Connect** - NFC e QR Code apontando para o mesmo perfil digital.
3. **BIRX ID Complete** - NFC, QR Code, nome do pet e telefone gravados.
4. **BIRX ID Cat** - versão menor, leve e silenciosa, com NFC e QR Code.

Os nomes substituem comercialmente `Essential`, `NFC Connect` e `Smart NFC`. Os códigos internos e as tags já vendidas não devem ser alterados.

## Especificação recomendada para o lote piloto

| Modelo | Corpo | Espessura alvo | Peso alvo | Tecnologia |
| --- | --- | --- | --- | --- |
| Essential | 35 x 25 mm | 2,5 mm | até 5 g | gravação visível |
| Connect | 38 x 28 mm | 4,5 mm | até 8 g | NFC + QR Code |
| Complete | 42 x 30 mm | 4,5 mm | até 10 g | NFC + QR Code + gravação |
| Cat | 28 x 22 mm | 3,5 mm | até 4 g | NFC compacto + QR Code |

- Formato retangular com cantos de raio mínimo de 4 mm.
- Furo de 4 mm, mantendo pelo menos 3 mm de parede ao redor.
- Argola inoxidável de 15 mm para cães e 12 mm para gatos.
- Corpo piloto em PETG ou nylon PA12; acabamento fosco e bordas arredondadas.
- Cores iniciais: preto, azul BIRX, branco e rosa.
- QR Code com contraste alto, margem livre e teste em pelo menos três celulares.
- Inlay NFC sugerido: NTAG213 ou equivalente. Tamanho e alcance devem ser homologados no protótipo físico.
- Gravação NFC e QR Code devem usar o mesmo endereço curto `https://pets.birx.com.br/q/CODIGO`.

## Embalagem piloto

- Cartela vertical com área final de 80 x 120 mm.
- Sangria de 3 mm em todos os lados.
- Papel cartão 300 a 350 g/m², laminação fosca.
- Euro hole centralizado, 32 x 6 mm, a 8 mm da borda superior final.
- Frente: marca, nome do modelo, promessa principal e janela/área da tag.
- Verso: três passos de ativação, compatibilidade, contato, site e aviso de segurança.
- Berço interno: cartão 250 a 300 g/m² ou PET reciclável, com dois cortes para prender a argola.

## Guia rápido

1. Aponte a câmera para o QR Code ou aproxime o celular da tag.
2. Abra `pets.birx.com.br` e confirme o código da BIRX ID.
3. Cadastre o pet e os contatos do tutor.
4. Teste o QR Code e o NFC antes de colocar a tag na coleira.

## Validações obrigatórias antes do lote

- Confirmar a área real do inlay NFC com o fornecedor.
- Medir alcance do NFC com a tag montada e com diferentes capas de celular.
- Fazer teste de leitura do QR Code no tamanho físico final.
- Testar impacto, água, abrasão, argola e bordas.
- Confirmar que a versão Cat não incomoda nem produz ruído excessivo.
- Solicitar prova de cor, corte e sangria da gráfica.

## Arquivo de cotação

O PDF `output/pdf/birx-id-especificacao-lote-piloto.pdf` consolida esta ficha para envio a fornecedores. As medidas são a base de cotação e precisam ser homologadas em amostra antes da produção em escala.
