(() => {
  const desktop = window.matchMedia('(min-width: 769px)');

  const body = document.body;
  const hero = document.querySelector('.board-operation-hero');
  const panel = document.querySelector('.board-content-shell');
  const trigger = document.querySelector('.board-operation-scroll');
  if (!hero || !panel || !trigger) return;

  const params = new URLSearchParams(location.search);
  const isInfoBoard = params.get('board') === 'infoboard';
  const introType = isInfoBoard ? 'info' : 'community';
  const introKey = `hbg-board-intro-seen-v1:${introType}`;
  const titleText = isInfoBoard ? 'INFO BOARD' : 'COMMUNITY';
  const title = document.getElementById('boardOperationTitle');
  const kickerLabel = document.querySelector('.board-operation-kicker span:last-child');
  const lead = document.querySelector('.board-operation-lead');
  const copy = document.querySelector('.board-operation-copy');
  const guideLabel = document.querySelector('.board-operation-label span');
  const sectionIndex = document.querySelector('.board-section-index');

  if (kickerLabel) kickerLabel.textContent = titleText;
  if (title) {
    title.setAttribute('aria-label', titleText);
    title.innerHTML = Array.from(titleText)
      .map((letter, index) => `<span style="--letter:${index}">${letter === ' ' ? '&nbsp;' : letter}</span>`)
      .join('');
  }

  if (isInfoBoard) {
    if (lead) lead.innerHTML = '<span>센터 운영 정보를,</span> <span>한곳에서 공유합니다.</span>';
    if (copy) {
      copy.innerHTML = `
        <p>헬스보이짐 수내점 관리자 전용 인포게시판입니다.</p>
        <p>FC, 필라테스, 헬스, PT 운영 정보를 빠르고 정확하게 확인하세요.</p>
      `;
    }
    if (guideLabel) guideLabel.textContent = 'INFO GUIDE';
    if (sectionIndex) sectionIndex.textContent = '01 / INFO BOARD';
  }

  let hasSeenIntro = document.documentElement.classList.contains('board-intro-seen');

  try {
    hasSeenIntro = localStorage.getItem(introKey) === '1';
    if (!hasSeenIntro) localStorage.setItem(introKey, '1');
  } catch (error) {}

  if (!desktop.matches) return;

  body.classList.add('board-panel-ready');
  panel.setAttribute('tabindex', '-1');

  let active = hasSeenIntro;
  let introDismissed = hasSeenIntro;
  let locked = false;
  let touchStartY = 0;

  const lockBriefly = () => {
    locked = true;
    window.setTimeout(() => { locked = false; }, 760);
  };

  const showBoard = (updateHash = true) => {
    if (active || locked) return;
    active = true;
    introDismissed = true;
    lockBriefly();
    body.classList.add('board-panel-active');
    hero.setAttribute('aria-hidden', 'true');
    panel.removeAttribute('aria-hidden');
    panel.scrollTop = 0;
    if (updateHash) history.replaceState(null, '', '#boardContent');
    window.setTimeout(() => panel.focus({ preventScroll:true }), 600);
  };

  const showIntro = (updateHash = true) => {
    if (!active || locked || introDismissed) return;
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

  if (hasSeenIntro || location.hash === '#boardContent') {
    active = true;
    introDismissed = true;
    body.classList.add('board-panel-active');
    hero.setAttribute('aria-hidden', 'true');
    panel.removeAttribute('aria-hidden');
  } else {
    panel.setAttribute('aria-hidden', 'true');
  }
})();
