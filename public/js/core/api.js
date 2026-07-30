(function () {
  async function requisicao(url, opcoes = {}) {
    const {
      aceitarErroDeNegocio = false,
      redirecionarLogin = true,
      ...opcoesFetch
    } = opcoes;

    const resposta = await fetch(url, {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(opcoesFetch.headers || {})
      },
      ...opcoesFetch
    });

    const dados = await resposta.json().catch(() => ({}));

    if (
      redirecionarLogin &&
      (resposta.status === 401 || dados.autenticado === false)
    ) {
      window.location.replace("/login.html");
      throw new Error("Sessão expirada.");
    }

    if (!aceitarErroDeNegocio && (!resposta.ok || dados.sucesso === false)) {
      throw new Error(
        dados.mensagem ||
        `Erro na requisição (${resposta.status}).`
      );
    }

    return {
      ok: resposta.ok,
      statusHttp: resposta.status,
      dados
    };
  }

  async function get(url, opcoes = {}) {
    const resultado = await requisicao(url, {
      method: "GET",
      ...opcoes
    });

    return opcoes.retornarRespostaCompleta
      ? resultado
      : resultado.dados;
  }

  async function post(url, body, opcoes = {}) {
    const resultado = await requisicao(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opcoes.headers || {})
      },
      body: JSON.stringify(body),
      ...opcoes
    });

    return opcoes.retornarRespostaCompleta
      ? resultado
      : resultado.dados;
  }

  async function upload(url, formData, opcoes = {}) {
    const resultado = await requisicao(url, {
      method: "POST",
      body: formData,
      ...opcoes
    });

    return opcoes.retornarRespostaCompleta
      ? resultado
      : resultado.dados;
  }

  window.OrbitekAPI = {
    request: requisicao,
    get,
    post,
    upload
  };
})();
