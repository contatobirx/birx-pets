# Design: unificação visual das páginas públicas BIRX Pets

Data: 2026-09-16

## Objetivo

Fazer as páginas públicas **Pets Perdidos**, **Adoção** e **Parceiros** parecerem partes do mesmo produto BIRX Pets, usando uma estrutura visual e de navegação compartilhada com a home, sem alterar a lógica funcional específica de cada página.

## Escopo

Páginas inicialmente incluídas:
- `/perdidos`
- `/adocao`
- `/parceiros`

O trabalho inclui:
- cabeçalho premium unificado;
- navegação principal coerente;
- estado ativo da página atual;
- menu mobile compartilhado;
- rodapé unificado;
- tokens visuais comuns de cor, tipografia, espaçamento e bordas;
- estrutura reutilizável para futuras páginas públicas, incluindo Clube Birx.

Fora do escopo desta etapa:
- reescrever filtros, buscas, mapas ou APIs;
- alterar regras de adoção, parceiros ou pets perdidos;
- redesenhar os cards internos de cada página;
- criar a página do Clube Birx;
- mudar autenticação ou área logada.

## Direção visual

A referência principal é a home atual da BIRX Pets:
- cabeçalho escuro/preto com aparência premium;
- azul BIRX como cor de destaque;
- tipografia Manrope + DM Sans;
- botões arredondados e linguagem visual limpa;
- sensação de produto único, tecnológico e confiável.

As páginas internas continuam podendo ter heróis e conteúdos próprios, mas passam a usar a mesma moldura visual.

## Cabeçalho compartilhado

O cabeçalho público terá:
- logo BIRX Pets à esquerda;
- navegação central;
- botão `Entrar` à direita;
- menu hambúrguer no mobile;
- destaque visual do item correspondente à página atual.

Navegação proposta:
- Início
- BIRX ID
- Como funciona
- Funcionalidades
- Comunidade
- Clube Birx
- Loja
- Entrar

### Comportamento dos links

Como várias páginas são rotas separadas, links para seções da home usarão URL completa com hash:
- `/#produtos`
- `/#como-funciona`
- `/#funcionalidades`

`Comunidade` funcionará como agrupamento visual contendo:
- Pets perdidos
- Adoção
- Parceiros

No desktop pode aparecer como grupo ou dropdown simples; no mobile, como bloco empilhado no menu. A implementação deve evitar dependência de JavaScript complexo para o básico da navegação.

## Rodapé compartilhado

O rodapé terá quatro grupos principais:

### Marca
- logo BIRX Pets;
- frase curta institucional;
- slogan `Inovação que conecta.`

### BIRX ID
- Comprar
- Personalizar
- Como funciona
- Perfil demonstrativo

### Comunidade
- Pets perdidos
- Adoção
- Parceiros
- Clube Birx

### Ajuda e contato
- WhatsApp
- e-mail
- Entrar
- links institucionais já existentes, quando aplicável

O rodapé será escuro para reforçar continuidade com o cabeçalho.

## Arquitetura de implementação

A solução deve reaproveitar os arquivos existentes `site-nav.css` e `site-nav.js`, em vez de duplicar cabeçalhos e estilos em cada página.

### CSS

`public/css/site-nav.css` passa a ser a fonte principal da identidade compartilhada de cabeçalho e rodapé públicos.

Ele deverá conter:
- variáveis de cor e espaçamento da casca pública;
- estilos do cabeçalho desktop/mobile;
- estilos da navegação e estado ativo;
- estilos do grupo Comunidade;
- estilos do rodapé compartilhado;
- regras responsivas.

### JavaScript

`public/js/site-nav.js` deve continuar responsável apenas por comportamentos comuns de navegação, como:
- abrir/fechar menu mobile;
- fechar menu ao navegar;
- comportamento opcional do agrupamento Comunidade, se necessário.

Não deve absorver lógica de Adoção, Parceiros ou Perdidos.

### HTML das páginas

`perdidos.html`, `adocao.html` e `parceiros.html` passam a usar a mesma marcação base de header/footer.

Cada página mantém:
- seu `<main>` atual;
- IDs usados pelos scripts;
- formulários;
- listas;
- mapas;
- modais;
- arquivos JS específicos.

## Compatibilidade e risco

O maior risco é quebrar CSS específico por causa de seletores genéricos como `header`, `nav`, `footer` ou `a` presentes nos estilos antigos.

Mitigação:
- usar classes prefixadas `.birx-public-*`;
- evitar novos seletores globais;
- revisar folhas específicas de Perdidos, Adoção e Parceiros;
- preservar IDs e classes funcionais usados pelo JavaScript.

Também deve ser evitada qualquer alteração visual que afete mapas, filtros ou modais nesta etapa.

## Responsividade

Em telas menores:
- logo reduzida sem perda de proporção;
- botão de menu visível;
- navegação empilhada;
- botão Entrar continua acessível;
- links de Comunidade aparecem como subgrupo claro;
- rodapé muda para uma coluna ou duas colunas conforme espaço.

## Acessibilidade

Manter:
- `aria-label` no menu;
- `aria-expanded` no botão mobile;
- `aria-current="page"` no item ativo;
- foco visível;
- contraste adequado em fundo escuro;
- links e botões com área de toque confortável.

## Critérios de aceitação

A implementação será considerada correta quando:
1. Perdidos, Adoção e Parceiros exibirem o mesmo cabeçalho e rodapé.
2. O visual combinar com a home atual.
3. O item atual de navegação estiver destacado corretamente.
4. O menu mobile abrir e fechar nas três páginas.
5. Os fluxos existentes de filtros, mapa, busca, cards e modais continuarem funcionando.
6. Não houver regressão visual evidente em desktop e mobile.
7. A estrutura compartilhada estiver pronta para reutilização em futuras páginas, especialmente Clube Birx.

## Estratégia de validação

Antes do merge:
- verificar sintaxe dos JS alterados;
- comparar diff das três páginas e dos arquivos compartilhados;
- confirmar presença dos mesmos componentes de header/footer nas três páginas;
- verificar que IDs funcionais existentes não foram removidos;
- validar navegação desktop/mobile manualmente ou por teste DOM simples, quando disponível;
- confirmar que páginas continuam carregando seus scripts específicos.

## Resultado esperado

Ao navegar entre Home, Pets Perdidos, Adoção e Parceiros, o usuário deve sentir que continua dentro do mesmo produto BIRX Pets. A mudança deve aumentar consistência e percepção de marca sem alterar o funcionamento das áreas públicas atuais.