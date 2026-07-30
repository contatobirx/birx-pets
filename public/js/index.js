const parametros = new URLSearchParams(window.location.search);
const codigoTag = parametros.get("tag")?.trim().toUpperCase() || "";

const mensagem = document.getElementById("mensagem");
const carregando = document.getElementById("carregando");
const botaoAtivar = document.getElementById("botaoAtivar");

function encerrarCarregamento() {
  carregando.style.display = "none";
}

function mostrarErro(texto) {
  encerrarCarregamento();
  mensagem.innerText = texto;
  botaoAtivar.classList.add("escondido");
}

function mostrarTagNaoAtivada() {
  encerrarCarregamento();
  mensagem.innerText =
    "Sua tag ainda não foi ativada. Faça o cadastro para proteger seu pet.";

  botaoAtivar.href =
    `/ativar.html?tag=${encodeURIComponent(codigoTag)}`;
  botaoAtivar.classList.remove("escondido");
}

async function verificarTag() {
  if (!codigoTag) {
    mostrarErro(
      "Esta tag não foi identificada. Verifique o endereço ou fale com a Orbitek."
    );
    return;
  }

  try {
    const resposta = await fetch(
      `/api/tag?tag=${encodeURIComponent(codigoTag)}`,
      { headers: { Accept: "application/json" } }
    );

    const resultado = await resposta.json();

    if (resultado.status === "nao-ativada") {
      mostrarTagNaoAtivada();
      return;
    }

    if (resultado.status === "ativa" || resultado.status === "perdido") {
      window.location.replace(
        `/t.html?tag=${encodeURIComponent(codigoTag)}`
      );
      return;
    }

    if (resultado.status === "bloqueada") {
      mostrarErro("Esta tag está bloqueada. Fale com a Orbitek.");
      return;
    }

    mostrarErro(
      resultado.mensagem ||
      "Esta tag não foi identificada. Verifique o endereço ou fale com a Orbitek."
    );
  } catch (erro) {
    console.error("Erro ao verificar tag:", erro);
    mostrarErro(
      "Não foi possível verificar a tag agora. Confira sua conexão e tente novamente."
    );
  }
}

verificarTag();
