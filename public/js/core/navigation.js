(function () {
  function obterParametros() {
    return new URLSearchParams(window.location.search);
  }

  function obterOrigem() {
    return obterParametros().get("origem") || "";
  }

  function veioDoTutor() {
    return obterOrigem() === "tutor";
  }

  function montarUrl(caminho, parametros = {}) {
    const url = new URL(caminho, window.location.origin);

    Object.entries(parametros).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== "") {
        url.searchParams.set(chave, String(valor));
      }
    });

    return `${url.pathname}${url.search}`;
  }

  function urlPerfil(tag, origem = "") {
    return montarUrl("/t.html", { tag, origem });
  }

  function urlHistorico(tag, origem = "") {
    return montarUrl("/historico.html", { tag, origem });
  }

  function abrirPerfilTutor(tag) {
    window.location.href = urlPerfil(tag, "tutor");
  }

  function abrirHistoricoTutor(tag) {
    window.location.href = urlHistorico(tag, "tutor");
  }

  function voltarDoHistorico(tag) {
    window.location.href = veioDoTutor() ? "/tutor.html" : urlPerfil(tag);
  }

  function voltarDoPerfil() {
    window.location.href = veioDoTutor() ? "/tutor.html" : "/";
  }

  function escaparHtml(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Compatibilidade do dashboard do tutor.
  window.renderizarPetsRecentes = function renderizarPetsRecentes(pets) {
    const lista = document.getElementById("listaPetsRecentes");
    if (!lista) return;

    const itens = Array.isArray(pets) ? pets : [];
    if (!itens.length) {
      lista.innerHTML = '<div class="pet-recente-vazio">Nenhum pet cadastrado recentemente.</div>';
      return;
    }

    lista.innerHTML = itens.slice(0, 3).map((pet) => {
      const tag = String(pet?.tagCodigo || pet?.tag_codigo || "").trim();
      const nome = String(pet?.nome || "Pet").trim() || "Pet";
      const especie = String(pet?.especie || "").trim();
      const raca = String(pet?.raca || "").trim();
      const foto = String(pet?.fotoUrl || pet?.foto_url || "").trim();
      const perdido = pet?.perdido === true || pet?.perdido === 1 || pet?.perdido === "1";
      const perfil = [especie, raca].filter(Boolean).join(" • ") || "Perfil BIRX";
      const avatar = foto
        ? `<img src="${escaparHtml(foto)}" alt="Foto de ${escaparHtml(nome)}" loading="lazy">`
        : `<span aria-hidden="true">${especie.toLowerCase().includes("gat") ? "🐱" : "🐶"}</span>`;

      return `
        <article class="pet-recente-card">
          <div class="pet-recente-foto">${avatar}</div>
          <div class="pet-recente-info">
            <div class="pet-recente-topo">
              <strong>${escaparHtml(nome)}</strong>
              <span>${perdido ? "Modo perdido" : "Tag ativa"}</span>
            </div>
            <p>${escaparHtml(perfil)}</p>
            <small>${escaparHtml(tag)}</small>
          </div>
          <button type="button" data-acao="ver-perfil-recente" data-tag="${escaparHtml(tag)}" aria-label="Ver perfil de ${escaparHtml(nome)}">Ver perfil</button>
        </article>`;
    }).join("");
  };

  // tutor.js começa a buscar dados assim que é executado, enquanto diversos módulos
  // ainda estão sendo carregados abaixo dele no HTML. Em alguns navegadores o primeiro
  // ciclo ficava preso no estado de skeleton e só o botão Atualizar resolvia.
  // Depois do load completo fazemos UMA recuperação automática apenas se a tela ainda
  // estiver no estado inicial. O botão já chama o mesmo carregarPainel() oficial.
  if (document.getElementById("painel2")) {
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        const nome = document.getElementById("petDestaqueNome");
        const saudacao = document.getElementById("textoSaudacao");
        const botao = document.getElementById("atualizarPainel");
        const aindaInicial =
          (nome && String(nome.textContent || "").trim() === "Seu pet") ||
          (saudacao && /carregando/i.test(String(saudacao.textContent || "")));

        if (aindaInicial && botao && !botao.disabled) {
          botao.click();
        }
      }, 700);
    }, { once: true });
  }

  window.BIRXNavigation = {
    obterOrigem,
    veioDoTutor,
    montarUrl,
    urlPerfil,
    urlHistorico,
    abrirPerfilTutor,
    abrirHistoricoTutor,
    voltarDoHistorico,
    voltarDoPerfil
  };
})();
