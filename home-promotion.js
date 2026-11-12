import { authReady } from "./firebase-index.js?v=20261112-admin";
import { recordTraffic } from "./site-traffic.js?v=1";

(async () => {
  const hero = document.querySelector('#hbChapter1');
  const popup = document.querySelector('#homePromotion');
  const startsAt = Date.parse('2026-11-10T00:00:00+09:00');
  const endsAt = Date.parse('2026-11-16T00:00:00+09:00');
  const { isAdmin } = await authReady;
  const cards = [...popup.querySelectorAll('[data-promotion]')].filter(card => {
    const isDiscount = card.dataset.promotion === 'new-member';
    if (isAdmin) return true;
    if (isDiscount && (Date.now() < startsAt || Date.now() >= endsAt)) return false;
    try { return localStorage.getItem(storageKey(card)) !== '1'; }
    catch { return true; }
  });
  if (!cards.length) return;

  function storageKey(card) {
    return card.dataset.promotion === 'new-member'
      ? 'hbg-new-member-november-2026-dismissed'
      : 'hbg-pilates-trial-dismissed';
  }

  function closeCard(card) {
    card.hidden = true;
    if (cards.every(item => item.hidden)) {
      popup.close();
      return;
    }
    popup.querySelector('.home-promotion-card:not([hidden]) button[value="close"]').focus();
  }

  const artwork = cards.map(card => card.querySelector('img'));
  let heroVisible = false;
  const observer = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    showWhenReady();
  }, { threshold: 0.5 });
  const loader = new MutationObserver(showWhenReady);

  function showWhenReady() {
    if (popup.open || !heroVisible || !document.body.classList.contains('loaded') ||
        document.body.classList.contains('menu-open') || document.hidden ||
        artwork.some(image => !image.complete)) return;

    cards.forEach((card, index) => { card.hidden = !artwork[index].naturalWidth; });
    observer.disconnect();
    loader.disconnect();
    document.removeEventListener('visibilitychange', showWhenReady);
    if (cards.some(card => !card.hidden)) popup.showModal();
  }

  cards.forEach(card => {
    card.querySelector('button[value="close"]').addEventListener('click', () => closeCard(card));
    const link = card.querySelector('.home-promotion-actions a');
    link.addEventListener('click', async event => {
      if (isAdmin) return;
      const kind = card.dataset.promotion;
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        void recordTraffic(kind);
        return;
      }
      event.preventDefault();
      await Promise.race([recordTraffic(kind), new Promise(resolve => setTimeout(resolve, 400))]);
      location.assign(link.href);
    });
    link.addEventListener('auxclick', event => {
      if (!isAdmin && event.button === 1) void recordTraffic(card.dataset.promotion);
    });
    const dismiss = card.querySelector('button[value="dismiss"]');
    dismiss.addEventListener('click', () => {
      if (dismiss.getAttribute('aria-pressed') !== 'true') {
        dismiss.setAttribute('aria-pressed', 'true');
        return;
      }
      if (!isAdmin) {
        try { localStorage.setItem(storageKey(card), '1'); } catch {}
      }
      closeCard(card);
    });
  });
  document.addEventListener('visibilitychange', showWhenReady);
  observer.observe(hero);
  loader.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  artwork.forEach(image => {
    image.addEventListener('load', showWhenReady, { once: true });
    image.addEventListener('error', showWhenReady, { once: true });
    image.src = image.dataset.src;
  });
})();
