(() => {
  const $ = id => document.getElementById(id);
  const form = $("formCadastro");
  const message = $("mensagem");
  const submit = form.querySelector("button[type='submit']");

  const show = (text, error = false) => {
    message.textContent = text;
    message.classList.toggle("erro", error);
    message.hidden = false;
  };

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.textContent = "Enviando…";
    message.hidden = true;
    const body = {
      nome: $("nome").value,
      categoria: $("categoria").value,
      responsavel: $("responsavel").value,
      whatsapp: $("whatsapp").value,
      email: $("email").value,
      cep: $("cep").value,
      cidade: $("cidade").value,
      estado: $("estado").value,
      endereco: $("endereco").value,
      servicos: $("servicos").value,
      produtos: $("produtos").value,
      promocao: $("promocao").value,
      descricao: $("descricao").value,
      atendeEmergencia: $("emergencia").checked,
      consentimento: $("consentimento").checked,
      site: $("site").value
    };
    try {
      const response = await fetch("/api/cadastro-parceiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.sucesso) throw new Error(data.mensagem || "Não foi possível enviar sua solicitação.");
      form.reset();
      show(data.mensagem || "Recebemos sua solicitação. Em breve a BIRX entrará em contato.");
    } catch (error) {
      show(error.message, true);
    } finally {
      submit.disabled = false;
      submit.textContent = "Enviar solicitação de parceria";
    }
  });
})();
