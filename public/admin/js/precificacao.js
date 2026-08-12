(() => {
  const ui = window.BirxAdmin;
  const $ = (id) => document.getElementById(id);
  const state = { produtos: [], materiais: [], composicao: [] };

  function materialOptions(selected = '') {
    return '<option value="">Selecione</option>' + state.materiais.map(m => `<option value="${m.id}" ${String(m.id)===String(selected)?'selected':''}>${ui.escapeHtml(m.nome)} (${ui.escapeHtml(m.unidade)})</option>`).join('');
  }

  function addRow(item = {}) {
    const row = document.createElement('div');
    row.className = 'bom-row';
    row.innerHTML = `<select class="material" required>${materialOptions(item.material_id)}</select><input class="qtd" type="number" min="0.0001" step="0.0001" value="${item.quantidade || 1}"><strong class="custo">R$ 0,00</strong><button type="button" class="secondary remove">×</button>`;
    row.querySelector('.remove').onclick = () => { row.remove(); recalcBom(); };
    row.querySelectorAll('input,select').forEach(el => el.addEventListener('input', recalcBom));
    $('bom').appendChild(row);
    recalcBom();
  }

  function recalcBom() {
    let total = 0;
    document.querySelectorAll('.bom-row').forEach(row => {
      const id = Number(row.querySelector('.material').value);
      const qtd = Number(row.querySelector('.qtd').value || 0);
      const mat = state.materiais.find(m => Number(m.id) === id);
      const custo = qtd * Number(mat?.custo_medio || 0);
      row.querySelector('.custo').textContent = ui.money.format(custo);
      total += custo;
    });
    $('custoMateriais').textContent = ui.money.format(total);
  }

  async function loadAll() {
    if (!await ui.requireAuth()) return;
    const [p, m] = await Promise.all([ui.api('/api/produtos'), ui.api('/api/materiais')]);
    state.produtos = p.produtos || [];
    state.materiais = m.materiais || [];
    $('produto').innerHTML = state.produtos.length ? state.produtos.map(x => `<option value="${x.id}">${ui.escapeHtml(x.nome)}</option>`).join('') : '<option value="">Cadastre um produto primeiro</option>';
    if (state.produtos.length) await loadProduto();
  }

  async function loadProduto() {
    const produtoId = Number($('produto').value);
    if (!produtoId) return;
    const [c, p] = await Promise.all([
      ui.api(`/api/produto-composicao?produto_id=${produtoId}`),
      ui.api(`/api/precificacao?produto_id=${produtoId}`),
    ]);
    state.composicao = c.itens || [];
    $('bom').innerHTML = '';
    state.composicao.forEach(addRow);
    if (!state.composicao.length) addRow();
    $('custoExtra').value = Number(p.custo_extra || 0);
    $('taxa').value = Number(p.taxa_percentual || 0);
    $('margem').value = Number(p.margem_percentual || 0);
    $('precoManual').value = '';
    renderPreco(p);
  }

  function renderPreco(p) {
    $('custoMateriais').textContent = ui.money.format(Number(p.custo_materiais || 0));
    $('custoBase').textContent = ui.money.format(Number(p.custo_base || 0));
    $('precoSugerido').textContent = ui.money.format(Number(p.preco_sugerido || 0));
    $('precoVenda').textContent = ui.money.format(Number(p.preco_venda || 0));
    $('lucro').textContent = ui.money.format(Number(p.lucro || 0));
    $('margemReal').textContent = `${Number(p.margem_real || 0).toFixed(1).replace('.', ',')}%`;
  }

  $('produto').addEventListener('change', () => loadProduto().catch(e => ui.feedback($('msg'), e.message, true)));
  $('addItem').onclick = () => addRow();
  $('salvarBom').onclick = async () => {
    const produtoId = Number($('produto').value);
    const itens = [...document.querySelectorAll('.bom-row')].map(row => ({ material_id: row.querySelector('.material').value, quantidade: row.querySelector('.qtd').value })).filter(i => i.material_id && Number(i.quantidade) > 0);
    try {
      await ui.api('/api/produto-composicao', { method: 'POST', body: JSON.stringify({ produto_id: produtoId, itens }) });
      ui.feedback($('msg'), 'Composição salva. Custos recalculados.');
      await loadProduto();
    } catch (e) { ui.feedback($('msg'), e.message, true); }
  };

  $('formPreco').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await ui.api('/api/precificacao', { method: 'POST', body: JSON.stringify({
        produto_id: Number($('produto').value),
        custo_extra: $('custoExtra').value,
        taxa_percentual: $('taxa').value,
        margem_percentual: $('margem').value,
        preco_manual: $('precoManual').value,
      }) });
      renderPreco(data);
      ui.feedback($('msg'), 'Precificação atualizada.');
    } catch (err) { ui.feedback($('msg'), err.message, true); }
  };

  loadAll().catch(e => ui.feedback($('msg'), e.message, true));
})();
