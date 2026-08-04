# Sprint 4.8 — Modo Gato

## Entrega

O painel do tutor agora reconhece a espécie do pet ativo e exibe uma experiência própria quando ele é um gato. A experiência dos cães permanece inalterada.

## Recursos

- perfil felino com acesso à rua, moradia, convivência e quantidade de gatos;
- registro de telas de proteção, castração, microchip, caixas de areia e pontos de água;
- recomendações personalizadas e explicáveis conforme o ambiente informado;
- lembretes rápidos para caixas de areia, água e enriquecimento;
- orientações seguras para busca de gatos desaparecidos;
- acesso direto ao mapa de avistamentos e ao modo perdido;
- atalhos para parceiros com atendimento felino e para a linha física BIRX Cat.

## Privacidade e segurança

O perfil felino só pode ser consultado e alterado pelo tutor autenticado que possui a tag. As orientações são preventivas e deixam claro que não substituem avaliação veterinária.

## Banco de dados

A migração `database/035_modo_gato.sql` cria `pet_modo_gato`, vinculada à tag do pet e isolada por tutor na API.
