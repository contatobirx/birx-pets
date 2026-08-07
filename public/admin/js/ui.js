window.BirxAdmin = (() => {
  const keyName = "birxAdminKey";
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const qty = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const getKey = () => sessionStorage.getItem(keyName) || "";
  const setKey = (value) => sessionStorage.setItem(keyName, String(value || "").trim());
  const clearKey = () => sessionStorage.removeItem(keyName);
  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", "X-BIRX-Admin": getKey(), ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({ sucesso: false, mensagem: "Resposta inválida do servidor." }));
    if (!response.ok) throw new Error(data.mensagem || "Não foi possível concluir a operação.");
    return data;
  }
  function feedback(el, message, error = false) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", error);
    el.hidden = false;
  }
  return { money, qty, escapeHtml, getKey, setKey, clearKey, api, feedback };
})();
