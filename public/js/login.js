const etapaEmail =
    document.getElementById("etapaEmail");

const etapaCodigo =
    document.getElementById("etapaCodigo");

const formEmail =
    document.getElementById("formEmail");

const formCodigo =
    document.getElementById("formCodigo");

const campoEmail =
    document.getElementById("email");

const campoCodigo =
    document.getElementById("codigo");

const descricaoCodigo =
    document.getElementById("descricaoCodigo");

const mensagemSistema =
    document.getElementById("mensagemSistema");

const botaoEnviarCodigo =
    document.getElementById("botaoEnviarCodigo");

const botaoEntrar =
    document.getElementById("botaoEntrar");

const botaoReenviar =
    document.getElementById("botaoReenviar");

const botaoAlterarEmail =
    document.getElementById("botaoAlterarEmail");

let emailAtual = "";

const errosOAuth = {
    "google-nao-configurado": "O login com Google ainda está sendo configurado. Use o código por e-mail.",
    "google-state-invalido": "A tentativa de login expirou. Tente novamente.",
    "google-email-invalido": "A conta Google não informou um e-mail verificado.",
    "conta-nao-encontrada": "Este e-mail Google ainda não está associado a uma Tag BIRX.",
    "google-falhou": "Não foi possível entrar com Google. Tente novamente ou use o código por e-mail."
};
const erroOAuth = new URLSearchParams(window.location.search).get("erro");
if (erroOAuth && errosOAuth[erroOAuth]) mostrarMensagem(errosOAuth[erroOAuth], "erro");

campoCodigo.addEventListener(
    "input",
    function () {
        campoCodigo.value =
            somenteNumeros(
                campoCodigo.value
            ).slice(0, 6);
    }
);

formEmail.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        const email =
            normalizarEmail(
                campoEmail.value
            );

        if (!emailValido(email)) {
            mostrarMensagem(
                "Digite um e-mail válido.",
                "erro"
            );

            return;
        }

        emailAtual = email;

        await solicitarCodigo();
    }
);

formCodigo.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        const codigo =
            somenteNumeros(
                campoCodigo.value
            );

        if (codigo.length !== 6) {
            mostrarMensagem(
                "Digite o código de 6 números.",
                "erro"
            );

            return;
        }

        await verificarCodigo(codigo);
    }
);

botaoAlterarEmail.addEventListener(
    "click",
    function () {
        campoCodigo.value = "";

        etapaCodigo.classList.add(
            "escondido"
        );

        etapaEmail.classList.remove(
            "escondido"
        );

        esconderMensagem();

        campoEmail.focus();
    }
);

botaoReenviar.addEventListener(
    "click",
    async function () {
        if (!emailAtual) {
            mostrarMensagem(
                "Informe seu e-mail novamente.",
                "erro"
            );

            return;
        }

        await solicitarCodigo();
    }
);

async function solicitarCodigo() {
    definirCarregamento(
        botaoEnviarCodigo,
        true,
        "Enviando..."
    );

    definirCarregamento(
        botaoReenviar,
        true,
        "Reenviando..."
    );

    esconderMensagem();

    try {
        const resposta = await fetch(
            "/api/login-solicitar",
            {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type":
                        "application/json",
                    Accept:
                        "application/json"
                },
                body: JSON.stringify({
                    email: emailAtual
                })
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
                "Não foi possível enviar o código."
            );
        }

        descricaoCodigo.textContent =
            `Enviamos um código para ${emailAtual}.`;

        etapaEmail.classList.add(
            "escondido"
        );

        etapaCodigo.classList.remove(
            "escondido"
        );

        mostrarMensagem(
            resultado.mensagem ||
            "Código enviado com sucesso.",
            "sucesso"
        );

        campoCodigo.focus();

        if (
            resultado.codigoDesenvolvimento
        ) {
            console.log(
                "Código de desenvolvimento:",
                resultado.codigoDesenvolvimento
            );
        }
    } catch (erro) {
        console.error(
            "Erro ao solicitar código:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível conectar ao servidor.",
            "erro"
        );
    } finally {
        definirCarregamento(
            botaoEnviarCodigo,
            false,
            "Receber código"
        );

        definirCarregamento(
            botaoReenviar,
            false,
            "Reenviar código"
        );
    }
}

async function verificarCodigo(codigo) {
    definirCarregamento(
        botaoEntrar,
        true,
        "Entrando..."
    );

    esconderMensagem();

    try {
        const resposta = await fetch(
            "/api/login-verificar",
            {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type":
                        "application/json",
                    Accept:
                        "application/json"
                },
                body: JSON.stringify({
                    email: emailAtual,
                    codigo
                })
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
                "Código inválido ou expirado."
            );
        }

        mostrarMensagem(
            "Login realizado com sucesso.",
            "sucesso"
        );

        const destino =
            resultado.redirecionarPara ||
            resultado.redirecionar ||
            "/tutor.html";

        window.location.replace(destino);
    } catch (erro) {
        console.error(
            "Erro ao verificar código:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível conectar ao servidor.",
            "erro"
        );
    } finally {
        definirCarregamento(
            botaoEntrar,
            false,
            "Entrar"
        );
    }
}

async function lerRespostaJson(resposta) {
    const tipoConteudo =
        resposta.headers.get(
            "Content-Type"
        ) || "";

    if (
        !tipoConteudo.includes(
            "application/json"
        )
    ) {
        const texto =
            await resposta.text();

        console.error(
            "Resposta inesperada da API:",
            texto
        );

        throw new Error(
            `O servidor retornou uma resposta inválida (${resposta.status}).`
        );
    }

    return resposta.json();
}

function mostrarMensagem(
    mensagem,
    tipo
) {
    mensagemSistema.textContent =
        mensagem;

    mensagemSistema.className =
        `mensagem-sistema ${tipo}`;
}

function esconderMensagem() {
    mensagemSistema.className =
        "mensagem-sistema escondido";

    mensagemSistema.textContent = "";
}

function definirCarregamento(
    botao,
    carregando,
    texto
) {
    if (!botao) {
        return;
    }

    botao.disabled = carregando;
    botao.textContent = texto;
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

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}
