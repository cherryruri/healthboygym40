(() => {
  const media = matchMedia('(max-width: 768px)');
  let cleanup = () => {};
  const icon = path => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  const icons = [
    icon('<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>'),
    icon('<path d="M4 10v5h4l10 4V5L8 10H4zM8 15l2 6h3l-2-5"/>'),
    icon('<path d="M7 9h10M7 15h10M3 8v8M7 6v12M17 6v12M21 8v8"/>'),
    icon('<path d="M20 16a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3zM7 8h9M7 12h6"/>')
  ];
  function sync() {
    cleanup();
    if (!media.matches || new URLSearchParams(location.search).get('board') === 'infoboard') return;
    const shell = document.querySelector('.board-content-shell'), bar = document.getElementById('boardCategoryBar');
    if (!shell || !bar) return;
    document.body.classList.add('mobile-board-look');
    const hero = document.createElement('section');
    hero.className = 'mobile-board-hero';
    hero.innerHTML = '<h2>우리의 운동 이야기</h2><p>함께 나누고, 함께 성장해요.</p>';
    const nav = document.createElement('nav');
    nav.className = 'mobile-board-nav';
    nav.setAttribute('aria-label', '게시판 바로가기');
    nav.innerHTML = [
      ['all','전체','board.html'],
      ['notice','공지사항','board.html?board=noticeboard'],
      ['review','운동후기','board.html?board=review&category=pt'],
      ['community','자유게시판','board.html?board=free&category=free']
    ].map(([key,label,href],i) => '<a href="'+href+'" data-board-shortcut="'+key+'">'+icons[i]+'<span>'+label+'</span></a>').join('');
    nav.addEventListener('click', event => {
      const link = event.target.closest('[data-board-shortcut]');
      if (!link || document.body.dataset.board !== 'free' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const category = {all:'all', review:'pt', community:'free'}[link.dataset.boardShortcut];
      if (!category) return;
      const button = bar.querySelector('[data-category="'+category+'"]');
      if (button) { event.preventDefault(); button.click(); }
    });
    const news = document.createElement('section');
    news.className = 'mobile-board-news';
    news.innerHTML = '<div class="mobile-board-section-title"><h2>센터 소식</h2><a href="board.html?board=noticeboard">전체 보기 ↗</a></div><a class="mobile-board-news-card" href="board.html?board=noticeboard"><img src="센터전체사진1.jpg" alt="헬스보이짐 수내점 시설" loading="lazy"><span class="mobile-board-news-badge">NOTICE</span><span class="mobile-board-news-copy"><strong>센터의 새로운 소식</strong><span>공지와 이용 안내를 확인해 보세요 ↗</span></span></a>';
    const listTitle = document.createElement('div');
    listTitle.className = 'mobile-board-section-title mobile-board-list-title';
    listTitle.innerHTML = '<h2>회원들의 이야기</h2><span>최신순 · 공지 우선</span>';
    shell.prepend(hero,nav,news,listTitle);
    const back = document.createElement('a');
    back.className = 'mobile-board-back';
    back.href = 'index.html';
    back.innerHTML = '<span aria-hidden="true">←</span> 홈';
    document.querySelector('#site-header .navbar')?.prepend(back);
    const search = document.getElementById('boardSearch');
    const oldPlaceholder = search?.getAttribute('placeholder');
    if (search) search.placeholder = '게시글을 검색해 보세요';
    const decorate = () => {
      const board = document.body.dataset.board;
      const official = board === 'noticeboard' || board === 'news', request = board === 'request';
      const category = bar.querySelector('[data-category].active')?.dataset.category || 'all';
      const active = official ? 'notice' : ['pt','before_after','challenge'].includes(category) ? 'review' : category === 'all' ? 'all' : 'community';
      nav.querySelectorAll('a').forEach(link => {
        if (link.dataset.boardShortcut === active && !request) link.setAttribute('aria-current','page');
        else link.removeAttribute('aria-current');
      });
      const title = request ? '1:1 문의' : official ? '센터 소식' : '우리의 운동 이야기';
      const subtitle = request ? '작성자와 관리자만 확인할 수 있어요.' : official ? '센터의 공지와 새로운 소식을 확인하세요.' : '함께 나누고, 함께 성장해요.';
      if (hero.querySelector('h2').textContent !== title) hero.querySelector('h2').textContent = title;
      if (hero.querySelector('p').textContent !== subtitle) hero.querySelector('p').textContent = subtitle;
      news.hidden = official || request;
      const heading = request ? '내 문의' : official ? '공지와 뉴스' : '회원들의 이야기';
      if (listTitle.querySelector('h2').textContent !== heading) listTitle.querySelector('h2').textContent = heading;
      shell.querySelectorAll('.board-post').forEach(card => {
        if (!card.hasAttribute('tabindex')) {
          card.tabIndex=0; card.setAttribute('role','link'); card.dataset.mobileBoardKeyboard='true';
        }
      });
    };
    const onKey = event => {
      if (event.key === 'Enter' && event.target.matches('[data-mobile-board-keyboard]')) event.target.click();
    };
    shell.addEventListener('keydown',onKey);
    const observer = new MutationObserver(decorate);
    observer.observe(shell,{childList:true,subtree:true});
    decorate();
    cleanup = () => {
      observer.disconnect(); shell.removeEventListener('keydown',onKey);
      shell.querySelectorAll('[data-mobile-board-keyboard]').forEach(card => {
        card.removeAttribute('tabindex'); card.removeAttribute('role'); delete card.dataset.mobileBoardKeyboard;
      });
      hero.remove(); nav.remove(); news.remove(); listTitle.remove(); back.remove();
      if (search) oldPlaceholder === null ? search.removeAttribute('placeholder') : search.setAttribute('placeholder',oldPlaceholder);
      document.body.classList.remove('mobile-board-look');
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
  media.addEventListener('change',sync);
})();
