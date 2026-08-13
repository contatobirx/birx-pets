(() => {
  const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
  const menu = sidebar?.querySelector('.menu');

  const grupos = [
    ['Visão geral', [['⌂','Dashboard','/admin/']]],
    ['Comercial', [['◎','CRM','/admin/crm.html'],['▤','Pedidos','/admin/pedidos.html']]],
    ['Financeiro', [['R$','Financeiro','/admin/financeiro.html'],['🛒','Compras','/admin/compras.html'],['％','Precificação','/admin/precificacao.html']]],
    ['Estoque', [['◆','Materiais','/admin/materiais.html'],['▣','Estoque','/admin/estoque.html'],['◫','Fornecedores','/admin/fornecedores.html'],['◇','Produtos','/admin/produtos.html']]],
    ['Produção', [['▤','Central de Produção','/admin/central-producao.html'],['🏭','Produção integrada','/admin/producao-integrada.html'],['▦','Impressoras','/admin/impressoras.html'],['◈','Modelos 3D','/admin/modelos-3d.html'],['⌁','Tags','/admin-tags.html']]],
    ['Sistema', [['✓','Auditoria','/admin/auditoria.html'],['▦','Loja interna','/admin-loja.html']]],
  ];

  function normalizar(path) {
    const p = String(path || '').replace(/\/+$/, '');
    return p === '/admin' ? '/admin' : p;
  }

  function montarMenu() {
    if (!menu) return;
    const atual = normalizar(location.pathname);
    menu.setAttribute('aria-label', 'Navegação administrativa');
    menu.innerHTML = grupos.map(([titulo, itens]) => `
      <div class="menu-group">
        <span class="menu-group-title">${titulo}</span>
        ${itens.map(([icone,nome,href]) => {
          const destino = normalizar(new URL(href, location.origin).pathname);
          const ativo = atual === destino || (destino === '/admin' && (atual === '/admin' || atual === '/admin/index.html'));
          return `<a class="menu-item${ativo ? ' active' : ''}" href="${href}"><span>${icone}</span>${nome}</a>`;
        }).join('')}
      </div>`).join('');
  }

  function prepararSidebar() {
    if (!sidebar) return;
    sidebar.id ||= 'sidebar';
    const brand = sidebar.querySelector('.brand');
    if (brand && !brand.querySelector('.sidebar-close')) {
      const close = document.createElement('button');
      close.className = 'sidebar-close';
      close.id = 'sidebarClose';
      close.type = 'button';
      close.setAttribute('aria-label','Fechar menu');
      close.textContent = '×';
      brand.appendChild(close);
    }
    if (!sidebar.querySelector('.sidebar-footer')) {
      const footer = document.createElement('div');
      footer.className = 'sidebar-footer';
      sidebar.appendChild(footer);
    }
    const footer = sidebar.querySelector('.sidebar-footer');
    if (footer) footer.innerHTML = `<div class="admin-user"><span class="admin-avatar">B</span><div><strong>Administrador</strong><small>contato.birx@gmail.com</small></div></div><button type="button" class="logout-button" id="adminLogout">Sair</button>`;
  }

  function prepararMobile() {
    if (!sidebar) return;
    let overlay = document.getElementById('sidebarOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.id = 'sidebarOverlay';
      overlay.hidden = true;
      sidebar.insertAdjacentElement('afterend', overlay);
    }
    let toggle = document.getElementById('menuToggle');
    const topbar = document.querySelector('.topbar');
    if (!toggle && topbar) {
      const primeiro = topbar.firstElementChild;
      toggle = document.createElement('button');
      toggle.className = 'menu-toggle';
      toggle.id = 'menuToggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label','Abrir menu');
      toggle.textContent = '☰';
      if (primeiro?.classList.contains('topbar-left')) primeiro.prepend(toggle);
      else {
        const wrap = document.createElement('div');
        wrap.className = 'topbar-left';
        if (primeiro) { topbar.insertBefore(wrap, primeiro); wrap.append(toggle, primeiro); }
        else topbar.append(toggle);
      }
    }
    const close = document.getElementById('sidebarClose') || sidebar.querySelector('.sidebar-close');
    const setMenu = open => {
      sidebar.classList.toggle('open', open);
      overlay.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle?.addEventListener('click', () => setMenu(true));
    close?.addEventListener('click', () => setMenu(false));
    overlay.addEventListener('click', () => setMenu(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (innerWidth > 820) setMenu(false); });
  }

  prepararSidebar();
  montarMenu();
  prepararMobile();
  document.getElementById('adminLogout')?.addEventListener('click', () => window.BirxAdmin?.logout?.());
})();
