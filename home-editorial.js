(()=>{
const home=document.getElementById('hbHome');if(!home)return;
const chapters=[...home.querySelectorAll('.hb-chapter')],nav=home.querySelector('.hb-page-nav'),links=[...nav.querySelectorAll('a')],pt=home.querySelector('.hb-pt'),video=pt.querySelector('video'),toggle=pt.querySelector('.hb-video-toggle');let frame=0,paused=false,inView=false,aiState=null,cardStateReady=false;
const clamp=v=>Math.max(0,Math.min(1,v));let revealTimer=0;
function paint(){frame=0;const h=innerHeight;let active=0;chapters.forEach((el,i)=>{if(el.getBoundingClientRect().top<h*.5)active=i});if(home.getBoundingClientRect().bottom<=1||home.getBoundingClientRect().top>=h)active=-1;links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});let progressIndex=0;chapters.forEach((c,i)=>{if(c.getBoundingClientRect().top<=1)progressIndex=i;});const progressRect=chapters[progressIndex].getBoundingClientRect(),progress=clamp((progressIndex+1+clamp(-progressRect.top/progressRect.height))/chapters.length);nav.style.setProperty('--page-progress',String(progress));nav.setAttribute('aria-valuenow',String(Math.round(progress*100)));nav.setAttribute('aria-valuetext',`${active+1} / ${chapters.length} 섹션`);nav.hidden=chapters.at(-1).getBoundingClientRect().height>0&&chapters.at(-1).getBoundingClientRect().bottom<100;chapters.forEach((c,i)=>c.classList.toggle('is-current',i===active));const bodydotButton=home.querySelector('.hb-bodydot-link');if(bodydotButton)bodydotButton.tabIndex=active===2?0:-1;if(aiState)syncAiPlayback();if(cardStateReady)syncCardVideos();if(active===1&&Math.abs(pt.getBoundingClientRect().top)<h*.18){if(!pt.classList.contains('is-revealed')&&!revealTimer)revealTimer=setTimeout(()=>{pt.classList.add('is-revealed');pt.querySelector('.hb-pt-copy>div').inert=false;toggle.tabIndex=0;revealTimer=0;},240);}else if(active!==1){clearTimeout(revealTimer);revealTimer=0;pt.classList.remove('is-revealed');pt.querySelector('.hb-pt-copy>div').inert=true;toggle.tabIndex=-1;}}

