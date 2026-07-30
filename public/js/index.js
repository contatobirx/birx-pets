const parametros =
    new URLSearchParams(window.location.search);

const codigoTag =
    parametros.get("tag");

const mensagem =
    document.getElementById("mensagem");

const carregando =
    document.getElementById("carregando");

const botaoAtivar =
    document.getElementById("botaoAtivar");


function mostrarTagInvalida() {
    carregando.style.display = "none";

    mensagem.innerText =
        "Esta tag não foi identificada. Verifique o endereço ou fale com a Orbitek.";
}


function mostrarTagNaoAtivada() {
    carregando.style.display = "none";

    mensagem.innerText =
        "Sua tag ainda não foi ativada. Faça o cadastro para proteger seu pet.";

    botaoAtivar.href =
        `ativar.html?tag=${encodeURIComponent(codigoTag)}`;

    botaoAtivar.classList.remove("escondido");
}


function verificarTag() {
    if (!codigoTag) {
        mostrarTagInvalida();
        return;
    }

    const codigoFormatado =
        codigoTag.trim().toUpperCase();

    if (codigoFormatado === "Q7KM-92XD") {
        mostrarTagNaoAtivada();
        return;
    }

    mostrarTagInvalida();
}


verificarTag();