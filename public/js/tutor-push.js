(() => {
  const button = document.getElementById("ativarPushMedicamentos");
  if (!button) return;
  const notify = (message, type="sucesso") => typeof window.exibirMensagem === "function" ? window.exibirMensagem(message,type) : alert(message);
  const decodeKey = (value) => { const padded=value+"=".repeat((4-value.length%4)%4),raw=atob(padded.replace(/-/g,"+").replace(/_/g,"/")),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes; };
  async function current() { if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return null; const registration=await navigator.serviceWorker.register("/sw.js"); return {registration,subscription:await registration.pushManager.getSubscription()}; }
  async function refresh() { try { const state=await current(); if(!state){button.disabled=true;button.textContent="Avisos não suportados neste aparelho";return} if(state.subscription&&Notification.permission==="granted"){button.textContent="🔔 Avisos ativados neste aparelho";button.dataset.active="true"}else{button.textContent="🔔 Ativar avisos no celular";button.dataset.active="false"} } catch { button.textContent="🔔 Ativar avisos no celular"; } }
  button.addEventListener("click", async () => {
    button.disabled=true;
    try {
      const state=await current();if(!state)throw new Error("Este navegador não oferece notificações push.");
      if(state.subscription&&button.dataset.active==="true"){if(!confirm("Deseja desativar os avisos neste aparelho?"))return;await fetch("/api/push-assinatura",{method:"DELETE",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({endpoint:state.subscription.endpoint})});await state.subscription.unsubscribe();notify("Avisos desativados neste aparelho.");return}
      const permission=await Notification.requestPermission();if(permission!=="granted")throw new Error("A permissão de notificações não foi concedida.");const configResponse=await fetch("/api/push-assinatura",{credentials:"same-origin"}),config=await configResponse.json();if(!configResponse.ok||!config.vapidPublicKey)throw new Error("A configuração dos avisos ainda não está disponível.");const subscription=state.subscription||await state.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodeKey(config.vapidPublicKey)});const response=await fetch("/api/push-assinatura",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({subscription:subscription.toJSON()})}),data=await response.json();if(!response.ok||!data.sucesso)throw new Error(data.mensagem||"Não foi possível ativar os avisos.");notify("Avisos de medicamentos ativados neste aparelho.");
    } catch(error){notify(error.message||"Não foi possível configurar os avisos.","erro");}
    finally{button.disabled=false;refresh()}
  });
  refresh();
})();
