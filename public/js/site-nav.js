document.querySelectorAll('.birx-public-nav a[href="/loja"],.birx-public-nav a[href="/loja.html"]').forEach(link=>link.remove());
document.querySelectorAll('a[href="/loja"],a[href="/loja.html"]').forEach(link=>{if(link.closest('.birx-public-nav'))return;link.href='/personalizar';if(/comprar|loja|escolher/i.test(link.textContent||''))link.textContent='Personalizar BIRX ID →';});
document.addEventListener('click',function(event){const button=event.target.closest('[data-birx-nav-toggle]');if(!button)return;const nav=button.closest('.birx-public-nav');const open=nav.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});

/* Correção genérica para diálogos: garante que o atributo hidden realmente
   remova o contêiner da tela, mesmo quando outro CSS define display. */
(()=>{
  const style=document.createElement('style');
  style.textContent='[hidden]{display:none!important}';
  document.head.appendChild(style);

  const forceHide=container=>{
    if(!container)return;
    const active=document.activeElement;
    if(active&&container.contains(active)&&typeof active.blur==='function')active.blur();
    container.hidden=true;
    container.setAttribute('aria-hidden','true');
    container.dataset.birxForceHidden='1';
    container.style.setProperty('display','none','important');
    container.style.setProperty('pointer-events','none','important');
    document.body.classList.remove('locked');
  };

  document.addEventListener('click',event=>{
    const close=event.target.closest?.('[aria-label="Fechar"]');
    if(!close)return;
    const dialog=close.closest?.('[role="dialog"]');
    if(!dialog)return;
    const container=dialog.parentElement;
    if(!container)return;
    event.preventDefault();
    event.stopPropagation();
    forceHide(container);
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const dialog=document.querySelector('[role="dialog"]');
    if(!dialog)return;
    const container=dialog.parentElement;
    if(!container||container.hidden)return;
    event.preventDefault();
    forceHide(container);
  },true);

  const observer=new MutationObserver(records=>{
    for(const record of records){
      const el=record.target;
      if(!(el instanceof HTMLElement))continue;
      if(el.dataset.birxForceHidden==='1'&&!el.hidden){
        delete el.dataset.birxForceHidden;
        el.style.removeProperty('display');
        el.style.removeProperty('pointer-events');
        el.setAttribute('aria-hidden','false');
      }
    }
  });

  const watch=()=>{
    document.querySelectorAll('[role="dialog"]').forEach(dialog=>{
      const container=dialog.parentElement;
      if(container)observer.observe(container,{attributes:true,attributeFilter:['hidden']});
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();
