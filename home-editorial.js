(()=>{
const home=document.getElementById('hbHome');if(!home)return;
const chapters=[...home.querySelectorAll('.hb-chapter')],nav=home.querySelector('.hb-page-nav'),links=[...nav.querySelectorAll('a')],pt=home.querySelector('.hb-pt'),video=pt.querySelector('video'),toggle=pt.querySelector('.hb-video-toggle');let frame=0,paused=false,inView=false;
const clamp=v=>Math.max(0,Math.min(1,v));let revealTimer=0;
function paint(){frame=0;const h=innerHeight;let active=0;chapters.forEach((el,i)=>{if(el.getBoundingClientRect().top<h*.5)active=i});links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});nav.querySelector('.hb-page-current').textContent=String(active+1).padStart(2,'0');nav.hidden=chapters.at(-1).getBoundingClientRect().height>0&&chapters.at(-1).getBoundingClientRect().bottom<100;chapters.forEach((c,i)=>c.classList.toggle('is-current',i===active));if(active===1&&Math.abs(pt.getBoundingClientRect().top)<h*.18){if(!pt.classList.contains('is-revealed')&&!revealTimer)revealTimer=setTimeout(()=>{pt.classList.add('is-revealed');pt.querySelector('.hb-pt-copy').inert=false;toggle.tabIndex=0;revealTimer=0;},240);}else if(active!==1){clearTimeout(revealTimer);revealTimer=0;pt.classList.remove('is-revealed');pt.querySelector('.hb-pt-copy').inert=true;toggle.tabIndex=-1;}}

function requestPaint(){if(!frame)frame=requestAnimationFrame(paint)}addEventListener('scroll',requestPaint,{passive:true});addEventListener('resize',requestPaint);new MutationObserver(requestPaint).observe(document.body,{attributes:true,attributeFilter:['class']});paint();
function playback(){if(inView&&!paused&&!document.hidden){if(!video.src)video.src=video.dataset.hbVideo;video.play().catch(()=>{});}else video.pause();toggle.textContent=paused?'▶':'Ⅱ';toggle.setAttribute('aria-label','상원 팀장님 영상 '+(paused?'재생':'일시정지'));}
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;playback()},{rootMargin:'100px'}).observe(pt);toggle.addEventListener('click',()=>{paused=!paused;playback()});document.addEventListener('visibilitychange',playback);
const welcome=home.querySelector('.hb-welcome'),welcomeVideo=home.querySelector('.hb-welcome-video'),welcomeToggle=home.querySelector('.hb-welcome-video-toggle');let welcomePaused=false,welcomeVisible=true;
function welcomePlayback(){if(welcomeVisible&&!welcomePaused&&!document.hidden)welcomeVideo.play().catch(()=>{});else welcomeVideo.pause();welcomeToggle.textContent=welcomePaused?'▶':'Ⅱ';welcomeToggle.setAttribute('aria-label','센터 영상 '+(welcomePaused?'재생':'일시정지'));}
new IntersectionObserver(entries=>{welcomeVisible=entries[0].isIntersecting;welcomePlayback()}).observe(welcome);welcomeToggle.addEventListener('click',()=>{welcomePaused=!welcomePaused;welcomePlayback()});document.addEventListener('visibilitychange',welcomePlayback);
let lockedUntil=0,lastWheel=0,touchStart=null;
const topOf=el=>scrollY+el.getBoundingClientRect().top;
function ready(){return document.body.classList.contains('loaded')&&!document.body.classList.contains('menu-open');}
function nearest(){let index=0,distance=Infinity;chapters.forEach((c,i)=>{const d=Math.abs(c.getBoundingClientRect().top);if(d<distance){distance=d;index=i;}});return index;}
function inChapters(direction){const top=topOf(home),bottom=top+home.offsetHeight;return scrollY>=top-2&&scrollY<bottom-2||(direction<0&&Math.abs(scrollY-bottom)<90);}
let motionFrame=0;
function cancelMotion(){cancelAnimationFrame(motionFrame);motionFrame=0;document.documentElement.classList.remove('hb-page-moving');}
function go(index){
 cancelMotion();index=Math.max(0,Math.min(chapters.length,index));
 const from=scrollY,target=index===chapters.length?topOf(home)+home.offsetHeight:topOf(chapters[index]),start=performance.now(),duration=1250;
 lockedUntil=start+(index===1?2350:1400);
 document.documentElement.classList.add('hb-page-moving');
 function tick(now){const t=clamp((now-start)/duration),ease=t*t*t*(t*(t*6-15)+10);window.scrollTo({top:from+(target-from)*ease,behavior:'instant'});if(t<1)motionFrame=requestAnimationFrame(tick);else{cancelMotion();requestPaint();}}
 motionFrame=requestAnimationFrame(tick);
}
addEventListener('resize',cancelMotion);
new MutationObserver(()=>{if(document.body.classList.contains('menu-open'))cancelMotion();}).observe(document.body,{attributes:true,attributeFilter:['class']});
document.addEventListener('click',e=>{if(e.target.closest('a[href]')&&!e.target.closest('.hb-scroll-hint'))cancelMotion();},true);

