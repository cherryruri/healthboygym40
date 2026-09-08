(() => {
  const tour = document.querySelector('#facilityTour');
  const modal = document.querySelector('.facility-photo-modal');
  if (!tour || !modal) return;
  modal.dataset.controller = 'unified';
  document.body.append(modal);
  const cards = [...tour.querySelectorAll('.txt_box > li')];
  const groups = [...tour.querySelectorAll('.img_box > li')].map((slide, index) => ({
    title: cards[index].querySelector('h2').textContent,
    photos: [...slide.querySelectorAll('span')].map(photo => photo.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''))
  }));
  modal.innerHTML = '<div class="facility-modal-dialog facility-gallery-505" role="dialog" aria-modal="true" aria-label="시설 사진 갤러리"><button type="button" class="facility-modal-close" aria-label="갤러리 닫기">×</button><div class="facility-gallery-main"><button type="button" class="facility-modal-nav prev" aria-label="이전 사진">‹</button><img alt=""><button type="button" class="facility-modal-nav next" aria-label="다음 사진">›</button><p class="facility-gallery-caption"></p><span class="facility-gallery-count" aria-live="polite"></span></div><div class="facility-gallery-side" aria-label="관련 시설 사진"></div></div>';
  const main = modal.querySelector('.facility-gallery-main img');
  const side = modal.querySelector('.facility-gallery-side');
  const closeButton = modal.querySelector('.facility-modal-close');
  let groupIndex = 0, photoIndex = 0, returnFocus = null;
  function renderPhoto() {
    const group = groups[groupIndex];
    main.src = group.photos[photoIndex];
    main.alt = group.title + ' ' + (photoIndex + 1);
    modal.querySelector('.facility-gallery-caption').textContent = group.title;
    modal.querySelector('.facility-gallery-count').textContent = `${photoIndex + 1} / ${group.photos.length}`;
    [...side.children].forEach((button, index) => {
      button.classList.toggle('is-active', index === photoIndex);
      button.setAttribute('aria-pressed', String(index === photoIndex));
    });
  }
  function open(index, trigger) {
    groupIndex = index;
    photoIndex = 0;
    returnFocus = trigger;
    side.replaceChildren();
    groups[index].photos.forEach((src, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'facility-gallery-thumb';
      button.setAttribute('aria-label', groups[index].title + ' 사진 ' + (i + 1));
      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      button.append(image);
      button.addEventListener('click', () => { photoIndex = i; renderPhoto(); });
      side.append(button);
    });
    renderPhoto();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('facility-gallery-open');
    document.documentElement.classList.add('facility-gallery-open');
    side.scrollLeft = side.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('facility-gallery-open');
    document.documentElement.classList.remove('facility-gallery-open');
    returnFocus?.focus({ preventScroll: true });
  }
  function move(step) {
    photoIndex = (photoIndex + step + groups[groupIndex].photos.length) % groups[groupIndex].photos.length;
    renderPhoto();
    side.children[photoIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  cards.forEach((card, index) => {
    const button = card.querySelector('.facility-view-btn');
    button?.addEventListener('click', () => open(index, button));
  });
  closeButton.addEventListener('click', close);
  modal.querySelector('.prev').addEventListener('click', () => move(-1));
  modal.querySelector('.next').addEventListener('click', () => move(1));
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    if (event.key === 'Tab') {
      const buttons = [...modal.querySelectorAll('button')];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
