const parametros = new URLSearchParams(window.location.search);

const codigoTag = parametros
  .get("tag")
  ?.trim()
  .toUpperCase();

const formulario = document.getElementById(
  "formularioAtivacao"
);

const indicadorEtapa = document.getElementById(
  "indicadorEtapa"
);

const tituloEtapa = document.getElementById(
  "tituloEtapa"
);

const descricaoEtapa = document.getElementById(
  "descricaoEtapa"
);

const codigoTagExibido = document.getElementById(
  "codigoTagExibido"
);

const mensagemFormulario = document.getElementById(
  "mensagemFormulario"
);

const botaoContinuar = document.getElementById(
  "botaoContinuar"
);

const botaoVoltar = document.getElementById(
  "botaoVoltar"
);

const telefoneTutor = document.getElementById(
  "telefoneTutor"
);

const emailTutor = document.getElementById(
  "emailTutor"
);

const cepTutor = document.getElementById(
  "cepTutor"
);

const mensagemCep = document.getElementById(
  "mensagemCep"
);

const logradouroTutor = document.getElementById(
  "logradouroTutor"
);

const bairroTutor = document.getElementById(
  "bairroTutor"
);

const cidadePet = document.getElementById(
  "cidadePet"
);

const estadoTutor = document.getElementById(
  "estadoTutor"
);

const numeroTutor = document.getElementById(
  "numeroTutor"
);

const complementoTutor = document.getElementById(
  "complementoTutor"
);

const fotoPet = document.getElementById(
  "fotoPet"
);

const previewFoto = document.getElementById(
  "previewFoto"
);

const imagemPreview = document.getElementById(
  "imagemPreview"
);

const botaoRemoverFoto = document.getElementById(
  "botaoRemoverFoto"
);

const etapas = [
  document.getElementById("etapa1"),
  document.getElementById("etapa2"),
  document.getElementById("etapa3")
];

const textosEtapas = [
  [
    "Ative sua Tag BIRX",
    "Primeiro, conte algumas informações sobre o seu pet."
  ],
  [
    "Dados do tutor",
    "Informe como você poderá ser localizado caso o pet seja encontrado."
  ],
  [
    "Detalhes importantes",
    "Complete o perfil com informações que ajudam na identificação."
  ]
];

const tiposImagemPermitidos = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const tamanhoMaximoFoto =
  5 * 1024 * 1024;

let etapaAtual = 1;
let cepValido = false;
let consultaCepEmAndamento = false;
let ultimoCepConsultado = "";
let arquivoFotoSelecionado = null;
let enderecoPreviewFoto = "";

iniciar();

function iniciar() {
  if (!codigoTag) {
    mostrarErroInicial(
      "Código da tag não informado."
    );

    return;
  }

  codigoTagExibido.textContent = codigoTag;

  formulario.addEventListener(
    "submit",
    aoEnviarFormulario
  );

  botaoVoltar.addEventListener(
    "click",
    voltarEtapa
  );

  telefoneTutor.addEventListener(
    "input",
    () => {
      telefoneTutor.value = formatarTelefone(
        telefoneTutor.value
      );
    }
  );

  emailTutor.addEventListener(
    "blur",
    () => {
      emailTutor.value = normalizarEmail(
        emailTutor.value
      );
    }
  );

  cepTutor.addEventListener(
    "input",
    aoDigitarCep
  );

  cepTutor.addEventListener(
    "blur",
    consultarCepAoSair
  );

  fotoPet.addEventListener(
    "change",
    aoSelecionarFoto
  );

  botaoRemoverFoto.addEventListener(
    "click",
    removerFotoSelecionada
  );

  atualizarEtapa();
}

async function aoEnviarFormulario(evento) {
  evento.preventDefault();
  limparMensagem();

  if (!validarEtapaAtual()) {
    return;
  }

  if (etapaAtual < 3) {
    etapaAtual += 1;

    atualizarEtapa();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    return;
  }

  await concluirAtivacao();
}

function voltarEtapa() {
  if (etapaAtual <= 1) {
    return;
  }

  etapaAtual -= 1;

  limparMensagem();
  atualizarEtapa();
}

