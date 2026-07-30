(function () {
  "use strict";

  const ICONES = {
    sucesso: "✓",
    erro: "!",
    aviso: "!",
    info: "i",
  };

  function obterContainer() {
    let container = document.getElementById("orbitekNotificacoes");
    if (container) return container;

    container = document.createElement("div");
    container.id = "orbitekNotificacoes";
    container.className = "orbitek-notificacoes";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "false");
    document.body.appendChild(container);
    return container;
  }

  function notificar(texto, tipo = "info", opcoes = {}) {
    if (!texto) return null;

    const tipoNormalizado = Object.prototype.hasOwnProperty.call(ICONES, tipo)
      ? tipo
      : "info";
    const duracao = Number.isFinite(opcoes.duracao) ? opcoes.duracao : 4200;
    const container = obterContainer();
    const toast = document.createElement("div");

    toast.className = `orbitek-toast orbitek-toast-${tipoNormalizado}`;
    toast.setAttribute("role", tipoNormalizado === "erro" ? "alert" : "status");
    toast.innerHTML = `
      <span class="orbitek-toast-icone" aria-hidden="true">${ICONES[tipoNormalizado]}</span>
      <div class="orbitek-toast-conteudo">
        ${opcoes.titulo ? `<strong>${escaparHtml(opcoes.titulo)}</strong>` : ""}
        <span>${escaparHtml(texto)}</span>
      </div>
      <button class="orbitek-toast-fechar" type="button" aria-label="Fechar notificação">×</button>
      <span class="orbitek-toast-progresso" aria-hidden="true"></span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visivel"));

    const remover = () => {
      if (toast.dataset.removendo === "1") return;
      toast.dataset.removendo = "1";
      toast.classList.remove("visivel");
      window.setTimeout(() => toast.remove(), 220);
    };

    toast.querySelector(".orbitek-toast-fechar")?.addEventListener("click", remover);

    if (duracao > 0) {
      const progresso = toast.querySelector(".orbitek-toast-progresso");
      if (progresso) progresso.style.animationDuration = `${duracao}ms`;
      window.setTimeout(remover, duracao);
    }

    return { fechar: remover, elemento: toast };
  }

  function confirmarAcao(opcoes = {}) {
    return new Promise((resolve) => {
      const sobreposicao = document.createElement("div");
      sobreposicao.className = "orbitek-confirmacao-fundo";
      sobreposicao.innerHTML = `
        <section class="orbitek-confirmacao" role="alertdialog" aria-modal="true" aria-labelledby="orbitekConfirmacaoTitulo">
          <div class="orbitek-confirmacao-icone" aria-hidden="true">?</div>
          <h2 id="orbitekConfirmacaoTitulo">${escaparHtml(opcoes.titulo || "Confirmar ação")}</h2>
          <p>${escaparHtml(opcoes.mensagem || "Deseja continuar?")}</p>
          <div class="orbitek-confirmacao-acoes">
            <button class="orbitek-confirmacao-cancelar" type="button">${escaparHtml(opcoes.textoCancelar || "Cancelar")}</button>
            <button class="orbitek-confirmacao-confirmar" type="button">${escaparHtml(opcoes.textoConfirmar || "Confirmar")}</button>
          </div>
        </section>
      `;

      document.body.appendChild(sobreposicao);
      document.body.classList.add("orbitek-modal-aberto");

      const botaoCancelar = sobreposicao.querySelector(".orbitek-confirmacao-cancelar");
      const botaoConfirmar = sobreposicao.querySelector(".orbitek-confirmacao-confirmar");
      let finalizado = false;

      const finalizar = (resultado) => {
        if (finalizado) return;
        finalizado = true;
        document.removeEventListener("keydown", tratarTecla);
        sobreposicao.classList.remove("visivel");
        document.body.classList.remove("orbitek-modal-aberto");
        window.setTimeout(() => sobreposicao.remove(), 180);
        resolve(resultado);
      };

      const tratarTecla = (evento) => {
        if (evento.key === "Escape") finalizar(false);
      };

      botaoCancelar?.addEventListener("click", () => finalizar(false));
      botaoConfirmar?.addEventListener("click", () => finalizar(true));
      sobreposicao.addEventListener("click", (evento) => {
        if (evento.target === sobreposicao) finalizar(false);
      });
      document.addEventListener("keydown", tratarTecla);

      requestAnimationFrame(() => {
        sobreposicao.classList.add("visivel");
        botaoConfirmar?.focus();
      });
    });
  }

  function escaparHtml(valor) {
    return String(valor)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.OrbitekUI = {
    notificar,
    confirmar: confirmarAcao,
    sucesso: (texto, opcoes) => notificar(texto, "sucesso", opcoes),
    erro: (texto, opcoes) => notificar(texto, "erro", opcoes),
    aviso: (texto, opcoes) => notificar(texto, "aviso", opcoes),
    info: (texto, opcoes) => notificar(texto, "info", opcoes),
  };
})();
