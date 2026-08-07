(() => {
  const state = { chave: sessionStorage.getItem("birxAdminKey") || "", materiais: [] };
  const $ = (id) => document.getElementById(id);
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const qty = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

  const acesso = $("acessoMateriais");
  const painel = $("painelMateriais");
  const formAcesso = $("formAcessoMateriais");
  const chaveInput = $("chaveAdminMateriais");
  const modal = $("modalMaterial");
  const form = $("formMaterial");

  function feedback(el, mensagem, erro = false) {
    el.textContent = mensagem;
    el.classList.toggle("error", erro);
    el.hidden = false;
  }

  async function api(path = "", options = {}) {
    const response = await fetch(`/api/materiais${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", "X-BIRX-Admin": state.chave, ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({ sucesso: false, mensagem: "Resposta inválida do servidor." }));
    if (!response.ok) throw new Error(data.mensagem || "Não foi possível concluir a operação.");
    return data;
  }

  function renderCategorias() {
    const select = $("filtroCategoria");
    const atual = select.value;
    const categorias = [...new Set(state.materiais.map((m) => m.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    select.innerHTML = '<option value="">Todas as categorias</option>' + categorias.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    select.value = categorias.includes(atual) ? atual : "";
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
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
        <td><div class="material-name"><strong>${escapeHtml(m.nome)}</strong><small>${escapeHtml(m.codigo || "Sem código")}</small></div></td>
        <td>${escapeHtml(m.categoria)}</td>
        <td class="${baixo ? "stock-low" : ""}">${qty.format(Number(m.estoque))} ${escapeHtml(m.unidade)}</td>
        <td>${qty.format(Number(m.estoque_minimo))} ${escapeHtml(m.unidade)}</td>
        <td>${money.format(Number(m.custo_medio))}</td>
        <td>${money.format(Number(m.estoque) * Number(m.custo_medio))}</td>
        <td><div class="row-actions"><button class="edit-btn" data-editar="${m.id}">Editar</button><button class="delete-btn" data-excluir="${m.id}">Arquivar</button></div></td>
      </tr>`;
    }).join("");
    $("materiaisVazio").hidden = filtrados.length > 0;
  }

  async function carregar() {
    const data = await api();
    state.materiais = data.materiais || [];
    $("statTotal").textContent = data.resumo?.total ?? state.materiais.length;
    $("statValor").textContent = money.format(Number(data.resumo?.valor_estoque || 0));
    $("statBaixo").textContent = data.resumo?.abaixo_minimo ?? 0;
    renderCategorias();
    render();
  }

  async function entrar(chave) {
    state.chave = chave.trim();
    if (!state.chave) return;
    try {
      await carregar();
      sessionStorage.setItem("birxAdminKey", state.chave);
      acesso.hidden = true;
      painel.hidden = false;
      $("novoMaterial").hidden = false;
    } catch (error) {
      sessionStorage.removeItem("birxAdminKey");
      state.chave = "";
      feedback($("mensagemAcesso"), error.message, true);
    }
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

  function fechar() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  formAcesso.addEventListener("submit", (event) => { event.preventDefault(); entrar(chaveInput.value); });
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
    try {
      await api(`?id=${material.id}`, { method: "DELETE" });
      await carregar();
    } catch (error) { feedback($("mensagemMateriais"), error.message, true); }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("materialId").value;
    const payload = {
      id: id || undefined,
      nome: $("nome").value,
      categoria: $("categoria").value,
      codigo: $("codigo").value,
      unidade: $("unidade").value,
      estoque: $("estoque").value,
      estoque_minimo: $("estoqueMinimo").value,
      custo_medio: $("custoMedio").value,
      fornecedor_principal: $("fornecedorPrincipal").value,
      observacoes: $("observacoes").value,
    };
    try {
      await api("", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
      fechar();
      await carregar();
      feedback($("mensagemMateriais"), id ? "Material atualizado." : "Material cadastrado.");
    } catch (error) { feedback($("mensagemModal"), error.message, true); }
  });

  $("novoMaterial").hidden = true;
  if (state.chave) entrar(state.chave);
})();
