(function () {
  const botao = document.getElementById("botaoCompartilharLocalizacao");
  const tag = new URLSearchParams(window.location.search).get("tag")?.trim().toUpperCase();
  if (!botao || !tag) return;

  function avisar(mensagem, erro = false) {
    if (window.OrbitekUI?.notificar) return window.OrbitekUI.notificar(mensagem, erro ? "erro" : "sucesso");
    const toast = document.getElementById("toastPerfil");
    if (toast) { toast.textContent = mensagem; toast.classList.add("visivel"); setTimeout(() => toast.classList.remove("visivel"), 3500); }
  }

  botao.addEventListener("click", () => {
    if (!navigator.geolocation) return avisar("Este dispositivo não oferece localização.", true);
    botao.disabled = true;
    botao.textContent = "Obtendo localização...";

    navigator.geolocation.getCurrentPosition(async (posicao) => {
      try {
        const resposta = await fetch("/api/localizacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ tag, latitude: posicao.coords.latitude, longitude: posicao.coords.longitude, precisao: posicao.coords.accuracy })
        });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || "Falha ao compartilhar.");
        botao.textContent = "✓ Localização compartilhada";
        avisar("Localização enviada ao tutor com sucesso.");
      } catch (erro) {
        botao.disabled = false;
        botao.textContent = "📍 Tentar novamente";
        avisar(erro.message, true);
      }
    }, (erro) => {
      botao.disabled = false;
      botao.textContent = "📍 Compartilhar localização";
      const mensagem = erro.code === 1 ? "Permissão de localização não concedida." : "Não foi possível obter sua localização.";
      avisar(mensagem, true);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
})();
