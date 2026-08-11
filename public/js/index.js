const siteHeader = document.querySelector('.site-header');

function atualizarCabecalhoAoRolar() {
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 12);
}

atualizarCabecalhoAoRolar();
window.addEventListener('scroll', atualizarCabecalhoAoRolar, { passive: true });

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  menu.classList.toggle('is-open', !open);
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menu?.classList.remove('is-open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !menu?.classList.contains('is-open')) return;
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menu');
  menu?.classList.remove('is-open');
  menuButton?.focus();
});

document.addEventListener('click', (event) => {
  if (!menu?.classList.contains('is-open')) return;
  if (menu.contains(event.target) || menuButton?.contains(event.target)) return;
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menu');
  menu?.classList.remove('is-open');
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900 && menu?.classList.contains('is-open')) {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
    menu.classList.remove('is-open');
  }
});

function carregar3DHome() {
  if (document.querySelector('script[data-home-tag-3d]')) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = '/js/home-tag-3d.js?v=1.0';
  script.dataset.homeTag3d = '1';
  document.body.appendChild(script);
}

function aplicarHomePremium() {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.classList.add('hero-premium');
    hero.innerHTML = `
      <div class="container hero-grid">
        <div class="hero-copy reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> IDENTIFICAÇÃO INTELIGENTE PARA PETS</span>
          <h1>Mais que uma tag.<br><em>Uma conexão com você.</em></h1>
          <p>A BIRX ID une identificação física, QR Code, NFC e um perfil digital que você pode atualizar quando quiser. Sem mensalidade. Feita para estar com seu pet todos os dias.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="/loja">Comprar BIRX ID <span aria-hidden="true">→</span></a>
            <a class="button button-ghost" href="/personalizar">Personalizar em 3D</a>
            <a class="button button-demo" href="/t.html?tag=DEMO"><span aria-hidden="true">⌁</span> Ver perfil demonstrativo</a>
          </div>
          <div class="proof-inline" aria-label="Diferenciais BIRX">
            <div><strong>SEM MENSALIDADE</strong><span>Um produto. Sem cobrança recorrente.</span></div>
            <div><strong>NFC + QR CODE</strong><span>Duas formas rápidas de identificação.</span></div>
            <div><strong>PERFIL EDITÁVEL</strong><span>Atualize os dados pelo celular.</span></div>
          </div>
          <div class="hero-trust"><p><strong>Tecnologia criada para aproximar pets e tutores.</strong><br>Produto BIRX desenvolvido e produzido no Brasil.</p></div>
        </div>
        <div class="hero-visual reveal" aria-label="BIRX ID real e plataforma digital BIRX Pets">
          <div class="premium-ring"></div><div class="premium-orb"></div><div class="premium-real-tag" data-birx-3d data-body="#151515" data-detail="#f5f5f2" data-spin="1" aria-label="Modelo 3D real da BIRX ID"></div>
          <div class="premium-phone" aria-label="Perfil digital do pet"><div class="premium-phone-screen"><div class="premium-phone-notch"></div><div class="premium-phone-brand">BIRX PETS</div><div class="premium-phone-pet">🐾</div><h3>Thor</h3><p>Meu perfil de identificação</p><div class="premium-status"><i></i> Perfil ativo e protegido</div><div class="premium-contact">Falar com meu tutor</div><div class="premium-data"><span><b>NFC</b>ativo</span><span><b>QR</b>pronto</span></div></div></div>
          <div class="premium-secure"><span>●</span> MODELO REAL BIRX ID</div><div class="premium-chip"><span class="premium-chip-icon">⌁</span><div><strong>Leitura instantânea</strong><small>Aproxime ou escaneie</small></div></div>
        </div>
      </div>`;
  }

  const proof = document.querySelector('.proof-bar');
  if (proof) {
    proof.classList.add('proof-premium');
    proof.innerHTML = `<div class="container proof-grid"><div><span class="proof-icon">∞</span><strong>Sem mensalidade</strong><span>Perfil digital sem cobrança recorrente</span></div><div><span class="proof-icon">⌁</span><strong>NFC + QR Code</strong><span>Identificação por aproximação ou câmera</span></div><div><span class="proof-icon">✦</span><strong>Dados atualizáveis</strong><span>Telefone e informações sempre editáveis</span></div><div><span class="proof-icon">BR</span><strong>Feita no Brasil</strong><span>Desenvolvimento e produção BIRX</span></div></div>`;
  }

  const products = document.querySelector('.birx-products');
  if (products) {
    const heading = products.querySelector('.heading-row');
    if (heading) heading.innerHTML = `<div><span class="kicker">BIRX ID</span><h2 id="produtos-title">A identificação inteligente da BIRX.</h2></div><p>O mesmo produto que você vê aqui é o modelo usado na fabricação. Escolha a versão clássica ou personalize as cores e o nome do pet.</p>`;
    const grid = products.querySelector('.birx-id-grid');
    if (grid) grid.innerHTML = `<article class="birx-id-card birx-id-real reveal is-visible"><div class="birx-id-media birx-real-media"><span class="birx-id-badge birx-id-badge-dark">QR CODE + NFC</span><div class="product-real-3d" data-birx-3d data-body="#151515" data-detail="#f5f5f2"></div></div><div class="birx-id-content"><div class="birx-id-title-row"><div><span>BIRX ID</span><h3>Tag</h3></div><strong>3 × 3 cm • NFC integrado</strong></div><p>A BIRX ID real em formato medalha, com QR Code, NFC e acesso ao perfil digital do pet.</p><ul class="birx-id-features"><li><span>✓</span> QR Code conectado ao perfil digital</li><li><span>✓</span> NFC integrado no interior da tag</li><li><span>✓</span> Perfil atualizável pelo tutor</li><li><span>✓</span> Sem mensalidade</li></ul><a class="button button-product button-product-dark" href="/loja">Comprar BIRX ID <span aria-hidden="true">→</span></a></div></article><article class="birx-id-card birx-id-real reveal is-visible"><div class="birx-id-media birx-real-media birx-real-media-custom"><span class="birx-id-badge">PERSONALIZADA</span><div class="product-real-3d" data-birx-3d data-body="#245eea" data-detail="#f5f5f2" data-name="THOR"></div></div><div class="birx-id-content"><div class="birx-id-title-row"><div><span>BIRX ID</span><h3>Personalizada</h3></div><strong>Cor + nome do pet</strong></div><p>Monte sua combinação, visualize a peça real em 3D e veja como ela ficará antes de pedir.</p><ul class="birx-id-features"><li><span>✓</span> Escolha a cor da peça</li><li><span>✓</span> Escolha a cor do logo e letras</li><li><span>✓</span> Nome do pet em relevo</li><li><span>✓</span> Preview 3D do modelo real</li></ul><a class="button button-product" href="/personalizar">Personalizar minha BIRX ID <span aria-hidden="true">→</span></a></div></article>`;
  }

  const personalization = document.querySelector('.personalization');
  if (personalization) {
    personalization.classList.add('personalization-real');
    personalization.innerHTML = `<div class="container personalization-grid"><div class="personalization-copy reveal is-visible"><span class="kicker">FEITA PARA O SEU PET</span><h2 id="personalizacao-title">A BIRX ID com a identidade dele.</h2><p>Escolha a cor da peça, a cor do logo e das letras e coloque o nome do seu pet. O formato e a tecnologia continuam sendo os mesmos da BIRX ID real.</p><div class="personalization-options"><span>Nome do pet</span><span>Cor da peça</span><span>Cor do logo</span><span>QR + NFC</span><span>3 × 3 cm</span></div><a class="button button-primary" href="/personalizar">Personalizar em 3D <span aria-hidden="true">→</span></a></div><div class="personalization-real-grid reveal is-visible" aria-label="Exemplos reais de BIRX ID personalizada"><article class="mini-real-tag"><div data-birx-3d data-body="#151515" data-detail="#f5f5f2" data-name="THOR"></div><span>THOR</span><small>Preto + Branco</small></article><article class="mini-real-tag mini-up"><div data-birx-3d data-body="#e978a7" data-detail="#151515" data-name="LUNA"></div><span>LUNA</span><small>Rosa + Preto</small></article><article class="mini-real-tag"><div data-birx-3d data-body="#245eea" data-detail="#f5f5f2" data-name="BENTO"></div><span>BENTO</span><small>Azul + Branco</small></article></div></div>`;
  }

  const showcase = document.querySelector('.pet-showcase');
  if (showcase) {
    showcase.classList.add('pet-showcase-premium');
    showcase.innerHTML = `<div class="container"><div class="section-heading reveal is-visible"><span class="kicker">UMA BIRX PARA CADA ROTINA</span><h2>Proteção pensada para todos os pets.</h2><p>A mesma tecnologia BIRX acompanha cães e gatos, com identificação rápida e perfil digital sempre atualizável.</p></div><div class="pet-showcase-grid"><article class="pet-profile-card reveal is-visible" style="--card-glow:#e9f1ff"><div class="pet-profile-icon">🐕</div><small>CÃES</small><h3>Para acompanhar todos os dias</h3><p>Identificação resistente para a rotina, passeios e imprevistos.</p><div class="pet-profile-meta"><span>QR Code</span><span>NFC</span><span>Perfil digital</span></div></article><article class="pet-profile-card reveal is-visible" style="--card-glow:#fff1e7"><div class="pet-profile-icon">🐈</div><small>GATOS</small><h3>Leve e conectada</h3><p>Identificação digital para manter os dados do tutor sempre acessíveis.</p><div class="pet-profile-meta"><span>Atualizável</span><span>Sem mensalidade</span><span>Contato rápido</span></div></article><article class="pet-profile-card reveal is-visible" style="--card-glow:#eef8f4"><div class="pet-profile-icon">✦</div><small>PERSONALIZADA</small><h3>Do seu jeito</h3><p>Escolha cores e nome e veja a BIRX ID real em 3D antes de pedir.</p><div class="pet-profile-meta"><span>3D</span><span>Cores</span><span>Nome do pet</span></div></article></div></div>`;
  }

  carregar3DHome();
}

aplicarHomePremium();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const destino = document.querySelector(link.getAttribute('href'));
    if (!destino) return;
    event.preventDefault();
    destino.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    if (destino.id) history.replaceState(null, '', `#${destino.id}`);
  });
});