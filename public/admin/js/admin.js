const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function adicionarLojaInterna() {
  const menu = document.querySelector('.sidebar .menu');
  if (!menu || menu.querySelector('[data-loja-interna]')) return;

  const link = document.createElement('a');
  link.className = 'menu-item';
  link.href = '/admin-loja.html';
  link.dataset.lojaInterna = '1';
  link.innerHTML = '<span>▦</span>Loja interna';

  const grupos = [...menu.querySelectorAll('.menu-group')];
  const grupoSistema = grupos.find((grupo) => grupo.querySelector('.menu-group-title')?.textContent.trim() === 'Sistema');
  if (grupoSistema) grupoSistema.appendChild(link);
  else menu.appendChild(link);
}

adicionarLojaInterna();

function setMenu(open) {
  if (!sidebar || !sidebarOverlay) return;
  sidebar.classList.toggle('open', open);
  sidebarOverlay.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}

menuToggle?.addEventListener('click', () => setMenu(true));
sidebarClose?.addEventListener('click', () => setMenu(false));
sidebarOverlay?.addEventListener('click', () => setMenu(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

document.querySelectorAll('[data-future]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) setMenu(false);
});
