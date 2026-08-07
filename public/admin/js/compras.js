(() => {
  const ui=window.BirxAdmin,$=id=>document.getElementById(id);
  const state={compras:[],fornecedores:[],materiais:[]};
  const acesso=$("acesso"),painel=$("painel"),modal=$("modal");

  function renderCompras(){
    $("lista").innerHTML=state.compras.map(c=>`<tr><td>${ui.escapeHtml(c.data_compra)}</td><td>${ui.escapeHtml(c.fornecedor_nome||"—")}</td><td>${ui.escapeHtml(c.numero_nf||"—")}</td><td>${ui.qty.format(Number(c.quantidade_itens||0))}</td><td>${ui.money.format(Number(c.frete||0))}</td><td>${ui.money.format(Number(c.desconto||0))}</td><td><strong>${ui.money.format(Number(c.total_final||0))}</strong></td></tr>`).join('');
    $("vazio").hidden=state.compras.length>0;
    $("statCompras").textContent=state.compras.length;
    $("statTotal").textContent=ui.money.format(state.compras.reduce((s,c)=>s+Number(c.total_final||0),0));
  }
  function materialOptions(){ return '<option value="">Selecione o material</option>'+state.materiais.map(m=>`<option value="${m.id}">${ui.escapeHtml(m.nome)} (${ui.escapeHtml(m.unidade)})</option>`).join(''); }
  function addItem(item={}){
    const row=document.createElement('div'); row.className='item-row';
    row.innerHTML=`<select class="material" required>${materialOptions()}</select><input class="quantidade" type="number" min="0.01" step="0.01" value="${item.quantidade||1}" required><input class="valor" type="number" min="0" step="0.01" value="${item.valor_unitario||0}" required><strong class="item-total">R$ 0,00</strong><button type="button" class="secondary remover">×</button>`;
    row.querySelector('.material').value=item.material_id||'';
    row.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',calc));
    row.querySelector('.remover').addEventListener('click',()=>{row.remove();calc()});
    $("itens").appendChild(row); calc();
  }
  function calc(){
    let items=0; document.querySelectorAll('.item-row').forEach(r=>{const q=Number(r.querySelector('.quantidade').value||0),v=Number(r.querySelector('.valor').value||0),t=q*v;items+=t;r.querySelector('.item-total').textContent=ui.money.format(t)});
    const frete=Number($("frete").value||0),imp=Number($("impostos").value||0),desc=Number($("desconto").value||0);
    $("totalItens").textContent=ui.money.format(items); $("totalExtras").textContent=ui.money.format(frete+imp); $("totalDesconto").textContent=ui.money.format(desc); $("totalFinal").textContent=ui.money.format(Math.max(0,items+frete+imp-desc));
  }
  async function load(){
    const [c,f,m]=await Promise.all([ui.api('/api/compras'),ui.api('/api/fornecedores'),ui.api('/api/materiais')]);
    state.compras=c.compras||[];state.fornecedores=f.fornecedores||[];state.materiais=m.materiais||[];
    $("fornecedor").innerHTML='<option value="">Sem fornecedor</option>'+state.fornecedores.map(x=>`<option value="${x.id}">${ui.escapeHtml(x.nome)}</option>`).join('');
    renderCompras();
  }
  async function enter(key){ui.setKey(key);try{await load();acesso.hidden=true;painel.hidden=false;$("novaCompra").hidden=false}catch(e){ui.clearKey();ui.feedback($("mensagemAcesso"),e.message,true)}}
  function open(){
    $("formCompra").reset(); $("itens").innerHTML=''; $("dataCompra").value=new Date().toISOString().slice(0,10); $("frete").value=0;$("impostos").value=0;$("desconto").value=0;addItem();$("mensagemModal").hidden=true;modal.hidden=false;document.body.style.overflow='hidden';calc();
  }
  function close(){modal.hidden=true;document.body.style.overflow='';}
  $("formAcesso").addEventListener('submit',e=>{e.preventDefault();enter($("chave").value)});$("novaCompra").addEventListener('click',open);$("adicionarItem").addEventListener('click',()=>addItem());document.querySelectorAll('[data-fechar]').forEach(el=>el.addEventListener('click',close));['frete','impostos','desconto'].forEach(id=>$(id).addEventListener('input',calc));
  $("formCompra").addEventListener('submit',async e=>{e.preventDefault();const itens=[...document.querySelectorAll('.item-row')].map(r=>({material_id:r.querySelector('.material').value,quantidade:r.querySelector('.quantidade').value,valor_unitario:r.querySelector('.valor').value}));if(itens.some(i=>!i.material_id))return ui.feedback($("mensagemModal"),'Selecione o material de todos os itens.',true);const payload={fornecedor_id:$("fornecedor").value||null,data_compra:$("dataCompra").value,numero_nf:$("numeroNf").value,frete:$("frete").value,impostos:$("impostos").value,desconto:$("desconto").value,observacoes:$("observacoes").value,itens};try{await ui.api('/api/compras',{method:'POST',body:JSON.stringify(payload)});close();await load();ui.feedback($("mensagem"),'Compra registrada. O estoque e o custo médio foram atualizados.')}catch(err){ui.feedback($("mensagemModal"),err.message,true)}});
  if(ui.getKey()) enter(ui.getKey());
})();