function requestPaint(){if(!frame)frame=requestAnimationFrame(paint)}addEventListener('scroll',requestPaint,{passive:true});addEventListener('resize',requestPaint);new MutationObserver(requestPaint).observe(document.body,{attributes:true,attributeFilter:['class']});paint();
function playback(){if(inView&&!paused&&!document.hidden){if(!video.src)video.src=video.dataset.hbVideo;video.play().catch(()=>{});}else video.pause();toggle.textContent=paused?'▶':'Ⅱ';toggle.setAttribute('aria-label','상원 팀장님 영상 '+(paused?'재생':'일시정지'));}
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;playback()},{rootMargin:'100px'}).observe(pt);toggle.addEventListener('click',()=>{paused=!paused;playback()});document.addEventListener('visibilitychange',playback);
const welcome=home.querySelector('.hb-welcome'),welcomeVideo=home.querySelector('.hb-welcome-video');let welcomeVisible=true,welcomePrimed=false;
const welcomeStart=4;
function welcomePlayback(){if(welcomePrimed&&welcomeVisible&&!document.hidden&&document.body.classList.contains('loaded'))welcomeVideo.play().catch(()=>{});else welcomeVideo.pause();}
function markWelcomeReady(){if(welcomeVideo.currentTime<welcomeStart-.1)return;welcomePrimed=true;welcomeVideo.dataset.ready='true';welcomeVideo.style.opacity='1';welcomeVideo.dispatchEvent(new Event('hb-welcome-ready'));welcomePlayback();}
welcomeVideo.style.opacity='0';
welcomeVideo.addEventListener('loadedmetadata',()=>{welcomeVideo.currentTime=welcomeStart;});
welcomeVideo.addEventListener('seeked',markWelcomeReady);
welcomeVideo.addEventListener('loadeddata',markWelcomeReady);
welcomeVideo.addEventListener('ended',()=>{welcomeVideo.currentTime=welcomeStart;});
if(welcomeVideo.readyState>=1)welcomeVideo.currentTime=welcomeStart;
new IntersectionObserver(entries=>{welcomeVisible=entries[0].isIntersecting;welcomePlayback();}).observe(welcome);
document.addEventListener('visibilitychange',welcomePlayback);
new MutationObserver(welcomePlayback).observe(document.body,{attributes:true,attributeFilter:['class']});
let lockedUntil=0,lastWheel=0,touchStart=null;
const topOf=el=>scrollY+el.getBoundingClientRect().top;
function ready(){return home.offsetHeight>0&&document.body.classList.contains('loaded')&&!document.body.classList.contains('menu-open')&&!document.body.classList.contains('hb-bodydot-open')&&!document.body.classList.contains('hb-machine-open')&&!document.body.classList.contains('facility-gallery-open');}
function nearest(){let index=0,distance=Infinity;chapters.forEach((c,i)=>{const d=Math.abs(c.getBoundingClientRect().top);if(d<distance){distance=d;index=i;}});return index;}
function inChapters(direction,travel=0){const top=topOf(home),bottom=top+home.offsetHeight;return scrollY>=top-2&&scrollY<bottom-2||(direction<0&&scrollY>=top&&scrollY-Math.max(0,travel)<=bottom+90);}
let motionFrame=0,morph=null,introCard=null,sceneFade=null,horizontalActive=false;const slideVideos=[];
function cancelMotion(){slideVideos.splice(0).forEach(({video,marker})=>{marker.replaceWith(video);});horizontalActive=false;cancelAnimationFrame(motionFrame);motionFrame=0;finishMorph();if(sceneFade){sceneFade.remove();sceneFade=null;}document.documentElement.classList.remove('hb-page-moving');requestAnimationFrame(()=>{const visible=section=>{const r=section.getBoundingClientRect();return r.bottom>1&&r.top<innerHeight-1;};allpassVisible=visible(allpassSection);challengeVisible=visible(challengeSection);allpassPlayback();challengePlayback();});}
function go(index){
 if(motionFrame||horizontalActive||sceneFade)return;
 cancelMotion();index=Math.max(0,Math.min(chapters.length,index));chapters.forEach(c=>c.classList.remove('is-leaving'));if(nearest()===2&&index===3)home.querySelector('.hb-ai').classList.add('is-leaving');
 if(index===4&&home.querySelector('.hb-programs').classList.contains('is-current')){goDarkScene(4);return;}
 if(index===3&&chapters[4].classList.contains('is-current')){chapters[4].dispatchEvent(new Event('hb-reverse-intro'));goDarkScene(3);return;}
 if(index===5&&chapters[4].classList.contains('is-current')){goDarkScene(5);return;}
 if(index===4&&chapters[5].classList.contains('is-current')){goDarkScene(4,true);return;}
 if(index===6&&chapters[5].classList.contains('is-current')){goHorizontalScene(5,6);return;}
 if(index===5&&chapters[6]?.classList.contains('is-current')){goHorizontalScene(6,5);return;}
 const from=scrollY,target=index===chapters.length?topOf(home)+home.offsetHeight:index===4&&nearest()===5?topOf(chapters[4])+chapters[4].offsetHeight-chapters[4].querySelector('.hb-facility-stage').getBoundingClientRect().height:topOf(chapters[index]),start=performance.now(),duration=1250;
 if(nearest()===2&&index===3)beginMorph(target);
 if(index===2&&home.querySelector('.hb-programs').classList.contains('is-current'))beginMorph(target,true);
 lockedUntil=start+(index===1?2350:1400);
 document.documentElement.classList.add('hb-page-moving');
 function tick(now){const t=clamp((now-start)/duration),ease=t*t*t*(t*(t*6-15)+10);window.scrollTo({top:from+(target-from)*ease,behavior:'instant'});updateMorph(ease,t);if(t<1)motionFrame=requestAnimationFrame(tick);else{cancelMotion();requestPaint();}}
 motionFrame=requestAnimationFrame(tick);
}
function goHorizontalScene(fromIndex,toIndex){
 const source=chapters[fromIndex],destination=chapters[toIndex],target=topOf(destination),direction=toIndex>fromIndex?1:-1;horizontalActive=true;
 const surface=document.createElement('div');surface.className='hb-home hb-horizontal-scene';surface.setAttribute('aria-hidden','true');surface.inert=true;
 const panels=[source,destination].map(section=>{
  const panel=section.cloneNode(true);panel.removeAttribute('id');panel.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));panel.classList.add('is-current');if(section===destination)panel.classList.add('is-slide-entering');
  panel.querySelectorAll('video').forEach((v,i)=>{const original=section.querySelectorAll('video')[i],marker=document.createComment('video-home');original.before(marker);slideVideos.push({video:original,marker});v.replaceWith(original);if(!original.getAttribute('src'))original.src=original.dataset.src;if(original!==challengeVideo||challengePrimed)original.play().catch(()=>{});});
  surface.appendChild(panel);return panel;
 });
 document.body.appendChild(surface);sceneFade=surface;
 const start=performance.now(),duration=1100;lockedUntil=start+1350;document.documentElement.classList.add('hb-page-moving');
 function tick(now){const t=clamp((now-start)/duration),ease=t*t*t*(t*(t*6-15)+10);
  panels[0].style.transform=`translateX(${-direction*ease*100}%)`;panels[1].style.transform=`translateX(${direction*(1-ease)*100}%)`;
  if(t<1)motionFrame=requestAnimationFrame(tick);else{window.scrollTo({top:topOf(destination),behavior:'instant'});cancelMotion();requestPaint();}
 }
 tick(start);
}
function goDarkScene(index,atEnd=false){
 const surface=document.createElement('div');surface.className='hb-scene-fade';surface.setAttribute('aria-hidden','true');document.body.appendChild(surface);sceneFade=surface;
 const start=performance.now(),duration=1100,target=topOf(chapters[index])+(atEnd?chapters[index].offsetHeight-(chapters[index].querySelector('.hb-facility-stage')?.getBoundingClientRect().height||innerHeight):0);let switched=false;
 prepareAllpass();lockedUntil=start+1400;document.documentElement.classList.add('hb-page-moving');
 function tick(now){
  const t=clamp((now-start)/duration);
  if(t>=.5&&!switched){switched=true;window.scrollTo({top:target,behavior:'instant'});requestPaint();}
  const phase=t<.5?t*2:(1-t)*2;surface.style.opacity=String(phase*phase*(3-2*phase));
  if(t<1)motionFrame=requestAnimationFrame(tick);else{cancelMotion();requestPaint();}
 }
 motionFrame=requestAnimationFrame(tick);
}
const allpassSection=home.querySelector('.hb-space'),allpassVideo=allpassSection.querySelector('video');let allpassVisible=false;
function prepareAllpass(){if(!allpassVideo.getAttribute('src')){allpassVideo.src=allpassVideo.dataset.src;allpassVideo.load();}}
function allpassPlayback(){if(horizontalActive)return;if(allpassVisible&&!document.hidden&&!document.body.classList.contains('menu-open')){prepareAllpass();allpassVideo.play().catch(()=>{});}else allpassVideo.pause();}
new IntersectionObserver(entries=>{if(entries[0].isIntersecting)prepareAllpass();},{rootMargin:'100% 0px'}).observe(allpassSection);
new IntersectionObserver(entries=>{allpassVisible=entries[0].isIntersecting;allpassPlayback();}).observe(allpassSection);
document.addEventListener('visibilitychange',allpassPlayback);new MutationObserver(allpassPlayback).observe(document.body,{attributes:true,attributeFilter:['class']});
const challengeSection=home.querySelector('.hb-challenge'),challengeVideo=challengeSection.querySelector('video');let challengeVisible=false,challengePrimed=false;
const challengeStart=25;
challengeVideo.addEventListener('loadedmetadata',()=>{challengeVideo.currentTime=challengeStart;});
challengeVideo.addEventListener('seeked',()=>{if(challengeVideo.currentTime>=challengeStart-.05){challengePrimed=true;challengeVideo.classList.add('is-primed');if(horizontalActive)challengeVideo.play().catch(()=>{});else challengePlayback();}});
challengeVideo.addEventListener('ended',()=>{challengeVideo.currentTime=challengeStart;});
if(challengeVideo.readyState>=1)challengeVideo.currentTime=challengeStart;
function challengePlayback(){if(horizontalActive)return;if(challengeVisible&&!document.hidden&&!document.body.classList.contains('menu-open')){if(!challengeVideo.getAttribute('src'))challengeVideo.src=challengeVideo.dataset.src;if(challengePrimed)challengeVideo.play().catch(()=>{});}else challengeVideo.pause();}
new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!challengeVideo.getAttribute('src')){challengeVideo.src=challengeVideo.dataset.src;challengeVideo.load();}},{rootMargin:'100% 0px'}).observe(challengeSection);
new IntersectionObserver(entries=>{challengeVisible=entries[0].isIntersecting;challengePlayback();}).observe(challengeSection);
document.addEventListener('visibilitychange',challengePlayback);new MutationObserver(challengePlayback).observe(document.body,{attributes:true,attributeFilter:['class']});
function beginMorph(target,reverse=false){
 const source=home.querySelector('.hb-ai-video'),program=home.querySelector('.hb-programs');
 if(!reverse&&source.readyState<2)return;
 const surface=document.createElement('div');surface.className='hb-video-morph';surface.setAttribute('aria-hidden','true');
 if(source.readyState>=2){
  const canvas=document.createElement('canvas');canvas.width=source.videoWidth;canvas.height=source.videoHeight;
  try{canvas.getContext('2d').drawImage(source,0,0);surface.appendChild(canvas);}catch(e){return;}
 }else{const poster=document.createElement('img');poster.src=source.poster;poster.alt='';surface.appendChild(poster);}
 if(!reverse)addAiIntro(source);
 program.classList.add('is-morph-target');
 const card=program.querySelector('.hb-program-card[data-position="0"]'),r=card.getBoundingClientRect();
 const full={left:0,top:0,width:innerWidth,height:innerHeight,radius:0};
 const small={left:r.left,top:r.top-(reverse?0:target-scrollY),width:r.width,height:r.height,radius:14};
 if(reverse){home.querySelector('.hb-ai').classList.add('is-returning');source.pause();}
 else{const targetVideo=card.querySelector('video');if(!targetVideo.getAttribute('src'))targetVideo.src=targetVideo.dataset.machineSrc;if(!program.classList.contains('is-motion-paused'))targetVideo.play().catch(()=>{});}
 document.body.appendChild(surface);morph={surface,program,reverse,from:reverse?small:full,to:reverse?full:small};
 clearTimeout(autoSlideTimer);autoSlideTimer=0;updateMorph(0,0);
}
function updateMorph(ease,t){
 if(!morph)return;const m=morph,a=m.from,b=m.to;
 for(const key of ['left','top','width','height'])m.surface.style[key]=a[key]+(b[key]-a[key])*ease+'px';
 m.surface.style.borderRadius=a.radius+(b.radius-a.radius)*ease+'px';
 m.surface.style.opacity=String(t<.9?1:Math.max(0,(1-t)/.1));
 if(m.reverse&&t>=.9)home.querySelector('.hb-ai').classList.remove('is-returning');
}
function finishMorph(){
 if(!morph)return;const reverse=morph.reverse;
 morph.surface.remove();morph.program.classList.remove('is-morph-target');home.querySelector('.hb-ai').classList.remove('is-returning');morph=null;
 if(reverse&&introCard)show(cards.indexOf(introCard)+1);
}
let motionViewportWidth=innerWidth;
addEventListener('resize',()=>{if(innerWidth!==motionViewportWidth){motionViewportWidth=innerWidth;cancelMotion();}requestPaint();});
new MutationObserver(()=>{if(document.body.classList.contains('menu-open'))cancelMotion();}).observe(document.body,{attributes:true,attributeFilter:['class']});
document.addEventListener('click',e=>{if(e.target.closest('a[href]'))cancelMotion();},true);

