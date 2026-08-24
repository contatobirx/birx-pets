(() => {
  const main = document.getElementById("conteudo");
  const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const lines = value => String(value || "").split(/[,;\n]/).map(item => item.trim()).filter(Boolean);
  const phone = value => String(value || "").replace(/\D/g, "");
  const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR") : "";
  const directions = partner => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(partner.latitude && partner.longitude ? `${partner.latitude},${partner.longitude}` : [partner.endereco, partner.cidade, partner.estado].filter(Boolean).join(", "))}`;
  const chips = (title, value) => lines(value).length ? `<section class="card"><h2>${title}</h2><div class="list">${lines(value).map(item => `<span>${escape(item)}</span>`).join("")}</div></section>` : "";

  function render(partner) {
    document.title = `${partner.nome} | Rede BIRX`;
    const address = [partner.endereco, partner.bairro, partner.cidade, partner.estado, partner.cep].filter(Boolean).join(" · ");
    const whatsapp = phone(partner.whatsapp);
    const appointment = encodeURIComponent(`Olá! Encontrei ${partner.nome} pela Rede BIRX e gostaria de agendar um atendimento.`);
    const promotion = partner.promocao ? `<section class="promotion"><span>BENEFÍCIO BIRX</span><h2>Oferta especial para tutores</h2><p>${escape(partner.promocao)}</p>${partner.promocaoCodigo ? `<div class="coupon"><code>${escape(partner.promocaoCodigo)}</code><button id="copiarCupom" type="button">Copiar cupom</button></div>` : ""}${partner.promocaoValidade ? `<div class="validade">Válido até ${formatDate(partner.promocaoValidade)}.</div>` : ""}</section>` : "";
    main.innerHTML = `<section class="hero"><div class="avatar">${escape((partner.nome || "B").trim().charAt(0).toUpperCase())}</div><div><span class="eyebrow">${escape(partner.categoria || "PARCEIRO BIRX")}</span><h1>${escape(partner.nome)}${partner.verificado ? '<span class="selo">✓ Verificado</span>' : ""}</h1><p>${escape([partner.cidade, partner.estado].filter(Boolean).join(" · "))}</p></div><button id="compartilhar" class="share" type="button">Compartilhar perfil</button></section><div class="layout"><div><section class="card">${partner.descricao ? `<h2>Sobre o estabelecimento</h2><p>${escape(partner.descricao)}</p>` : ""}${partner.descricao && (partner.horarios || address) ? '<hr style="border:0;border-top:1px solid #e4eaf4;margin:20px 0">' : ""}<div class="details">${partner.horarios ? `<div class="detail"><small>Horários</small><strong>${escape(partner.horarios)}</strong></div>` : ""}${address ? `<div class="detail"><small>Endereço</small><strong>${escape(address)}</strong></div>` : ""}</div>${partner.atendeEmergencia ? '<div class="emergencia">🚨 Atendimento de emergência informado</div>' : ""}</section>${chips("Serviços", partner.servicos)}${chips("Especialidades", partner.especialidades)}${chips("Produtos disponíveis", partner.produtos)}</div><aside>${promotion}<section class="card"><h2>Fale com este parceiro</h2><p>Entre em contato direto para tirar dúvidas, agendar ou conhecer os produtos disponíveis.</p><div class="actions">${whatsapp ? `<a href="https://wa.me/55${whatsapp}?text=${appointment}" target="_blank" rel="noopener">Agendar pelo WhatsApp</a>` : ""}<a class="secondary" href="${directions(partner)}" target="_blank" rel="noopener">Como chegar</a></div></section></aside></div>`;
    document.getElementById("copiarCupom")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      try { await navigator.clipboard?.writeText(partner.promocaoCodigo); button.textContent = "Cupom copiado"; } catch { button.textContent = partner.promocaoCodigo; }
    });
    document.getElementById("compartilhar")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      try { await navigator.clipboard?.writeText(location.href); button.textContent = "Link copiado"; } catch { button.textContent = "Copie o endereço"; }
    });
  }

  async function load() {
    const id = Number.parseInt(new URLSearchParams(location.search).get("id"), 10);
    if (!id) throw new Error("Este parceiro não foi informado.");
    const response = await fetch(`/api/parceiro-publico?id=${encodeURIComponent(id)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Parceiro não encontrado.");
    render(data.parceiro);
  }

  load().catch(error => { main.innerHTML = `<section class="empty"><h1>Perfil indisponível</h1><p>${escape(error.message)}</p><p><a href="/parceiros">Voltar para a Rede BIRX</a></p></section>`; });
})();
