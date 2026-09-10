(() => {
 const params=new URLSearchParams(location.search);
 if(['infoboard','request','teen'].includes(params.get('board'))||params.get('category')==='request')return;
 const media=matchMedia('(min-width:769px)'),shell=document.querySelector('.board-content-shell');
 if(!shell)return;
 const booking='https://m.booking.naver.com/booking/6/bizes/593585/items/6533348?entry=pll&lang=ko&theme=place';
 const slides=[
 ['bodychallenge34-interview-poster.jpg','바디챌린지 34기<br>수내점 김영관 회원님 인터뷰','','인터뷰 영상 보기 ▶','bodychallenge34-interview.mp4'],
 ['프리웨이트존사진1.jpg','나에게 맞는<br>운동의 시작','당신의 목표에 한 걸음 더','트레이너 만나보기 →','index.html#trainer'],
 ['기구존사진1.jpg','오늘도 한 걸음,<br>더 나은 나로','건강한 일상이 시작되는 곳','시설 둘러보기 →','index.html#facility']
 ];
 const hero=document.createElement('section');hero.className='desktop-community-hero mall-carousel';hero.setAttribute('aria-label','센터 소개 슬라이드');hero.setAttribute('aria-roledescription','캐러셀');
 hero.innerHTML='<div class="mall-slide-track">'+slides.map((s,i)=>`<article class="mall-slide" aria-label="${i+1} / ${slides.length}"><img src="${s[0]}" alt="" ${i?'loading="lazy"':'fetchpriority="high"'}><div class="mall-slide-copy"><p>${s[1]}</p><span>${s[2]}</span><a href="${s[4]}">${s[3]}</a></div></article>`).join('')+'</div><button type="button" class="mall-prev" aria-label="이전 배너">‹</button><button type="button" class="mall-next" aria-label="다음 배너">›</button><div class="mall-slide-dots">'+slides.map((_,i)=>`<button type="button" aria-label="${i+1}번 배너" data-slide="${i}"></button>`).join('')+'</div><span class="mall-slide-count" aria-live="polite"></span>';
 shell.before(hero);
 let active=0;
 const showSlide=index=>{active=(index+slides.length)%slides.length;hero.querySelectorAll('.mall-slide').forEach((slide,i)=>{const position=(i-active+slides.length)%slides.length;slide.dataset.position=position;slide.setAttribute('aria-hidden',String(position!==0));slide.inert=position!==0;});hero.querySelectorAll('[data-slide]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));hero.querySelector('.mall-slide-count').textContent=`0${active+1} / 03`;hero.dispatchEvent(new Event("slidechange"));};
 hero.querySelector('.mall-prev').addEventListener('click',()=>showSlide(active-1));hero.querySelector('.mall-next').addEventListener('click',()=>showSlide(active+1));hero.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>showSlide(Number(b.dataset.slide))));
 hero.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showSlide(active+(e.key==='ArrowRight'?1:-1));}});showSlide(0);
 const stories=document.createElement('section');stories.className='mall-stories';stories.setAttribute('aria-label','지금 헬스보이짐');
 const cards=[['기구존사진1.jpg','센터의 새로운 소식','더 좋은 변화를 위한 소식들을 만나보세요.','news'],['community-trainer-v1.jpg','이달의 트레이너','회원의 목표를 함께하는 전문가들','trainer'],['community-mood-v2.jpg','회원들의 운동 이야기','오늘도 한 걸음 더, 함께 나누는 이야기','free'],['기구존사진1.jpg','칭찬합니다','고마운 마음과 따뜻한 칭찬을 나눠보세요.','praise']];
 stories.innerHTML='<div class="mall-section-heading"><h2>지금, 헬스보이짐</h2><a href="board.html?view=list">더보기 →</a></div><div class="mall-story-grid">'+cards.map(c=>`<a class="mall-story" href="board.html?board=free&category=${c[3]}&view=list"><img src="${c[0]}" alt="" loading="lazy"><span><strong>${c[1]}</strong><small>${c[2]}</small></span></a>`).join('')+'</div>';
 shell.before(stories);
 const main=document.createElement('div');main.className='mall-board-main';while(shell.firstChild)main.appendChild(shell.firstChild);shell.appendChild(main);
 const aside=document.createElement('aside');aside.className='mall-sidebar';aside.innerHTML=`<h2>자주 찾는 메뉴</h2><nav aria-label="게시판 바로가기"><a href="index.html#facility">시설 안내 <span>↗</span></a><a href="index.html#hours">운영시간 <span>↗</span></a><a href="index.html#location">오시는 길 <span>↗</span></a><a href="${booking}" target="_blank" rel="noopener noreferrer">상담 예약 <span>↗</span></a></nav><a class="mall-consult" href="${booking}" target="_blank" rel="noopener noreferrer"><img src="상담실사진.jpg" alt="헬스보이짐 상담 공간" loading="lazy"><span><strong>나에게 맞는<br>운동을 찾아보세요</strong><small>상담 알아보기 →</small></span></a>`;shell.appendChild(aside);
 const controls=document.createElement('div');controls.className='board-view-controls';controls.innerHTML='<button type="button" class="board-view-toggle">게시글 전체 보기 →</button>';main.appendChild(controls);const toggle=controls.querySelector('button');
 const applyView=()=>{const list=new URLSearchParams(location.search).get('view')==='list';document.body.classList.toggle('board-list-view',list);toggle.textContent=list?'커뮤니티 홈으로 돌아가기 ←':'게시글 전체 보기 →';window.dispatchEvent(new Event('board-view-change'));};
 toggle.addEventListener('click',()=>{const url=new URL(location.href);if(document.body.classList.contains('board-list-view'))url.searchParams.delete('view');else url.searchParams.set('view','list');history.pushState(null,'',url);applyView();shell.scrollIntoView({block:'start',behavior:'instant'});toggle.focus({preventScroll:true});});window.addEventListener('popstate',()=>location.reload());applyView();
 const footer=document.createElement('footer');footer.className='desktop-community-bottom mall-footer';footer.innerHTML='<strong>HEALTHBOYGYM <small>수내점</small></strong><span>건강한 일상이 시작되는 곳</span><nav aria-label="하단 안내"><a href="index.html#facility">시설 안내</a><a href="index.html#hours">운영시간</a><a href="index.html#location">오시는 길</a></nav>';shell.after(footer);
 const sync=()=>{document.body.classList.toggle('desktop-board',media.matches);if(media.matches){shell.removeAttribute('aria-hidden');document.body.classList.remove('board-header-over-hero');}};sync();media.addEventListener('change',sync);

 const interview=hero.querySelector('.mall-slide');interview.classList.add('mall-interview-slide');
 const still=interview.querySelector('img');still.remove();
 const preview=document.createElement('video');preview.className='mall-interview-preview';preview.muted=true;preview.defaultMuted=true;preview.loop=true;preview.autoplay=true;preview.playsInline=true;preview.preload='none';preview.poster='bodychallenge34-interview-poster.jpg';preview.setAttribute('aria-hidden','true');interview.prepend(preview);
 const openButton=document.createElement('button');openButton.type='button';openButton.className='mall-interview-open';openButton.setAttribute('aria-label','바디챌린지 34기 수내점 김영관 회원님 인터뷰 영상 보기');interview.appendChild(openButton);
 const pauseButton=document.createElement('button');pauseButton.type='button';pauseButton.className='mall-interview-pause';pauseButton.textContent='미리보기 일시정지';pauseButton.setAttribute('aria-label','배너 영상 미리보기 일시정지');interview.appendChild(pauseButton);
 const dialog=document.createElement('dialog');dialog.className='mall-interview-dialog';dialog.setAttribute('aria-label','김영관 회원님 인터뷰 영상');dialog.innerHTML='<button type="button" class="mall-interview-close" aria-label="영상 닫기">×</button><video controls playsinline preload="none" poster="bodychallenge34-interview-poster.jpg" aria-label="바디챌린지 34기 인터뷰"></video>';document.body.appendChild(dialog);
 const player=dialog.querySelector('video'),closeButton=dialog.querySelector('button');
 let userPaused=false,inView=false;
 const updatePreview=()=>{const playing=media.matches&&inView&&!document.hidden&&!dialog.open&&!document.body.classList.contains('board-list-view')&&interview.dataset.position==='0'&&!userPaused;if(playing){if(!preview.getAttribute('src'))preview.src='bodychallenge34-preview.mp4';preview.play().catch(()=>{});}else preview.pause();pauseButton.textContent=userPaused?'미리보기 재생':'미리보기 일시정지';pauseButton.setAttribute('aria-label',userPaused?'배너 영상 미리보기 재생':'배너 영상 미리보기 일시정지');};
 const openInterview=e=>{e.preventDefault();if(!player.getAttribute('src'))player.src='bodychallenge34-interview.mp4';dialog.showModal();preview.pause();player.currentTime=0;player.play().catch(()=>{});closeButton.focus();};
 openButton.addEventListener('click',openInterview);interview.querySelector('.mall-slide-copy a').addEventListener('click',openInterview);
 pauseButton.addEventListener('click',()=>{userPaused=!userPaused;updatePreview();});closeButton.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{player.pause();updatePreview();openButton.focus({preventScroll:true});});
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;updatePreview();},{threshold:.1}).observe(hero);
 hero.addEventListener('slidechange',updatePreview);document.addEventListener('visibilitychange',updatePreview);window.addEventListener('board-view-change',updatePreview);media.addEventListener('change',updatePreview);updatePreview();

})();
