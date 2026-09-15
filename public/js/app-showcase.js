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
      .birx-feature-spotlight{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.95fr);gap:32px;margin-top:44px;padding:34px;border-radius:32px;background:linear-gradient(135deg,#081425 0%,#0d2240 55%,#15396f 100%);box-shadow:0 26px 72px rgba(12,34,66,.18);position:relative;overflow:hidden}
      .birx-feature-spotlight:after{content:"";position:absolute;width:420px;height:420px;border-radius:50%;right:-170px;top:-180px;background:radial-gradient(circle,rgba(89,200,255,.2),rgba(89,200,255,0) 67%)}
      .birx-spotlight-copy{position:relative;z-index:1}
      .birx-spotlight-copy .kicker{color:#72d6ff}
      .birx-spotlight-copy h3{font:800 clamp(1.85rem,3vw,2.7rem)/1.06 Manrope,sans-serif;letter-spacing:-.04em;color:#fff;margin:14px 0 16px}
      .birx-spotlight-copy>p{color:#adbdd2;line-height:1.75;margin:0 0 24px;max-width:660px}
      .birx-spotlight-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0;padding:0;list-style:none}
      .birx-spotlight-list li{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.08);color:#edf5ff;font-size:.88rem;line-height:1.5}
      .birx-spotlight-list b{display:block;color:#fff;font-size:.92rem;margin-bottom:3px}
      .birx-spotlight-list span{width:34px;height:34px;flex:0 0 34px;border-radius:12px;display:grid;place-items:center;background:rgba(89,200,255,.12)}
      .birx-spotlight-visual{position:relative;min-height:470px;display:flex;align-items:center;justify-content:center;z-index:1}
      .birx-phone-demo{position:relative;width:min(100%,340px);padding:16px;border-radius:34px;background:linear-gradient(180deg,#0d1730,#081220);box-shadow:0 28px 70px rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.07)}
      .birx-phone-demo:before{content:"";position:absolute;inset:8px;border-radius:28px;border:1px solid rgba(255,255,255,.06);pointer-events:none}
      .birx-phone-notch{width:38%;height:24px;margin:0 auto 14px;border-radius:999px;background:#020611}
      .birx-phone-ui{padding:18px 18px 20px;border-radius:24px;background:linear-gradient(180deg,#f8fbff 0%,#edf4ff 100%)}
      .birx-phone-ui small{display:block;color:#7887a0;font-size:.72rem}
      .birx-phone-ui h4{font:800 1.28rem/1.05 Manrope,sans-serif;color:#07111f;margin:4px 0 18px}
      .birx-demo-pet{display:flex;align-items:center;gap:12px;padding:14px;border-radius:18px;background:#fff;box-shadow:0 12px 24px rgba(20,43,83,.08)}
      .birx-demo-avatar{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#dfe9ff,#ecf4ff);display:grid;place-items:center;font-size:1.4rem}
      .birx-demo-pet strong{display:block;color:#081426;font-size:.96rem}
      .birx-demo-pet p{margin:2px 0 0;color:#73829a;font-size:.78rem}
      .birx-demo-status{margin-left:auto;padding:7px 10px;border-radius:999px;background:#e7f7ed;color:#1c8b50;font-size:.67rem;font-weight:800;letter-spacing:.05em}
      .birx-demo-shortcuts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}
      .birx-demo-shortcut{padding:12px 10px;border-radius:16px;background:#fff;text-align:center;box-shadow:0 12px 24px rgba(20,43,83,.08)}
      .birx-demo-shortcut span{display:block;font-size:1.1rem;margin-bottom:6px}
      .birx-demo-shortcut b{display:block;font-size:.74rem;color:#0e2038}
      .birx-demo-shortcut small{font-size:.64rem;color:#7f8ca2;margin-top:4px}
      .birx-demo-banner{margin-top:14px;padding:15px;border-radius:18px;background:linear-gradient(135deg,#0b1f3d,#184983);color:#fff}
      .birx-demo-banner span{display:block;font-size:.67rem;letter-spacing:.09em;text-transform:uppercase;color:#8fd8ff}
      .birx-demo-banner strong{display:block;font-size:1rem;margin:6px 0}
      .birx-demo-banner p{margin:0;color:#bfd0e6;font-size:.74rem;line-height:1.5}
      .birx-floating-card{position:absolute;max-width:190px;padding:14px 15px;border-radius:18px;background:#fff;border:1px solid #dce8f8;box-shadow:0 18px 48px rgba(17,42,82,.18)}
      .birx-floating-card small{display:block;color:#7c8aa2;font-size:.67rem;margin-bottom:4px}
      .birx-floating-card strong{display:block;color:#0a1728;font-size:.9rem;line-height:1.35}
      .birx-floating-card p{margin:5px 0 0;color:#718097;font-size:.72rem;line-height:1.5}
      .birx-floating-offer{top:28px;right:-14px}
      .birx-floating-reminder{left:0;bottom:84px}
      .birx-floating-tag{right:16px;bottom:6px;background:linear-gradient(135deg,#0f203b,#183d72);border-color:rgba(255,255,255,.1)}
      .birx-floating-tag small,.birx-floating-tag p{color:#abc2df}
      .birx-floating-tag strong{color:#fff}
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
      .birx-offer-stack{display:grid;gap:16px}
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
      .birx-mini-alert{padding:15px 16px;border-radius:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.08)}
      .birx-mini-alert small{display:block;color:#8fd8ff;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;margin:0 0 5px}
      .birx-mini-alert strong{display:block;color:#fff;font-size:.95rem}
      .birx-mini-alert p{margin:6px 0 0;color:#a9b7cb;font-size:.75rem;line-height:1.55}
      .birx-ecosystem{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:22px}
      .birx-ecosystem a{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-radius:18px;border:1px solid #d7e4f5;background:#fff;color:#11233d;text-decoration:none;font-weight:800;font-size:.84rem;box-shadow:0 10px 28px rgba(16,48,93,.06);transition:.2s}
      .birx-ecosystem a span{color:#2f6fff}
      .birx-ecosystem a:hover{border-color:#9ec9ff;transform:translateY(-2px)}
      @media(max-width:1100px){.birx-feature-spotlight{grid-template-columns:1fr}.birx-spotlight-visual{min-height:420px}.birx-phone-demo{width:min(100%,360px)}}
      @media(max-width:980px){.birx-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.birx-benefits{padding:34px}.birx-benefits-grid{grid-template-columns:1fr}.birx-offer-card{max-width:480px;transform:none}.birx-ecosystem{grid-template-columns:1fr 1fr}.birx-ecosystem a:last-child{grid-column:1/-1}}
      @media(max-width:760px){.birx-features-hub{padding:68px 0}.birx-features-heading{margin-bottom:32px;text-align:left}.birx-feature-grid{grid-template-columns:1fr}.birx-feature-card{min-height:auto;padding:23px}.birx-feature-spotlight{margin-top:34px;padding:24px;border-radius:24px}.birx-spotlight-list{grid-template-columns:1fr}.birx-spotlight-visual{min-height:auto;padding-top:8px}.birx-phone-demo{width:100%;max-width:340px}.birx-floating-offer{position:relative;right:auto;top:auto;margin:12px 0 0 auto}.birx-floating-reminder{position:relative;left:auto;bottom:auto;margin:12px auto 0 0}.birx-floating-tag{position:relative;right:auto;bottom:auto;margin-top:12px}.birx-benefits{margin-top:46px;padding:25px 20px;border-radius:25px}.birx-partner-types{grid-template-columns:1fr}.birx-benefits-actions{flex-direction:column}.birx-benefits-actions .button{width:100%;justify-content:center}.birx-ecosystem{grid-template-columns:1fr}.birx-ecosystem a:last-child{grid-column:auto}.birx-offer-card{padding:22px}}
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

        <div class="birx-feature-spotlight">
          <div class="birx-spotlight-copy">
            <span class="kicker">Uma central para o tutor</span>
            <h3>Proteção inteligente com visual de app de verdade.</h3>
            <p>A BIRX pode reunir o que importa em um só lugar: status da tag, acesso ao perfil do pet, lembretes, saúde, contato rápido e até comunicações de parceiros.</p>
            <ul class="birx-spotlight-list">
              <li><span>📱</span><div><b>Painel simples</b>Visual pensado para o celular, rápido de entender e fácil de usar.</div></li>
              <li><span>🔔</span><div><b>Avisos úteis</b>Lembretes e destaques importantes da rotina do pet.</div></li>
              <li><span>📁</span><div><b>Documentos e cuidados</b>Vacinas, observações e informações importantes organizadas.</div></li>
              <li><span>🤝</span><div><b>Vantagens com parceiros</b>Benefícios que tornam a BIRX útil mesmo quando o pet está seguro.</div></li>
            </ul>
          </div>

          <div class="birx-spotlight-visual" aria-label="Exemplo visual do ecossistema BIRX no celular">
            <div class="birx-phone-demo">
              <div class="birx-phone-notch"></div>
              <div class="birx-phone-ui">
                <small>BIRX PETS</small>
                <h4>Painel do tutor</h4>
                <div class="birx-demo-pet">
                  <div class="birx-demo-avatar">🐶</div>
                  <div>
                    <strong>Thor</strong>
                    <p>Perfil ativo e protegido</p>
                  </div>
                  <div class="birx-demo-status">ATIVO</div>
                </div>
                <div class="birx-demo-shortcuts">
                  <div class="birx-demo-shortcut"><span>💉</span><b>Vacinas</b><small>Em dia</small></div>
                  <div class="birx-demo-shortcut"><span>📍</span><b>Localização</b><small>Último ponto</small></div>
                  <div class="birx-demo-shortcut"><span>📄</span><b>Documentos</b><small>3 arquivos</small></div>
                </div>
                <div class="birx-demo-banner">
                  <span>Benefício parceiro</span>
                  <strong>Oferta especial em ração</strong>
                  <p>Usuários BIRX podem receber promoções e condições especiais.</p>
                </div>
              </div>
            </div>
            <div class="birx-floating-card birx-floating-offer">
              <small>Promoção BIRX</small>
              <strong>Ração Premium 15 kg</strong>
              <p>Oferta especial de parceiro para tutores cadastrados.</p>
            </div>
            <div class="birx-floating-card birx-floating-reminder">
              <small>Lembrete</small>
              <strong>Vacina do Thor</strong>
              <p>Organize informações importantes do seu pet em um só lugar.</p>
            </div>
            <div class="birx-floating-card birx-floating-tag">
              <small>BIRX ID</small>
              <strong>NFC + QR Code</strong>
              <p>Leitura rápida por aproximação ou câmera.</p>
            </div>
          </div>
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

            <div class="birx-offer-stack">
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
              <div class="birx-mini-alert">
                <small>Comunicação inteligente</small>
                <strong>Benefícios pensados para o perfil do pet.</strong>
                <p>A ideia é mostrar vantagens mais relevantes conforme o tipo de pet e os parceiros participantes.</p>
              </div>
            </div>
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
