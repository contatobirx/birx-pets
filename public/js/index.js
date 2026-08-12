const estiloCabecalhoHome = document.createElement('style');
estiloCabecalhoHome.textContent = `
.site-header,.site-header.is-scrolled{background:rgba(3,8,15,.96)!important;border-bottom:1px solid rgba(255,255,255,.10)!important;box-shadow:0 10px 30px rgba(0,0,0,.18)!important;backdrop-filter:blur(18px)}
.site-header .main-nav a{color:#f5f7fb!important}.site-header .main-nav a:after{background:#59c8ff!important}.site-header .login-button{border-color:rgba(255,255,255,.75)!important;color:#fff!important;background:transparent!important}.site-header .login-button:hover{background:#fff!important;color:#07111f!important}.site-header .main-nav a[href="/perdidos"]{border-left-color:rgba(255,255,255,.18)!important}.site-header .menu-toggle span{background:#fff!important}
@media(max-width:980px){.site-header .main-nav{background:#07111f!important;border-color:rgba(255,255,255,.12)!important}.site-header .main-nav a{color:#fff!important}.site-header .main-nav a:hover{background:rgba(255,255,255,.08)!important}.site-header .main-nav a[href="/perdidos"]{border-top-color:rgba(255,255,255,.12)!important}}
`;
document.head.appendChild(estiloCabecalhoHome);

function criarJornadaEncontro() {
  const hero = document.querySelector('.hero-premium');
  if (!hero || document.querySelector('.home-find-journey')) return;
  const estilo = document.createElement('style');
  estilo.textContent = `
.home-find-journey{padding:84px 0;background:linear-gradient(180deg,#07111f 0%,#0b1930 100%);color:#fff;position:relative;overflow:hidden;border-top:1px solid rgba(255,255,255,.06)}
.home-find-journey:before{content:"";position:absolute;width:520px;height:520px;border-radius:50%;right:-230px;top:-260px;background:radial-gradient(circle,rgba(89,200,255,.15),transparent 68%);pointer-events:none}
.home-find-heading{text-align:center;max-width:760px;margin:0 auto 44px}.home-find-heading .kicker{color:#72d6ff}.home-find-heading h2{font:800 clamp(2.1rem,4vw,3.65rem)/1.08 Manrope,sans-serif;letter-spacing:-.045em;margin:12px 0 16px}.home-find-heading p{color:#a9b7cb;font-size:1.05rem;line-height:1.7;margin:0 auto;max-width:650px}
.home-find-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;align-items:stretch;position:relative}.home-find-step{position:relative;min-height:220px;padding:26px 20px 22px;border-radius:24px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);text-align:center;display:flex;flex-direction:column;align-items:center;box-shadow:0 20px 50px rgba(0,0,0,.13)}.home-find-step:not(:last-child):after{content:"→";position:absolute;right:-22px;top:50%;transform:translateY(-50%);z-index:2;width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:#2f6fff;color:#fff;font-weight:900;box-shadow:0 0 0 5px #09162a}.home-find-icon{width:68px;height:68px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(47,111,255,.3),rgba(89,200,255,.15));border:1px solid rgba(116,190,255,.2);font-size:2rem;margin-bottom:18px}.home-find-step small{color:#6ecfff;font-weight:900;letter-spacing:.1em;font-size:.65rem}.home-find-step strong{font:800 1rem Manrope,sans-serif;margin:7px 0 8px}.home-find-step p{color:#8fa0b7;font-size:.78rem;line-height:1.55;margin:0}.home-find-step:last-child{background:linear-gradient(145deg,rgba(47,111,255,.22),rgba(89,200,255,.08));border-color:rgba(89,200,255,.25)}
.home-find-result{margin:34px auto 0;display:flex;align-items:center;justify-content:center;gap:22px;flex-wrap:wrap}.home-find-promise{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.home-find-promise span{padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);font-size:.76rem;font-weight:800;color:#dce9fb}.home-find-result .button{min-width:210px;text-align:center;background:#fff;color:#081426;box-shadow:0 14px 35px rgba(0,0,0,.24)}.home-find-result .button:hover{background:#eef5ff}
@media(max-width:980px){.home-find-flow{grid-template-columns:repeat(2,1fr)}.home-find-step:last-child{grid-column:1/-1}.home-find-step:not(:last-child):after{display:none}}
@media(max-width:620px){.home-find-journey{padding:62px 0}.home-find-heading{margin-bottom:30px}.home-find-flow{grid-template-columns:1fr;gap:10px}.home-find-step,.home-find-step:last-child{grid-column:auto;min-height:auto;display:grid;grid-template-columns:58px 1fr;text-align:left;column-gap:15px;align-items:center;padding:18px}.home-find-icon{width:58px;height:58px;margin:0;grid-row:1/4}.home-find-step small,.home-find-step strong,.home-find-step p{grid-column:2}.home-find-step strong{margin:3px 0 4px}.home-find-result{margin-top:26px}.home-find-result .button{width:100%}}
`;
  document.head.appendChild(estilo);
  const secao = document.createElement('section');
  secao.className = 'home-find-journey';
  secao.setAttribute('aria-labelledby', 'home-find-title');
  secao.innerHTML = `<div class="container"><div class="home-find-heading reveal"><span class="kicker">QUANDO CADA SEGUNDO IMPORTA</span><h2 id="home-find-title">E se seu pet se perder?</h2><p>A BIRX ID transforma a identificação em um caminho rápido entre quem encontrou seu pet e você. Sem depender de aplicativo.</p></div><div class="home-find-flow" aria-label="Como a BIRX ajuda quando um pet é encontrado"><article class="home-find-step reveal"><div class="home-find-icon" aria-hidden="true">🐕</div><small>01</small><strong>Seu pet é encontrado</strong><p>Alguém percebe que ele está usando uma BIRX ID.</p></article><article class="home-find-step reveal"><div class="home-find-icon" aria-hidden="true">🏷️</div><small>02</small><strong>A BIRX ID está com ele</strong><p>A identificação acompanha seu pet na coleira.</p></article><article class="home-find-step reveal"><div class="home-find-icon" aria-hidden="true">📱</div><small>03</small><strong>QR Code ou NFC</strong><p>A pessoa escaneia o QR Code ou aproxima um celular compatível.</p></article><article class="home-find-step reveal"><div class="home-find-icon" aria-hidden="true">🐾</div><small>04</small><strong>O perfil aparece</strong><p>Nome, fotos e os dados que você escolheu manter atualizados.</p></article><article class="home-find-step reveal"><div class="home-find-icon" aria-hidden="true">💬</div><small>05</small><strong>Contato com o tutor</strong><p>WhatsApp ou ligação ficam a poucos toques de distância.</p></article></div><div class="home-find-result reveal"><div class="home-find-promise" aria-label="Vantagens da identificação BIRX"><span>Sem aplicativo</span><span>Sem mensalidade</span><span>Em poucos segundos</span></div><a class="button" href="/t.html?tag=DEMO">Testar como funciona →</a></div></div>`;
  hero.insertAdjacentElement('afterend', secao);
}
criarJornadaEncontro();

