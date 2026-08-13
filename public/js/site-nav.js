document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-birx-nav-toggle]');
  if (button) {
    const nav = button.closest('.birx-public-nav');
    if (!nav) return;

    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    return;
  }

  const closeControl = event.target.closest('[aria-label="Fechar"], [aria-label^="Fechar "]');
  if (!closeControl) return;

  const dialog = closeControl.closest('[role="dialog"]');
  if (dialog) {
    event.preventDefault();
    event.stopPropagation();

    if (document.activeElement && dialog.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    const container = dialog.parentElement;
    if (container) {
      container.hidden = true;
      container.setAttribute('aria-hidden', 'true');
      container.style.pointerEvents = 'none';
    } else {
      dialog.hidden = true;
    }

    document.body.classList.remove('locked');

    const safeFocus = document.getElementById('abrirCarrinho') || document.querySelector('main a, main button');
    if (safeFocus && typeof safeFocus.focus === 'function') {
      requestAnimationFrame(() => safeFocus.focus({ preventScroll: true }));
    }
    return;
  }

  const drawer = closeControl.closest('aside[aria-hidden]');
  if (drawer) {
    event.preventDefault();
    event.stopPropagation();

    if (document.activeElement && drawer.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    drawer.classList.remove('open', 'is-open');
    drawer.setAttribute('aria-hidden', 'true');
    const overlay = drawer.previousElementSibling;
    if (overlay && overlay.hasAttribute('hidden')) overlay.hidden = true;
    document.body.classList.remove('locked');

    const opener = document.getElementById('abrirCarrinho');
    if (opener) requestAnimationFrame(() => opener.focus({ preventScroll: true }));
  }
}, true);
