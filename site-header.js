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
