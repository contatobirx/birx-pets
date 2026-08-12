(function () {
  const painel = document.getElementById("localizacaoPainel");
  const resumo = document.getElementById("localizacaoResumo");
  const historico = document.getElementById("historicoLocalizacoes");
  const botaoAtualizar = document.getElementById("atualizarLocalizacao");
  const origemTag = document.getElementById("verPerfilPublico");
  let mapa;
  let marcador;

  function formatarData(valor) {
    const data = new Date(String(valor).replace(" ", "T") + (String(valor).includes("Z") ? "" : "Z"));
    return Number.isNaN(data.getTime()) ? valor : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(data);
  }

  async function carregar() {
    const tag = origemTag?.dataset.tag;
    if (!tag || !window.L) return;
    botaoAtualizar.disabled = true;
    try {
      const resposta = await fetch(`/api/localizacoes?tag=${encodeURIComponent(tag)}`, { headers: { Accept: "application/json" }, credentials: "same-origin" });
      if (resposta.status === 401) return;
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem || "Falha ao carregar localização.");
      const locais = dados.localizacoes || [];
      painel.hidden = false;
      if (!locais.length) { resumo.textContent = "Nenhuma localização foi compartilhada para este pet."; historico.innerHTML = ""; return; }
      const atual = locais[0];
      resumo.textContent = `${formatarData(atual.criado_em)} · precisão aproximada de ${Math.round(atual.precisao_metros || 0)} m`;
      if (!mapa) {
        mapa = L.map("mapaUltimaLocalizacao").setView([atual.latitude, atual.longitude], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(mapa);
      } else mapa.setView([atual.latitude, atual.longitude], 16);
      if (marcador) marcador.setLatLng([atual.latitude, atual.longitude]);
      else marcador = L.marker([atual.latitude, atual.longitude]).addTo(mapa).bindPopup("Última localização compartilhada");
      setTimeout(() => mapa.invalidateSize(), 50);
      historico.innerHTML = locais.slice(0, 5).map((local, indice) => `<div class="localizacao-item"><strong>${indice === 0 ? "Mais recente" : `Localização ${indice + 1}`}</strong><span>${formatarData(local.criado_em)} · precisão ${Math.round(local.precisao_metros || 0)} m</span></div>`).join("");
    } catch (erro) {
      painel.hidden = false;
      resumo.textContent = erro.message;
    } finally { botaoAtualizar.disabled = false; }
  }

  botaoAtualizar?.addEventListener("click", carregar);
  const observador = new MutationObserver(() => { if (origemTag?.dataset.tag) { observador.disconnect(); carregar(); } });
  if (origemTag?.dataset.tag) carregar(); else if (origemTag) observador.observe(origemTag, { attributes: true, attributeFilter: ["data-tag"] });
})();
