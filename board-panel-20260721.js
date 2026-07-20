(() => {
  const desktop = window.matchMedia('(min-width: 769px)');
  if (!desktop.matches) return;

  const body = document.body;
  const hero = document.querySelector('.board-operation-hero');
  const panel = document.querySelector('.board-content-shell');
  const trigger = document.querySelector('.board-operation-scroll');
  if (!hero || !panel || !trigger) return;

  body.classList.add('board-panel-ready');
  panel.setAttribute('tabindex', '-1');

  let active = false;
  let locked = false;
  let touchStartY = 0;

  const lockBriefly = () => {
    locked = true;
    window.setTimeout(() => { locked = false; }, 760);
  };

  const showBoard = (updateHash = true) => {
    if (active || locked) return;
    active = true;
    lockBriefly();
    body.classList.add('board-panel-active');
    hero.setAttribute('aria-hidden', 'true');
    panel.removeAttribute('aria-hidden');
    panel.scrollTop = 0;
    if (updateHash) history.replaceState(null, '', '#boardContent');
    window.setTimeout(() => panel.focus({ preventScroll:true }), 600);
  };

  const showIntro = (updateHash = true) => {
    if (!active || locked) return;
    active = false;
    lockBriefly();
    body.classList.remove('board-panel-active');
    hero.removeAttribute('aria-hidden');
    panel.setAttribute('aria-hidden', 'true');
    if (updateHash) history.replaceState(null, '', location.pathname + location.search);
    window.setTimeout(() => trigger.focus({ preventScroll:true }), 600);
  };

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    showBoard();
  });

  window.addEventListener('wheel', (event) => {
    if (locked) {
      event.preventDefault();
      return;
    }

    if (!active && event.deltaY > 24) {
      event.preventDefault();
      showBoard();
      return;
    }

    if (active && panel.scrollTop <= 0 && event.deltaY < -32) {
      event.preventDefault();
      showIntro();
    }
  }, { passive:false });

  window.addEventListener('touchstart', (event) => {
    touchStartY = event.changedTouches[0]?.clientY || 0;
  }, { passive:true });

  window.addEventListener('touchend', (event) => {
    if (locked) return;
    const endY = event.changedTouches[0]?.clientY || 0;
    const distance = touchStartY - endY;
    if (!active && distance > 60) showBoard();
    if (active && panel.scrollTop <= 0 && distance < -60) showIntro();
  }, { passive:true });

  window.addEventListener('keydown', (event) => {
    if (!active && ['ArrowDown','PageDown',' '].includes(event.key)) {
      event.preventDefault();
      showBoard();
      return;
    }

    if (active && panel.scrollTop <= 0 && ['ArrowUp','PageUp','Escape'].includes(event.key)) {
      event.preventDefault();
      showIntro();
    }
  });

  window.addEventListener('hashchange', () => {
    if (location.hash === '#boardContent') showBoard(false);
    else if (active) showIntro(false);
  });

  if (location.hash === '#boardContent') {
    active = true;
    body.classList.add('board-panel-active');
    hero.setAttribute('aria-hidden', 'true');
    panel.removeAttribute('aria-hidden');
  } else {
    panel.setAttribute('aria-hidden', 'true');
  }
})();