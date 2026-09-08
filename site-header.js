(() => {
  const header = document.getElementById('site-header');
  if (!header) return;
  let lastY = Math.max(0, scrollY);
  let distance = 0;
  let direction = 0;
  let queued = false;
  let holdUntil = 0;
  const show = () => header.classList.remove('site-header-hidden');
  function update() {
    queued = false;
    const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = y - lastY;
    lastY = y;
    if (y < 12 || document.body.classList.contains('menu-open') || performance.now() < holdUntil) {
      show(); distance = 0; return;
    }
    if (Math.abs(delta) < 1) return;
    const nextDirection = Math.sign(delta);
    distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
    direction = nextDirection;
    if (direction < 0 && distance >= 8) show();
    else if (direction > 0 && distance >= 36 && y > header.offsetHeight + 24) header.classList.add('site-header-hidden');
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, {passive: true});
  header.addEventListener('focusin', show);
  header.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    const toggle = header.querySelector('.mobile-menu-btn');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    toggle.focus();
  });
  header.addEventListener('click', () => { show(); holdUntil = performance.now() + 1000; });
  addEventListener('pageshow', () => { lastY = Math.max(0, scrollY); show(); });
  new MutationObserver(() => {
    if (document.body.classList.contains('menu-open')) show();
  }).observe(document.body, {attributes:true, attributeFilter:['class']});
})();
