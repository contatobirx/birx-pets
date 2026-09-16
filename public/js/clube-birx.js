(() => {
  const init = () => {
    const clube = document.querySelector('.birx-features-hub .birx-benefits');
  if (!clube || clube.dataset.clubeBirx === '1') return;

  clube.dataset.clubeBirx = '1';
  clube.id = 'clube-birx';
  clube.classList.add('birx-club');

  if (!document.querySelector('#birx-club-style')) {
    const style = document.createElement('style');
    style.id = 'birx-club-style';
    style.textContent = `
      .birx-club{margin-top:66px!important;padding:0!important;border-radius:34px!important;background:linear-gradient(145deg,#06101e 0%,#0b1f3b 52%,#123e74 100%)!important;overflow:hidden!important;box-shadow:0 30px 80px rgba(7,17,31,.24)!important}
      .birx-club-shell{position:relative;padding:48px 44px 42px;color:#fff}
      .birx-club-shell:before{content:"";position:absolute;width:500px;height:500px;border-radius:50%;right:-230px;top:-240px;background:radial-gradient(circle,rgba(89,200,255,.18),rgba(89,200,255,0) 68%);pointer-events:none}
      .birx-club-top{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(320px,.88fr);gap:38px;align-items:center;position:relative;z-index:1}
      .birx-club-kicker{display:inline-flex;align-items:center;gap:8px;color:#76d9ff;font-size:.72rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
      .birx-club-kicker:before{content:"★";font-size:.76rem}
      .birx-club-copy h3{font:800 clamp(2rem,3.5vw,3.35rem)/1.04 Manrope,sans-serif;letter-spacing:-.055em;margin:14px 0 16px;max-width:780px}
      .birx-club-copy>p{max-width:760px;margin:0;color:#adbed3;line-height:1.75;font-size:.98rem}
      .birx-club-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin:24px 0 0}
      .birx-club-point{padding:15px;border-radius:17px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.09);color:#c2cfe0;font-size:.75rem;line-height:1.5}
      .birx-club-point span{display:block;font-size:1.25rem;margin-bottom:8px}.birx-club-point b{display:block;color:#fff;font-size:.82rem;margin-bottom:4px}
      .birx-club-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:25px}.birx-club-actions .button:first-child{background:#fff;color:#09172a}.birx-club-actions .button:last-child{border-color:rgba(255,255,255,.24);color:#fff}
      .birx-club-control{padding:24px;border-radius:26px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(10px)}
      .birx-club-control small{display:block;color:#76d9ff;font-size:.66rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.birx-club-control h4{font:800 1.35rem/1.15 Manrope,sans-serif;margin:8px 0 12px}.birx-club-control p{margin:0;color:#aebed2;font-size:.8rem;line-height:1.6}
      .birx-club-control-list{display:grid;gap:9px;margin-top:16px}.birx-club-control-item{display:flex;align-items:flex-start;gap:10px;padding:11px 12px;border-radius:14px;background:rgba(255,255,255,.06);color:#e8f0fa;font-size:.75rem;line-height:1.45}.birx-club-control-item b{color:#70d69f}
      .birx-club-offers-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-top:40px;position:relative;z-index:1}.birx-club-offers-head h4{font:800 clamp(1.35rem,2.2vw,1.85rem)/1.1 Manrope,sans-serif;margin:6px 0 0}.birx-club-offers-head p{margin:0;color:#93a8c2;font-size:.78rem}.birx-club-arrows{display:flex;gap:8px}.birx-club-arrow{width:42px;height:42px;border-radius:13px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#fff;cursor:pointer;font-size:1.05rem;transition:.2s}.birx-club-arrow:hover{background:rgba(255,255,255,.13);transform:translateY(-1px)}
      .birx-club-offers{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(265px,1fr);gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:18px 2px 4px;position:relative;z-index:1}.birx-club-offers::-webkit-scrollbar{display:none}
      .birx-club-offer{scroll-snap-align:start;min-height:300px;padding:20px;border-radius:24px;background:#fff;color:#0b182a;box-shadow:0 18px 42px rgba(0,0,0,.18);display:flex;flex-direction:column}
      .birx-club-offer-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.birx-club-badge{display:inline-flex;padding:7px 9px;border-radius:999px;background:#eaf3ff;color:#1c62c7;font-size:.58rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.birx-club-category{font-size:1.25rem}.birx-club-offer small{display:block;color:#8b97a9;margin-top:16px;font-size:.68rem}.birx-club-offer h5{font:800 1.1rem/1.25 Manrope,sans-serif;margin:5px 0 9px}.birx-club-offer p{margin:0;color:#6f7d91;font-size:.78rem;line-height:1.55}.birx-club-price{display:flex;align-items:flex-end;gap:9px;margin-top:auto;padding-top:18px}.birx-club-price del{color:#9aa4b2;font-size:.72rem}.birx-club-price strong{color:#1167df;font:900 1.35rem Manrope,sans-serif}.birx-club-link{display:flex;align-items:center;justify-content:center;margin-top:13px;padding:11px 13px;border-radius:13px;background:#0f65dc;color:#fff;text-decoration:none;font-size:.76rem;font-weight:900}.birx-club-link:hover{background:#0a57bd}
      .birx-club-partner{margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 18px;border-radius:18px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.09);position:relative;z-index:1}.birx-club-partner p{margin:0;color:#aebed1;font-size:.77rem;line-height:1.5}.birx-club-partner strong{color:#fff}.birx-club-partner a{white-space:nowrap;color:#78d9ff;text-decoration:none;font-size:.78rem;font-weight:900}.birx-club-disclaimer{margin:14px 0 0;color:#8296af;font-size:.66rem;line-height:1.55;position:relative;z-index:1}
      @media(max-width:980px){.birx-club-top{grid-template-columns:1fr}.birx-club-points{grid-template-columns:1fr 1fr}.birx-club-point:last-child{grid-column:1/-1}.birx-club-control{max-width:620px}}
      @media(max-width:700px){.birx-club-shell{padding:30px 20px 25px}.birx-club-points{grid-template-columns:1fr}.birx-club-point:last-child{grid-column:auto}.birx-club-actions{flex-direction:column}.birx-club-actions .button{width:100%;justify-content:center}.birx-club-offers-head{align-items:flex-start}.birx-club-arrows{display:none}.birx-club-offers{grid-auto-columns:84%}.birx-club-partner{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  clube.innerHTML = `
    <div class="birx-club-shell">
      <div class="birx-club-top">
        <div class="birx-club-copy">
          <span class="birx-club-kicker">Clube Birx</span>
          <h3>Benefícios para quem cuida de verdade.</h3>
          <p>Quem faz parte do ecossistema BIRX pode encontrar vantagens oferecidas por parceiros para a rotina do pet — de alimentação e acessórios a serviços e cuidados veterinários.</p>

          <div class="birx-club-points">
            <div class="birx-club-point"><span>🎟️</span><b>Benefícios exclusivos</b>Cupons, condições especiais e campanhas de parceiros participantes.</div>
            <div class="birx-club-point"><span>🐾</span><b>Mais relevância</b>Ofertas podem ser organizadas conforme informações gerais do perfil do pet.</div>
            <div class="birx-club-point"><span>🔔</span><b>Você no controle</b>Você escolhe se quer receber ofertas e comunicações promocionais.</div>
          </div>

          <div class="birx-club-actions">
            <a class="button" href="#birx-club-offers">Ver benefícios →</a>
            <a class="button button-ghost" href="/parceiros">Quero ser parceiro</a>
          </div>
        </div>

        <aside class="birx-club-control">
          <small>Como funciona</small>
          <h4>A BIRX aproxima. O parceiro atende.</h4>
          <p>O Clube Birx funciona como uma ponte entre tutores e estabelecimentos parceiros. A compra ou contratação acontece diretamente com o parceiro.</p>
          <div class="birx-club-control-list">
            <div class="birx-club-control-item"><b>✓</b><span>Sem estoque ou entrega pela BIRX.</span></div>
            <div class="birx-club-control-item"><b>✓</b><span>Parceiros podem divulgar vantagens para a comunidade.</span></div>
            <div class="birx-club-control-item"><b>✓</b><span>Comunicações promocionais dependem da escolha do tutor.</span></div>
          </div>
        </aside>
      </div>

      <div class="birx-club-offers-head" id="birx-club-offers">
        <div>
          <p>VITRINE DO CLUBE</p>
          <h4>Exemplos de benefícios que podem aparecer por aqui.</h4>
        </div>
        <div class="birx-club-arrows" aria-label="Navegar pelas ofertas">
          <button class="birx-club-arrow" type="button" data-club-prev aria-label="Oferta anterior">←</button>
          <button class="birx-club-arrow" type="button" data-club-next aria-label="Próxima oferta">→</button>
        </div>
      </div>

      <div class="birx-club-offers" data-club-track>
        <article class="birx-club-offer">
          <div class="birx-club-offer-top"><span class="birx-club-badge">Exclusivo Clube Birx</span><span class="birx-club-category">🥣</span></div>
          <small>ALIMENTAÇÃO • EXEMPLO</small>
          <h5>Ração Premium 15 kg</h5>
          <p>Condição especial ilustrativa de um parceiro do Clube Birx.</p>
          <div class="birx-club-price"><del>R$ 189,90</del><strong>R$ 149,90</strong></div>
          <a class="birx-club-link" href="/parceiros">Ver benefício</a>
        </article>

        <article class="birx-club-offer">
          <div class="birx-club-offer-top"><span class="birx-club-badge">Exclusivo Clube Birx</span><span class="birx-club-category">🩺</span></div>
          <small>CLÍNICA • EXEMPLO</small>
          <h5>Condição especial em consulta</h5>
          <p>Benefícios em serviços podem ser divulgados por clínicas veterinárias parceiras.</p>
          <div class="birx-club-price"><strong>Benefício parceiro</strong></div>
          <a class="birx-club-link" href="/parceiros">Ver benefício</a>
        </article>

        <article class="birx-club-offer">
          <div class="birx-club-offer-top"><span class="birx-club-badge">Exclusivo Clube Birx</span><span class="birx-club-category">✂️</span></div>
          <small>BANHO E TOSA • EXEMPLO</small>
          <h5>Vantagem para a rotina do pet</h5>
          <p>Pet shops parceiros podem criar campanhas e condições especiais para usuários BIRX.</p>
          <div class="birx-club-price"><strong>Oferta especial</strong></div>
          <a class="birx-club-link" href="/parceiros">Ver benefício</a>
        </article>

        <article class="birx-club-offer">
          <div class="birx-club-offer-top"><span class="birx-club-badge">Exclusivo Clube Birx</span><span class="birx-club-category">🦴</span></div>
          <small>ACESSÓRIOS • EXEMPLO</small>
          <h5>Desconto em produtos selecionados</h5>
          <p>Brinquedos, coleiras, higiene e acessórios também podem entrar na vitrine de parceiros.</p>
          <div class="birx-club-price"><strong>Cupom parceiro</strong></div>
          <a class="birx-club-link" href="/parceiros">Ver benefício</a>
        </article>
      </div>

      <div class="birx-club-partner">
        <p><strong>Tem um pet shop, clínica ou serviço para pets?</strong><br>O Clube Birx também pode ser um canal para apresentar sua empresa aos tutores da comunidade.</p>
        <a href="/parceiros">Quero ser parceiro do Clube Birx →</a>
      </div>

      <p class="birx-club-disclaimer">Os benefícios acima são exemplos ilustrativos. Parceiros, produtos, preços, disponibilidade, validade e condições dependem das campanhas ativas. Ofertas de produtos e serviços veterinários não substituem orientação profissional.</p>
    </div>
  `;

  const track = clube.querySelector('[data-club-track]');
  const prev = clube.querySelector('[data-club-prev]');
  const next = clube.querySelector('[data-club-next]');
  const scrollOffers = (direction) => {
    if (!track) return;
    const firstCard = track.querySelector('.birx-club-offer');
    const amount = firstCard ? firstCard.getBoundingClientRect().width + 14 : 300;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };
  prev?.addEventListener('click', () => scrollOffers(-1));
  next?.addEventListener('click', () => scrollOffers(1));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
