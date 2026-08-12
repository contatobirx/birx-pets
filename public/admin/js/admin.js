Exit code: 0
Wall time: 1.7 seconds
Output:
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
  link.innerHTML = '<span>ðŸ§ª</span>Loja interna';
  const primeiro = menu.querySelector('.menu-item');
  if (primeiro?.nextSibling) menu.insertBefore(link, primeiro.nextSibling);
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

