const parametros = new URLSearchParams(window.location.search);

const codigoTag = parametros
  .get("tag")
  ?.trim()
  .toUpperCase();

const estadoCarregando = document.getElementById("estadoCarregando");
const perfilPet = document.getElementById("perfilPet");
const estadoErro = document.getElementById("estadoErro");
const tituloErro = document.getElementById("tituloErro");
const mensagemErro = document.getElementById("mensagemErro");
const botaoAtivar = document.getElementById("botaoAtivar");

iniciar();

async function iniciar() {
  if (!codigoTag) {
    mostrarErro(
      "Código não informado",
      "Não foi possível identificar o código desta tag."
    );
    return;
  }

  try {
    const resultadoApi = await consultarTag();
    const resultado = resultadoApi.dados;

    if (resultado.status === "nao-ativada") {
      mostrarTagNaoAtivada();
      return;
    }

    const perfilValido =
      resultado.status === "ativa" ||
      resultado.status === "perdido";

    if (
      !resultadoApi.ok ||
      !perfilValido ||
      !resultado.pet
    ) {
      mostrarErro(
        "Não foi possível abrir esta tag",
        resultado.mensagem ||
          "O perfil do pet não foi encontrado."
      );
      return;
    }

    preencherPerfil(resultado.pet, resultado.status);
  } catch (erro) {
    console.error("Erro ao consultar tag:", erro);

    mostrarErro(
      "Erro de conexão",
      erro?.message ||
        "Não foi possível consultar esta tag agora."
    );
  }
}

async function consultarTag() {
  const url =
    `/api/tag?tag=${encodeURIComponent(codigoTag)}`;

  if (window.OrbitekAPI?.get) {
    return window.OrbitekAPI.get(url, {
      aceitarErroDeNegocio: true,
      redirecionarLogin: false,
      retornarRespostaCompleta: true
    });
  }

  const resposta = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json"
    }
  });

  const dados = await resposta.json().catch(() => ({}));

  return {
    ok: resposta.ok,
    statusHttp: resposta.status,
    dados
  };
}

function mostrarTagNaoAtivada() {
  mostrarErro(
    "Tag ainda não ativada",
    "Esta tag ainda precisa ser cadastrada."
  );

  if (!botaoAtivar) return;

  botaoAtivar.href =
    `/ativar.html?tag=${encodeURIComponent(codigoTag)}`;

  botaoAtivar.classList.remove("escondido");
}

function preencherPerfil(pet, statusApi) {
  estadoCarregando?.classList.add("escondido");
  estadoErro?.classList.add("escondido");
  perfilPet?.classList.remove("escondido");

  definirTexto("nomePet", pet.nome || "Pet");
  definirTexto(
    "localPet",
    montarLocalizacaoSegura(pet)
  );
  definirTexto(
    "especiePet",
    pet.especie || "Não informado"
  );
  definirTexto(
    "racaPet",
    pet.raca || "Não informada"
  );
  definirTexto(
    "sexoPet",
    pet.sexo || "Não informado"
  );
  definirTexto(
    "idadePet",
    pet.idade || "Não informada"
  );
  definirTexto(
    "comportamentoPet",
    pet.comportamento ||
      "Nenhuma informação cadastrada."
  );
  definirTexto(
    "nomeTutor",
    pet.nome_tutor || "Não informado"
  );

  const estaPerdido =
    statusApi === "perdido" ||
    Number(pet.perdido) === 1;

  preencherStatus(estaPerdido);
  configurarWhatsapp(pet, estaPerdido);
  configurarFoto(pet);
  configurarModoPerdido(estaPerdido);
}

function definirTexto(id, valor) {
  const elemento = document.getElementById(id);

  if (elemento) {
    elemento.textContent = valor;
  }
}

