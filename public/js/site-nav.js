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
    event.preventDefault(); event.stopPropagation();
    if (document.activeElement && dialog.contains(document.activeElement)) document.activeElement.blur();
    const container = dialog.parentElement;
    if (container) { container.hidden = true; container.setAttribute('aria-hidden','true'); container.style.pointerEvents='none'; }
    else dialog.hidden = true;
    document.body.classList.remove('locked');
    const safeFocus=document.getElementById('abrirCarrinho')||document.querySelector('main a, main button');
    if(safeFocus&&typeof safeFocus.focus==='function')requestAnimationFrame(()=>safeFocus.focus({preventScroll:true}));
    return;
  }
  const drawer=closeControl.closest('aside[aria-hidden]');
  if(drawer){event.preventDefault();event.stopPropagation();if(document.activeElement&&drawer.contains(document.activeElement))document.activeElement.blur();drawer.classList.remove('open','is-open');drawer.setAttribute('aria-hidden','true');const overlay=drawer.previousElementSibling;if(overlay&&overlay.hasAttribute('hidden'))overlay.hidden=true;document.body.classList.remove('locked');const opener=document.getElementById('abrirCarrinho');if(opener)requestAnimationFrame(()=>opener.focus({preventScroll:true}));}
}, true);

(function melhorarLoja(){
  if(!/^\/loja(?:\/|$)/.test(location.pathname))return;
  const style=document.createElement('style');
  style.textContent=`
    .birx-public-nav{background:#050505!important;border-bottom:1px solid rgba(255,255,255,.10)!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important}
    .birx-public-nav__links a{color:#f5f7fb!important}.birx-public-nav__links a[aria-current="page"]{color:#66cfff!important}.birx-public-nav__toggle{color:#fff!important}.birx-public-nav__brand img{filter:none!important}
    .cart-button{background:#111827!important;color:#fff!important;border-color:rgba(255,255,255,.16)!important}
    .hero-product.birx-3d-hero{min-height:440px!important;position:relative!important;display:block!important;overflow:hidden!important;contain:layout paint size!important;border-radius:24px!important}
    .hero-product.birx-3d-hero:before{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:360px;height:360px;border:1px solid rgba(112,181,255,.18);border-radius:50%;box-shadow:0 0 0 45px rgba(74,136,255,.035),0 0 0 90px rgba(74,136,255,.02);pointer-events:none}
    .hero-product .store-3d-tag{position:absolute!important;inset:0!important;z-index:2;width:100%!important;height:100%!important;overflow:hidden!important;contain:layout paint size!important;pointer-events:none!important}
    .hero-product .store-3d-tag canvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;display:block!important;pointer-events:none!important;touch-action:none!important;user-select:none!important}
    .hero-product .store-color-click{position:absolute;inset:0;z-index:3;cursor:pointer;background:transparent;border:0;padding:0;margin:0;touch-action:manipulation}
    .hero-product .store-3d-badge{position:absolute;right:8%;bottom:10%;z-index:4;padding:9px 13px;border-radius:999px;background:#fff;color:#17346d;font-size:.68rem;font-weight:900;letter-spacing:.12em;pointer-events:none}
    .hero-product .store-color-hint{position:absolute;left:50%;bottom:calc(7% - 38px);transform:translateX(-50%);z-index:4;color:#4e607e;font-size:.78rem;font-weight:800;pointer-events:none;white-space:nowrap}
    @media(max-width:760px){.hero-product.birx-3d-hero{min-height:360px!important}.hero-product .store-color-hint{bottom:calc(7% - 32px)}}
  `;
  document.head.appendChild(style);
  const hero=document.querySelector('.hero-product');if(!hero||hero.querySelector('.store-3d-tag'))return;
  hero.classList.add('birx-3d-hero');
  hero.innerHTML='<div class="store-3d-tag" aria-hidden="true"></div><button class="store-color-click" type="button" aria-label="Toque para mudar a cor da BIRX ID"></button><span class="store-3d-badge">MODELO 3D REAL</span><span class="store-color-hint">Toque para mudar de cor</span>';
  if(!document.querySelector('script[data-store-tag-3d]')){const script=document.createElement('script');script.type='module';script.src='/js/loja-tag-3d.js?v=4.0';script.dataset.storeTag3d='1';document.body.appendChild(script);}
})();

