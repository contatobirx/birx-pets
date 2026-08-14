document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-birx-nav-toggle]');
  if (button) {
    const nav = button.closest('.birx-public-nav');
    if (!nav) return;

    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    return;
  }

  const closeControl = event.target.closest('[aria-label="Fechar"], [aria-label^="Fechar "]');
  if (!closeControl) return;

  const dialog = closeControl.closest('[role="dialog"]');
  if (dialog) {
    event.preventDefault();
    event.stopPropagation();

    if (document.activeElement && dialog.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    const container = dialog.parentElement;
    if (container) {
      container.hidden = true;
      container.setAttribute('aria-hidden', 'true');
      container.style.pointerEvents = 'none';
    } else {
      dialog.hidden = true;
    }

    document.body.classList.remove('locked');

    const safeFocus = document.getElementById('abrirCarrinho') || document.querySelector('main a, main button');
    if (safeFocus && typeof safeFocus.focus === 'function') {
      requestAnimationFrame(() => safeFocus.focus({ preventScroll: true }));
    }
    return;
  }

  const drawer = closeControl.closest('aside[aria-hidden]');
  if (drawer) {
    event.preventDefault();
    event.stopPropagation();

    if (document.activeElement && drawer.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    drawer.classList.remove('open', 'is-open');
    drawer.setAttribute('aria-hidden', 'true');
    const overlay = drawer.previousElementSibling;
    if (overlay && overlay.hasAttribute('hidden')) overlay.hidden = true;
    document.body.classList.remove('locked');

    const opener = document.getElementById('abrirCarrinho');
    if (opener) requestAnimationFrame(() => opener.focus({ preventScroll: true }));
  }
}, true);

(function melhorarLoja() {
  if (!/^\/loja(?:\/|$)/.test(location.pathname)) return;

  const style = document.createElement('style');
  style.textContent = `
    .birx-public-nav{
      background:#050505!important;
      border-bottom:1px solid rgba(255,255,255,.10)!important;
      box-shadow:0 8px 24px rgba(0,0,0,.18)!important;
    }
    .birx-public-nav__links a{color:#f5f7fb!important}
    .birx-public-nav__links a[aria-current="page"]{color:#66cfff!important}
    .birx-public-nav__toggle{color:#fff!important}
    .birx-public-nav__brand img{filter:none!important}
    .cart-button{
      background:#111827!important;
      color:#fff!important;
      border-color:rgba(255,255,255,.16)!important;
    }
    .hero-product.birx-3d-hero{
      min-height:440px!important;
      position:relative!important;
      display:block!important;
      overflow:hidden!important;
      contain:layout paint size!important;
      border-radius:24px!important;
    }
    .hero-product.birx-3d-hero:before{
      content:"";
      position:absolute;
      left:50%;
      top:50%;
      transform:translate(-50%,-50%);
      width:360px;
      height:360px;
      border:1px solid rgba(112,181,255,.18);
      border-radius:50%;
      box-shadow:0 0 0 45px rgba(74,136,255,.035),0 0 0 90px rgba(74,136,255,.02);
      pointer-events:none;
    }
    .hero-product .store-3d-tag{
      position:absolute!important;
      inset:0!important;
      z-index:2;
      width:100%!important;
      height:100%!important;
      overflow:hidden!important;
      contain:layout paint size!important;
    }
    .hero-product .store-3d-tag canvas{
      position:absolute!important;
      inset:0!important;
      width:100%!important;
      height:100%!important;
      max-width:100%!important;
      max-height:100%!important;
      display:block!important;
      touch-action:none!important;
    }
    .hero-product .store-3d-badge{
      position:absolute;
      right:8%;
      bottom:10%;
      z-index:4;
      padding:9px 13px;
      border-radius:999px;
      background:#fff;
      color:#17346d;
      font-size:.68rem;
      font-weight:900;
      letter-spacing:.12em;
      pointer-events:none;
    }
    @media(max-width:760px){
      .hero-product.birx-3d-hero{min-height:360px!important}
    }
  `;
  document.head.appendChild(style);

  const hero = document.querySelector('.hero-product');
  if (!hero || hero.querySelector('[data-birx-3d]')) return;

  hero.classList.add('birx-3d-hero');
  hero.innerHTML = '<div class="store-3d-tag" data-birx-3d data-body="#151515" data-detail="#f5f5f2" aria-label="Modelo 3D real da BIRX ID"></div><span class="store-3d-badge">MODELO 3D REAL</span>';

  if (!document.querySelector('script[data-store-tag-3d]')) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/js/home-tag-3d.js?v=1.8';
    script.dataset.storeTag3d = '1';
    document.body.appendChild(script);
  }
})();