function move(direction){const below=scrollY>=topOf(home)+home.offsetHeight-2;go(below?chapters.length-1:nearest()+direction);}
window.addEventListener('wheel',e=>{if(!ready()||e.ctrlKey||!e.deltaY||Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.target.closest('dialog,[role="dialog"],input,textarea,select'))return;const now=performance.now(),direction=Math.sign(e.deltaY),tail=now-lastWheel<170;lastWheel=now;if(now<lockedUntil){e.preventDefault();return;}if(!inChapters(direction))return;e.preventDefault();if(!tail)move(direction);},{passive:false});
window.addEventListener('touchstart',e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,used:false};},{passive:true});
window.addEventListener('touchmove',e=>{if(!ready()||!touchStart||e.touches.length!==1)return;const dx=e.touches[0].clientX-touchStart.x,dy=touchStart.y-e.touches[0].clientY;if(Math.abs(dx)>Math.abs(dy)||Math.abs(dy)<35)return;const direction=Math.sign(dy);if(touchStart.used){e.preventDefault();return;}if(!inChapters(direction))return;e.preventDefault();touchStart.used=true;if(performance.now()>=lockedUntil)move(direction);},{passive:false});
window.addEventListener('touchend',()=>touchStart=null,{passive:true});
window.addEventListener('keydown',e=>{if(!ready()||e.target.closest('a,button,input,textarea,select,[contenteditable]'))return;const direction=['ArrowDown','PageDown',' '].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;if(!direction||!inChapters(direction))return;e.preventDefault();if(performance.now()>=lockedUntil)move(direction);});
home.querySelector('.hb-scroll-hint').addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();go(1);});
const cards=[...home.querySelectorAll('.hb-program-card')],controls=home.querySelector('.hb-program-controls');let selected=0;function show(i){selected=(i+cards.length)%cards.length;cards.forEach((c,j)=>{let offset=(j-selected+cards.length)%cards.length;if(offset>2)offset-=cards.length;c.dataset.position=offset;c.inert=Math.abs(offset)>1;c.querySelector('.hb-card-link').tabIndex=offset===0?0:-1;});controls.querySelector('span').textContent=String(selected+1).padStart(2,'0')+' / 05';}controls.querySelector('[aria-label="이전 프로그램"]').addEventListener('click',()=>show(selected-1));controls.querySelector('[aria-label="다음 프로그램"]').addEventListener('click',()=>show(selected+1));cards.forEach((c,i)=>c.querySelector('.hb-card-select').addEventListener('click',()=>show(i)));const track=home.querySelector('.hb-program-track');let touchX=null;track.addEventListener('touchstart',e=>touchX=e.touches[0].clientX,{passive:true});track.addEventListener('touchend',e=>{if(touchX===null)return;const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>50)show(selected+(delta<0?1:-1));touchX=null},{passive:true});show(0);
})();