function aoSelecionarFoto() {
  limparMensagem();

  const arquivo = fotoPet.files?.[0];

  if (!arquivo) {
    removerFotoSelecionada();
    return;
  }

  if (
    !tiposImagemPermitidos.includes(
      arquivo.type
    )
  ) {
    removerFotoSelecionada();

    mostrarMensagem(
      "Escolha uma imagem JPG, PNG ou WEBP."
    );

    fotoPet.focus();
    return;
  }

  if (arquivo.size > tamanhoMaximoFoto) {
    removerFotoSelecionada();

    mostrarMensagem(
      "A foto deve ter no máximo 5 MB."
    );

    fotoPet.focus();
    return;
  }

  arquivoFotoSelecionado = arquivo;

  if (enderecoPreviewFoto) {
    URL.revokeObjectURL(
      enderecoPreviewFoto
    );
  }

  enderecoPreviewFoto =
    URL.createObjectURL(arquivo);

  imagemPreview.src =
    enderecoPreviewFoto;

  previewFoto.classList.remove(
    "escondido"
  );
}

function removerFotoSelecionada() {
  arquivoFotoSelecionado = null;
  fotoPet.value = "";

  imagemPreview.removeAttribute(
    "src"
  );

  previewFoto.classList.add(
    "escondido"
  );

  if (enderecoPreviewFoto) {
    URL.revokeObjectURL(
      enderecoPreviewFoto
    );

    enderecoPreviewFoto = "";
  }
}

function aoDigitarCep() {
  cepTutor.value = formatarCep(
    cepTutor.value
  );

  const cep = somenteNumeros(
    cepTutor.value
  );

  if (cep !== ultimoCepConsultado) {
    cepValido = false;
    limparEndereco();
  }

  if (cep.length < 8) {
    mensagemCep.textContent = "";
    return;
  }

  consultarCep(cep);
}

function consultarCepAoSair() {
  const cep = somenteNumeros(
    cepTutor.value
  );

  if (
    cep.length === 8 &&
    !cepValido &&
    !consultaCepEmAndamento
  ) {
    consultarCep(cep);
  }
}

function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor)
    .slice(0, 11);

  if (!numeros) {
    return "";
  }

  if (numeros.length <= 2) {
    return "(" + numeros;
  }

  const ddd = numeros.slice(0, 2);
  const restante = numeros.slice(2);

  if (restante.length <= 4) {
    return (
      "(" +
      ddd +
      ") " +
      restante
    );
  }

  if (numeros.length <= 10) {
    return (
      "(" +
      ddd +
      ") " +
      restante.slice(0, 4) +
      "-" +
      restante.slice(4, 8)
    );
  }

  return (
    "(" +
    ddd +
    ") " +
    restante.slice(0, 5) +
    "-" +
    restante.slice(5, 9)
  );
}

function formatarCep(valor) {
  const numeros = somenteNumeros(valor)
    .slice(0, 8);

  if (numeros.length <= 5) {
    return numeros;
  }

  return (
    numeros.slice(0, 5) +
    "-" +
    numeros.slice(5)
  );
}

function somenteNumeros(valor) {
  return String(valor || "")
    .replace(/\D/g, "");
}

