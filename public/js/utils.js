// ===============================
// Máscara de telefone
// ===============================

function aplicarMascaraTelefone(idCampo) {

    const campo = document.getElementById(idCampo);

    if (!campo) return;

    campo.addEventListener("input", () => {

        let valor = campo.value.replace(/\D/g, "");

        valor = valor.substring(0, 11);

        if (valor.length <= 10) {

            valor = valor.replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            );

            valor = valor.replace(
                /(\d{4})(\d)/,
                "$1-$2"
            );

        } else {

            valor = valor.replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            );

            valor = valor.replace(
                /(\d{5})(\d)/,
                "$1-$2"
            );

        }

        campo.value = valor;

    });

}

// ===============================
// Retorna apenas números
// ===============================

function somenteNumeros(valor) {
    return valor.replace(/\D/g, "");
}