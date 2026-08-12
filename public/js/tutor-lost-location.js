(function(){
  const modal=document.getElementById("modalLocalPerdido"),confirmar=document.getElementById("confirmarLocalPerdido"),texto=document.getElementById("textoLocalSelecionado");
  if(!modal||!window.L)return;
  let mapa,marcador,ponto,resolverAtual;
  function selecionar(lat,lng){ponto={latitude:lat,longitude:lng};if(marcador)marcador.setLatLng([lat,lng]);else marcador=L.marker([lat,lng]).addTo(mapa);confirmar.disabled=false;texto.textContent="Local selecionado. Confirme para ativar o modo perdido."}
  function fechar(resultado=null){modal.hidden=true;document.body.style.overflow="";const resolver=resolverAtual;resolverAtual=null;if(resolver)resolver(resultado)}
  function abrir(){modal.hidden=false;document.body.style.overflow="hidden";ponto=null;confirmar.disabled=true;texto.textContent="Nenhum ponto selecionado.";if(marcador){marcador.remove();marcador=null}setTimeout(()=>{if(!mapa){mapa=L.map("mapaSelecionarLocalPerdido").setView([-14.2,-51.9],4);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap"}).addTo(mapa);mapa.on("click",evento=>selecionar(evento.latlng.lat,evento.latlng.lng))}mapa.invalidateSize()},50);return new Promise(resolve=>{resolverAtual=resolve})}
  document.getElementById("usarLocalAtual").addEventListener("click",()=>{if(!navigator.geolocation)return;texto.textContent="Obtendo sua localização...";navigator.geolocation.getCurrentPosition(pos=>{mapa.setView([pos.coords.latitude,pos.coords.longitude],16);selecionar(pos.coords.latitude,pos.coords.longitude)},()=>{texto.textContent="Não foi possível obter sua localização. Toque no mapa para marcar manualmente."},{enableHighAccuracy:true,timeout:12000})});
  confirmar.addEventListener("click",()=>{if(ponto)fechar(ponto)});["cancelarLocalPerdido","fecharLocalPerdido","fecharLocalPerdidoOverlay"].forEach(id=>document.getElementById(id)?.addEventListener("click",()=>fechar(null)));
  window.BIRXSelecionarLocalizacao={abrir};
})();
