# BIRX Admin — Publicação do MVP

## Autenticação

O BIRX Admin usa a mesma variável `TAG_ADMIN_TOKEN` que já protege Preparação de Tags e Produção.

No navegador, a chave é compartilhada por `sessionStorage` usando o nome `orbitek_tag_admin`.

## Preparação automática do D1

O endpoint protegido `/api/admin-migrate` cria de forma idempotente as tabelas e índices necessários ao BIRX Admin.

A primeira entrada por `/admin/login.html` valida a chave existente e prepara o banco automaticamente. As páginas novas também chamam essa preparação uma vez por sessão antes de carregar.

As migrações SQL em `migrations/` continuam mantidas como histórico versionado do schema e podem ser usadas manualmente se necessário.

## URLs

- `/admin/login.html`
- `/admin/`
- `/admin/materiais.html`
- `/admin/estoque.html`
- `/admin/fornecedores.html`
- `/admin/compras.html`
- `/admin/produtos.html`
- `/admin-tags.html`
- `/producao.html`

## Verificação após deploy

1. Abrir `/admin/login.html`.
2. Informar a mesma chave administrativa usada em Preparação de Tags.
3. Confirmar que o Dashboard abre.
4. Cadastrar um material.
5. Cadastrar um fornecedor.
6. Registrar uma compra e confirmar o aumento do estoque e o novo custo médio.
7. Testar entrada, saída e ajuste no Estoque.
8. Cadastrar um produto.
9. Conferir os indicadores do Dashboard.

## Schema versionado

- `migrations/0001_admin_materiais.sql`
- `migrations/0002_fornecedores_compras.sql`
- `migrations/0003_produtos.sql`
