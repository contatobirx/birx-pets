(() => {
  const ui = window.BirxAdmin;
  const $ = (id) => document.getElementById(id);

  function renderAlertas(alertas) {
    const box = $("alertasEstoque");
    if (!box) return;

    if (!alertas.length) {
      box.innerHTML = '<div class="empty">Nenhum material abaixo do estoque mínimo. Tudo certo por aqui.</div>';
      return;
    }

    box.innerHTML = alertas.map((a) => `
      <a class="action-card" href="/admin/estoque.html">
        <span class="action-icon">!</span>
        <div>
          <strong>${ui.escapeHtml(a.nome)}</strong>
          <small>${ui.qty.format(Number(a.estoque))} ${ui.escapeHtml(a.unidade)} em estoque · mínimo ${ui.qty.format(Number(a.estoque_minimo))}</small>
        </div>
        <b>→</b>
      </a>
    `).join('');
  }

  function atualizarPrioridades(data) {
    const estoque = $("prioridadeEstoque");
    if (!estoque) return;
    const total = Number(data.materiais?.abaixo_minimo || 0);
    estoque.textContent = total > 0
      ? `${ui.qty.format(total)} material(is) exigem atenção.`
      : 'Nenhum material abaixo do mínimo.';
  }

  async function load() {
    if (!(await ui.requireAuth())) return;

    const data = await ui.api('/api/admin-dashboard');
    $("dashMateriais").textContent = ui.qty.format(Number(data.materiais?.total || 0));
    $("dashValorEstoque").textContent = ui.money.format(Number(data.materiais?.valor_estoque || 0));
    $("dashBaixoMinimo").textContent = ui.qty.format(Number(data.materiais?.abaixo_minimo || 0));
    $("dashComprasMes").textContent = ui.money.format(Number(data.compras?.valor_mes || 0));
    $("dashProdutos").textContent = ui.qty.format(Number(data.produtos?.estoque || 0));
    $("dashTags").textContent = ui.qty.format(Number(data.tags?.disponiveis || 0));

    atualizarPrioridades(data);
    renderAlertas(data.alertas || []);
  }

  load().catch((error) => {
    const box = $("dashboardMensagem");
    if (box) ui.feedback(box, error.message, true);
  });
})();
