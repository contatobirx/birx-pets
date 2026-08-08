# BIRX Admin — Publicação do MVP

## Acesso administrativo

O BIRX Admin usa a mesma chave administrativa já existente nos módulos de Preparação de Tags e Produção.

Variável obrigatória no Cloudflare Pages:

- `TAG_ADMIN_TOKEN`

Não é necessário configurar `ADMIN_USER`, `ADMIN_PASSWORD` ou `ADMIN_SESSION_SECRET`.

A chave é enviada no cabeçalho `X-BIRX-Admin` e armazenada apenas durante a sessão do navegador em `sessionStorage` com a mesma chave usada pelo admin atual (`orbitek_tag_admin`).

## Aplicar migrações no D1 remoto

Execute na raiz do projeto, usando o Wrangler autenticado na conta Cloudflare correta:

```bash
npx wrangler d1 execute orbitek-pets --remote --file=./migrations/0001_admin_materiais.sql
npx wrangler d1 execute orbitek-pets --remote --file=./migrations/0002_fornecedores_compras.sql
npx wrangler d1 execute orbitek-pets --remote --file=./migrations/0003_produtos.sql
```

As migrações devem ser aplicadas na ordem numérica.

## Verificações antes do merge

1. Confirmar que `TAG_ADMIN_TOKEN` continua configurado no ambiente de produção.
2. Aplicar as três migrações no D1 remoto.
3. Fazer deploy de preview da branch `agent/admin-dashboard-base`.
4. Entrar em `/admin/login.html` usando a mesma chave administrativa atual.
5. Confirmar que a mesma sessão abre `/admin-tags.html`, `/producao.html` e `/admin/` sem pedir outra credencial enquanto a aba/sessão estiver ativa.
6. Testar cadastro de material.
7. Testar cadastro de fornecedor.
8. Registrar uma compra e confirmar alteração de saldo/custo médio.
9. Testar entrada/saída/ajuste em `/admin/estoque.html`.
10. Testar cadastro de produto.
11. Conferir os indicadores em `/admin/`.
12. Só então mesclar na `main`.

## URLs após publicação

- `/admin/login.html`
- `/admin/`
- `/admin/materiais.html`
- `/admin/estoque.html`
- `/admin/fornecedores.html`
- `/admin/compras.html`
- `/admin/produtos.html`
- `/admin-tags.html`
- `/producao.html`

## Compatibilidade

Todos os módulos administrativos passam a usar o mesmo `TAG_ADMIN_TOKEN`, evitando dois sistemas de autenticação e duas credenciais diferentes.
