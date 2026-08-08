(()=>{
  const KEY='birx_personalizacao_pendente';
  const grid=document.getElementById('gradeProdutos');
  const checkoutObs=document.getElementById('checkoutObservacoes');
  if(!grid)return;
  const getConfig=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const clearConfig=()=>{try{localStorage.removeItem(KEY)}catch{}};
  const summary=c=>c?`BIRX ID PERSONALIZADA — Modelo: ${c.shape||'redonda'}; Cor: ${c.colorName||''}; Nome: ${(c.name||'PET').toUpperCase()}; Ícone: ${c.icon||'🐾'}; Estilo: ${c.font||'forte'}.`:'';
  function customCard(){return [...grid.querySelectorAll('.product-card')].find(card=>/personaliz/i.test(card.textContent||''))||null}
  function decorate(){
    const card=customCard();if(!card)return false;
    const btn=card.querySelector('[data-adicionar]');if(!btn)return false;
    const cfg=getConfig();
    btn.textContent=cfg?'Adicionar personalizada':'Personalizar em 3D';
    btn.dataset.birxPersonalizada='1';
    if(!card.querySelector('.custom-3d-hint')){const p=document.createElement('p');p.className='custom-3d-hint';p.style.cssText='margin:10px 0 0;font-size:.78rem;color:#5f6f89;font-weight:700';p.textContent='Visualize em 3D, escolha formato, cor, nome e ícone.';btn.closest('.product-buy')?.insertAdjacentElement('beforebegin',p)}
    if(cfg&&!card.dataset.autoAdded){card.dataset.autoAdded='1';setTimeout(()=>btn.click(),80)}
    return true;
  }
  grid.addEventListener('click',event=>{
    const btn=event.target.closest('[data-birx-personalizada]');if(!btn)return;
    const cfg=getConfig();
    if(!cfg){event.preventDefault();event.stopImmediatePropagation();location.href='/personalizar';return}
    if(checkoutObs&&!checkoutObs.value.includes('BIRX ID PERSONALIZADA'))checkoutObs.value=[checkoutObs.value.trim(),summary(cfg)].filter(Boolean).join('\n');
    setTimeout(()=>{btn.textContent='Personalizar outra';},100);
  },true);
  const checkoutButton=document.getElementById('irCheckout');
  checkoutButton?.addEventListener('click',()=>{const cfg=getConfig();if(cfg&&checkoutObs&&!checkoutObs.value.includes('BIRX ID PERSONALIZADA'))checkoutObs.value=[checkoutObs.value.trim(),summary(cfg)].filter(Boolean).join('\n')});
  const form=document.getElementById('formCheckout');
  form?.addEventListener('submit',()=>{const cfg=getConfig();if(cfg&&checkoutObs&&!checkoutObs.value.includes('BIRX ID PERSONALIZADA'))checkoutObs.value=[checkoutObs.value.trim(),summary(cfg)].filter(Boolean).join('\n');setTimeout(clearConfig,3000)},true);
  const observer=new MutationObserver(()=>decorate());observer.observe(grid,{childList:true,subtree:true});decorate();
})();
