# BIRX Admin — Publicação do MVP

## Variáveis obrigatórias no Cloudflare Pages

Configure estas variáveis/segredos no projeto `birx-pets`:

- `ADMIN_USER` — opcional; padrão: `admin`
- `ADMIN_PASSWORD` — senha forte do administrador
- `ADMIN_SESSION_SECRET` — segredo aleatório longo usado para assinar a sessão

A variável antiga `TAG_ADMIN_TOKEN` continua necessária para os módulos legados de preparação de tags/produção enquanto eles ainda usam a autenticação antiga.

## Aplicar migrações no D1 remoto

Execute na raiz do projeto, usando o Wrangler autenticado na conta Cloudflare correta:

```bash
npx wrangler d1 execute orbitek-pets --remote --file=./migrations/0001_admin_materiais.sql
npx wrangler d1 execute orbitek-pets --remote --file=./migrations/0002_fornecedores_compras.sql
npx wrangler d1 execute orbitek-pets --remote --file=./migrations/0003_produtos.sql
```

As migrações usam `CREATE TABLE IF NOT EXISTS`/índices apropriados e devem ser aplicadas na ordem numérica.

## Verificações antes do merge

1. Confirmar que `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` existem no ambiente de produção.
2. Aplicar as três migrações no D1 remoto.
3. Fazer deploy de preview da branch `agent/admin-dashboard-base`.
4. Testar `/admin/login.html` e login por sessão.
5. Testar cadastro de material.
6. Testar cadastro de fornecedor.
7. Registrar uma compra e confirmar alteração de saldo/custo médio.
8. Testar entrada/saída/ajuste em `/admin/estoque.html`.
9. Testar cadastro de produto.
10. Conferir os indicadores em `/admin/`.
11. Só então mesclar na `main`.

## URLs após publicação

- `/admin/login.html`
- `/admin/`
- `/admin/materiais.html`
- `/admin/estoque.html`
- `/admin/fornecedores.html`
- `/admin/compras.html`
- `/admin/produtos.html`

## Observação de compatibilidade

O BIRX Admin novo usa sessão com cookie `HttpOnly`, `Secure` e `SameSite=Strict`. Os módulos antigos `/admin-tags.html` e `/producao.html` ainda usam `TAG_ADMIN_TOKEN` e devem ser migrados em uma sprint posterior para o mesmo sistema de sessão.
