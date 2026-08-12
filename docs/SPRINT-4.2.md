# Sprint 4.2 - Painel do Parceiro

## Entrega 1 - Acesso e estoque

Rotas criadas:

- `/admin-parceiros` - administração protegida pela chave da BIRX;
- `/parceiro` - login exclusivo do parceiro;
- `/parceiro-painel` - estoque, vendas e ativação assistida.

## Fluxo administrativo

1. A BIRX cadastra e aprova o parceiro.
2. O sistema gera um código de acesso aleatório, exibido apenas uma vez.
3. A BIRX copia o código e o entrega ao responsável por um canal seguro.
4. Tags já preparadas são distribuídas ao estoque do parceiro.
5. A BIRX pode suspender o parceiro ou gerar um novo código, encerrando sessões anteriores.

## Fluxo do parceiro

1. O parceiro entra usando e-mail e código de acesso.
2. A sessão fica em cookie seguro, inacessível ao JavaScript.
3. O painel mostra somente as tags atribuídas àquele parceiro.
4. O atendente registra a venda de uma tag disponível.
5. O painel abre o mesmo link da tag para realizar a ativação assistida com o tutor.

## Segurança

- O parceiro nunca recebe `TAG_ADMIN_TOKEN`.
- Códigos de acesso e tokens de sessão são guardados apenas como hashes SHA-256.
- Cookies usam `HttpOnly`, `Secure` e `SameSite=Strict`.
- Parceiros suspensos têm suas sessões encerradas.
- Uma tag ativada, bloqueada ou pertencente a outro parceiro não pode ser vendida pelo painel.
- Cada tag pode pertencer a somente um estoque de parceiro.

## Banco de dados

A migração `database/029_parceiros.sql` cria:

- `parceiros`;
- `parceiro_sessoes`;
- `parceiro_estoque`;
- `parceiro_vendas`.

## Próximas entregas da Sprint 4.2

- perfis separados para proprietário e atendentes;
- histórico detalhado e indicadores por período;
- cadastro assistido sem expor dados do tutor ao parceiro;
- materiais de treinamento e suporte;
- programa de benefícios por indicação.

