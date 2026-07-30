const parametros = new URLSearchParams(window.location.search);

const codigoTag = parametros
  .get("tag")
  ?.trim()
  .toUpperCase();

const estadoCarregando = document.getElementById("estadoCarregando");
const estadoErro = document.getElementById("estadoErro");
const estadoVazio = document.getElementById("estadoVazio");
const conteudoHistorico = document.getElementById("conteudoHistorico");
const tituloErro = document.getElementById("tituloErro");
const mensagemErro = document.getElementById("mensagemErro");
const descricaoTag = document.getElementById("descricaoTag");
const quantidadeLeituras = document.getElementById("quantidadeLeituras");
const ultimaLeitura = document.getElementById("ultimaLeitura");
const listaLeituras = document.getElementById("listaLeituras");
const botaoVoltar = document.getElementById("botaoVoltar");

iniciar();

async function iniciar() {
  if (!codigoTag) {
    mostrarErro(
      "Código não informado",
      "Abra esta página usando o endereço do histórico da tag."
    );

    configurarBotaoVoltar();
    return;
  }

  if (descricaoTag) {
    descricaoTag.textContent =
      `Leituras registradas para a tag ${codigoTag}`;
  }

  configurarBotaoVoltar();

  try {
    const resposta = await fetch(
      `/api/leituras?tag=${encodeURIComponent(codigoTag)}`,
      {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const resultado = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || resultado.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !resultado.sucesso) {
      mostrarErro(
        "Não foi possível carregar",
        resultado.mensagem ||
          "O histórico desta tag não pôde ser consultado."
      );

      return;
    }

    const leituras = Array.isArray(resultado.leituras)
      ? resultado.leituras
      : [];

    if (leituras.length === 0) {
      mostrarVazio();
      return;
    }

    mostrarHistorico(leituras);
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);

    mostrarErro(
      "Erro de conexão",
      "Não foi possível consultar o histórico agora."
    );
  }
}

function configurarBotaoVoltar() {
  if (!botaoVoltar) return;

  const origem = parametros.get("origem");
  const destino = origem === "tutor"
    ? "/tutor.html"
    : codigoTag
      ? `/t.html?tag=${encodeURIComponent(codigoTag)}`
      : "/";

  botaoVoltar.href = destino;
  botaoVoltar.addEventListener("click", function (evento) {
    evento.preventDefault();
    window.location.assign(destino);
  });
}

function mostrarHistorico(leituras) {
  ocultarEstados();

  conteudoHistorico?.classList.remove("escondido");

  if (quantidadeLeituras) {
    quantidadeLeituras.textContent = String(leituras.length);
  }

  if (ultimaLeitura) {
    ultimaLeitura.textContent =
      formatarDataResumida(leituras[0]?.data_hora);
  }

  if (!listaLeituras) return;

  listaLeituras.textContent = "";

  leituras.forEach(function (leitura) {
    const item = document.createElement("article");
    item.className = "item-leitura";

    const marcador = document.createElement("div");
    marcador.className = "marcador";

    const dados = document.createElement("div");
    dados.className = "dados-leitura";

    const local = document.createElement("h2");
    local.className = "local-leitura";
    local.textContent = montarLocalizacao(leitura);

    const data = document.createElement("p");
    data.className = "data-leitura";
    data.textContent = formatarDataCompleta(leitura.data_hora);

    dados.append(local, data);
    item.append(marcador, dados);
    listaLeituras.appendChild(item);
  });
}

function montarLocalizacao(leitura) {
  const cidade = String(leitura?.cidade || "").trim();
  const estado = String(leitura?.estado || "").trim();

  const local = [cidade, estado]
    .filter(Boolean)
    .join(" - ");

  return local || "Localização aproximada indisponível";
}

function formatarDataCompleta(dataHora) {
  const data = new Date(dataHora);

  if (Number.isNaN(data.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function formatarDataResumida(dataHora) {
  const data = new Date(dataHora);

  if (Number.isNaN(data.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function mostrarVazio() {
  ocultarEstados();
  estadoVazio?.classList.remove("escondido");
}

function mostrarErro(titulo, mensagem) {
  ocultarEstados();
  estadoErro?.classList.remove("escondido");

  if (tituloErro) tituloErro.textContent = titulo;
  if (mensagemErro) mensagemErro.textContent = mensagem;
}

function ocultarEstados() {
  estadoCarregando?.classList.add("escondido");
  estadoErro?.classList.add("escondido");
  estadoVazio?.classList.add("escondido");
  conteudoHistorico?.classList.add("escondido");
}
