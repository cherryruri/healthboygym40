(() => {
  const body = document.body;
  const menu = document.getElementById('boardCorporateMenu');
  const openButton = document.getElementById('boardCorporateMenuOpen');
  const closeButton = document.getElementById('boardCorporateMenuClose');
  const splash = document.getElementById('boardCorporateSplash');

  const setMenu = (open) => {
    if (!menu || !openButton) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    openButton.setAttribute('aria-expanded', String(open));
    body.classList.toggle('corporate-menu-open', open);
    if (open && closeButton) closeButton.focus();
    if (!open) openButton.focus();
  };

  openButton?.addEventListener('click', () => setMenu(true));
  closeButton?.addEventListener('click', () => setMenu(false));
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false);
  });

  if (splash) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      splash.remove();
    } else {
      window.setTimeout(() => splash.classList.add('is-leaving'), 1050);
      window.setTimeout(() => splash.remove(), 1850);
    }
  }
})();