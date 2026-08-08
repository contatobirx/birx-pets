(()=>{
  const BASE=4000,CUSTOM=990,TOTAL=4990,KEY='birx_personalizacao_pendente';
  const btn=document.getElementById('addCustom');
  if(!btn)return;
  btn.addEventListener('click',()=>{
    setTimeout(()=>{
      try{
        const cfg=JSON.parse(localStorage.getItem(KEY)||'null');
        if(!cfg)return;
        cfg.precoBaseCentavos=BASE;
        cfg.personalizacaoCentavos=CUSTOM;
        cfg.precoFinalCentavos=TOTAL;
        cfg.precoFinal='R$ 49,90';
        cfg.tipo='BIRX ID Personalizada';
        localStorage.setItem(KEY,JSON.stringify(cfg));
      }catch{}
    },0);
  });
})();
