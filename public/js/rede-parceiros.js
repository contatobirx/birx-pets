(() => {
  const $ = id => document.getElementById(id);
  const ui = {
    form: $("buscaParceiros"), address: $("enderecoBusca"), category: $("categoriaBusca"),
    service: $("servicoBusca"), emergency: $("emergenciaBusca"), result: $("resultado"),
    map: $("mapaParceiros"), list: $("listaParceiros"), total: $("totalParceiros"),
    empty: $("vazio"), message: $("mensagem"), dialog: $("modalRelato"),
    report: $("formRelato"), googleMaps: $("googleMapsParceiros")
  };
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const phone = value => String(value || "").replace(/\D/g, "");
  const lines = value => String(value || "").split(/[,;\n]/).map(item => item.trim()).filter(Boolean);
  const directions = partner => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(partner.latitude && partner.longitude ? `${partner.latitude},${partner.longitude}` : [partner.endereco, partner.cidade, partner.estado].filter(Boolean).join(", "))}`;

  function googleQuery() {
    const category = ui.category.value || "clínica veterinária";
    return [category, ui.service.value.trim(), ui.emergency.checked ? "24 horas" : "", ui.address.value.trim()].filter(Boolean).join(" ");
  }

  function updateGoogleMaps(reloadMap = true) {
    const query = googleQuery();
    ui.googleMaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    if (reloadMap) ui.map.src = `/api/google-maps-embed?q=${encodeURIComponent(query)}`;
  }

  async function locate(value) {
    const text = value.trim();
    if (!text) return null;
    const cep = text.replace(/\D/g, "");
    let query = text, city = "", cepValue = "";
    if (cep.length === 8) {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) throw new Error("CEP não encontrado.");
      query = [data.logradouro, data.bairro, data.localidade, data.uf, "Brasil"].filter(Boolean).join(", ");
      city = data.localidade;
      cepValue = cep;
    }
    const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "1", countrycodes: "br" });
    const places = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { "Accept-Language": "pt-BR" } }).then(response => response.json());
    return { city, cep: cepValue, lat: places[0] ? Number(places[0].lat) : null, lng: places[0] ? Number(places[0].lon) : null };
  }

  function render(rows) {
    ui.result.hidden = false;
    ui.empty.hidden = rows.length > 0;
    ui.total.textContent = `${rows.length} parceiro${rows.length === 1 ? "" : "s"} encontrado${rows.length === 1 ? "" : "s"}`;
    ui.list.innerHTML = rows.map(partner => `<article class="parceiro"><div class="parceiro-topo"><div><h3>${esc(partner.nome)} ${partner.verificado ? '<span class="selo">✓ Verificado</span>' : ""}</h3><span class="categoria">${esc(partner.categoria || "Parceiro BIRX")}</span></div>${partner.distanciaKm !== null ? `<span class="distancia">${partner.distanciaKm < 1 ? `${Math.round(partner.distanciaKm * 1000)} m` : `${partner.distanciaKm.toFixed(1)} km`}</span>` : ""}</div>${partner.descricao ? `<p>${esc(partner.descricao)}</p>` : ""}<p>📍 ${esc([partner.endereco, partner.bairro, partner.cidade, partner.estado].filter(Boolean).join(" · ") || "Consulte o endereço")}</p>${partner.horarios ? `<p>🕐 ${esc(partner.horarios)}</p>` : ""}${lines(partner.servicos).length ? `<p><strong>Serviços:</strong> ${lines(partner.servicos).map(esc).join(" · ")}</p>` : ""}${lines(partner.especialidades).length ? `<p><strong>Especialidades:</strong> ${lines(partner.especialidades).map(esc).join(" · ")}</p>` : ""}${partner.atendeEmergencia ? '<div class="emergencia">🚨 Atendimento de emergência informado</div>' : ""}${partner.promocao ? `<div class="promocao">🏷️ ${esc(partner.promocao)}</div>` : ""}${partner.produtos ? `<p><strong>Produtos:</strong> ${esc(partner.produtos)}</p>` : ""}<div class="acoes">${phone(partner.whatsapp) ? `<a href="https://wa.me/55${phone(partner.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}<a class="secundario" href="${directions(partner)}" target="_blank" rel="noopener">Como chegar</a><button class="secundario" data-report="${partner.id}">Informação incorreta</button></div></article>`).join("");
    ui.list.querySelectorAll("[data-report]").forEach(button => button.onclick = () => {
      $("relatoParceiroId").value = button.dataset.report;
      ui.dialog.showModal();
    });
  }

  async function search() {
    ui.message.hidden = true;
    if (!ui.service.value) ui.service.value = new URLSearchParams(location.search).get("servico") || "";
    updateGoogleMaps();
    const center = await locate(ui.address.value), params = new URLSearchParams();
    if (ui.category.value) params.set("categoria", ui.category.value);
    if (ui.service.value) params.set("servico", ui.service.value);
    if (ui.emergency.checked) params.set("emergencia", "1");
    if (center?.city) params.set("cidade", center.city);
    if (center?.cep) params.set("cep", center.cep);
    if (center?.lat !== null && center?.lat !== undefined) {
      params.set("lat", center.lat);
      params.set("lng", center.lng);
    }
    const response = await fetch(`/api/rede-parceiros?${params}`), data = await response.json();
    if (!response.ok) throw new Error(data.mensagem);
    render(data.parceiros || []);
  }

  ui.form.onsubmit = event => {
    event.preventDefault();
    search().catch(error => { ui.message.textContent = error.message; ui.message.hidden = false; });
  };
  ui.address.addEventListener("input", () => updateGoogleMaps(false));
  ui.category.addEventListener("change", () => updateGoogleMaps(false));
  ui.service.addEventListener("input", () => updateGoogleMaps(false));
  ui.emergency.addEventListener("change", () => updateGoogleMaps(false));
  ui.dialog.querySelector(".fechar").onclick = () => ui.dialog.close();
  ui.report.onsubmit = async event => {
    event.preventDefault();
    const response = await fetch("/api/rede-parceiros", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parceiroId: $("relatoParceiroId").value, motivo: $("relatoMotivo").value, detalhes: $("relatoDetalhes").value, contato: $("relatoContato").value, site: $("relatoSite").value }) });
    const data = await response.json();
    if (!response.ok) return alert(data.mensagem);
    alert(data.mensagem);
    ui.dialog.close();
    ui.report.reset();
  };
  updateGoogleMaps();
  search().catch(() => { ui.result.hidden = false; });
})();
