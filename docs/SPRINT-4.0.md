# Sprint 4.0 — Estabilização da BIRX

## Entrega 1 — Domínios antigos

O middleware global redireciona permanentemente:

- `https://orbitekoficial.com.br/*`
- `https://www.orbitekoficial.com.br/*`

para o mesmo caminho e os mesmos parâmetros em `https://pets.birx.com.br/*`.

Exemplo:

`https://orbitekoficial.com.br/q/ORB-26-123456` passa a abrir
`https://pets.birx.com.br/q/ORB-26-123456`.

Isso preserva tags, QR Codes, favoritos e links antigos.

## Ativação na Cloudflare

Depois que esta versão estiver publicada:

1. Remover `orbitekoficial.com.br` e `www.orbitekoficial.com.br` dos domínios personalizados do projeto antigo `orbitek-pets`.
2. Adicionar os dois domínios ao projeto novo `birx-pets`.
3. Aguardar o status **Ativo** e **SSL habilitado**.
4. Testar a raiz, uma rota `/q/` e uma rota `/tag/` antiga.
5. Manter o projeto antigo arquivado por segurança até o fim da Sprint 4.0.

## Regras de segurança

- Não alterar códigos `ORB-` já vendidos ou impressos.
- Não renomear o banco D1 durante esta etapa.
- Não remover o projeto antigo antes do backup e do teste dos redirecionamentos.

## Entrega 2 — Backup do banco D1

O script `scripts/backup-d1.ps1` exporta o banco remoto para a pasta local `backups`.

Execute no PowerShell, dentro do projeto:

```powershell
.\scripts\backup-d1.ps1
```

O nome técnico `orbitek-pets` permanece apenas para acessar o banco existente sem perda de dados. O arquivo gerado recebe data e hora e não é enviado ao GitHub.

Depois da exportação:

1. Confirmar que o arquivo `.sql` não está vazio.
2. Copiar o arquivo para um armazenamento seguro da BIRX.
3. Não enviar o backup por mensagens nem anexá-lo a tarefas públicas.
4. Registrar a data do backup no checklist de lançamento.

## Entrega 3 — Notificações de medicamentos

- O Worker `birx-medication-reminders` está publicado na Cloudflare.
- O agendamento executa a verificação dos medicamentos a cada minuto.
- As chaves VAPID ficam somente nos segredos da Cloudflare e não no código.
- O site e o Worker usam o mesmo par de chaves para cadastrar o aparelho e enviar os avisos.
- As tabelas `push_assinaturas` e `push_medicamentos_enviados` foram confirmadas no banco de produção.
- O identificador técnico do banco continua `orbitek-pets` para preservar os dados existentes.

### Teste pelo tutor

1. Instalar ou abrir o BIRX Pets em um celular compatível.
2. Entrar na conta e abrir a aba **Medicamentos**.
3. Tocar em **Ativar avisos no celular** e permitir as notificações.
4. Cadastrar um medicamento com um horário alguns minutos à frente.
5. Manter o aparelho conectado e aguardar o aviso.
