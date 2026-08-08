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

function aplicarHomePremium() {
  if (!document.querySelector('link[href*="home-premium.css"]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/css/home-premium.css?v=1.0';
    document.head.appendChild(css);
  }

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

        <div class="hero-visual reveal" aria-label="BIRX ID e plataforma digital BIRX Pets">
          <div class="premium-ring"></div>
          <div class="premium-orb"></div>
          <div class="premium-tag" aria-label="Representação da BIRX ID">
            <span class="premium-nfc">⌁</span>
            <div class="premium-tag-face"><div class="premium-mark">BIRX</div><strong>BIRX ID</strong><small>NFC</small></div>
          </div>
          <div class="premium-phone" aria-label="Perfil digital do pet">
            <div class="premium-phone-screen">
              <div class="premium-phone-notch"></div>
              <div class="premium-phone-brand">BIRX PETS</div>
              <div class="premium-phone-pet">🐾</div>
              <h3>Thor</h3>
              <p>Meu perfil de identificação</p>
              <div class="premium-status"><i></i> Perfil ativo e protegido</div>
              <div class="premium-contact">Falar com meu tutor</div>
              <div class="premium-data"><span><b>NFC</b>ativo</span><span><b>QR</b>pronto</span></div>
            </div>
          </div>
          <div class="premium-secure"><span>●</span> PERFIL DIGITAL SEGURO</div>
          <div class="premium-chip"><span class="premium-chip-icon">⌁</span><div><strong>Leitura instantânea</strong><small>Aproxime ou escaneie</small></div></div>
        </div>
      </div>`;
  }

  const proof = document.querySelector('.proof-bar');
  if (proof) {
    proof.classList.add('proof-premium');
    proof.innerHTML = `<div class="container proof-grid">
      <div><span class="proof-icon">∞</span><strong>Sem mensalidade</strong><span>Perfil digital sem cobrança recorrente</span></div>
      <div><span class="proof-icon">⌁</span><strong>NFC + QR Code</strong><span>Identificação por aproximação ou câmera</span></div>
      <div><span class="proof-icon">✦</span><strong>Dados atualizáveis</strong><span>Telefone e informações sempre editáveis</span></div>
      <div><span class="proof-icon">BR</span><strong>Feita no Brasil</strong><span>Desenvolvimento e produção BIRX</span></div>
    </div>`;
  }

  const showcase = document.querySelector('.pet-showcase');
  if (showcase) {
    showcase.classList.add('pet-showcase-premium');
    showcase.innerHTML = `<div class="container">
      <div class="section-heading reveal is-visible">
        <span class="kicker">UMA BIRX PARA CADA ROTINA</span>
        <h2>Proteção pensada para todos os pets.</h2>
        <p>Sem fotos genéricas ou soluções improvisadas. A BIRX desenvolve formatos para diferentes portes e rotinas, conectados à mesma plataforma digital.</p>
      </div>
      <div class="pet-showcase-grid">
        <article class="pet-profile-card reveal is-visible" style="--card-glow:#e9f1ff"><div class="pet-profile-icon">🐕</div><small>CÃES</small><h3>Para acompanhar todos os dias</h3><p>Identificação resistente para a rotina, passeios e imprevistos.</p><div class="pet-profile-meta"><span>QR Code</span><span>NFC</span><span>Perfil digital</span></div></article>
        <article class="pet-profile-card reveal is-visible" style="--card-glow:#fff1e7"><div class="pet-profile-icon">🐈</div><small>GATOS</small><h3>Leve e discreta</h3><p>Opções compactas pensadas para conforto e identificação sem excesso de peso.</p><div class="pet-profile-meta"><span>Compacta</span><span>Atualizável</span><span>Sem mensalidade</span></div></article>
        <article class="pet-profile-card reveal is-visible" style="--card-glow:#eef8f4"><div class="pet-profile-icon">✦</div><small>PERSONALIZADA</small><h3>Do seu jeito</h3><p>Escolha a combinação de cores e o nome do pet e veja a BIRX ID em 3D antes de pedir.</p><div class="pet-profile-meta"><span>3D</span><span>Cores</span><span>Nome do pet</span></div></article>
      </div>
    </div>`;
  }
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

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '+';
    const start = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.5 });

counters.forEach((counter) => counterObserver.observe(counter));

// Sprint 2.2 — rolagem acessível para links internos da landing page.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const destino = document.querySelector(link.getAttribute('href'));
    if (!destino) return;

    event.preventDefault();
    destino.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });

    if (destino.id) {
      history.replaceState(null, '', `#${destino.id}`);
    }
  });
});
