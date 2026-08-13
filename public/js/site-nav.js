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

    const container = dialog.parentElement;
    if (container) {
      container.hidden = true;
      container.setAttribute('aria-hidden', 'true');
    } else {
      dialog.hidden = true;
    }

    document.body.classList.remove('locked');
    return;
  }

  const drawer = closeControl.closest('aside[aria-hidden]');
  if (drawer) {
    event.preventDefault();
    event.stopPropagation();
    drawer.classList.remove('open', 'is-open');
    drawer.setAttribute('aria-hidden', 'true');
    const overlay = drawer.previousElementSibling;
    if (overlay && overlay.hasAttribute('hidden')) overlay.hidden = true;
    document.body.classList.remove('locked');
  }
}, true);
