(function () {
  "use strict";

  function marcarPaginaPronta() {
    requestAnimationFrame(() => document.body.classList.add("orbitek-pagina-pronta"));
  }

  function obterAvisoConexao() {
    let aviso = document.getElementById("orbitekConexao");
    if (aviso) return aviso;
    aviso = document.createElement("div");
    aviso.id = "orbitekConexao";
    aviso.className = "orbitek-conexao";
    aviso.setAttribute("role", "status");
    aviso.setAttribute("aria-live", "polite");
    document.body.appendChild(aviso);
    return aviso;
  }

  let temporizador;
  function exibirConexao(texto, online) {
    const aviso = obterAvisoConexao();
    window.clearTimeout(temporizador);
    aviso.textContent = texto;
    aviso.classList.toggle("online", online);
    aviso.classList.add("visivel");
    if (online) temporizador = window.setTimeout(() => aviso.classList.remove("visivel"), 2800);
  }

  window.addEventListener("offline", () => {
    exibirConexao("Você está sem internet. Algumas ações ficarão indisponíveis.", false);
  });

  window.addEventListener("online", () => {
    exibirConexao("Conexão restabelecida.", true);
  });

  document.addEventListener("DOMContentLoaded", marcarPaginaPronta, { once: true });
  window.addEventListener("pageshow", marcarPaginaPronta);
})();
