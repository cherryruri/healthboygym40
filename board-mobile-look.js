(() => {
 const cp=new URLSearchParams(location.search);
 if(!['infoboard','request','teen'].includes(cp.get('board'))&&cp.get('category')!=='request')return;
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
    hero.innerHTML = '<span class="mobile-board-eyebrow">HEALTHBOY GYM · 수내점</span><h2>우리 센터 이야기</h2><p>새로운 소식과 운동 이야기를 만나보세요.</p>';
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
      if (button) { event.preventDefault(); button.click(); } // Otherwise follow the real destination URL.
    });
    const news = document.createElement('section');
    news.className = 'mobile-board-news';
    const slides = [
      {image:'센터전체사진1.jpg', badge:'센터 이야기', title:'운동하고 싶은 공간,\n헬스보이짐 수내점', label:'시설 둘러보기', href:'index.html#facility'},
      {image:'프리웨이트존사진1.jpg', badge:'함께하는 운동', title:'함께 나누는\n우리의 운동 이야기', label:'운동후기 보기', href:'board.html?board=review&category=pt'},
      {image:'상담실사진.jpg', badge:'센터 소식', title:'알아두면 좋은\n센터 공지와 안내', label:'공지사항 보기', href:'board.html?board=noticeboard'}
    ];
    news.setAttribute('aria-label','센터 안내 배너');
    news.innerHTML = '<a class="mobile-board-news-card"><img alt="" decoding="async"><span class="mobile-board-news-copy"><span class="mobile-board-news-badge"></span><strong></strong><span class="mobile-board-slide-link"></span></span></a><div class="mobile-board-slide-controls" aria-label="배너 선택"></div>';
    const slideLink = news.querySelector('.mobile-board-news-card');
    const controls = news.querySelector('.mobile-board-slide-controls');
    function showSlide(index) {
      const slide = slides[index];
      slideLink.href = slide.href;
      slideLink.querySelector('img').src = slide.image;
      slideLink.querySelector('img').alt = slide.badge + ' · 헬스보이짐 수내점';
      slideLink.querySelector('.mobile-board-news-badge').textContent = slide.badge;
      slideLink.querySelector('strong').textContent = slide.title;
      slideLink.querySelector('.mobile-board-slide-link').textContent = slide.label + ' →';
      controls.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    }
    slides.forEach((slide,index)=>{
      const button=document.createElement('button');
      button.type='button'; button.setAttribute('aria-label',slide.badge+' 배너 보기');
      button.addEventListener('click',()=>showSlide(index)); controls.appendChild(button);
    });
    showSlide(0);
    const quickLinks = document.createElement('div');
    quickLinks.className = 'mobile-board-quick-links';
    quickLinks.innerHTML = '<a href="index.html#facility"><img src="기구존사진1.jpg" alt="" loading="lazy"><span>시설 안내 <i aria-hidden="true">→</i></span></a><a href="index.html#hours"><img src="상담실사진.jpg" alt="" loading="lazy"><span>이용 안내 <i aria-hidden="true">→</i></span></a>';
    const listTitle = document.createElement('div');
    listTitle.className = 'mobile-board-section-title mobile-board-list-title';
    listTitle.innerHTML = '<h2>회원들의 이야기</h2><span>최신순 · 공지 우선</span>';
    shell.prepend(hero,news,nav,listTitle);
    shell.appendChild(quickLinks);
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
      const title = request ? '1:1 문의' : official ? '센터 소식' : '우리 센터 이야기';
      const subtitle = request ? '작성자와 관리자만 확인할 수 있어요.' : official ? '센터의 공지와 새로운 소식을 확인하세요.' : '새로운 소식과 운동 이야기를 만나보세요.';
      if (hero.querySelector('h2').textContent !== title) hero.querySelector('h2').textContent = title;
      if (hero.querySelector('p').textContent !== subtitle) hero.querySelector('p').textContent = subtitle;
      news.hidden = request;
      quickLinks.hidden = request;
      const heading = request ? '내 문의' : official ? '공지와 뉴스' : '새로운 이야기';
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
      hero.remove(); nav.remove(); news.remove(); listTitle.remove(); back.remove(); quickLinks.remove();
      if (search) oldPlaceholder === null ? search.removeAttribute('placeholder') : search.setAttribute('placeholder',oldPlaceholder);
      document.body.classList.remove('mobile-board-look');
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
  media.addEventListener('change',sync);
})();