function montarLocalizacaoSegura(pet) {
  const bairro = String(pet?.bairro || "").trim();
  const cidade = String(pet?.cidade || "").trim();
  const estado = String(pet?.estado || "")
    .trim()
    .toUpperCase();

  const cidadeEstado = [cidade, estado]
    .filter(Boolean)
    .join(" - ");

  if (bairro && cidadeEstado) {
    return `${bairro} • ${cidadeEstado}`;
  }

  return cidadeEstado ||
    bairro ||
    "Localização não informada";
}

function preencherStatus(estaPerdido) {
  const statusPet =
    document.getElementById("statusPet");

  if (!statusPet) return;

  statusPet.textContent = estaPerdido
    ? "Pet desaparecido"
    : "Estou seguro";

  statusPet.classList.toggle(
    "perdido",
    estaPerdido
  );

  statusPet.classList.toggle(
    "seguro",
    !estaPerdido
  );
}

function configurarModoPerdido(estaPerdido) {
  perfilPet?.classList.toggle(
    "modo-perdido",
    estaPerdido
  );

  let alerta =
    document.getElementById("alertaPetPerdido");

  if (!estaPerdido) {
    alerta?.remove();
    return;
  }

  if (alerta || !perfilPet) return;

  alerta = document.createElement("div");
  alerta.id = "alertaPetPerdido";
  alerta.className = "alerta-pet-perdido";

  const titulo = document.createElement("strong");
  titulo.textContent = "Estou perdido!";

  const mensagem = document.createElement("p");
  mensagem.textContent =
    "Ajude-me a voltar para casa. Entre em contato com meu tutor pelo WhatsApp.";

  alerta.append(titulo, mensagem);

  const cabecalho =
    perfilPet.querySelector(".cabecalho-pet");

  if (cabecalho) {
    cabecalho.insertAdjacentElement(
      "afterend",
      alerta
    );
  }
}

function configurarWhatsapp(pet, estaPerdido) {
  const botaoWhatsapp =
    document.getElementById("botaoWhatsapp");

  if (!botaoWhatsapp) return;

  const telefone = somenteNumeros(pet.whatsapp);

  if (!telefone) {
    botaoWhatsapp.classList.add("escondido");
    botaoWhatsapp.removeAttribute("href");
    return;
  }

  const telefoneCompleto =
    telefone.length === 10 ||
    telefone.length === 11
      ? `55${telefone}`
      : telefone;

  const nomePet = pet.nome || "o pet";

  const textoMensagem = estaPerdido
    ? `Olá! Encontrei ${nomePet}, que consta como desaparecido na Tag Orbitek ${codigoTag}.`
    : `Olá! Encontrei ${nomePet} pela Tag Orbitek ${codigoTag}.`;

  botaoWhatsapp.href =
    `https://wa.me/${telefoneCompleto}?text=${encodeURIComponent(textoMensagem)}`;

  botaoWhatsapp.textContent = estaPerdido
    ? "Avisar que encontrei este pet"
    : "Falar com o tutor pelo WhatsApp";

  botaoWhatsapp.classList.toggle(
    "destaque-perdido",
    estaPerdido
  );

  botaoWhatsapp.classList.remove("escondido");
}

function configurarFoto(pet) {
  const fotoPet = document.getElementById("fotoPet");

  if (!fotoPet || !pet.foto_url) return;

  fotoPet.textContent = "";

  const imagem = document.createElement("img");
  imagem.src = pet.foto_url;
  imagem.alt = `Foto de ${pet.nome || "pet"}`;
  imagem.loading = "lazy";
  imagem.decoding = "async";

  imagem.addEventListener("error", function () {
    imagem.remove();
  });

  fotoPet.appendChild(imagem);
}

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function mostrarErro(titulo, mensagem) {
  estadoCarregando?.classList.add("escondido");
  perfilPet?.classList.add("escondido");
  estadoErro?.classList.remove("escondido");

  if (tituloErro) {
    tituloErro.textContent = titulo;
  }

  if (mensagemErro) {
    mensagemErro.textContent = mensagem;
  }
}
