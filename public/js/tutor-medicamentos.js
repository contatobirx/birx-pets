(() => {
  const $ = (id) => document.getElementById(id);
  const ui = {
    modal: $("modalMedicamentos"), tag: $("medicamentoTag"), pet: $("medicamentoNomePet"),
    resumo: $("medicamentosResumo"), carregando: $("medicamentosCarregando"), lista: $("listaMedicamentos"), vazio: $("medicamentosVazio"),
    novo: $("novoMedicamento"), form: $("formMedicamento"), tituloForm: $("tituloFormMedicamento"), cancelar: $("cancelarFormMedicamento"), fecharForm: $("fecharFormMedicamento"), salvar: $("salvarMedicamento"),
    id: $("medicamentoId"), nome: $("medicamentoNome"), dosagem: $("medicamentoDosagem"), frequencia: $("medicamentoFrequencia"), horarios: $("medicamentoHorarios"), inicio: $("medicamentoInicio"), fim: $("medicamentoFim"), veterinario: $("medicamentoVeterinario"), observacoes: $("medicamentoObservacoes"), ativo: $("medicamentoAtivo")
  };
  let registros = [], doses = [], salvando = false, registrandoDose = false;
  const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
  const avisar = (message, type = "sucesso") => typeof window.exibirMensagem === "function" ? window.exibirMensagem(message, type) : alert(message);
  const formatDate = (value) => { if (!value) return "Sem previsão"; const [y,m,d] = value.split("-"); return `${d}/${m}/${y}`; };
  const isActive = (item) => Number(item.ativo) === 1 && (!item.dataFim || item.dataFim >= new Date().toISOString().slice(0,10));
  const localNow = () => { const now = new Date(), pad = (n) => String(n).padStart(2,"0"); return { date: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`, time: `${pad(now.getHours())}:${pad(now.getMinutes())}` }; };
  const doseLabel = { pendente: "Pendente", administrada: "Administrada", ignorada: "Ignorada" };

  function clearForm() {
    ui.form.reset(); ui.id.value = ""; ui.ativo.checked = true; ui.inicio.value = new Date().toISOString().slice(0,10);
    ui.tituloForm.textContent = "Novo medicamento"; ui.salvar.textContent = "Salvar medicamento";
  }
  function showForm(item = null) {
    clearForm();
    if (item) {
      ui.id.value = item.id; ui.nome.value = item.nome || ""; ui.dosagem.value = item.dosagem || ""; ui.frequencia.value = item.frequencia || ""; ui.horarios.value = item.horarios || ""; ui.inicio.value = item.dataInicio || ""; ui.fim.value = item.dataFim || ""; ui.veterinario.value = item.veterinario || ""; ui.observacoes.value = item.observacoes || ""; ui.ativo.checked = Number(item.ativo) === 1; ui.tituloForm.textContent = "Editar medicamento";
    }
    ui.form.hidden = false; setTimeout(() => ui.nome.focus(), 40);
  }
  function hideForm() { if (salvando) return; ui.form.hidden = true; clearForm(); }
  function render() {
    const activeCount = registros.filter(isActive).length;
    ui.resumo.textContent = registros.length ? `${registros.length} medicamento${registros.length === 1 ? "" : "s"} cadastrado${registros.length === 1 ? "" : "s"} • ${activeCount} ativo${activeCount === 1 ? "" : "s"}` : "Nenhum medicamento cadastrado.";
    ui.vazio.hidden = registros.length > 0;
    ui.lista.innerHTML = registros.map((item) => {
      const active = isActive(item), details = [item.dosagem && `<span><strong>Dose:</strong> ${escape(item.dosagem)}</span>`, `<span><strong>Frequência:</strong> ${escape(item.frequencia)}</span>`, item.horarios && `<span><strong>Horários:</strong> ${escape(item.horarios)}</span>`, `<span><strong>Início:</strong> ${formatDate(item.dataInicio)}</span>`, item.dataFim && `<span><strong>Término:</strong> ${formatDate(item.dataFim)}</span>`, item.veterinario && `<span><strong>Veterinário:</strong> ${escape(item.veterinario)}</span>`].filter(Boolean).join("");
      const medicineDoses = doses.filter((dose) => Number(dose.medicamentoId) === Number(item.id)).slice(0, 8);
      const doseHistory = medicineDoses.length ? `<div class="dose-historico"><strong>Lembretes e últimas doses</strong>${medicineDoses.map((dose) => { const time = dose.previstaEm.slice(11,16), day = formatDate(dose.previstaEm.slice(0,10)), pending = dose.status === "pendente"; return `<div class="dose-linha dose-${dose.status}"><span><b>${day} às ${time}</b><small>${doseLabel[dose.status] || dose.status}</small></span>${pending ? `<div><button type="button" data-dose="administrada" data-med="${item.id}" data-prevista="${dose.previstaEm}">✓ Dose administrada</button><button type="button" class="dose-ignorar" data-dose="ignorada" data-med="${item.id}" data-prevista="${dose.previstaEm}">Ignorar</button></div>` : ""}</div>`; }).join("")}</div>` : (active ? `<div class="dose-sem-horario">Informe horários no formato <strong>08:00 e 20:00</strong> para ativar os lembretes.</div>` : "");
      return `<article class="medicamento-card ${active ? "" : "finalizado"}"><div class="medicamento-icone">💊</div><div><div class="medicamento-topo"><h3>${escape(item.nome)}</h3><span class="medicamento-status">${active ? "Ativo" : "Finalizado"}</span></div><div class="medicamento-detalhes">${details}</div><button class="onde-comprar-atalho" type="button" data-onde-comprar="${item.id}">📍 Onde comprar ${escape(item.nome)} perto de mim</button>${item.observacoes ? `<div class="medicamento-observacoes">${escape(item.observacoes)}</div>` : ""}${doseHistory}</div><div class="medicamento-acoes"><button type="button" data-editar="${item.id}" aria-label="Editar medicamento">✏️</button><button class="excluir" type="button" data-excluir="${item.id}" aria-label="Excluir medicamento">🗑️</button></div></article>`;
    }).join("");
    ui.lista.querySelectorAll("[data-editar]").forEach((button) => button.addEventListener("click", () => showForm(registros.find((item) => String(item.id) === button.dataset.editar))));
    ui.lista.querySelectorAll("[data-excluir]").forEach((button) => button.addEventListener("click", () => remove(button.dataset.excluir)));
    ui.lista.querySelectorAll("[data-dose]").forEach((button) => button.addEventListener("click", () => registerDose(button)));
    ui.lista.querySelectorAll("[data-onde-comprar]").forEach((button) => button.addEventListener("click", () => { const item=registros.find((record)=>String(record.id)===button.dataset.ondeComprar);if(item)window.dispatchEvent(new CustomEvent("orbitek:onde-comprar",{detail:{medicamento:item.nome}})); }));
  }
  async function loadDoses() {
    const now = localNow();
    const response = await fetch(`/api/medicamento-doses?tagCodigo=${encodeURIComponent(ui.tag.value)}&data=${now.date}&hora=${now.time}`, { credentials: "same-origin" });
    const data = await response.json(); if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível carregar os lembretes."); doses = data.doses || [];
    fetch("/api/notificacoes", { credentials: "same-origin" }).then((result) => result.ok ? result.json() : null).then((notifications) => { const badge = $("contadorNotificacoes"), total = Number(notifications?.naoLidas || 0); if (!badge) return; badge.textContent = total > 99 ? "99+" : String(total); badge.hidden = total === 0; }).catch(() => {});
  }
  async function load() {
    ui.carregando.hidden = false; ui.lista.innerHTML = ""; ui.vazio.hidden = true;
    try { const response = await fetch(`/api/medicamentos?tagCodigo=${encodeURIComponent(ui.tag.value)}`, { credentials: "same-origin" }); const data = await response.json(); if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível carregar os medicamentos."); registros = data.medicamentos || []; await loadDoses(); render(); }
    catch (error) { registros = []; doses = []; render(); avisar(error.message, "erro"); }
    finally { ui.carregando.hidden = true; }
  }
  async function save(event) {
    event.preventDefault(); if (salvando) return;
    const payload = { id: ui.id.value || null, tagCodigo: ui.tag.value, nome: ui.nome.value.trim(), dosagem: ui.dosagem.value.trim(), frequencia: ui.frequencia.value.trim(), horarios: ui.horarios.value.trim(), dataInicio: ui.inicio.value, dataFim: ui.fim.value, veterinario: ui.veterinario.value.trim(), observacoes: ui.observacoes.value.trim(), ativo: ui.ativo.checked };
    if (!payload.nome || !payload.frequencia || !payload.dataInicio) return avisar("Informe medicamento, frequência e data de início.", "erro");
    salvando = true; ui.salvar.disabled = true; ui.salvar.textContent = "Salvando...";
    try { const response = await fetch("/api/medicamentos", { method: "POST", credentials: "same-origin", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) }); const data = await response.json(); if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível salvar."); salvando = false; hideForm(); avisar(data.mensagem); await load(); }
    catch (error) { avisar(error.message, "erro"); }
    finally { salvando = false; ui.salvar.disabled = false; ui.salvar.textContent = "Salvar medicamento"; }
  }
  async function remove(id) {
    if (!confirm("Deseja realmente excluir este medicamento?")) return;
    try { const response = await fetch("/api/medicamentos", { method: "DELETE", credentials: "same-origin", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id, tagCodigo: ui.tag.value }) }); const data = await response.json(); if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível excluir."); avisar(data.mensagem); await load(); }
    catch (error) { avisar(error.message, "erro"); }
  }
  async function registerDose(button) {
    if (registrandoDose) return; registrandoDose = true; button.disabled = true;
    try { const response = await fetch("/api/medicamento-doses", { method: "POST", credentials: "same-origin", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ tagCodigo: ui.tag.value, medicamentoId: button.dataset.med, previstaEm: button.dataset.prevista, status: button.dataset.dose }) }); const data = await response.json(); if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível registrar a dose."); avisar(data.mensagem); await loadDoses(); render(); }
    catch (error) { button.disabled = false; avisar(error.message, "erro"); }
    finally { registrandoDose = false; }
  }
  function close() { if (salvando) return; ui.modal.hidden = true; document.body.classList.remove("modal-aberto"); hideForm(); registros = []; doses = []; }
  window.addEventListener("orbitek:abrir-medicamentos", (event) => { ui.tag.value = event.detail?.tagCodigo || ""; ui.pet.textContent = event.detail?.nome || "Pet"; ui.modal.hidden = false; document.body.classList.add("modal-aberto"); hideForm(); load(); });
  ui.novo?.addEventListener("click", () => showForm()); ui.form?.addEventListener("submit", save); ui.cancelar?.addEventListener("click", hideForm); ui.fecharForm?.addEventListener("click", hideForm); document.querySelectorAll("[data-fechar-medicamentos]").forEach((button) => button.addEventListener("click", close));
})();