(function melhorarCardsDaLoja(){
  if(!/^\/loja(?:\/|$)/.test(location.pathname))return;

  const style=document.createElement('style');
  style.textContent=`
    .product-grid{gap:28px!important}
    .product-card{position:relative!important;border:1px solid #dbe4f1!important;border-radius:26px!important;box-shadow:0 18px 46px rgba(17,34,68,.09)!important;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease!important}
    .product-card:hover{transform:translateY(-5px);border-color:#bfd0ee!important;box-shadow:0 26px 60px rgba(17,34,68,.14)!important}
    .product-media{height:285px!important;background:linear-gradient(145deg,#f5f8ff,#e6eefc)!important}
    .product-media img{object-fit:contain!important;padding:18px!important;filter:drop-shadow(0 18px 22px rgba(19,42,82,.16))}
    .product-content{padding:25px!important}
    .product-content h3{font-size:1.28rem!important;margin:8px 0 10px!important}
    .product-content p{min-height:54px;line-height:1.55!important}
    .birx-card-benefits{display:flex;flex-wrap:wrap;gap:7px;margin:16px 0 2px}
    .birx-card-benefits span{display:inline-flex;align-items:center;padding:6px 9px;border-radius:999px;background:#f1f5fb;color:#41516d;font-size:.67rem;font-weight:800}
    .birx-card-monthly{display:inline-flex!important;width:max-content;margin-top:13px;padding:6px 10px;border-radius:999px;background:#e9f8ef;color:#187348!important;font-size:.66rem!important;letter-spacing:.04em!important}
    .product-buy{align-items:flex-end!important;gap:10px!important;padding-top:18px!important}
    .product-price strong{font-size:1.55rem!important;letter-spacing:-.03em}
    .birx-card-actions{display:flex;flex-direction:column;gap:8px;min-width:150px}
    .birx-personalize{display:flex;align-items:center;justify-content:center;padding:10px 12px;border:1px solid #2463eb;border-radius:11px;color:#245ed8;text-decoration:none;font-size:.73rem;font-weight:900;background:#fff}
    .birx-card-actions .add-button{width:100%}
    .product-card[data-birx-featured="1"]:before{content:"MAIS ESCOLHIDA";position:absolute;top:14px;right:14px;z-index:5;padding:7px 10px;border-radius:999px;background:#2463eb;color:#fff;font-size:.58rem;font-weight:900;letter-spacing:.08em;box-shadow:0 8px 18px rgba(36,99,235,.25)}
    @media(max-width:620px){.product-media{height:245px!important}.product-content p{min-height:0}.product-buy{align-items:stretch!important;flex-direction:column}.birx-card-actions{width:100%}}
  `;
  document.head.appendChild(style);

  function decorar(){
    document.querySelectorAll('.product-card').forEach(card=>{
      if(card.dataset.birxEnhanced==='1')return;
      const content=card.querySelector('.product-content');
      const buy=card.querySelector('.product-buy');
      const add=card.querySelector('[data-adicionar], .add-button');
      if(!content||!buy||!add)return;

      const title=(card.querySelector('h3')?.textContent||'').trim();
      const slug=add.dataset.adicionar||'';
      const isBirx=/birx|nfc|tag/i.test(title+' '+slug);
      const isNfc=/nfc|smart|connect/i.test(title+' '+slug);

      const monthly=document.createElement('span');
      monthly.className='birx-card-monthly';
      monthly.textContent='✓ Sem mensalidade';
      const desc=content.querySelector('p');
      (desc||content.firstElementChild)?.insertAdjacentElement('afterend',monthly);

      const benefits=document.createElement('div');
      benefits.className='birx-card-benefits';
      benefits.innerHTML=isBirx
        ? `<span>${isNfc?'NFC + QR Code':'Identificação prática'}</span><span>Perfil editável</span><span>Suporte BIRX</span>`
        : '<span>Produção BIRX</span><span>Feito para pets</span>';
      buy.insertAdjacentElement('beforebegin',benefits);

      const actions=document.createElement('div');
      actions.className='birx-card-actions';
      if(isBirx){
        const personalize=document.createElement('a');
        personalize.className='birx-personalize';
        personalize.href=slug?`/personalizar?produto=${encodeURIComponent(slug)}`:'/personalizar';
        personalize.textContent='Personalizar minha BIRX ID';
        actions.appendChild(personalize);
      }
      add.parentNode.insertBefore(actions,add);
      actions.appendChild(add);

      if(/smart|connect/i.test(title+' '+slug))card.dataset.birxFeatured='1';
      card.dataset.birxEnhanced='1';
    });
  }

  decorar();
  const grid=document.getElementById('gradeProdutos')||document.querySelector('.product-grid');
  if(grid)new MutationObserver(decorar).observe(grid,{childList:true,subtree:true});
})();

