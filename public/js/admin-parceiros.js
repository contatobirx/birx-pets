(() => {
  const $ = id => document.getElementById(id);
  const ui = {
    access: $("acesso"), accessForm: $("formAcesso"), key: $("chave"), accessMessage: $("mensagemAcesso"), panel: $("painel"),
    partnerForm: $("formParceiro"), distribution: $("formDistribuir"), partner: $("parceiroId"), codes: $("codigos"),
    list: $("lista"), empty: $("vazio"), message: $("mensagem")
  };
  let token = sessionStorage.getItem("birx_partner_admin") || "";
  let partners = [];
  const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

  function notify(text, error = false, target = ui.message, persistent = false) {
    target.textContent = text;
    target.classList.toggle("erro", error);
    target.hidden = false;
    if (!persistent) setTimeout(() => { target.hidden = true; }, 7000);
  }

  async function api(options = {}) {
    const response = await fetch("/api/admin-parceiros", { ...options, headers: { ...(options.headers || {}), "X-BIRX-Admin": token } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível concluir.");
    return data;
  }

  function vitrine(item) {
    const lines = [item.categoria, item.servicos && `Serviços: ${item.servicos}`, item.produtos && `Produtos: ${item.produtos}`, item.promocao && `Promoção: ${item.promocao}`].filter(Boolean);
    return lines.map(line => `<small>${escape(line)}</small>`).join("<br>");
  }

  function actions(item) {
    if (item.status === "pendente") return `<button data-approve="${item.id}">Aprovar e gerar acesso</button><button class="secundario" data-status="suspenso" data-id="${item.id}">Recusar</button>`;
    if (item.status === "ativo") return `<button class="secundario" data-reset="${item.id}">Novo código</button><button class="secundario" data-status="suspenso" data-id="${item.id}">Suspender</button>`;
    return `<button data-status="ativo" data-id="${item.id}">Reativar</button>`;
  }

  function render() {
    ui.empty.hidden = partners.length > 0;
    ui.partner.innerHTML = '<option value="">Selecione</option>' + partners.filter(item => item.status === "ativo").map(item => `<option value="${item.id}">${escape(item.nome)}</option>`).join("");
    ui.list.innerHTML = partners.map(item => `<tr>
      <td><strong>${escape(item.nome)}</strong><br><small>${escape([item.cidade, item.estado].filter(Boolean).join(" - "))}</small>${vitrine(item) ? `<div style="margin-top:7px">${vitrine(item)}</div>` : ""}</td>
      <td>${escape(item.email)}<br><small>${escape(item.whatsapp || "")}</small></td>
      <td><span class="status ${escape(item.status)}">${escape(item.status)}</span></td>
      <td>${Number(item.emEstoque || 0)} de ${Number(item.totalTags || 0)}</td>
      <td>${Number(item.vendidas || 0)} / ${Number(item.ativadas || 0)}</td>
      <td><div class="acoes">${actions(item)}</div></td>
    </tr>`).join("");
    ui.list.querySelectorAll("[data-approve]").forEach(button => { button.onclick = () => approve(button.dataset.approve); });
    ui.list.querySelectorAll("[data-reset]").forEach(button => { button.onclick = () => reset(button.dataset.reset); });
    ui.list.querySelectorAll("[data-status]").forEach(button => { button.onclick = () => status(button.dataset.id, button.dataset.status); });
  }

  async function load() {
    const data = await api();
    partners = data.parceiros || [];
    render();
  }

  async function copyCode(code, prefix) {
    notify(`${prefix} Código de acesso: ${code}. Copie agora; ele não será exibido novamente.`, false, ui.message, true);
    try { await navigator.clipboard?.writeText(code); } catch { /* O código continua visível para cópia manual. */ }
  }

  async function approve(id) {
    if (!confirm("Aprovar este parceiro e gerar o código de acesso ao painel?")) return;
    try {
      const data = await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao: "aprovar", id }) });
      await copyCode(data.codigoAcesso, "Parceiro aprovado.");
      await load();
    } catch (error) { notify(error.message, true); }
  }

  async function status(id, value) {
    try {
      await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao: "status", id, status: value }) });
      notify(value === "suspenso" ? "Parceiro suspenso." : "Parceiro reativado.");
      await load();
    } catch (error) { notify(error.message, true); }
  }

  async function reset(id) {
    if (!confirm("Gerar um novo código e encerrar as sessões atuais?")) return;
    try {
      const data = await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao: "redefinir", id }) });
      await copyCode(data.codigoAcesso, "Novo código gerado.");
      await load();
    } catch (error) { notify(error.message, true); }
  }

  ui.accessForm.onsubmit = async event => {
    event.preventDefault();
    token = ui.key.value.trim();
    try {
      await load();
      sessionStorage.setItem("birx_partner_admin", token);
      ui.access.hidden = true;
      ui.panel.hidden = false;
    } catch (error) { notify(error.message, true, ui.accessMessage); }
  };

  ui.partnerForm.onsubmit = async event => {
    event.preventDefault();
    const payload = { acao: "criar", nome: $("nome").value, email: $("email").value, documento: $("documento").value, whatsapp: $("whatsapp").value, cidade: $("cidade").value, estado: $("estado").value };
    try {
      const data = await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      await copyCode(data.codigoAcesso, "Parceiro criado.");
      ui.partnerForm.reset();
      await load();
    } catch (error) { notify(error.message, true); }
  };

  ui.distribution.onsubmit = async event => {
    event.preventDefault();
    try {
      const data = await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao: "distribuir", id: ui.partner.value, codigos: ui.codes.value }) });
      notify(data.mensagem);
      ui.codes.value = "";
      await load();
    } catch (error) { notify(error.message, true); }
  };

  if (token) load().then(() => { ui.access.hidden = true; ui.panel.hidden = false; }).catch(() => sessionStorage.removeItem("birx_partner_admin"));
})();
