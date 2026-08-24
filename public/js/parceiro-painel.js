(() => {
  const $ = id => document.getElementById(id);
  const ui = {
    name: $("nomeParceiro"), location: $("localParceiro"), total: $("total"), stock: $("estoque"), sold: $("vendidas"), active: $("ativadas"),
    search: $("busca"), list: $("lista"), empty: $("vazio"), message: $("mensagem"), profileMessage: $("mensagemPerfil"),
    profile: $("formPerfil"), verification: $("statusVerificacao"), logout: $("sair")
  };
  let tags = [];
  let partner = {};
  const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const date = value => value ? new Date(`${String(value).replace(" ", "T")}Z`).toLocaleDateString("pt-BR") : "—";
  const labels = { essential: "Essential", nfc: "Connect", "nfc-identificacao": "Complete" };

  function notify(text, error = false, target = ui.message) {
    target.textContent = text;
    target.classList.toggle("erro", error);
    target.hidden = false;
    setTimeout(() => { target.hidden = true; }, 7000);
  }

  async function api(options = {}) {
    const response = await fetch("/api/parceiro", { credentials: "same-origin", ...options });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      location.replace("/parceiro");
      throw new Error("Sessão expirada.");
    }
    if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível concluir.");
    return data;
  }

  function render() {
    const query = ui.search.value.trim().toLowerCase();
    const items = tags.filter(tag => !query || tag.codigo.toLowerCase().includes(query));
    ui.empty.hidden = items.length > 0;
    ui.list.innerHTML = items.map(tag => `<tr><td class="codigo">${escape(tag.codigo)}</td><td>${escape(labels[tag.modelo] || tag.modelo || "BIRX ID")}<br><small>${escape(tag.lote || "Sem lote")}</small></td><td><span class="status ${escape(tag.status)}">${escape(tag.status)}</span></td><td>${date(tag.recebidoEm)}</td><td><div class="acoes">${tag.status === "estoque" ? `<button data-venda="${escape(tag.codigo)}">Registrar venda</button>` : ""}<a class="button secundario" href="/q/${encodeURIComponent(tag.codigo)}" target="_blank" rel="noopener">Abrir ativação</a></div></td></tr>`).join("");
    ui.list.querySelectorAll("[data-venda]").forEach(button => { button.onclick = () => sale(button.dataset.venda); });
  }

  function fill() {
    for (const id of ["categoria", "whatsapp", "endereco", "cep", "bairro", "cidade", "estado", "latitude", "longitude", "horarios", "servicos", "especialidades", "produtos", "promocao", "promocaoCodigo", "promocaoValidade", "descricao"]) {
      const input = $(id);
      if (input) input.value = partner[id] ?? "";
    }
    $("emergencia").checked = Boolean(partner.atendeEmergencia);
    $("publico").checked = Boolean(partner.publico);
    ui.verification.textContent = partner.verificado ? "✓ Perfil verificado" : partner.publico ? "Em verificação" : "Perfil não publicado";
    ui.verification.classList.toggle("ativo", Boolean(partner.verificado));
  }

  async function load() {
    const data = await api();
    tags = data.tags || [];
    partner = data.parceiro || {};
    ui.name.textContent = partner.nome;
    ui.location.textContent = [partner.cidade, partner.estado].filter(Boolean).join(" - ") || partner.email;
    ui.total.textContent = data.resumo.total;
    ui.stock.textContent = data.resumo.estoque;
    ui.sold.textContent = data.resumo.vendidas;
    ui.active.textContent = data.resumo.ativadas;
    fill();
    render();
  }

  async function sale(code) {
    if (!confirm(`Confirmar a venda da tag ${code}?`)) return;
    try {
      const data = await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao: "venda", codigo: code }) });
      notify(data.mensagem);
      await load();
      if (confirm("Venda registrada. Deseja abrir agora a ativação assistida?")) location.href = data.urlAtivacao;
    } catch (error) { notify(error.message, true); }
  }

  ui.profile.onsubmit = async event => {
    event.preventDefault();
    const payload = {
      acao: "salvar-perfil-publico", categoria: $("categoria").value, whatsapp: $("whatsapp").value, endereco: $("endereco").value,
      cep: $("cep").value, bairro: $("bairro").value, cidade: $("cidade").value, estado: $("estado").value,
      latitude: $("latitude").value, longitude: $("longitude").value, horarios: $("horarios").value, servicos: $("servicos").value,
      especialidades: $("especialidades").value, produtos: $("produtos").value, promocao: $("promocao").value,
      promocaoCodigo: $("promocaoCodigo").value, promocaoValidade: $("promocaoValidade").value, descricao: $("descricao").value,
      atendeEmergencia: $("emergencia").checked, publico: $("publico").checked
    };
    try {
      const data = await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      notify(data.mensagem, false, ui.profileMessage);
      await load();
    } catch (error) { notify(error.message, true, ui.profileMessage); }
  };

  $("localizarEndereco").onclick = async () => {
    try {
      let address = [$("endereco").value, $("cidade").value, $("estado").value, "Brasil"].filter(Boolean).join(", ");
      const cep = $("cep").value.replace(/\D/g, "");
      if (cep.length === 8) {
        const data = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(response => response.json());
        if (!data.erro) {
          $("bairro").value = data.bairro || $("bairro").value;
          $("cidade").value = data.localidade || $("cidade").value;
          $("estado").value = data.uf || $("estado").value;
          address = [data.logradouro, data.bairro, data.localidade, data.uf, "Brasil"].filter(Boolean).join(", ");
        }
      }
      const params = new URLSearchParams({ q: address, format: "jsonv2", limit: "1", countrycodes: "br" });
      const result = await fetch(`https://nominatim.openstreetmap.org/search?${params}`).then(response => response.json());
      if (!result.length) throw new Error("Endereço não localizado.");
      $("latitude").value = result[0].lat;
      $("longitude").value = result[0].lon;
      notify("Endereço localizado. Salve o perfil para confirmar.", false, ui.profileMessage);
    } catch (error) { notify(error.message, true, ui.profileMessage); }
  };

  ui.search.oninput = render;
  ui.logout.onclick = async () => {
    await fetch("/api/parceiro-login", { method: "DELETE", credentials: "same-origin" });
    location.replace("/parceiro");
  };
  load().catch(error => notify(error.message, true));
})();
