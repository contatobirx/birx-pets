(() => {
  const tabs = [...document.querySelectorAll("[data-app-tab]")];
  const panels = [...document.querySelectorAll("[data-app-panel]")];

  if (tabs.length && panels.length) {
    function select(name) {
      tabs.forEach((tab) => {
        const active = tab.dataset.appTab === name;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      panels.forEach((panel) => {
        const active = panel.dataset.appPanel === name;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
    }

    tabs.forEach((tab) =>
      tab.addEventListener("click", () => select(tab.dataset.appTab))
    );
  }

  function atualizarMenuFuncionalidades() {
    const recursosLink = [...document.querySelectorAll(".main-nav a")].find(
      (link) => link.getAttribute("href") === "#app"
    );
    if (!recursosLink) return;
    recursosLink.setAttribute("href", "#funcionalidades");
    recursosLink.textContent = "Funcionalidades";
  }

  function instalarEstilosFuncionalidades() {
    if (document.querySelector("#birx-funcionalidades-style")) return;
    const style = document.createElement("style");
    style.id = "birx-funcionalidades-style";
    style.textContent = `
      .birx-funcionalidades-anchor{display:block;height:0;scroll-margin-top:88px}
      .birx-features-hub{position:relative;overflow:hidden;padding:96px 0;background:linear-gradient(180deg,#f7faff 0%,#eef5ff 48%,#f8fbff 100%);border-top:1px solid #dce8f8;border-bottom:1px solid #dce8f8}
      .birx-features-hub:before{content:"";position:absolute;width:620px;height:620px;border-radius:50%;right:-260px;top:-250px;background:radial-gradient(circle,rgba(47,111,255,.16),rgba(47,111,255,0) 68%);pointer-events:none}
      .birx-features-heading{max-width:820px;margin:0 auto 46px;text-align:center}
      .birx-features-heading .kicker{color:#2f6fff}
      .birx-features-heading h2{font:800 clamp(2.15rem,4.3vw,4.05rem)/1.04 Manrope,sans-serif;letter-spacing:-.055em;color:#07111f;margin:12px 0 18px}
      .birx-features-heading p{max-width:720px;margin:0 auto;color:#617089;font-size:1.06rem;line-height:1.75}
      .birx-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
      .birx-feature-card{position:relative;min-height:248px;padding:28px;border:1px solid #d7e4f5;border-radius:26px;background:rgba(255,255,255,.9);box-shadow:0 18px 48px rgba(16,48,93,.08);transition:transform .2s,border-color .2s,box-shadow .2s}
      .birx-feature-card:hover{transform:translateY(-4px);border-color:#9ec9ff;box-shadow:0 24px 54px rgba(16,48,93,.13)}
      .birx-feature-icon{width:54px;height:54px;border-radius:17px;display:grid;place-items:center;margin-bottom:22px;background:linear-gradient(135deg,#eaf3ff,#ddecff);font-size:1.5rem}
      .birx-feature-card h3{font:800 1.08rem Manrope,sans-serif;letter-spacing:-.02em;color:#0a1728;margin:0 0 10px}
      .birx-feature-card p{color:#65738a;font-size:.9rem;line-height:1.65;margin:0}
      .birx-feature-card strong{color:#183b73}
      .birx-benefits{margin-top:66px;padding:42px;border-radius:32px;background:linear-gradient(135deg,#07111f 0%,#0a1b34 55%,#12366a 100%);color:#fff;box-shadow:0 28px 70px rgba(7,17,31,.22);position:relative;overflow:hidden}
      .birx-benefits:after{content:"";position:absolute;width:380px;height:380px;border:1px solid rgba(89,200,255,.18);border-radius:50%;right:-160px;bottom:-190px;box-shadow:0 0 0 38px rgba(89,200,255,.035),0 0 0 76px rgba(89,200,255,.025)}
      .birx-benefits-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:38px;align-items:center;position:relative;z-index:1}
      .birx-benefits .kicker{color:#72d6ff}
      .birx-benefits h3{font:800 clamp(1.85rem,3vw,2.8rem)/1.08 Manrope,sans-serif;letter-spacing:-.045em;margin:12px 0 14px;max-width:720px}
      .birx-benefits-copy>p{color:#aebbd0;line-height:1.72;margin:0 0 24px;max-width:720px}
      .birx-partner-types{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin:22px 0}
      .birx-partner-type{display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:15px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);color:#edf5ff;font-size:.82rem;font-weight:700}
      .birx-partner-type span{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:rgba(89,200,255,.12)}
      .birx-benefits-note{display:flex;gap:10px;align-items:flex-start;margin-top:17px;color:#91a4bd;font-size:.78rem;line-height:1.55}
      .birx-benefits-note b{color:#67d39a}
      .birx-benefits-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
      .birx-benefits-actions .button:first-child{background:#fff;color:#081426}
      .birx-benefits-actions .button:last-child{border-color:rgba(255,255,255,.25);color:#fff}
      .birx-offer-card{position:relative;padding:26px;border-radius:27px;background:#fff;color:#07111f;box-shadow:0 24px 62px rgba(0,0,0,.28);transform:rotate(1.2deg)}
      .birx-offer-badge{display:inline-flex;padding:7px 10px;border-radius:999px;background:#eaf3ff;color:#2264cb;font-size:.62rem;font-weight:900;letter-spacing:.1em}
      .birx-offer-card small{display:block;color:#75839a;margin-top:20px}
      .birx-offer-card h4{font:800 1.4rem/1.15 Manrope,sans-serif;margin:6px 0 18px;letter-spacing:-.03em}
      .birx-offer-product{padding:17px;border:1px solid #e2eaf5;border-radius:18px;background:#f8fbff}
      .birx-offer-product strong{display:block;font:800 1.02rem Manrope,sans-serif;margin-bottom:5px}
      .birx-offer-price{display:flex;align-items:flex-end;gap:11px;margin-top:15px}
      .birx-offer-price del{color:#8e99aa;font-size:.83rem}
      .birx-offer-price b{color:#1468dc;font:900 1.55rem Manrope,sans-serif}
      .birx-offer-action{margin-top:15px;padding:12px 14px;border-radius:13px;background:#1769e0;color:#fff;text-align:center;font-weight:800;font-size:.82rem}
      .birx-offer-foot{font-size:.67rem!important;line-height:1.45;color:#8a96a8!important;margin-top:12px!important}
      .birx-ecosystem{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:22px}
      .birx-ecosystem a{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-radius:18px;border:1px solid #d7e4f5;background:#fff;color:#11233d;text-decoration:none;font-weight:800;font-size:.84rem;box-shadow:0 10px 28px rgba(16,48,93,.06);transition:.2s}
      .birx-ecosystem a span{color:#2f6fff}
      .birx-ecosystem a:hover{border-color:#9ec9ff;transform:translateY(-2px)}
      @media(max-width:980px){.birx-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.birx-benefits{padding:34px}.birx-benefits-grid{grid-template-columns:1fr}.birx-offer-card{max-width:480px;transform:none}.birx-ecosystem{grid-template-columns:1fr 1fr}.birx-ecosystem a:last-child{grid-column:1/-1}}
      @media(max-width:760px){.birx-features-hub{padding:68px 0}.birx-features-heading{margin-bottom:32px;text-align:left}.birx-feature-grid{grid-template-columns:1fr}.birx-feature-card{min-height:auto;padding:23px}.birx-benefits{margin-top:46px;padding:25px 20px;border-radius:25px}.birx-partner-types{grid-template-columns:1fr}.birx-benefits-actions{flex-direction:column}.birx-benefits-actions .button{width:100%;justify-content:center}.birx-ecosystem{grid-template-columns:1fr}.birx-ecosystem a:last-child{grid-column:auto}.birx-offer-card{padding:22px}}
    `;
    document.head.appendChild(style);
  }

  function criarHubFuncionalidades() {
    const app = document.querySelector(".app-showcase");
    if (!app || document.querySelector(".birx-features-hub")) return;

    if (!document.querySelector("#funcionalidades")) {
      const anchor = document.createElement("span");
      anchor.id = "funcionalidades";
      anchor.className = "birx-funcionalidades-anchor";
      anchor.setAttribute("aria-hidden", "true");
      app.insertAdjacentElement("beforebegin", anchor);
    }

    const sec = document.createElement("section");
    sec.className = "birx-features-hub";
    sec.setAttribute("aria-labelledby", "funcionalidades-title");
    sec.innerHTML = `
      <div class="container">
        <div class="birx-features-heading">
          <span class="kicker">FUNCIONALIDADES BIRX PETS</span>
          <h2 id="funcionalidades-title">Tudo o que a BIRX faz pelo seu pet.</h2>
          <p>Proteção, informações importantes, contato rápido e benefícios para o dia a dia — tudo conectado à sua BIRX ID.</p>
        </div>

        <div class="birx-feature-grid">
          <article class="birx-feature-card">
            <div class="birx-feature-icon">🐾</div>
            <h3>Perfil digital</h3>
            <p>Foto, dados, características e informações importantes do seu pet em um perfil que você pode <strong>atualizar quando quiser</strong>.</p>
          </article>
          <article class="birx-feature-card">
            <div class="birx-feature-icon">⌁</div>
            <h3>NFC + QR Code</h3>
            <p>Quem encontrar seu pet pode aproximar um celular compatível ou escanear o QR Code. <strong>Não precisa instalar aplicativo.</strong></p>
          </article>
          <article class="birx-feature-card">
            <div class="birx-feature-icon">📍</div>
            <h3>Modo Pet Perdido</h3>
            <p>Destaque que seu pet está sendo procurado, divulgue informações e facilite o envio da última localização conhecida.</p>
          </article>
          <article class="birx-feature-card">
            <div class="birx-feature-icon">💬</div>
            <h3>Contato e localização</h3>
            <p>Facilite o contato por WhatsApp ou ligação e permita que quem encontrou o pet compartilhe a localização quando necessário.</p>
          </article>
          <article class="birx-feature-card">
            <div class="birx-feature-icon">❤️</div>
            <h3>Saúde e cuidados</h3>
            <p>Organize vacinas, medicamentos, documentos e orientações que ajudam no cuidado do seu pet.</p>
          </article>
          <article class="birx-feature-card">
            <div class="birx-feature-icon">∞</div>
            <h3>Sem mensalidade</h3>
            <p>O perfil digital da BIRX ID permanece disponível <strong>sem cobrança mensal recorrente</strong>.</p>
          </article>
        </div>

        <div class="birx-benefits">
          <div class="birx-benefits-grid">
            <div class="birx-benefits-copy">
              <span class="kicker">Benefícios e parceiros</span>
              <h3>Sua BIRX ID também pode gerar vantagens no dia a dia.</h3>
              <p>Parceiros BIRX podem disponibilizar promoções, cupons e condições especiais para tutores cadastrados. A plataforma aproxima você das ofertas, sem transformar a BIRX em uma loja intermediária.</p>

              <div class="birx-partner-types">
                <div class="birx-partner-type"><span>🥣</span>Rações e petiscos</div>
                <div class="birx-partner-type"><span>💊</span>Farmácia veterinária</div>
                <div class="birx-partner-type"><span>🩺</span>Clínicas veterinárias</div>
                <div class="birx-partner-type"><span>✂️</span>Banho e tosa</div>
              </div>

              <div class="birx-benefits-note"><b>✓</b><span>A BIRX conecta o tutor à oferta; a compra é feita diretamente com o parceiro participante.</span></div>
              <div class="birx-benefits-note"><b>✓</b><span>Você escolhe se quer receber ofertas e comunicações promocionais.</span></div>

              <div class="birx-benefits-actions">
                <a class="button" href="/parceiros">Conhecer parceiros →</a>
                <a class="button button-ghost" href="/loja">Quero minha BIRX ID</a>
              </div>
            </div>

            <aside class="birx-offer-card" aria-label="Exemplo ilustrativo de benefício BIRX">
              <span class="birx-offer-badge">EXEMPLO DE BENEFÍCIO</span>
              <small>Oferta para você e para o Thor</small>
              <h4>Benefícios que fazem sentido para o seu pet.</h4>
              <div class="birx-offer-product">
                <strong>Ração Premium 15 kg</strong>
                <span>Condição especial de parceiro</span>
                <div class="birx-offer-price"><del>R$ 189,90</del><b>R$ 149,90</b></div>
                <div class="birx-offer-action">Ver benefício</div>
              </div>
              <small class="birx-offer-foot">Exemplo ilustrativo. Produtos, preços, disponibilidade e condições dependem dos parceiros participantes.</small>
            </aside>
          </div>
        </div>

        <div class="birx-ecosystem" aria-label="Outros recursos do ecossistema BIRX">
          <a href="/perdidos">Pets perdidos <span>→</span></a>
          <a href="/adocao">Adoção <span>→</span></a>
          <a href="/personalizar">Personalização 3D <span>→</span></a>
        </div>
      </div>
    `;

    app.insertAdjacentElement("afterend", sec);
  }

  atualizarMenuFuncionalidades();
  instalarEstilosFuncionalidades();
  criarHubFuncionalidades();
})();
