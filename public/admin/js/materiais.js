(() => {
  const ui = window.BirxAdmin;
  const state = { materiais: [] };
  const $ = (id) => document.getElementById(id);
  const acesso = $("acessoMateriais");
  const painel = $("painelMateriais");
  const modal = $("modalMaterial");
  const form = $("formMaterial");

  function renderCategorias() {
    const select = $("filtroCategoria");
    const atual = select.value;
    const categorias = [...new Set(state.materiais.map((m) => m.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    select.innerHTML = '<option value="">Todas as categorias</option>' + categorias.map((c) => `<option value="${ui.escapeHtml(c)}">${ui.escapeHtml(c)}</option>`).join("");
    select.value = categorias.includes(atual) ? atual : "";
  }

  function render() {
    const busca = $("buscaMaterial").value.trim().toLowerCase();
    const categoria = $("filtroCategoria").value;
    const filtrados = state.materiais.filter((m) => {
      const termo = `${m.nome} ${m.codigo || ""}`.toLowerCase();
      return (!busca || termo.includes(busca)) && (!categoria || m.categoria === categoria);
    });

    $("listaMateriais").innerHTML = filtrados.map((m) => {
      const baixo = Number(m.estoque) <= Number(m.estoque_minimo);
      return `<tr>
        <td><div class="material-name"><strong>${ui.escapeHtml(m.nome)}</strong><small>${ui.escapeHtml(m.codigo || "Sem código")}</small></div></td>
        <td>${ui.escapeHtml(m.categoria)}</td>
        <td class="${baixo ? "stock-low" : ""}">${ui.qty.format(Number(m.estoque))} ${ui.escapeHtml(m.unidade)}</td>
        <td>${ui.qty.format(Number(m.estoque_minimo))} ${ui.escapeHtml(m.unidade)}</td>
        <td>${ui.money.format(Number(m.custo_medio))}</td>
        <td>${ui.money.format(Number(m.estoque) * Number(m.custo_medio))}</td>
        <td><div class="row-actions"><button class="edit-btn" data-editar="${m.id}">Editar</button><button class="delete-btn" data-excluir="${m.id}">Arquivar</button></div></td>
      </tr>`;
    }).join("");
    $("materiaisVazio").hidden = filtrados.length > 0;
  }

  async function carregar() {
    const data = await ui.api('/api/materiais');
    state.materiais = data.materiais || [];
    $("statTotal").textContent = data.resumo?.total ?? state.materiais.length;
    $("statValor").textContent = ui.money.format(Number(data.resumo?.valor_estoque || 0));
    $("statBaixo").textContent = data.resumo?.abaixo_minimo ?? 0;
    renderCategorias();
    render();
  }

  function abrir(material = null) {
    form.reset();
    $("materialId").value = material?.id || "";
    $("tituloModal").textContent = material ? "Editar material" : "Novo material";
    $("nome").value = material?.nome || "";
    $("categoria").value = material?.categoria || "";
    $("codigo").value = material?.codigo || "";
    $("unidade").value = material?.unidade || "un";
    $("estoque").value = material?.estoque ?? 0;
    $("estoqueMinimo").value = material?.estoque_minimo ?? 0;
    $("custoMedio").value = material?.custo_medio ?? 0;
    $("fornecedorPrincipal").value = material?.fornecedor_principal || "";
    $("observacoes").value = material?.observacoes || "";
    $("mensagemModal").hidden = true;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function fechar() { modal.hidden = true; document.body.style.overflow = ""; }

  $("novoMaterial").addEventListener("click", () => abrir());
  $("buscaMaterial").addEventListener("input", render);
  $("filtroCategoria").addEventListener("change", render);
  document.querySelectorAll("[data-fechar-modal]").forEach((el) => el.addEventListener("click", fechar));

  $("listaMateriais").addEventListener("click", async (event) => {
    const edit = event.target.closest("[data-editar]");
    if (edit) return abrir(state.materiais.find((m) => String(m.id) === edit.dataset.editar));
    const del = event.target.closest("[data-excluir]");
    if (!del) return;
    const material = state.materiais.find((m) => String(m.id) === del.dataset.excluir);
    if (!material || !confirm(`Arquivar ${material.nome}? O histórico será preservado.`)) return;
    try { await ui.api(`/api/materiais?id=${material.id}`, { method: "DELETE" }); await carregar(); ui.feedback($("mensagemMateriais"), "Material arquivado."); }
    catch (error) { ui.feedback($("mensagemMateriais"), error.message, true); }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("materialId").value;
    const payload = { id: id || undefined, nome: $("nome").value, categoria: $("categoria").value, codigo: $("codigo").value, unidade: $("unidade").value, estoque: $("estoque").value, estoque_minimo: $("estoqueMinimo").value, custo_medio: $("custoMedio").value, fornecedor_principal: $("fornecedorPrincipal").value, observacoes: $("observacoes").value };
    try { await ui.api('/api/materiais', { method: id ? "PUT" : "POST", body: JSON.stringify(payload) }); fechar(); await carregar(); ui.feedback($("mensagemMateriais"), id ? "Material atualizado." : "Material cadastrado."); }
    catch (error) { ui.feedback($("mensagemModal"), error.message, true); }
  });

  (async () => {
    acesso.hidden = true;
    $("novoMaterial").hidden = true;
    if (!(await ui.requireAuth())) return;
    try { await carregar(); painel.hidden = false; $("novoMaterial").hidden = false; }
    catch (error) { ui.feedback($("mensagemMateriais"), error.message, true); }
  })();
})();
