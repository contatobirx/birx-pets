window.BirxAdmin = (() => {
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const qty = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '\"': "&quot;" }[char]));

  // Compatibilidade temporária com módulos antigos. A autenticação real é feita pelo cookie HttpOnly birx_admin.
  const getKey = () => "";
  const setKey = () => {};
  const clearKey = () => {
    sessionStorage.removeItem("orbitek_tag_admin");
    sessionStorage.removeItem("birxAdminKey");
  };

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({ sucesso: false, mensagem: "Resposta inválida do servidor." }));
    if (!response.ok) throw new Error(data.mensagem || "Não foi possível concluir a operação.");
    return data;
  }

  async function estaAutenticado() {
    try {
      const response = await fetch('/api/admin-login', { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      return response.ok && data.autenticado === true;
    } catch {
      return false;
    }
  }

  async function requireAuth() {
    if (await estaAutenticado()) return true;
    const voltar = encodeURIComponent(location.pathname + location.search);
    location.replace(`/admin/login.html?voltar=${voltar}`);
    return false;
  }

  async function logout() {
    clearKey();
    try { await fetch('/api/admin-login', { method: 'DELETE', credentials: 'same-origin' }); } catch {}
    location.replace('/login');
  }

  function feedback(el, message, error = false) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", error);
    el.hidden = false;
  }

  return { money, qty, escapeHtml, getKey, setKey, clearKey, api, requireAuth, logout, feedback };
})();
