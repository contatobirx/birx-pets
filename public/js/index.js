const estiloCabecalhoHome = document.createElement('style');
estiloCabecalhoHome.textContent = `
.site-header,.site-header.is-scrolled{background:rgba(3,8,15,.96)!important;border-bottom:1px solid rgba(255,255,255,.10)!important;box-shadow:0 10px 30px rgba(0,0,0,.18)!important;backdrop-filter:blur(18px)}
.site-header .main-nav a{color:#f5f7fb!important}.site-header .main-nav a:after{background:#59c8ff!important}.site-header .login-button{border-color:rgba(255,255,255,.75)!important;color:#fff!important;background:transparent!important}.site-header .login-button:hover{background:#fff!important;color:#07111f!important}.site-header .main-nav a[href="/perdidos"]{border-left-color:rgba(255,255,255,.18)!important}.site-header .menu-toggle span{background:#fff!important}
@media(max-width:980px){.site-header .main-nav{background:#07111f!important;border-color:rgba(255,255,255,.12)!important}.site-header .main-nav a{color:#fff!important}.site-header .main-nav a:hover{background:rgba(255,255,255,.08)!important}.site-header .main-nav a[href="/perdidos"]{border-top-color:rgba(255,255,255,.12)!important}}
`;
document.head.appendChild(estiloCabecalhoHome);

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
  menu?.classList.toggle('is-open', !open);
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
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
    menu?.classList.remove('is-open');
  }
});

function carregar3DHome() {
  if (!document.querySelector('[data-birx-3d]')) return;
  if (document.querySelector('script[data-home-tag-3d]')) return;

  const script = document.createElement('script');
  script.type = 'module';
  script.src = '/js/home-tag-3d.js?v=1.5';
  script.dataset.homeTag3d = '1';
  document.body.appendChild(script);
}

carregar3DHome();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const seletor = link.getAttribute('href');
    if (!seletor || seletor === '#') return;
    const destino = document.querySelector(seletor);
    if (!destino) return;

    event.preventDefault();
    destino.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });

    if (destino.id) history.replaceState(null, '', `#${destino.id}`);
  });
});
