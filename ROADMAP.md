# Roadmap BIRX Pets

Este documento consolida as ideias da conversa **Modelos de NFC Retangular** e o estado atual do produto. Ele deve orientar as próximas atualizações sem repetir recursos já entregues.

## Visão do produto

A BIRX Pets é uma plataforma de identificação, proteção e cuidados para pets. A BIRX ID conecta NFC e QR Code a um perfil digital, enquanto o aplicativo organiza saúde, rotina, localização e relacionamento com parceiros.

## Base já entregue

- Cadastro de tutor e de múltiplos pets.
- Ativação e transferência de tags.
- Perfil público por NFC e QR Code.
- Modo perdido, localização, mapa e diretório de animais perdidos.
- Galeria com até cinco fotos.
- Login por Google e código enviado por e-mail.
- Vacinas, medicamentos, antipulgas, vermífugos e peso.
- Consultas, agenda, calendário, rotinas e timeline.
- Documentos, despesas, diário de bem-estar e resumo veterinário.
- Contatos de confiança, central de emergência e carteirinha digital.
- Clínicas próximas e busca de locais para comprar medicamentos.
- PWA instalável, acessibilidade e notificações.
- Painel administrativo para preparar, gravar e testar tags.
- Landing page, produtos, catálogo e apresentação do aplicativo.
- Migração pública da marca e do domínio para BIRX Pets.

## Próximas sprints

### Sprint 4.0 — Estabilização da BIRX

Objetivo: encerrar a migração e deixar a operação segura para o lançamento.

- Redirecionar os domínios antigos para `pets.birx.com.br`, preservando caminhos de tags.
- Revisar todos os textos, e-mails, metadados e telas em busca de referências públicas à marca antiga.
- Validar notificações push e o Worker de lembretes.
- Criar rotina de backup do banco D1.
- Registrar erros e eventos críticos de produção.
- Checklist completo de NFC, QR Code, login, fotos e ativação.

Critério de conclusão: nenhuma função essencial depende do projeto antigo e os links já gravados continuam funcionando.

### Sprint 4.1 — BIRX ID pronta para venda

Objetivo: transformar a tag em um produto físico pronto para orçamento e produção.

- Definir o nome comercial final da família BIRX ID.
- Definir modelos Essential, NFC e NFC com identificação.
- Criar versão leve, pequena e silenciosa para gatos.
- Definir dimensões, materiais, argola, acabamento e cores.
- Criar embalagem frente e verso com euro hole.
- Criar berço interno e guia rápido de ativação.
- Preparar arquivos com corte, dobra, sangria e especificações para gráfica.
- Criar folha A4 e material de balcão para parceiros.

Critério de conclusão: pacote fechado para cotação em gráfica e produção de um lote piloto.

### Sprint 4.2 — Painel do Parceiro

Objetivo: permitir que pet shops e clínicas vendam e ativem BIRX IDs.

- Cadastro e aprovação de parceiros.
- Perfis de acesso para atendentes.
- Estoque de tags por parceiro e lote.
- Ativação assistida na loja.
- Histórico de vendas e ativações.
- Dashboard com indicadores.
- Materiais de treinamento e suporte.
- Programa de benefícios por indicação.

Critério de conclusão: um parceiro piloto consegue receber, vender e ativar uma tag sem acesso administrativo da BIRX.

### Sprint 4.3 — Alimentação Inteligente

Objetivo: organizar a alimentação e criar utilidade recorrente no aplicativo.

- Cadastro de marca, linha e tipo de ração.
- Quantidade diária e horários.
- Histórico de troca de alimentação.
- Estimativa de duração do pacote.
- Lembrete de reposição.
- Alertas configuráveis sem diagnóstico veterinário.
- Integração com rotina e despesas.

Critério de conclusão: o tutor acompanha consumo e recebe aviso antes de a ração acabar.

### Sprint 4.4 — Encontrei um Pet

Objetivo: permitir que qualquer pessoa publique um animal encontrado, mesmo sem tag BIRX.

- Formulário público com foto, espécie, data, local e observações.
- Opção **Estou com ele em segurança**.
- Proteção contra spam e conteúdo inadequado.
- Página pública do animal encontrado.
- Contato seguro com quem publicou.
- Expiração, encerramento e histórico do caso.
- Notificação para usuários próximos com consentimento.

Critério de conclusão: uma pessoa sem conta consegue publicar com segurança e o caso aparece para a comunidade local.

### Sprint 4.5 — Mapa de Avistamentos

Objetivo: melhorar as buscas, principalmente para gatos desaparecidos.

- Botão **Avistado** em cada caso perdido.
- Registro de foto, localização e horário.
- Mapa cronológico de avistamentos.
- Possível rota do pet sem prometer localização exata.
- Validação e moderação dos relatos.
- Alertas ao tutor responsável.

Critério de conclusão: o tutor visualiza uma sequência confiável de avistamentos por pet.

### Sprint 4.6 — Encontre um Novo Amigo

Objetivo: criar a área de adoção responsável da BIRX.

- Cadastro de ONGs e protetores verificados.
- Perfil com fotos, vídeo, história e informações de saúde.
- Filtros por espécie, porte, idade, localização e convivência.
- Botão de contato com a organização responsável.
- Status disponível, em processo e adotado.
- Lar temporário e apadrinhamento.
- BIRX ID de boas-vindas para adoções parceiras.