function allowsFacilityScroll(direction){
 const facility=chapters[4],start=topOf(facility),end=start+facility.offsetHeight-facility.querySelector('.hb-facility-stage').getBoundingClientRect().height;
 return direction>0?scrollY>=start-innerHeight*.5&&scrollY<end-2:scrollY>start+2&&scrollY<=end+2;
}
// Only a fresh gesture after the current scene has fully settled may advance it.
addEventListener('site:top',e=>{if(!home.offsetHeight)return;e.preventDefault();cancelMotion();lockedUntil=0;go(0)});
function sceneReady(){
 if(motionFrame||horizontalActive||sceneFade||document.documentElement.classList.contains('hb-page-moving')||performance.now()<lockedUntil)return false;
 const chapter=home.querySelector('.hb-chapter.is-current');if(!chapter)return true;
 if(chapter.dataset.introRunning==='true')return false;
 if(chapter===pt&&(!pt.classList.contains('is-revealed')||revealTimer))return false;
 if(chapter===chapters[4]){
  const shown=[...chapter.querySelectorAll('.hb-facility-card[aria-hidden="false"]')].at(-1);
  if(shown&&!shown.classList.contains('is-caption-visible'))return false;
 }
 const copy='.hb-welcome-copy,.hb-pt-copy,.hb-ai-copy,.hb-ai-description-wrap,.hb-section-title,.hb-challenge-copy,.hb-facility-caption,.hb-stack-intro-title,.hb-space-copy';
 return !chapter.getAnimations({subtree:true}).some(animation=>{
  const target=animation.effect?.target,timing=animation.effect?.getComputedTiming();
  return target?.closest(copy)&&timing?.iterations!==Infinity&&(animation.playState==='running'||animation.playState==='pending');
 });
}
function move(direction){
 if(!sceneReady())return;
 const lastChapter=chapters.at(-1);
 // Returning from the free-scrolling news area must settle on the final scene first.
 if(direction<0&&scrollY>topOf(lastChapter)+2){go(chapters.length-1);return;}
 const facility=chapters[4],facilityTop=topOf(facility);
 if(direction<0&&chapters[5].classList.contains('is-current')){go(4);return;}
 if(facility.classList.contains('is-current')&&facility.dataset.introRunning==='true')return;
 if(allowsFacilityScroll(direction)){
  cancelMotion();const step=facility.querySelector('.hb-facility-stage').getBoundingClientRect().height*.85,from=scrollY,target=Math.max(facilityTop,Math.min(facilityTop+facility.offsetHeight-facility.querySelector('.hb-facility-stage').getBoundingClientRect().height,facilityTop+(Math.round((from-facilityTop)/step)+direction)*step)),start=performance.now();lockedUntil=start+700;document.documentElement.classList.add('hb-page-moving');
  function tick(now){const t=clamp((now-start)/650),ease=t*t*(3-2*t);window.scrollTo({top:from+(target-from)*ease,behavior:'instant'});if(t<1)motionFrame=requestAnimationFrame(tick);else{cancelMotion();requestPaint();}}
  motionFrame=requestAnimationFrame(tick);return;
 }
 if(direction>0&&scrollY>=facilityTop-2&&scrollY<facilityTop+facility.offsetHeight-2){go(5);return;}
 const machines=home.querySelector('.hb-programs'),start=topOf(machines),end=start+machines.offsetHeight-innerHeight;
 if(direction<0&&machines.classList.contains('is-current')&&scrollY>=start-2){go(2);return;}
 if(end>start+2&&scrollY>=start-innerHeight*.18&&scrollY<=end+2){
  const target=direction>0?end:start;
  if((direction>0&&scrollY<end-2)||(direction<0&&scrollY>start+2)){lockedUntil=performance.now()+700;window.scrollTo({top:target,behavior:'smooth'});return;}
 }
 const below=scrollY>=topOf(home)+home.offsetHeight-2;go(below?chapters.length-1:nearest()+direction);
}
window.addEventListener('wheel',e=>{if(!ready()||e.ctrlKey||!e.deltaY||Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.target.closest('dialog,[role="dialog"],input,textarea,select'))return;const now=performance.now(),direction=Math.sign(e.deltaY),tail=now-lastWheel<170;lastWheel=now;if(!inChapters(direction,Math.abs(e.deltaY)))return;e.stopImmediatePropagation();if(!sceneReady()){e.preventDefault();return;}e.preventDefault();if(!tail)move(direction);},{capture:true,passive:false});
window.addEventListener('touchstart',e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,used:!sceneReady()};},{passive:true});
window.addEventListener('touchmove',e=>{if(!ready()||!touchStart||e.touches.length!==1)return;const dx=e.touches[0].clientX-touchStart.x,dy=touchStart.y-e.touches[0].clientY;if(Math.abs(dx)>Math.abs(dy)||Math.abs(dy)<5)return;const direction=Math.sign(dy);if(!inChapters(direction,Math.abs(dy)))return;e.stopImmediatePropagation();e.preventDefault();if(touchStart.used||Math.abs(dy)<35)return;touchStart.used=true;if(sceneReady())move(direction);},{capture:true,passive:false});
window.addEventListener('touchend',()=>touchStart=null,{passive:true});
window.addEventListener('touchcancel',()=>touchStart=null,{passive:true});
window.addEventListener('keydown',e=>{if(!ready()||e.target.closest('a,button,input,textarea,select,[contenteditable]'))return;const direction=['ArrowDown','PageDown',' '].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;if(!direction||!inChapters(direction))return;e.preventDefault();if(performance.now()>=lockedUntil)move(direction);});
const ai=home.querySelector('.hb-ai'),aiVideo=ai.querySelector('video');
aiState={visible:false,paused:false,advanced:false,primed:false};
const aiStart=1;
aiVideo.classList.remove('is-primed');
function primeAi(){aiVideo.currentTime=aiStart;}
aiVideo.addEventListener('loadedmetadata',primeAi);
aiVideo.addEventListener('seeked',()=>{if(aiVideo.currentTime>=aiStart-.05){aiState.primed=true;aiVideo.classList.add('is-primed');syncAiPlayback();}});
new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!aiVideo.getAttribute('src')){aiVideo.preload='auto';aiVideo.src=aiVideo.dataset.src;aiVideo.load();}},{rootMargin:'100% 0px'}).observe(ai);
if(aiVideo.readyState>=1)primeAi();
function syncAiPlayback(){const r=ai.getBoundingClientRect(),visible=ai.classList.contains('is-current')&&Math.abs(r.top)<8;if(!visible){if(aiState.visible){aiVideo.pause();aiVideo.currentTime=aiStart;aiState.paused=false;aiState.advanced=false;}aiState.visible=false;return;}aiState.visible=true;const allowed=!document.hidden&&!document.body.classList.contains('menu-open')&&!document.body.classList.contains('hb-bodydot-open')&&!document.body.classList.contains('hb-machine-open')&&!aiState.paused;if(allowed){if(!aiVideo.getAttribute('src'))aiVideo.src=aiVideo.dataset.src;if(aiVideo.ended){advanceAi();}else if(aiState.primed&&aiVideo.paused)aiVideo.play().catch(()=>{});}else aiVideo.pause();}
function advanceAi(){if(aiState.visible&&!aiState.advanced&&!aiState.paused&&!document.hidden&&!document.body.classList.contains('menu-open')&&!document.body.classList.contains('hb-bodydot-open')&&!document.body.classList.contains('hb-machine-open')){aiState.advanced=true;go(3);}}
aiVideo.addEventListener('ended',advanceAi);document.addEventListener('visibilitychange',syncAiPlayback);
const cards=[...home.querySelectorAll('.hb-program-card')],track=home.querySelector('.hb-program-track'),status=home.querySelector('.hb-machine-status');let selected=0,autoSlideTimer=0;
// Each descent adds one AI card; it leaves the machine rotation until the next descent.
function addAiIntro(source){
 if(introCard){show(cards.indexOf(introCard));return;}
 const card=cards[0].cloneNode(true),preview=card.querySelector('video');
 card.dataset.card='ai-intro';card.dataset.title='AI 체형분석';card.classList.add('hb-ai-intro-card');
 preview.removeAttribute('src');preview.dataset.machineSrc=source.dataset.src;preview.poster=source.poster;
 preview.setAttribute('aria-label','AI 체형분석 영상');preview.muted=true;preview.loop=true;
 preview.addEventListener('loadedmetadata',()=>{preview.currentTime=source.ended?0:Math.min(source.currentTime,preview.duration-.1);},{once:true});
 const detail=card.querySelector('.hb-card-link');detail.setAttribute('aria-label','바디닷 영상 보기');detail.setAttribute('aria-controls','hbBodydotDialog');
 detail.addEventListener('click',()=>bodydotButton.click());
 const select=card.querySelector('.hb-card-select');select.setAttribute('aria-label','AI 체형분석 카드 선택');select.addEventListener('click',()=>show(cards.indexOf(card)));
 introCard=card;cards.unshift(card);track.prepend(card);show(0);
}
function show(i){
 clearTimeout(autoSlideTimer);autoSlideTimer=0;
 const next=cards[(i+cards.length)%cards.length];
 if(introCard&&next!==introCard){
  const retiring=introCard;introCard=null;cards.splice(cards.indexOf(retiring),1);
  retiring.dataset.position=i>selected?-1:1;retiring.classList.add('is-intro-retiring');retiring.inert=true;
  setTimeout(()=>{retiring.querySelector('video').pause();retiring.remove();},350);
 }
 selected=cards.indexOf(next);
 cards.forEach((c,j)=>{let offset=(j-selected+cards.length)%cards.length;if(offset>cards.length/2)offset-=cards.length;c.dataset.position=offset;c.inert=Math.abs(offset)>1;c.querySelector('.hb-card-link').tabIndex=offset===0?0:-1;});
 status.textContent=cards[selected].dataset.title;
 if(cardStateReady)syncCardVideos();
}
cards.forEach(c=>c.querySelector('.hb-card-select').addEventListener('click',()=>show(cards.indexOf(c))));
let touchX=null,mouseX=null,ignoreClickUntil=0;
track.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;syncCardVideos();},{passive:true});
track.addEventListener('touchend',e=>{if(touchX===null)return;const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>35){show(selected+(delta<0?1:-1));ignoreClickUntil=performance.now()+350;}touchX=null;syncCardVideos();},{passive:true});
track.addEventListener('touchcancel',()=>{touchX=null;syncCardVideos();},{passive:true});
track.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0&&!e.target.closest('.hb-card-link')){mouseX=e.clientX;syncCardVideos();}});
document.addEventListener('pointerup',e=>{if(mouseX===null)return;const delta=e.clientX-mouseX;mouseX=null;if(Math.abs(delta)>35){show(selected+(delta<0?1:-1));ignoreClickUntil=performance.now()+350;}syncCardVideos();});
document.addEventListener('pointercancel',()=>{mouseX=null;syncCardVideos();});
track.addEventListener('click',e=>{if(performance.now()<ignoreClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();show(selected+(e.key==='ArrowRight'?1:-1));}});
show(0);
function syncAutoSlide(visible){
 const allowed=visible&&home.querySelector('.hb-programs').classList.contains('is-current')&&!home.querySelector('.hb-programs').classList.contains('is-motion-paused')&&!morph&&touchX===null&&mouseX===null;
 if(!allowed){clearTimeout(autoSlideTimer);autoSlideTimer=0;return;}
 if(!autoSlideTimer)autoSlideTimer=setTimeout(()=>{autoSlideTimer=0;show(selected+1);},3000);
}
function syncCardVideos(){const r=track.getBoundingClientRect(),visible=r.top<innerHeight&&r.bottom>0&&!document.hidden&&!document.body.classList.contains('menu-open')&&!document.body.classList.contains('hb-bodydot-open')&&!document.body.classList.contains('hb-machine-open');cards.forEach(c=>{const v=c.querySelector('video');if(visible&&Math.abs(Number(c.dataset.position))<=1&&!home.querySelector('.hb-programs').classList.contains('is-motion-paused')){if(!v.getAttribute('src'))v.src=v.dataset.machineSrc;if(v.paused)v.play().catch(()=>{});}else v.pause();});syncAutoSlide(visible);}
cardStateReady=true;document.addEventListener('visibilitychange',syncCardVideos);syncCardVideos();

