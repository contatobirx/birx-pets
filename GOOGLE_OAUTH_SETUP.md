# Login com Google — Sprint 2.6

O código do login social já está integrado. Para ativá-lo no ambiente publicado:

1. No Google Cloud Console, configure a tela de consentimento OAuth para a Orbitek Pets.
2. Crie um cliente OAuth do tipo **Aplicativo da Web**.
3. Cadastre estas URLs de redirecionamento autorizadas:
   - `https://orbitekoficial.com.br/api/auth-google-callback`
   - `https://www.orbitekoficial.com.br/api/auth-google-callback`
4. Adicione ao Cloudflare Pages os segredos `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
5. Faça uma nova implantação do site e teste com um e-mail já associado a uma Tag Orbitek.

O fluxo solicita apenas `openid`, `email` e `profile`. A Orbitek usa o e-mail verificado pelo Google para localizar uma conta existente; o login social não cria cadastros paralelos.

Para desenvolvimento local, informe as mesmas variáveis em `.dev.vars`. Nunca envie os valores reais para o Git.