function normalizarEmail(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function emailValido(valor) {
  const email = normalizarEmail(valor);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

async function consultarCep(cep) {
  if (
    consultaCepEmAndamento ||
    cep.length !== 8
  ) {
    return;
  }

  consultaCepEmAndamento = true;
  cepValido = false;

  mensagemCep.textContent =
    "Buscando endereço...";

  botaoContinuar.disabled = true;

  try {
    const resposta = await fetch(
      "https://viacep.com.br/ws/" +
      encodeURIComponent(cep) +
      "/json/"
    );

    if (!resposta.ok) {
      throw new Error(
        "Não foi possível consultar o CEP."
      );
    }

    const endereco =
      await resposta.json();

    if (endereco.erro) {
      throw new Error(
        "CEP não encontrado."
      );
    }

    ultimoCepConsultado = cep;

    logradouroTutor.value =
      endereco.logradouro || "";

    bairroTutor.value =
      endereco.bairro || "";

    cidadePet.value =
      endereco.localidade || "";

    estadoTutor.value =
      endereco.uf || "";

    cepValido = true;

    mensagemCep.textContent =
      "Endereço encontrado.";

    numeroTutor.focus();
  } catch (erro) {
    ultimoCepConsultado = "";

    limparEndereco();

    mensagemCep.textContent =
      erro.message ||
      "Não foi possível consultar o CEP.";
  } finally {
    consultaCepEmAndamento = false;
    botaoContinuar.disabled = false;
  }
}

function limparEndereco() {
  logradouroTutor.value = "";
  bairroTutor.value = "";
  cidadePet.value = "";
  estadoTutor.value = "";
}

function atualizarEtapa() {
  etapas.forEach(
    (etapa, indice) => {
      etapa.classList.toggle(
        "ativa",
        indice === etapaAtual - 1
      );
    }
  );

  indicadorEtapa.textContent =
    "Etapa " +
    etapaAtual +
    " de 3";

  tituloEtapa.textContent =
    textosEtapas[etapaAtual - 1][0];

  descricaoEtapa.textContent =
    textosEtapas[etapaAtual - 1][1];

  botaoVoltar.classList.toggle(
    "escondido",
    etapaAtual === 1
  );

  botaoContinuar.textContent =
    etapaAtual === 3
      ? "Concluir cadastro"
      : "Continuar";
}

function validarEtapaAtual() {
  if (etapaAtual === 1) {
    if (!valor("nomePet")) {
      return erroCampo(
        "Informe o nome do pet.",
        "nomePet"
      );
    }

    if (!valor("especiePet")) {
      return erroCampo(
        "Selecione a espécie do pet.",
        "especiePet"
      );
    }

    if (
      arquivoFotoSelecionado &&
      !tiposImagemPermitidos.includes(
        arquivoFotoSelecionado.type
      )
    ) {
      return erroCampo(
        "Escolha uma imagem JPG, PNG ou WEBP.",
        "fotoPet"
      );
    }

    if (
      arquivoFotoSelecionado &&
      arquivoFotoSelecionado.size >
        tamanhoMaximoFoto
    ) {
      return erroCampo(
        "A foto deve ter no máximo 5 MB.",
        "fotoPet"
      );
    }
  }

  if (etapaAtual === 2) {
    if (!valor("nomeTutor")) {
      return erroCampo(
        "Informe o nome do tutor.",
        "nomeTutor"
      );
    }

    if (
      somenteNumeros(
        telefoneTutor.value
      ).length !== 11
    ) {
      return erroCampo(
        "Informe um WhatsApp válido com DDD e 11 números.",
        "telefoneTutor"
      );
    }

    if (!normalizarEmail(emailTutor.value)) {
      return erroCampo(
        "Informe seu e-mail.",
        "emailTutor"
      );
    }

    if (!emailValido(emailTutor.value)) {
      return erroCampo(
        "Informe um e-mail válido.",
        "emailTutor"
      );
    }

    emailTutor.value =
      normalizarEmail(emailTutor.value);

    if (
      somenteNumeros(
        cepTutor.value
      ).length !== 8
    ) {
      return erroCampo(
        "Informe um CEP válido com 8 números.",
        "cepTutor"
      );
    }

    if (consultaCepEmAndamento) {
      mostrarMensagem(
        "Aguarde a consulta do CEP terminar."
      );

      return false;
    }

    if (!cepValido) {
      return erroCampo(
        "Consulte um CEP válido antes de continuar.",
        "cepTutor"
      );
    }

    if (
      !cidadePet.value.trim() ||
      !estadoTutor.value.trim()
    ) {
      mostrarMensagem(
        "Não foi possível identificar a cidade e o estado."
      );

      return false;
    }

    if (!numeroTutor.value.trim()) {
      return erroCampo(
        "Informe o número do endereço.",
        "numeroTutor"
      );
    }
  }

  return true;
}

function valor(id) {
  return document
    .getElementById(id)
    .value
    .trim();
}

function erroCampo(mensagem, id) {
  mostrarMensagem(mensagem);

  document
    .getElementById(id)
    .focus();

  return false;
}

async function enviarFoto() {
  if (!arquivoFotoSelecionado) {
    return "";
  }

  const dadosFoto = new FormData();

  dadosFoto.append(
    "foto",
    arquivoFotoSelecionado
  );

  dadosFoto.append(
    "codigoTag",
    codigoTag
  );

  const resposta = await fetch(
    "/api/upload",
    {
      method: "POST",
      body: dadosFoto
    }
  );

  const resultado =
    await lerRespostaJson(resposta);

  if (
    !resposta.ok ||
    !resultado.sucesso
  ) {
    throw new Error(
      resultado.mensagem ||
      "Não foi possível enviar a foto."
    );
  }

  if (!resultado.fotoUrl) {
    throw new Error(
      "A Cloudinary não retornou o endereço da foto."
    );
  }

  return resultado.fotoUrl;
}

async function concluirAtivacao() {
  botaoContinuar.disabled = true;
  botaoVoltar.disabled = true;

  try {
    let fotoUrl = "";

    if (arquivoFotoSelecionado) {
      botaoContinuar.textContent =
        "Enviando foto...";

      fotoUrl = await enviarFoto();
    }

    botaoContinuar.textContent =
      "Salvando cadastro...";

    const dados = {
      codigoTag,

      nomePet: valor("nomePet"),
      especiePet: valor("especiePet"),

      nomeTutor: valor("nomeTutor"),

      whatsapp: somenteNumeros(
        telefoneTutor.value
      ),

      email: normalizarEmail(
        emailTutor.value
      ),

      cep: somenteNumeros(
        cepTutor.value
      ),

      logradouro:
        logradouroTutor.value.trim(),

      bairro:
        bairroTutor.value.trim(),

      cidade:
        cidadePet.value.trim(),

      estado:
        estadoTutor.value
          .trim()
          .toUpperCase(),

      numero:
        numeroTutor.value.trim(),

      complemento:
        complementoTutor.value.trim(),

      racaPet: valor("racaPet"),
      sexoPet: valor("sexoPet"),
      idadePet: valor("idadePet"),

      comportamentoPet:
        valor("comportamentoPet"),

      fotoUrl
    };

    const resposta = await fetch(
      "/api/ativar",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify(dados)
      }
    );

    const resultado =
      await lerRespostaJson(resposta);

    if (!resposta.ok) {
      throw new Error(
        resultado.mensagem ||
        "Não foi possível concluir a ativação."
      );
    }

    mostrarSucesso(
      resultado.mensagem ||
      "Os dados foram salvos com sucesso."
    );
  } catch (erro) {
    mostrarMensagem(
      erro.message ||
      "Não foi possível concluir a ativação."
    );

    botaoContinuar.disabled = false;
    botaoVoltar.disabled = false;

    botaoContinuar.textContent =
      "Concluir cadastro";
  }
}

async function lerRespostaJson(resposta) {
  const texto = await resposta.text();

  if (!texto) {
    return {};
  }

  try {
    return JSON.parse(texto);
  } catch {
    throw new Error(
      "O servidor retornou uma resposta inválida."
    );
  }
}

function mostrarMensagem(mensagem) {
  mensagemFormulario.textContent =
    mensagem;
}

function limparMensagem() {
  mensagemFormulario.textContent = "";
}

function mostrarErroInicial(mensagem) {
  codigoTagExibido.textContent =
    "Não identificada";

  tituloEtapa.textContent =
    "Não foi possível ativar a tag";

  descricaoEtapa.textContent =
    mensagem;

  formulario.textContent =
    "Verifique se o endereço possui o código correto da tag.";
}

function mostrarSucesso(mensagem) {
  if (enderecoPreviewFoto) {
    URL.revokeObjectURL(
      enderecoPreviewFoto
    );

    enderecoPreviewFoto = "";
  }

  indicadorEtapa.textContent =
    "Ativação concluída";

  tituloEtapa.textContent =
    "Tag ativada com sucesso!";

  descricaoEtapa.textContent =
    "Seu pet foi cadastrado e sua tag já está funcionando.";

  formulario.replaceChildren();

  const caixa =
    document.createElement("div");

  caixa.className =
    "estado-sucesso";

  const titulo =
    document.createElement("h2");

  titulo.textContent =
    "Cadastro finalizado";

  const texto =
    document.createElement("p");

  texto.textContent = mensagem;

  const link =
    document.createElement("a");

  link.className =
    "botao-principal";

  link.href = "/tutor.html";

  link.textContent =
    "Ir para meu painel";

  caixa.append(
    titulo,
    texto,
    link
  );

  formulario.appendChild(caixa);
}