const bodydotDialog=document.getElementById('hbBodydotDialog'),bodydotButton=home.querySelector('.hb-bodydot-link');
if(bodydotDialog&&bodydotButton){
 const detailVideo=bodydotDialog.querySelector('video');
 bodydotButton.addEventListener('click',()=>{
  cancelMotion();
  bodydotDialog.showModal();
  document.body.classList.add('hb-bodydot-open');
  syncAiPlayback();
  if(!detailVideo.getAttribute('src'))detailVideo.src=detailVideo.dataset.src;
  detailVideo.currentTime=0;
  detailVideo.play().catch(()=>{});
 });
 bodydotDialog.querySelector('.hb-bodydot-close').addEventListener('click',()=>bodydotDialog.close());
 bodydotDialog.addEventListener('click',e=>{
  if(e.target!==bodydotDialog)return;
  const r=bodydotDialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)bodydotDialog.close();
 });
 bodydotDialog.addEventListener('close',()=>{
  detailVideo.pause();
  document.body.classList.remove('hb-bodydot-open');
  syncAiPlayback();
  bodydotButton.focus({preventScroll:true});
 });
}

const machineSection=home.querySelector('.hb-programs'),machineMotion=home.querySelector('.hb-machine-motion-toggle'),machineDialog=document.getElementById('hbMachineDialog');
function setMachineMotion(stopped){machineSection.classList.toggle('is-motion-paused',stopped);machineMotion.textContent=stopped?'▶':'Ⅱ';machineMotion.setAttribute('aria-pressed',String(stopped));machineMotion.setAttribute('aria-label',stopped?'로고와 미리보기 재생':'로고와 미리보기 일시정지');syncCardVideos();}
setMachineMotion(false);
machineMotion.addEventListener('click',()=>setMachineMotion(!machineSection.classList.contains('is-motion-paused')));
if(machineDialog){
 const fullVideo=machineDialog.querySelector('video');let opener=null;
 cards.forEach(card=>card.querySelector('.hb-card-link').addEventListener('click',e=>{
  opener=e.currentTarget;cancelMotion();machineDialog.showModal();document.body.classList.add('hb-machine-open');syncCardVideos();
  const preview=card.querySelector('video');fullVideo.src=preview.dataset.machineSrc;fullVideo.poster=preview.poster;machineDialog.querySelector('h2').textContent=card.dataset.title;
  fullVideo.play().catch(()=>{});
 }));
 machineDialog.querySelector('.hb-machine-close').addEventListener('click',()=>machineDialog.close());
 machineDialog.addEventListener('click',e=>{if(e.target!==machineDialog)return;const r=machineDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)machineDialog.close();});
 machineDialog.addEventListener('close',()=>{fullVideo.pause();document.body.classList.remove('hb-machine-open');syncCardVideos();opener?.focus({preventScroll:true});});
}
})();