function aplicarFotosVitrinePets() {
  const cards = [...document.querySelectorAll('.pet-showcase-premium .pet-profile-card')];
  if (cards.length < 3) return;
  const fotos = [
    { src: '/assets/home/1.png?v=2', alt: 'Luna usando BIRX ID' },
    { src: '/assets/home/2.png?v=2', alt: 'Bento usando BIRX ID' },
    { src: '/assets/home/3.png?v=2', alt: 'Cachorro usando BIRX ID com NFC' },
  ];
  const estilo = document.createElement('style');
  estilo.textContent = `.pet-showcase-premium .pet-profile-card{padding-top:0!important;overflow:hidden}.pet-card-photo{width:calc(100% + 48px);height:260px;margin:0 -24px 28px;object-fit:cover;object-position:center;display:block;border-bottom:1px solid rgba(17,37,68,.08);image-rendering:auto}.pet-showcase-premium .pet-profile-icon{display:none!important}@media(max-width:700px){.pet-card-photo{height:280px}}`;
  document.head.appendChild(estilo);
  cards.slice(0,3).forEach((card, index) => {
    const icon = card.querySelector('.pet-profile-icon');
    const img = document.createElement('img');
    img.className = 'pet-card-photo';
    img.src = fotos[index].src;
    img.alt = fotos[index].alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    if (icon) icon.insertAdjacentElement('beforebegin', img); else card.prepend(img);
  });
  const terceiro = cards[2];
  const label = terceiro.querySelector('small');
  const titulo = terceiro.querySelector('h3');
  const descricao = terceiro.querySelector('p');
  if (label) label.textContent = 'BIRX ID';
  if (titulo) titulo.textContent = 'Identificação inteligente';
  if (descricao) descricao.textContent = 'QR Code, NFC e perfil digital para aproximar seu pet de você quando mais importa.';
  const meta = terceiro.querySelector('.pet-profile-meta');
  if (meta) meta.innerHTML = '<span>QR Code</span><span>NFC</span><span>Perfil digital</span>';
}
aplicarFotosVitrinePets();

const siteHeader = document.querySelector('.site-header');
function atualizarCabecalhoAoRolar() { siteHeader?.classList.toggle('is-scrolled', window.scrollY > 12); }
atualizarCabecalhoAoRolar();
window.addEventListener('scroll', atualizarCabecalhoAoRolar, { passive: true });
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');
menuButton?.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); menuButton.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu'); menu?.classList.toggle('is-open', !open); });
document.querySelectorAll('.main-nav a').forEach((link) => { link.addEventListener('click', () => { menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', 'Abrir menu'); menu?.classList.remove('is-open'); }); });
document.addEventListener('keydown', (event) => { if (event.key !== 'Escape' || !menu?.classList.contains('is-open')) return; menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', 'Abrir menu'); menu?.classList.remove('is-open'); menuButton?.focus(); });
document.addEventListener('click', (event) => { if (!menu?.classList.contains('is-open')) return; if (menu.contains(event.target) || menuButton?.contains(event.target)) return; menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', 'Abrir menu'); menu?.classList.remove('is-open'); });
window.addEventListener('resize', () => { if (window.innerWidth > 900 && menu?.classList.contains('is-open')) { menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', 'Abrir menu'); menu?.classList.remove('is-open'); } });
function carregar3DHome() { if (!document.querySelector('[data-birx-3d]')) return; if (document.querySelector('script[data-home-tag-3d]')) return; const script = document.createElement('script'); script.type = 'module'; script.src = '/js/home-tag-3d.js?v=1.7'; script.dataset.homeTag3d = '1'; document.body.appendChild(script); }
carregar3DHome();
if ('IntersectionObserver' in window) { const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }); }, { threshold: 0.12 }); document.querySelectorAll('.reveal').forEach((item) => observer.observe(item)); } else { document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible')); }
document.querySelectorAll('a[href^="#"]').forEach((link) => { link.addEventListener('click', (event) => { const seletor = link.getAttribute('href'); if (!seletor || seletor === '#') return; const destino = document.querySelector(seletor); if (!destino) return; event.preventDefault(); destino.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); if (destino.id) history.replaceState(null, '', `#${destino.id}`); }); });
