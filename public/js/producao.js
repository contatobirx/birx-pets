(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const ui = {
    access: $("acesso"),
    accessForm: $("formAcesso"),
    key: $("chaveAdmin"),
    accessMessage: $("mensagemAcesso"),
    panel: $("painel"),
    batch: $("lote"),
    refresh: $("atualizarLotes"),
    summary: $("resumoLote"),
    total: $("quantidadeLote"),
    nfc: $("quantidadeNfc"),
    stock: $("quantidadeEstoque"),
    active: $("quantidadeAtivadas"),
    showCode: $("mostrarCodigo"),
    labels: $("gerarAdesivos"),
    conference: $("gerarConferencia"),
    message: $("mensagem"),
  };

  let token = sessionStorage.getItem("orbitek_tag_admin") || "";
  let batches = [];

  function notify(message, error = false, target = ui.message) {
    target.textContent = message;
    target.classList.toggle("erro", error);
    target.hidden = false;
    clearTimeout(target._hideTimer);
    target._hideTimer = setTimeout(() => { target.hidden = true; }, 6000);
  }

  async function readError(response) {
    const type = response.headers.get("content-type") || "";
    if (type.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      return data.mensagem || `Erro HTTP ${response.status}.`;
    }
    return (await response.text().catch(() => "")).slice(0, 300) || `Erro HTTP ${response.status}.`;
  }

  async function api(url) {
    const response = await fetch(url, {
      headers: { "X-BIRX-Admin": token, Accept: "application/json" },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível concluir.");
    return data;
  }

  function selectedBatch() {
    return batches.find((item) => item.lote === ui.batch.value) || null;
  }

  function renderSummary() {
    const batch = selectedBatch();
    ui.summary.hidden = !batch;
    if (!batch) return;
    ui.total.textContent = Number(batch.quantidade || 0);
    ui.nfc.textContent = Number(batch.quantidadeNfc || 0);
    ui.stock.textContent = Number(batch.estoque || 0);
    ui.active.textContent = Number(batch.ativadas || 0);
  }

  async function loadBatches() {
    const oldText = ui.refresh.textContent;
    ui.refresh.disabled = true;
    ui.refresh.textContent = "Atualizando...";
    try {
      const previous = ui.batch.value;
      const data = await api(`/api/producao/lotes?_=${Date.now()}`);
      batches = data.lotes || [];
      ui.batch.innerHTML = batches.length
        ? `<option value="">Selecione um lote</option>${batches.map((item) => `<option value="${String(item.lote).replaceAll('"', '&quot;')}">${item.lote} — ${item.quantidade} tags</option>`).join("")}`
        : `<option value="">Nenhum lote cadastrado</option>`;
      if (previous && batches.some((item) => item.lote === previous)) ui.batch.value = previous;
      renderSummary();
    } finally {
      ui.refresh.disabled = false;
      ui.refresh.textContent = oldText;
    }
  }

  function filenameFromDisposition(disposition, fallback) {
    const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8?.[1]) return decodeURIComponent(utf8[1]);
    return disposition.match(/filename="?([^";]+)"?/i)?.[1] || fallback;
  }

  async function download(url, button, loadingText, fallbackName, successMessage) {
    if (!ui.batch.value) {
      notify("Selecione um lote antes de exportar.", true);
      ui.batch.focus();
      return;
    }

    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = loadingText;
    try {
      const response = await fetch(url, {
        headers: { "X-BIRX-Admin": token },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(await readError(response));
      const blob = await response.blob();
      if (!blob.size) throw new Error("O arquivo gerado veio vazio.");
      const filename = filenameFromDisposition(response.headers.get("content-disposition") || "", fallbackName);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      notify(successMessage);
    } catch (error) {
      console.error(error);
      notify(error.message || "Não foi possível gerar o arquivo.", true);
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  }

  ui.accessForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    token = ui.key.value.trim();
    try {
      await loadBatches();
      sessionStorage.setItem("orbitek_tag_admin", token);
      ui.access.hidden = true;
      ui.panel.hidden = false;
    } catch (error) {
      notify(error.message, true, ui.accessMessage);
    }
  });

  ui.batch.addEventListener("change", renderSummary);
  ui.refresh.addEventListener("click", () => loadBatches().catch((error) => notify(error.message, true)));

  ui.labels.addEventListener("click", () => {
    const batch = encodeURIComponent(ui.batch.value);
    const code = ui.showCode.checked ? "1" : "0";
    download(
      `/api/producao/adesivos?lote=${batch}&codigo=${code}&_=${Date.now()}`,
      ui.labels,
      "Gerando PDF...",
      `BIRX-Adesivos-${ui.batch.value}.pdf`,
      `PDF do lote “${ui.batch.value}” gerado com sucesso.`,
    );
  });

  ui.conference.addEventListener("click", () => {
    const batch = encodeURIComponent(ui.batch.value);
    download(
      `/api/producao/conferencia?lote=${batch}&_=${Date.now()}`,
      ui.conference,
      "Gerando CSV...",
      `BIRX-Conferencia-${ui.batch.value}.csv`,
      `Lista de conferência do lote “${ui.batch.value}” gerada.`,
    );
  });

  if (token) {
    loadBatches()
      .then(() => {
        ui.access.hidden = true;
        ui.panel.hidden = false;
      })
      .catch(() => sessionStorage.removeItem("orbitek_tag_admin"));
  }
})();
