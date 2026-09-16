(() => {
  const header = document.getElementById('site-header');
  if (!header) return;
  let lastY = Math.max(0, scrollY);
  let distance = 0;
  let direction = 0;
  let queued = false;
  let holdUntil = 0;
  const show = () => header.classList.remove('site-header-hidden');
  function update() {
    queued = false;
    const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = y - lastY;
    lastY = y;
    if (y < 12 || document.body.classList.contains('menu-open') || performance.now() < holdUntil) {
      show(); distance = 0; return;
    }
    if (Math.abs(delta) < 1) return;
    const nextDirection = Math.sign(delta);
    distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
    direction = nextDirection;
    if (direction < 0 && distance >= 8) show();
    else if (direction > 0 && distance >= 36 && y > header.offsetHeight + 24) header.classList.add('site-header-hidden');
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, {passive: true});
  header.addEventListener('focusin', show);
  header.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    const toggle = header.querySelector('.mobile-menu-btn');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    toggle.focus();
  });
  header.addEventListener('click', () => { show(); holdUntil = performance.now() + 1000; });
  addEventListener('pageshow', () => { lastY = Math.max(0, scrollY); show(); });
  new MutationObserver(() => {
    if (document.body.classList.contains('menu-open')) show();
  }).observe(document.body, {attributes:true, attributeFilter:['class']});
})();








// Remember deliberate navigation before another page loads.
document.addEventListener('click', event => {
 const link=event.target.closest('a[href]');if(!link)return;
 const url=new URL(link.href,location.href);if(url.origin!==location.origin)return;
 try{
  if(link.closest('#site-header .logo'))sessionStorage.setItem('hb-replay-loader','1');
  else sessionStorage.setItem('hb-internal-navigation','1');
 }catch(_){}
},{capture:true});








