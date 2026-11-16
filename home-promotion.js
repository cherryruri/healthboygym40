import { authReady } from "./firebase-index.js?v=verified-admin-menu";
import { recordTraffic, todayInSeoul } from "./site-traffic.js?v=verified-admin-menu";

import { loadPromotions } from "./promotions.js";

(async () => {
  const hero = document.querySelector('#hbChapter1');
  const popup = document.querySelector('#homePromotion');
  const storageKey = card => 'hbg-' + (card.dataset.promotion === 'pilates' ? 'pilates-trial' : card.dataset.promotion) + '-dismissed';
  const promotions = await loadPromotions().catch(error => {
    console.warn('Unable to load homepage promotions', error);
    return [];
  });
  const promotionCards = promotions.filter(item => !item.archived && item.url).map(item => {
    const card = document.createElement('article');
    card.className = 'home-promotion-card';
    card.dataset.promotion = item.id;
    card.hidden = true;
    card.innerHTML = '<div class="home-promotion-panel"><div class="home-promotion-art"><img></div>' +
      '<div class="home-promotion-actions"><button type="button" value="close">닫기</button>' +
      '<a>지금 바로 예약하기 <span aria-hidden="true">›</span></a></div></div>' +
      '<div class="home-promotion-dismiss"><button type="button" value="dismiss" aria-pressed="false">' +
      '<span aria-hidden="true">✓</span> 오늘 하루 다시 보지 않기</button></div>';
    const panel = card.firstElementChild;
    if (['pilates', 'exam'].includes(item.theme)) panel.classList.add('home-promotion-' + item.theme);
    const image = card.querySelector('img');
    image.dataset.src = item.image;
    image.alt = item.title;
    card.querySelector('a').href = item.url;
    popup.append(card);
    return card;
  });
  const pageUrl = new URL(location.href);
  if (pageUrl.searchParams.get('showPromotions') === '1') {
    try { promotionCards.forEach(card => localStorage.removeItem(storageKey(card))); } catch {}
    pageUrl.searchParams.delete('showPromotions');
    history.replaceState(history.state, '', pageUrl);
  }
  const { isAdmin } = await authReady;
  const cards = promotionCards.filter(card => {
    if (isAdmin) return true;
    try { return localStorage.getItem(storageKey(card)) !== todayInSeoul(); }
    catch { return true; }
  });
  if (!cards.length) return;

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

  let revealTimer;
  function canReveal() {
    return !popup.open && heroVisible && document.body.classList.contains('loaded') &&
      !document.body.classList.contains('menu-open') && !document.hidden &&
      artwork.every(image => image.complete);
  }

  function showWhenReady() {
    if (!canReveal()) {
      clearTimeout(revealTimer);
      revealTimer = undefined;
      return;
    }
    revealTimer ??= setTimeout(revealPopup, 650);
  }

  function revealPopup() {
    revealTimer = undefined;
    if (!canReveal()) return;
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
        try { localStorage.setItem(storageKey(card), todayInSeoul()); } catch {}
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
