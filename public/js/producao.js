(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const ui = {
    access: $("acesso"), accessForm: $("formAcesso"), key: $("chaveAdmin"),
    accessMessage: $("mensagemAcesso"), panel: $("painel"), batch: $("lote"),
    refresh: $("atualizarLotes"), summary: $("resumoLote"), total: $("quantidadeLote"),
    nfc: $("quantidadeNfc"), stock: $("quantidadeEstoque"), active: $("quantidadeAtivadas"),
    showCode: $("mostrarCodigo"), labels: $("gerarAdesivos"), conference: $("gerarConferencia"),
    message: $("mensagem"), printArea: $("areaImpressao"),
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

  async function api(url) {
    const response = await fetch(url, {
      headers: { "X-BIRX-Admin": token, Accept: "application/json" }, cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.sucesso) throw new Error(data.mensagem || `Erro HTTP ${response.status}.`);
    return data;
  }

  function selectedBatch() { return batches.find((item) => item.lote === ui.batch.value) || null; }
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

  function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function buildSticker(link, codigo, showCode) {
    const holder = document.createElement("div");
    holder.className = "qr-temp";
    document.body.appendChild(holder);

    new QRCode(holder, {
      text: link,
      width: 512,
      height: 512,
      correctLevel: QRCode.CorrectLevel.M,
    });

    await wait(35);
    const source = holder.querySelector("canvas");
    if (!source) {
      holder.remove();
      throw new Error("Não foi possível criar um QR Code.");
    }

    // Converte o QR para módulos brancos com fundo transparente.
    const qrCanvas = document.createElement("canvas");
    qrCanvas.width = source.width;
    qrCanvas.height = source.height;
    const qrCtx = qrCanvas.getContext("2d", { willReadFrequently: true });
    qrCtx.drawImage(source, 0, 0);
    const image = qrCtx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);

    for (let i = 0; i < image.data.length; i += 4) {
      const isDarkModule = image.data[i] < 128;
      if (isDarkModule) {
        image.data[i] = 255;
        image.data[i + 1] = 255;
        image.data[i + 2] = 255;
        image.data[i + 3] = 255;
      } else {
        image.data[i] = 255;
        image.data[i + 1] = 255;
        image.data[i + 2] = 255;
        image.data[i + 3] = 0;
      }
    }
    qrCtx.putImageData(image, 0, 0);
    holder.remove();

    // Renderiza o adesivo inteiro como imagem. Assim o círculo preto
    // aparece no PDF mesmo quando "gráficos de plano de fundo" está desligado.
    const sticker = document.createElement("canvas");
    sticker.width = 900;
    sticker.height = 900;
    const ctx = sticker.getContext("2d");
    ctx.clearRect(0, 0, sticker.width, sticker.height);

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(450, 450, 444, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 94px Arial, sans-serif";
    ctx.fillText("SCAN", 450, 112);

    const qrSize = showCode ? 590 : 625;
    const qrX = (900 - qrSize) / 2;
    const qrY = showCode ? 190 : 188;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    if (showCode) {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "500 34px Arial, sans-serif";
      ctx.fillText(codigo, 450, 826);
    }

    return sticker.toDataURL("image/png");
  }

  async function generatePrint() {
    if (!ui.batch.value) { notify("Selecione um lote antes de exportar.", true); ui.batch.focus(); return; }
    if (typeof QRCode === "undefined") { notify("A biblioteca de QR Code não carregou. Atualize a página.", true); return; }

    const oldText = ui.labels.textContent;
    ui.labels.disabled = true;
    ui.labels.textContent = "Preparando etiquetas...";
    try {
      const data = await api(`/api/producao/adesivos?lote=${encodeURIComponent(ui.batch.value)}&_=${Date.now()}`);
      ui.printArea.replaceChildren();
      ui.printArea.dataset.lote = data.lote;

      for (let i = 0; i < data.tags.length; i += 1) {
        const tag = data.tags[i];
        const label = document.createElement("div");
        label.className = "adesivo-print";
        if (i > 0 && i % 48 === 0) label.classList.add("nova-pagina");

        const img = document.createElement("img");
        img.className = "sticker-print";
        img.alt = `Adesivo QR ${tag.codigo}`;
        img.src = await buildSticker(tag.link, tag.codigo, ui.showCode.checked);
        label.appendChild(img);
        ui.printArea.appendChild(label);
      }

      notify(`${data.quantidade} etiquetas preparadas. Na janela de impressão, escolha “Salvar como PDF”, escala 100% e margens: padrão.`);
      await wait(150);
      window.print();
    } catch (error) {
      console.error(error);
      notify(error.message || "Não foi possível preparar as etiquetas.", true);
    } finally {
      ui.labels.disabled = false;
      ui.labels.textContent = oldText;
    }
  }

  async function downloadConference() {
    if (!ui.batch.value) { notify("Selecione um lote antes de exportar.", true); return; }
    const oldText = ui.conference.textContent;
    ui.conference.disabled = true; ui.conference.textContent = "Gerando CSV...";
    try {
      const response = await fetch(`/api/producao/conferencia?lote=${encodeURIComponent(ui.batch.value)}&_=${Date.now()}`, {
        headers: { "X-BIRX-Admin": token }, cache: "no-store",
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).mensagem || "Não foi possível gerar o CSV.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = `BIRX-Conferencia-${ui.batch.value}.csv`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      notify("Lista de conferência gerada.");
    } catch (error) { notify(error.message, true); }
    finally { ui.conference.disabled = false; ui.conference.textContent = oldText; }
  }

  ui.accessForm.addEventListener("submit", async (event) => {
    event.preventDefault(); token = ui.key.value.trim();
    try { await loadBatches(); sessionStorage.setItem("orbitek_tag_admin", token); ui.access.hidden = true; ui.panel.hidden = false; }
    catch (error) { notify(error.message, true, ui.accessMessage); }
  });
  ui.batch.addEventListener("change", renderSummary);
  ui.refresh.addEventListener("click", () => loadBatches().catch((error) => notify(error.message, true)));
  ui.labels.addEventListener("click", generatePrint);
  ui.conference.addEventListener("click", downloadConference);

  if (token) loadBatches().then(() => { ui.access.hidden = true; ui.panel.hidden = false; }).catch(() => sessionStorage.removeItem("orbitek_tag_admin"));
})();
