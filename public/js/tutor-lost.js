(function () {
  const botao = document.getElementById("publicarPerdidoDestaque");
  if (!botao) return;
  botao.addEventListener("click", async () => {
    const tag = botao.dataset.tag;
    const publicar = botao.dataset.publicado !== "1";
    if (!tag) return;
    botao.disabled = true;
    try {
      const resposta = await fetch("/api/perdidos", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ tag, publicar }) });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível atualizar a publicação.");
      botao.dataset.publicado = dados.publicoPerdidos ? "1" : "0";
      botao.textContent = dados.publicoPerdidos ? "✓ Remover do diretório público" : "🌐 Publicar em pets perdidos";
      botao.classList.toggle("ativo", dados.publicoPerdidos);
      if (window.OrbitekUI?.notificar) window.OrbitekUI.notificar(dados.mensagem, "sucesso");
    } catch (erro) {
      if (window.OrbitekUI?.notificar) window.OrbitekUI.notificar(erro.message, "erro");
    } finally { botao.disabled = false; }
  });
})();