Critério de conclusão: uma organização publica, gerencia e conclui uma adoção pela plataforma.

### Sprint 4.7 — Rede de Parceiros

Objetivo: conectar tutores a serviços confiáveis próximos.

- Pet shops, clínicas, banho e tosa, creches, hotéis e adestradores.
- Busca por endereço ou CEP.
- Mapa, distância, horário, serviços e WhatsApp.
- Especialidades e atendimento de emergência.
- Promoções e produtos dos parceiros.
- Perfis verificados e denúncia de informação incorreta.

Critério de conclusão: o tutor encontra e contata um parceiro adequado sem sair do aplicativo.

### Sprint 4.8 — Modo Gato

Objetivo: adaptar a experiência às necessidades específicas de gatos.

- Perfil com acesso à rua, convivência e ambiente doméstico.
- Recomendações e lembretes específicos.
- Orientações seguras para busca de gatos desaparecidos.
- Integração com o mapa de avistamentos.
- Linha física BIRX Cat leve e silenciosa.
- Conteúdo e parceiros especializados.

Critério de conclusão: o tutor de gato recebe uma experiência claramente diferente e relevante.

### Sprint 4.9 — Índice de Bem-estar

Objetivo: transformar dados já registrados em uma visão simples para o tutor.

- Resumo de vacinas, medicamentos, peso, alimentação e rotina.
- Indicadores transparentes e explicáveis.
- Alertas de dados incompletos ou cuidados atrasados.
- Tendências sem diagnóstico médico.
- Recomendações revisadas e vinculadas a fontes confiáveis.

Critério de conclusão: todo indicador informa quais dados foram usados e nunca substitui orientação veterinária.

### Sprint 4.10 — Loja BIRX

Objetivo: vender tags e produtos próprios dentro do ecossistema.

- Catálogo comercial e estoque.
- Carrinho, endereço e pagamento.
- Pedido, acompanhamento e suporte.
- BIRX ID, BIRX Cat e kits.
- Produtos impressos em 3D: pá dosadora, porta-ração, porta-remédios e organizadores.
- Cupons e atribuição de parceiros.

Critério de conclusão: compra completa em produção, com pedido rastreável e confirmação de pagamento.

## Sprints de longo prazo

### Sprint 5.0 — Parceiros Premium

- Painel avançado para pet shops.
- Painel clínico com autorização do tutor.
- Painel de ONGs e adoções.
- Campanhas locais e relatórios.

### Sprint 5.1 — Guardião BIRX

- Reconhecimento por contribuições úteis.
- Selos, níveis e histórico de ajuda.
- Regras contra fraude e competição inadequada.
- Rede de voluntários e lares temporários.

### Sprint 5.2 — Recomendações personalizadas

- Recomendações por espécie, idade, peso e rotina.
- Produtos e parceiros relevantes.
- Controle de preferências e explicação de cada recomendação.
- Revisão de privacidade e consentimento.

### Sprint 5.3 — Aplicativos nativos

- Android e iPhone.
- Notificações nativas.
- Melhorias de câmera, localização e NFC.
- Publicação nas lojas após estabilização do PWA.

### Sprint 5.4 — Plataforma e inteligência

- Analytics com privacidade.
- Dashboard administrativo geral.
- API pública com autenticação e limites.
- Assistente BIRX com escopo seguro.
- Marketplace de parceiros.

## Roadmap comercial paralelo

### Sprint C1 — Produto piloto

- Fechar identidade da BIRX ID.
- Produzir embalagem e lote piloto.
- Validar custo total por unidade.
- Meta inicial: custo compatível com venda ao parceiro por R$ 15,00 e preço sugerido de R$ 29,90, sujeito à validação real de custos e impostos.

### Sprint C2 — Primeiros parceiros

- Selecionar cinco pet shops ou clínicas.
- Entregar amostras e treinamento.
- Medir ativação, dúvidas e conversão.

### Sprint C3 — Material de vendas

- Folder A4, expositor e catálogo.
- Manual rápido do atendente.
- Vídeos curtos de demonstração.
- Argumentos centrados em proteção, não apenas em NFC ou QR Code.

### Sprint C4 — Operação piloto

- Acompanhar estoque, vendas e ativações.
- Recolher feedback de tutores e parceiros.
- Ajustar produto, embalagem e fluxo.

### Sprint C5 — Lançamento oficial

- Definir preço final e política comercial.
- Campanha de lançamento.
- Suporte e reposição de estoque.
- Indicadores semanais de vendas e uso.

## Princípios para decidir novas sprints

1. Proteção e retorno seguro do pet vêm primeiro.
2. Privacidade, consentimento e segurança são requisitos, não extras.
3. A experiência deve funcionar para idosos e pessoas com pouca familiaridade tecnológica.
4. Cada recurso deve funcionar bem no celular antes de ganhar complexidade.
5. Recursos de saúde orientam e organizam; não diagnosticam.
6. Tags e links antigos nunca devem deixar de funcionar durante mudanças de marca.
7. Ideias futuras entram neste documento antes de entrarem no desenvolvimento.
