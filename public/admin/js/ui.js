window.BirxAdmin = (() => {
  const schemaKey = "birx_admin_schema_ready_v12";
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const qty = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '\"': "&quot;" }[char]));

  // Compatibilidade temporária com módulos antigos. A autenticação real é feita pelo cookie HttpOnly birx_admin.
  const getKey = () => "";
  const setKey = () => { sessionStorage.removeItem(schemaKey); };
  const clearKey = () => {
    sessionStorage.removeItem("orbitek_tag_admin");
    sessionStorage.removeItem("birxAdminKey");
    sessionStorage.removeItem(schemaKey);
  };

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({ sucesso: false, mensagem: "Resposta inválida do servidor." }));
    if (!response.ok) {
      if (response.status === 401 && location.pathname.startsWith('/admin/') && !location.pathname.endsWith('/login.html')) {
        const voltar = encodeURIComponent(location.pathname + location.search);
        location.replace(`/admin/login.html?voltar=${voltar}`);
      }
      throw new Error(data.mensagem || "Não foi possível concluir a operação.");
    }
    return data;
  }

  async function estaAutenticado() {
    try {
      const response = await fetch('/api/admin-login', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));
      return response.ok && data.autenticado === true;
    } catch {
      return false;
    }
  }

  async function ensureSchema() {
    if (sessionStorage.getItem(schemaKey) === "1") return true;
    await api('/api/admin-migrate', { method: 'POST', body: '{}' });
    await api('/api/admin-upgrade', { method: 'POST', body: '{}' });
    sessionStorage.setItem(schemaKey, "1");
    return true;
  }

  async function requireAuth() {
    if (!(await estaAutenticado())) {
      const voltar = encodeURIComponent(location.pathname + location.search);
      location.replace(`/admin/login.html?voltar=${voltar}`);
      return false;
    }
    try {
      await ensureSchema();
      return true;
    } catch {
      return false;
    }
  }

  async function logout() {
    clearKey();
    try {
      await fetch('/api/admin-login', { method: 'DELETE', credentials: 'same-origin' });
    } catch {}
    location.replace('/admin/login.html');
  }

  function feedback(el, message, error = false) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", error);
    el.hidden = false;
  }

  return { money, qty, escapeHtml, getKey, setKey, clearKey, api, ensureSchema, requireAuth, logout, feedback };
})();
