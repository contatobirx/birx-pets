(() => {
  const ui = window.BirxAdmin;
  const state = { fornecedores: [] };
  const $ = (id) => document.getElementById(id);
  const acesso = $("acesso"), painel = $("painel"), modal = $("modal"), form = $("formFornecedor");

  function render() {
    const q = $("busca").value.trim().toLowerCase();
    const rows = state.fornecedores.filter((f) => `${f.nome} ${f.cnpj || ""} ${f.contato || ""} ${f.telefone || ""} ${f.whatsapp || ""} ${f.email || ""}`.toLowerCase().includes(q));
    $("lista").innerHTML = rows.map((f) => `<tr>
      <td><strong>${ui.escapeHtml(f.nome)}</strong>${f.site ? `<br><small class="muted">${ui.escapeHtml(f.site)}</small>` : ""}</td>
      <td>${ui.escapeHtml(f.contato || "—")}</td>
      <td>${ui.escapeHtml(f.telefone || "—")}</td>
      <td>${ui.escapeHtml(f.whatsapp || "—")}</td>
      <td>${ui.escapeHtml(f.email || "—")}</td>
      <td>${ui.escapeHtml(f.cnpj || "—")}</td>
      <td><div class="row-actions"><button data-edit="${f.id}">Editar</button><button class="secondary" data-delete="${f.id}">Arquivar</button></div></td>
    </tr>`).join("");
    $("vazio").hidden = rows.length > 0;
  }

  async function load() {
    const data = await ui.api('/api/fornecedores');
    state.fornecedores = data.fornecedores || [];
    render();
  }

  async function enter(key) {
    ui.setKey(key);
    try {
      await load();
      acesso.hidden = true;
      painel.hidden = false;
      $("novoFornecedor").hidden = false;
    } catch (e) {
      ui.clearKey();
      ui.feedback($("mensagemAcesso"), e.message, true);
    }
  }

  function open(f = null) {
    form.reset();
    $("id").value = f?.id || "";
    $("tituloModal").textContent = f ? "Editar fornecedor" : "Novo fornecedor";
    ["nome", "cnpj", "contato", "telefone", "whatsapp", "email", "site", "observacoes"].forEach((k) => $(k).value = f?.[k] || "");
    $("mensagemModal").hidden = true;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  $("formAcesso").addEventListener('submit', (e) => { e.preventDefault(); enter($("chave").value); });
  $("novoFornecedor").addEventListener('click', () => open());
  $("busca").addEventListener('input', render);
  document.querySelectorAll('[data-fechar]').forEach((el) => el.addEventListener('click', close));

  $("lista").addEventListener('click', async (e) => {
    const edit = e.target.closest('[data-edit]');
    if (edit) return open(state.fornecedores.find((f) => String(f.id) === edit.dataset.edit));
    const del = e.target.closest('[data-delete]');
    if (!del) return;
    const f = state.fornecedores.find((x) => String(x.id) === del.dataset.delete);
    if (!f || !confirm(`Arquivar ${f.nome}? O histórico de compras será preservado.`)) return;
    try {
      await ui.api(`/api/fornecedores?id=${f.id}`, { method: 'DELETE' });
      await load();
      ui.feedback($("mensagem"), 'Fornecedor arquivado.');
    } catch (err) {
      ui.feedback($("mensagem"), err.message, true);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = $("id").value;
    const payload = {
      id: id || undefined,
      nome: $("nome").value,
      cnpj: $("cnpj").value,
      contato: $("contato").value,
      telefone: $("telefone").value,
      whatsapp: $("whatsapp").value,
      email: $("email").value,
      site: $("site").value,
      observacoes: $("observacoes").value,
    };
    try {
      await ui.api('/api/fornecedores', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      close();
      await load();
      ui.feedback($("mensagem"), id ? 'Fornecedor atualizado.' : 'Fornecedor cadastrado.');
    } catch (err) {
      ui.feedback($("mensagemModal"), err.message, true);
    }
  });

  if (ui.getKey()) enter(ui.getKey());
})();
