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
    return montarUrl("/t.html", {
      tag,
      origem
    });
  }

  function urlHistorico(tag, origem = "") {
    return montarUrl("/historico.html", {
      tag,
      origem
    });
  }

  function abrirPerfilTutor(tag) {
    const url = urlPerfil(tag, "tutor");

    window.location.href = url;
  }

  function abrirHistoricoTutor(tag) {
    window.location.href = urlHistorico(tag, "tutor");
  }

  function voltarDoHistorico(tag) {
    if (veioDoTutor()) {
      window.location.href = "/tutor.html";
      return;
    }

    window.location.href = urlPerfil(tag);
  }

  function voltarDoPerfil() {
    if (veioDoTutor()) {
      window.location.href = "/tutor.html";
      return;
    }

    window.location.href = "/";
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