(function adicionarComoFuncionaLoja(){
  if(!/^\/loja(?:\/|$)/.test(location.pathname))return;
  if(document.querySelector('.birx-how-store'))return;

  const produtos=document.getElementById('produtosLoja')||document.querySelector('.store-section');
  if(!produtos)return;

  const style=document.createElement('style');
  style.textContent=`
    .birx-how-store{padding:72px 0;background:linear-gradient(180deg,#f8fbff 0%,#f2f7ff 100%);border-bottom:1px solid #dfe7f3}
    .birx-how-store .store-container{width:min(1160px,calc(100% - 40px));margin:auto}
    .birx-how-head{text-align:center;max-width:720px;margin:0 auto 42px}
    .birx-how-head .store-kicker{display:block;margin-bottom:9px}
    .birx-how-head h2{margin:0;font-size:clamp(2rem,4vw,3.15rem);letter-spacing:-.04em;color:#111a31}
    .birx-how-head p{margin:13px auto 0;color:#667085;max-width:620px;font-size:.96rem}
    .birx-how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;position:relative}
    .birx-how-step{position:relative;padding:25px 22px 23px;border:1px solid #dbe5f2;border-radius:22px;background:#fff;box-shadow:0 14px 34px rgba(19,42,82,.07)}
    .birx-how-number{display:grid;place-items:center;width:38px;height:38px;margin-bottom:17px;border-radius:12px;background:#101d39;color:#fff;font-size:.8rem;font-weight:900}
    .birx-how-icon{display:grid;place-items:center;position:absolute;right:20px;top:20px;width:42px;height:42px;border-radius:14px;background:#eef4ff;font-size:1.3rem}
    .birx-how-step h3{margin:0 0 8px;font-size:1.08rem;color:#111a31}
    .birx-how-step p{margin:0;color:#6b778c;font-size:.82rem;line-height:1.55}
    .birx-how-note{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:26px;color:#43516a;font-size:.78rem;font-weight:800}
    .birx-how-note strong{color:#17734a}
    @media(max-width:900px){.birx-how-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:620px){.birx-how-store{padding:55px 0}.birx-how-store .store-container{width:min(100% - 28px,1160px)}.birx-how-head{margin-bottom:28px}.birx-how-grid{grid-template-columns:1fr;gap:12px}.birx-how-step{padding:21px}.birx-how-note{text-align:center;align-items:flex-start}}
  `;
  document.head.appendChild(style);

  const section=document.createElement('section');
  section.className='birx-how-store';
  section.setAttribute('aria-labelledby','birxComoFuncionaTitulo');
  section.innerHTML=`
    <div class="store-container">
      <div class="birx-how-head">
        <span class="store-kicker">SIMPLES DO INÍCIO AO FIM</span>
        <h2 id="birxComoFuncionaTitulo">Como funciona a BIRX ID?</h2>
        <p>Em poucos passos, seu pet passa a ter uma identificação inteligente pronta para ajudar quem o encontrar a falar com você.</p>
      </div>
      <div class="birx-how-grid">
        <article class="birx-how-step"><span class="birx-how-number">01</span><span class="birx-how-icon" aria-hidden="true">🎨</span><h3>Personalize</h3><p>Escolha o modelo, a cor e os dados da BIRX ID do seu pet.</p></article>
        <article class="birx-how-step"><span class="birx-how-number">02</span><span class="birx-how-icon" aria-hidden="true">📦</span><h3>Receba em casa</h3><p>Nós produzimos sua BIRX ID e enviamos para o endereço escolhido.</p></article>
        <article class="birx-how-step"><span class="birx-how-number">03</span><span class="birx-how-icon" aria-hidden="true">🐾</span><h3>Cadastre seu pet</h3><p>Ative a tag e mantenha o perfil do pet atualizado sempre que precisar.</p></article>
        <article class="birx-how-step"><span class="birx-how-number">04</span><span class="birx-how-icon" aria-hidden="true">📱</span><h3>NFC ou QR Code</h3><p>Quem encontrar seu pet aproxima o celular ou lê o QR Code para acessar o perfil.</p></article>
      </div>
      <div class="birx-how-note"><strong>✓ Sem mensalidade</strong><span>•</span><span>O perfil pode ser atualizado pelo tutor.</span></div>
    </div>`;

  produtos.parentNode.insertBefore(section,produtos);
})();