(()=>{if(document.querySelector('.site-quick-actions'))return;const group=document.createElement('nav');group.className='site-quick-actions';group.setAttribute('aria-label','빠른 이동');const top=document.createElement('button');top.type='button';top.className='site-top-button';top.textContent='TOP';top.setAttribute('aria-label','맨 위로 이동');top.addEventListener('click',()=>{const event=new CustomEvent('site:top',{cancelable:true});if(window.dispatchEvent(event))window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});const phone=document.querySelector('.hb-call-float')||document.createElement('a');phone.className='site-phone-button';phone.href='tel:050713802239';phone.setAttribute('aria-label','헬스보이짐 수내점 전화하기');phone.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg>';group.append(top,phone);document.body.append(group)})();
;(() => {
  const media = matchMedia('(max-width: 768px)');
  if (!media.matches) return;
  const mount = () => {
    document.body.classList.add('global-mobile-quick-menu');
    if (document.querySelector('.travel-quick-dock')) return;
    const dock = document.createElement('nav');
    dock.className = 'travel-quick-dock';
    dock.setAttribute('aria-label','빠른 메뉴');
    dock.innerHTML = '<div class="travel-quick-actions"><a href="index.html" aria-label="홈"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 11 9-8 9 8v9H3z"/><path d="M9 20v-6h6v6"/></svg></a><a href="mypage.html" aria-label="마이페이지"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/></svg></a><a href="board.html?board=noticeboard" aria-label="공지사항"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></a></div><button class="travel-quick-toggle" type="button" aria-label="빠른 메뉴 열기" aria-expanded="false"><span>+</span></button><a class="travel-quick-phone" href="tel:050713802239" aria-label="전화하기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1.5 1.5 0 0 1 1.5-.36l3.2 1.05a1.5 1.5 0 0 1 1.03 1.43V20a1.5 1.5 0 0 1-1.5 1.5C10.17 21.5 2.5 13.83 2.5 4.5A1.5 1.5 0 0 1 4 3h2.68a1.5 1.5 0 0 1 1.43 1.03l1.05 3.2a1.5 1.5 0 0 1-.36 1.5z"/></svg></a>';
    document.body.append(dock);
    const toggle = dock.querySelector('.travel-quick-toggle');
    toggle.addEventListener('click', () => {
      const open = dock.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '빠른 메뉴 닫기' : '빠른 메뉴 열기');
    });
  };
  const style = document.createElement('style');
  style.textContent = '@media(max-width:768px){body.global-mobile-quick-menu #site-header{display:none!important}body.global-mobile-quick-menu .site-floating-actions,body.global-mobile-quick-menu .site-top-button,body.global-mobile-quick-menu .site-phone-button{display:none!important}.travel-quick-dock{position:fixed;right:18px;bottom:18px;z-index:12000;display:flex;flex-direction:column;align-items:center;gap:10px}.travel-quick-actions{display:flex;flex-direction:column;gap:10px;pointer-events:none}.travel-quick-actions a,.travel-quick-toggle,.travel-quick-phone{width:54px;height:54px;border:0;border-radius:50%;display:grid;place-items:center;text-decoration:none;box-shadow:0 8px 22px rgba(0,0,0,.18)}.travel-quick-actions a{background:#f15b47;color:#fff;opacity:0;transform:translateY(22px) scale(.72);transition:opacity .25s ease,transform .38s cubic-bezier(.22,1,.36,1)}.travel-quick-actions a:nth-child(2){transition-delay:.04s}.travel-quick-actions a:nth-child(1){transition-delay:.08s}.travel-quick-dock.is-open .travel-quick-actions{pointer-events:auto}.travel-quick-dock.is-open .travel-quick-actions a{opacity:1;transform:none}.travel-quick-toggle{background:#ffbec6;color:#111;font-size:38px;font-weight:300;line-height:1;cursor:pointer}.travel-quick-toggle span{display:block;transition:transform .32s ease}.travel-quick-dock.is-open .travel-quick-toggle span{transform:rotate(45deg)}.travel-quick-phone{background:#111;color:#fff}.travel-quick-dock svg{width:25px;height:25px;display:block}}';
  document.head.append(style);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mount,0), {once:true});
  else setTimeout(mount,0);
})();
;(() => {
  const ensureDesktopMyPage = () => {
    if (matchMedia('(max-width: 768px)').matches) return;
    const menu = document.querySelector('#site-header .menu');
    if (!menu || menu.querySelector('a[href="mypage.html"]')) return;
    const item = document.createElement('li');
    item.className = 'mypage-menu';
    item.innerHTML = '<a href="mypage.html">MY PAGE</a>';
    const login = menu.querySelector('.login-menu');
    menu.insertBefore(item, login || null);
  };
  const icons = {
    home:'<path d="m3 11 9-8 9 8v9H3z"/><path d="M9 20v-6h6v6"/>',
    about:'<path d="M4 21V5l8-3 8 3v16"/><path d="M8 9h1M8 13h1M15 9h1M15 13h1M10 21v-4h4v4"/>',
    pass:'<path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z"/><path d="M12 6v12"/>',
    space:'<path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12"/>',
    trainer:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21c.6-4.2 3-6.3 7-6.3s6.4 2.1 7 6.3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    location:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',
    board:'<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    mypage:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/>',
    login:'<path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/>'
  };
  const links = [
    ['index.html','홈','home'],['company.html','회사소개','about'],['allpass.html','올패스','pass'],
    ['index.html#facility','시설 투어','space'],['index.html#trainer','트레이너 소개','trainer'],
    ['index.html#hours','운영 시간','clock'],['index.html#location','오시는 길','location'],
    ['board.html','공지문/자유게시판','board'],['mypage.html','마이페이지','mypage'],['login.html','로그인','login']
  ];
  const mountAllMobileMenus = () => {
    if (!matchMedia('(max-width: 768px)').matches) return;
    document.body.classList.add('global-mobile-quick-menu');
    let dock = document.querySelector('.travel-quick-dock');
    if (!dock) { dock = document.createElement('nav'); dock.className='travel-quick-dock'; document.body.append(dock); }
    dock.setAttribute('aria-label','전체 메뉴');
    const actions = links.map(([href,label,key]) => '<a href="'+href+'" aria-label="'+label+'" title="'+label+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[key]+'</svg></a>').join('');
    dock.innerHTML = '<div class="travel-quick-actions">'+actions+'</div><button class="travel-quick-toggle" type="button" aria-label="전체 메뉴 열기" aria-expanded="false"><span>+</span></button><a class="travel-quick-phone" href="tel:050713802239" aria-label="전화하기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1.5 1.5 0 0 1 1.5-.36l3.2 1.05a1.5 1.5 0 0 1 1.03 1.43V20a1.5 1.5 0 0 1-1.5 1.5C10.17 21.5 2.5 13.83 2.5 4.5A1.5 1.5 0 0 1 4 3h2.68a1.5 1.5 0 0 1 1.43 1.03l1.05 3.2a1.5 1.5 0 0 1-.36 1.5z"/></svg></a>';
    const toggle=dock.querySelector('.travel-quick-toggle');
    toggle.addEventListener('click',()=>{const open=dock.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'전체 메뉴 닫기':'전체 메뉴 열기');});
  };
  const style=document.createElement('style');
  style.textContent='@media(min-width:769px){.travel-quick-dock{display:none!important}}@media(max-width:768px){body.global-mobile-quick-menu .travel-quick-actions{max-height:calc(100vh - 146px);overflow-y:auto;scrollbar-width:none;padding:4px}body.global-mobile-quick-menu .travel-quick-actions::-webkit-scrollbar{display:none}body.global-mobile-quick-menu .travel-quick-actions a{width:50px;height:50px;background:#f4c400!important;color:#161616!important;box-shadow:0 7px 18px rgba(0,0,0,.2)!important}body.global-mobile-quick-menu .travel-quick-toggle{background:#f4c400!important;color:#111!important}body.global-mobile-quick-menu .travel-quick-actions a:nth-child(n){transition-delay:0s!important}body.global-mobile-quick-menu .travel-quick-dock svg{width:24px;height:24px}}';
  document.head.append(style);
  const run=()=>{ensureDesktopMyPage();setTimeout(mountAllMobileMenus,120)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
;(() => {
  const media=matchMedia('(max-width:768px)');
  if(!media.matches)return;
  const restore=()=>{
    document.body.classList.remove('global-mobile-quick-menu');
    document.querySelectorAll('.travel-quick-dock').forEach(el=>el.remove());
    const header=document.getElementById('site-header');
    if(header)header.style.setProperty('display','block','important');
  };
  const style=document.createElement('style');
  style.textContent='@media(max-width:768px){.travel-quick-dock{display:none!important}body #site-header#site-header{display:block!important}}';
  document.head.append(style);
  const run=()=>{restore();setTimeout(restore,180);setTimeout(restore,700);const observer=new MutationObserver(restore);observer.observe(document.body,{childList:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
