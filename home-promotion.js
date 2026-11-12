(() => {
  const hero = document.querySelector('#hbChapter1');
  const popup = document.querySelector('#homePromotion');
  const artwork = popup.querySelector('img');
  const storageKey = 'hbg-new-member-november-2026-dismissed';
  const startsAt = Date.parse('2026-11-10T00:00:00+09:00');
  const endsAt = Date.parse('2026-11-16T00:00:00+09:00');
  const isActive = () => Date.now() >= startsAt && Date.now() < endsAt;

  if (!isActive()) return;
  try {
    if (localStorage.getItem(storageKey) === '1') return;
  } catch {}

  let heroVisible = false;
  const observer = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    showWhenReady();
  }, { threshold: 0.5 });
  const loader = new MutationObserver(showWhenReady);

  function showWhenReady() {
    if (!heroVisible || !document.body.classList.contains('loaded') ||
        document.body.classList.contains('menu-open') || document.hidden ||
        !artwork.complete || !artwork.naturalWidth || !isActive()) return;

    popup.showModal();
    observer.disconnect();
    loader.disconnect();
    artwork.removeEventListener('load', showWhenReady);
    document.removeEventListener('visibilitychange', showWhenReady);
  }

  const dismissButton = popup.querySelector('button[value="dismiss"]');
  dismissButton.addEventListener('click', event => {
    if (dismissButton.getAttribute('aria-pressed') === 'true') return;
    event.preventDefault();
    dismissButton.setAttribute('aria-pressed', 'true');
  });

  popup.addEventListener('close', () => {
    if (popup.returnValue !== 'dismiss') return;
    try { localStorage.setItem(storageKey, '1'); } catch {}
  });
  artwork.addEventListener('load', showWhenReady);
  document.addEventListener('visibilitychange', showWhenReady);
  observer.observe(hero);
  loader.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  artwork.src = artwork.dataset.src;
})();
