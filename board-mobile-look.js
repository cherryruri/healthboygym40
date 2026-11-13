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
    if (search) {search.placeholder = '공지와 게시글을 검색해 보세요';search.style.setProperty('border','0','important');search.style.setProperty('border-bottom','0','important');search.style.setProperty('border-bottom-width','0','important');search.style.setProperty('border-bottom-style','none','important');search.style.setProperty('box-shadow','none','important');}
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
















(() => {
 const media=matchMedia('(max-width:768px)');
 const boot=()=>{
  if(!media.matches||document.querySelector('.travel-board-mobile'))return;
  const params=new URLSearchParams(location.search),board=params.get('board')||'free';
  if(['request','teen','infoboard'].includes(board)||params.get('category')==='request')return;
  const shell=document.querySelector('.board-content-shell'),searchField=document.querySelector('.board-search-field');
  const searchInput=document.getElementById('boardSearch');if(searchInput){searchInput.style.setProperty('border','0','important');searchInput.style.setProperty('border-bottom','0','important');searchInput.style.setProperty('border-bottom-width','0','important');searchInput.style.setProperty('border-bottom-style','none','important');searchInput.style.setProperty('box-shadow','none','important');}
  if(!shell||!searchField)return;
  document.body.classList.add('travel-board-mobile-active');
  const stage = document.createElement('section');
  stage.className = 'travel-board-mobile';
  stage.innerHTML = `
    <div class="travel-board-hero" style="background-image: url(센터전체사진1.jpg)">
      <video class="travel-board-video" muted playsinline webkit-playsinline loop preload="metadata" aria-hidden="true"></video>
      <div class="travel-board-shade"></div>
      <div class="travel-board-copy">
        <span>HEALTHBOYGYM SUNAE</span>
        <h1>운동이 즐거워지는
새로운 공간</h1>
        <p>더 좋은 시설과 편안한 분위기에서 건강한 일상을 시작하세요.</p>
      </div>
    </div>
    <div class="travel-board-content"><div class="travel-board-search-panel"></div></div>
  `;
  shell.before(stage);
  const video = stage.querySelector('.travel-board-video');
  const siteHeader=document.getElementById('site-header');if(siteHeader)document.body.prepend(siteHeader);
  const contentLayer=stage.querySelector('.travel-board-content');stage.querySelector('.travel-board-search-panel').append(searchField);
  const searchIcon=document.createElement('span');searchIcon.className='travel-search-icon';searchIcon.setAttribute('aria-hidden','true');searchIcon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m16.5 16.5 4 4"></path></svg>';searchField.append(searchIcon);
  contentLayer.append(shell);
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  video.addEventListener('playing',()=>{
   if(!video.paused&&video.readyState>=2)video.classList.add('is-playing');
  });
  video.addEventListener('error', () => video.classList.remove('is-playing'));
  video.src = '센터 드론 영상.mp4';
  video.play()?.catch(() => video.classList.remove('is-playing'));
 };
 const style=document.createElement('style');
 style.textContent='@media(min-width:0px){body.travel-board-mobile-active{background:#fff!important}body.travel-board-mobile-active #site-header#site-header{position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:10000!important;height:64px!important;background:transparent!important;background-color:transparent!important;border:0!important;box-shadow:none!important;opacity:1!important;backdrop-filter:none!important}body.travel-board-mobile-active:not(.menu-open) #site-header .navbar{background:transparent!important;background-color:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}body.travel-board-mobile-active #site-header .logo a,body.travel-board-mobile-active #site-header .mobile-menu-btn{color:#fff!important;-webkit-text-fill-color:#fff!important}body.travel-board-mobile-active .board-page{position:relative;z-index:2;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;background:transparent!important}body.menu-open .travel-board-hero{z-index:9999!important;overflow:visible!important}body.menu-open #site-header#site-header{position:fixed!important;inset:0 0 auto 0!important;z-index:10000!important}body.menu-open #site-header .mobile-side-menu{max-height:calc(100svh - 64px)!important;overflow-y:auto!important}body.travel-board-mobile-active .board-operation-hero,body.travel-board-mobile-active .desktop-community-hero:not(.board-inline-carousel),body.travel-board-mobile-active .mall-stories,body.travel-board-mobile-active .cinema-top-tabs,body.travel-board-mobile-active .cinema-extras,body.travel-board-mobile-active .mobile-board-nav,body.travel-board-mobile-active .mobile-board-quick-links{display:none!important}.travel-board-mobile{position:relative;left:50%;width:100vw!important;max-width:none!important;margin-left:0!important;transform:translateX(-50%);padding-top:clamp(470px,78vh,620px);display:block;background:transparent;color:#111}.travel-board-hero{position:fixed;top:-72px;left:0;right:0;z-index:1;width:100%;height:calc(clamp(470px,78vh,620px) + 72px);overflow:hidden;background:#171717}.travel-board-hero{background-size:cover;background-position:center}.travel-board-video:not(.is-playing){visibility:hidden}.travel-board-video{pointer-events:none;position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center;background:#171717;transition:transform .45s ease}.travel-board-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.08) 42%,rgba(0,0,0,.64))}.travel-board-copy{position:absolute;left:30px;right:26px;bottom:82px;z-index:2;color:#fff;text-align:left}.travel-board-copy>span{display:block;margin-bottom:14px;font-size:11px;font-weight:750;letter-spacing:.13em}.travel-board-copy h1{margin:0!important;white-space:pre-line;font-size:clamp(32px,9vw,46px)!important;line-height:1.25!important;letter-spacing:-.055em!important;color:#fff!important;text-align:left!important}.travel-board-copy p{margin:14px 0 22px!important;font-size:15px!important;line-height:1.65!important;color:rgba(255,255,255,.88)!important;text-align:left!important}.travel-board-copy a{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:24px;background:#fff;color:#151515!important;font-size:13px;font-weight:700;text-decoration:none}.travel-board-content{position:relative;z-index:6;width:100%;margin-top:-72px;border-radius:42px 42px 0 0;background:#fff;box-shadow:0 -12px 32px rgba(0,0,0,.12);animation:travelPanelRise .78s cubic-bezier(.22,.8,.28,1) both;will-change:transform;overflow:hidden}.travel-board-search-panel{position:relative;padding:42px 24px 28px;background:#fff}.travel-board-search-panel>p{display:none!important}.travel-board-search-panel .board-search-field{position:relative!important;display:block!important;width:100%!important;height:56px!important;margin:0!important;border:1px solid #d5d5d5!important;border-radius:999px!important;background:#fff!important;background-image:none!important;box-shadow:none!important;box-sizing:border-box!important;overflow:hidden!important}.travel-board-search-panel .board-search-field:before,.travel-board-search-panel .board-search-field:after{display:none!important}body.travel-board-mobile-active .travel-board-search-panel #boardSearch{display:block!important;width:100%!important;height:54px!important;padding:0 54px 0 20px!important;border:0!important;border-width:0!important;border-style:none!important;border-color:transparent!important;border-bottom:0!important;border-radius:999px!important;background:transparent!important;background-image:none!important;color:#222!important;font-size:15px!important;box-shadow:none!important;outline:0!important;-webkit-appearance:none!important;appearance:none!important}.travel-board-search-panel .board-search-field i{display:none!important}.travel-search-icon{position:absolute;right:19px;top:50%;z-index:3;width:22px;height:22px;display:grid;place-items:center;transform:translateY(-50%);color:#202020;pointer-events:none}.travel-search-icon svg{width:22px;height:22px;display:block}html body.travel-board-mobile-active .travel-board-mobile .travel-board-search-panel #boardSearch#boardSearch#boardSearch{border:0!important;border-bottom:0!important;border-bottom-width:0!important;border-bottom-style:none!important;box-shadow:none!important}body.travel-board-mobile-active #site-header{display:none!important}body.travel-board-mobile-active .site-top-button,body.travel-board-mobile-active .site-phone-button{display:none!important}.travel-quick-dock{position:fixed;right:18px;bottom:18px;z-index:12000;display:flex;flex-direction:column;align-items:center;gap:10px}.travel-quick-actions{display:flex;flex-direction:column;gap:10px;pointer-events:none}.travel-quick-actions a,.travel-quick-toggle,.travel-quick-phone{width:54px;height:54px;border:0;border-radius:50%;display:grid;place-items:center;text-decoration:none;box-shadow:0 8px 22px rgba(0,0,0,.18)}.travel-quick-actions a{background:#f15b47;color:#fff;opacity:0;transform:translateY(22px) scale(.72);transition:opacity .25s ease,transform .38s cubic-bezier(.22,1,.36,1)}.travel-quick-actions a:nth-child(2){transition-delay:.04s}.travel-quick-actions a:nth-child(1){transition-delay:.08s}.travel-quick-dock.is-open .travel-quick-actions{pointer-events:auto}.travel-quick-dock.is-open .travel-quick-actions a{opacity:1;transform:none}.travel-quick-toggle{background:#ffbec6;color:#111;font-size:38px;font-weight:300;line-height:1;cursor:pointer}.travel-quick-toggle span{display:block;transition:transform .32s ease}.travel-quick-dock.is-open .travel-quick-toggle span{transform:rotate(45deg)}.travel-quick-phone{background:#111;color:#fff}.travel-quick-dock svg{width:25px;height:25px;display:block}@keyframes travelPanelRise{from{transform:translateY(110px)}to{transform:translateY(0)}}.travel-board-content>.board-content-shell{position:relative;z-index:6;background:#fff;padding-top:8px!important}.travel-board-content>.board-content-shell .board-bottom{justify-content:flex-end!important}.travel-board-content>.board-content-shell .board-toolbar{padding-top:0!important}@media(min-width:769px){body.travel-board-mobile-active #site-header#site-header{display:block!important;position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:10000!important;height:80px!important;background:#050505!important;background-color:#050505!important}body.travel-board-mobile-active #site-header .navbar{display:flex!important;background:#050505!important;background-color:#050505!important;border:0!important;box-shadow:none!important}.travel-board-mobile{padding-top:720px}.travel-board-hero{top:-80px;height:800px}.travel-board-copy{left:max(64px,calc((100vw - 1200px)/2));right:auto;bottom:118px;width:min(620px,48vw)}.travel-board-copy h1{font-size:58px!important;line-height:1.14!important}.travel-board-copy p{font-size:17px!important}.travel-board-content{margin-top:-92px;border-radius:54px 54px 0 0}.travel-board-search-panel{padding:56px 40px 34px}.travel-board-search-panel .board-search-field{max-width:760px;margin:0 auto!important}.travel-board-content>.board-content-shell{width:min(1200px,calc(100% - 64px))!important;max-width:1200px!important;margin:0 auto!important;padding:34px 0 80px!important}.travel-quick-dock{right:32px;bottom:28px}.travel-quick-actions a,.travel-quick-toggle,.travel-quick-phone{width:58px;height:58px}}}';
 document.head.append(style);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
;(() => {
 const style=document.createElement('style');
 style.textContent='@media(min-width:769px){body.travel-board-mobile-active .travel-quick-dock{display:none!important}body.travel-board-mobile-active .travel-board-content>.board-content-shell{display:block!important;width:calc(100vw - 64px)!important;max-width:1200px!important;min-width:0!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important;left:auto!important;right:auto!important;transform:none!important}body.travel-board-mobile-active .travel-board-content>.board-content-shell>*{max-width:100%!important;min-width:0!important;box-sizing:border-box!important}body.travel-board-mobile-active .mall-stories{display:block!important;width:100%!important;max-width:1200px!important;margin:0 auto 54px!important}body.travel-board-mobile-active .mall-story-grid{width:100%!important}body.travel-board-mobile-active .site-top-button,body.travel-board-mobile-active .site-phone-button{display:grid!important}}';
 document.head.append(style);
})();

;(() => {
 const center=()=>{if(!matchMedia('(min-width:769px)').matches)return;const shell=document.querySelector('.travel-board-content > .board-content-shell');if(!shell)return;[['display','block'],['width','calc(100vw - 64px)'],['max-width','1200px'],['min-width','0'],['box-sizing','border-box'],['margin-left','auto'],['margin-right','auto'],['left','auto'],['right','auto'],['transform','none']].forEach(([p,v])=>shell.style.setProperty(p,v,'important'));};
 const run=()=>{center();setTimeout(center,350);setTimeout(center,1000)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
