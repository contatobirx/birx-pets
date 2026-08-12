Exit code: 0
Wall time: 1.5 seconds
Output:
(() => {
  const ui = window.BirxAdmin;
  const $ = (id) => document.getElementById(id);

  function renderAlertas(alertas) {
    const box = $("alertasEstoque");
    if (!alertas.length) {
      box.innerHTML = '<div class="empty">Nenhum material abaixo do estoque mÃ­nimo.</div>';
      return;
    }
    box.innerHTML = alertas.map((a) => `<a class="action-card" href="/admin/estoque.html"><span class="action-icon">!</span><div><strong>${ui.escapeHtml(a.nome)}</strong><small>${ui.qty.format(Number(a.estoque))} ${ui.escapeHtml(a.unidade)} em estoque Â· mÃ­nimo ${ui.qty.format(Number(a.estoque_minimo))}</small></div><b>â†’</b></a>`).join('');
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
    renderAlertas(data.alertas || []);
  }

  load().catch((error) => {
    const box = $("dashboardMensagem");
    if (box) ui.feedback(box, error.message, true);
  });
})();

