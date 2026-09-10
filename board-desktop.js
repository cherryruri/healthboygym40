(() => {
  const params = new URLSearchParams(location.search);
  if (['infoboard','request','teen'].includes(params.get('board')) || params.get('category') === 'request') return;
  const media = matchMedia('(min-width:769px)');
  const shell = document.querySelector('.board-content-shell');
  if (!shell) return;
  const hero = document.createElement('section');
  hero.className = 'desktop-community-hero';
  hero.setAttribute('aria-label','헬스보이짐 수내점 커뮤니티');
  hero.innerHTML = '<img src="센터전체사진1.jpg" alt="헬스보이짐 수내점 전경" fetchpriority="high"><span class="desktop-hero-label">SUNAE COMMUNITY</span><div class="desktop-hero-caption"><p>함께 운동하고, 함께 나누는 이야기.</p><a href="#boardContent">게시글 둘러보기 <span aria-hidden="true">↗</span></a></div>';
  shell.before(hero);
  const lower = document.createElement('div');
  lower.className = 'desktop-community-bottom';
  lower.innerHTML = `<div class="desktop-community-links">
    <a href="index.html#facility"><img src="기구존사진1.jpg" alt="" loading="lazy"><span><strong>공간을 둘러보세요</strong><em>시설 투어 ↗</em></span></a>
    <a href="https://m.booking.naver.com/booking/6/bizes/593585/items/6533348?entry=pll&amp;lang=ko&amp;theme=place" target="_blank" rel="noopener noreferrer"><img src="상담실사진.jpg" alt="" loading="lazy"><span><strong>당신의 시작을 함께해요</strong><em>상담 예약 ↗</em></span></a>
  </div><footer class="desktop-community-footer"><div><strong>HEALTHBOY GYM <small>수내점</small></strong><p>건강한 일상이 시작되는 곳</p></div><nav aria-label="게시판 하단 안내"><a href="index.html#facility">시설 안내</a><a href="index.html#hours">운영시간</a><a href="index.html#location">오시는 길</a></nav><small>© HEALTHBOY GYM. All rights reserved.</small></footer>`;
  shell.after(lower);
  const sync = () => {
    document.body.classList.toggle('desktop-board',media.matches);
    if (media.matches) {
      shell.removeAttribute('aria-hidden');
      document.body.classList.remove('board-header-over-hero');
    }
  };
  sync(); media.addEventListener('change',sync);
})();
