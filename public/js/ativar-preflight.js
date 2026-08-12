(() => {
  const params = new URLSearchParams(location.search);
  const codigo = String(params.get('tag') || '').trim().toUpperCase();
  const form = document.getElementById('formularioAtivacao');
  const titulo = document.getElementById('tituloEtapa');
  const descricao = document.getElementById('descricaoEtapa');
  const codigoEl = document.getElementById('codigoTagExibido');
  const botao = document.getElementById('botaoContinuar');

  function bloquear(t, d) {
    if (titulo) titulo.textContent = t;
    if (descricao) descricao.textContent = d;
    if (form) {
      form.querySelectorAll('input,select,textarea,button').forEach((el) => { el.disabled = true; });
      const aviso = document.createElement('p');
      aviso.className = 'mensagem-formulario';
      aviso.textContent = d;
      form.prepend(aviso);
    }
  }

  async function validar() {
    if (!/^BIRX-\d{2}-\d{6}$/.test(codigo)) {
      bloquear('Tag inválida', 'O código informado não possui o formato de uma BIRX ID válida.');
      return;
    }

    if (botao) botao.disabled = true;
    if (codigoEl) codigoEl.textContent = codigo;

    try {
      const resposta = await fetch(`/api/tag?tag=${encodeURIComponent(codigo)}&_=${Date.now()}`, { cache: 'no-store' });
      const dados = await resposta.json().catch(() => ({}));

      if (dados.status === 'nao-ativada') {
        if (botao) botao.disabled = false;
        return;
      }

      if (dados.status === 'ativa' || dados.status === 'perdido') {
        location.replace(`/q/${encodeURIComponent(codigo)}`);
        return;
      }

      if (dados.status === 'bloqueada') {
        bloquear('Tag bloqueada', 'Esta BIRX ID está bloqueada e não pode ser ativada.');
        return;
      }

      bloquear('Não foi possível ativar', dados.mensagem || 'Esta BIRX ID não está disponível para ativação.');
    } catch {
      bloquear('Não foi possível validar a tag', 'Verifique sua conexão e tente novamente.');
    }
  }

  validar();
})();
