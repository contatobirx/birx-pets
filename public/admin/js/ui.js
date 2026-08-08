window.BirxAdmin = (() => {
  const keyName = "orbitek_tag_admin";
  const schemaKey = "birx_admin_schema_ready_v8";
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const qty = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '\"': "&quot;" }[char]));
  const getKey = () => sessionStorage.getItem(keyName) || "";
  const setKey = (value) => { sessionStorage.setItem(keyName, String(value || "").trim()); sessionStorage.removeItem(schemaKey); };
  const clearKey = () => { sessionStorage.removeItem(keyName); sessionStorage.removeItem(schemaKey); };

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(getKey() ? { "X-BIRX-Admin": getKey() } : {}), ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({ sucesso: false, mensagem: "Resposta inválida do servidor." }));
    if (!response.ok) {
      if (response.status === 401 && location.pathname.startsWith('/admin/') && !location.pathname.endsWith('/login.html')) location.href = '/admin/login.html';
      throw new Error(data.mensagem || "Não foi possível concluir a operação.");
    }
    return data;
  }

  async function ensureSchema() {
    if (sessionStorage.getItem(schemaKey) === "1") return true;
    await api('/api/admin-migrate', { method: 'POST', body: '{}' });
    await api('/api/admin-upgrade', { method: 'POST', body: '{}' });
    sessionStorage.setItem(schemaKey, "1");
    return true;
  }

  async function requireAuth() {
    if (!getKey()) {
      location.href = '/admin/login.html';
      return false;
    }
    try {
      await ensureSchema();
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    clearKey();
    location.href = '/admin/login.html';
  }

  function feedback(el, message, error = false) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", error);
    el.hidden = false;
  }

  return { money, qty, escapeHtml, getKey, setKey, clearKey, api, ensureSchema, requireAuth, logout, feedback };
})();
