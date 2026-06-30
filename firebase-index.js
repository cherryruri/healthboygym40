import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6fYLWkH9oSr7f-H4QNHUuN7Y2bFOvgQ8",
  authDomain: "healthboygym40-4ee44.firebaseapp.com",
  projectId: "healthboygym40-4ee44",
  storageBucket: "healthboygym40-4ee44.firebasestorage.app",
  messagingSenderId: "924150165105",
  appId: "1:924150165105:web:860ff60aaafb61b722b5d0",
  measurementId: "G-4CJK3XF633"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function getUserId(user){
  return user && user.email ? user.email.split("@")[0] : "회원";
}

function getUserName(user, data){
  return (data && (data.name || data.signupName || data.id)) || getUserId(user);
}

function setAvatar(photoDataUrl){
  const image = document.getElementById("mobileProfileImage");
  const placeholder = document.getElementById("mobileProfilePlaceholder");
  const deleteButton = document.getElementById("mobileProfileDelete");
  const pageImage = document.getElementById("myAvatarImage");
  const pagePlaceholder = document.querySelector(".my-avatar");
  const pageDelete = document.getElementById("removeProfileImageBtn");

  if(image && photoDataUrl){
    image.src = photoDataUrl;
    image.hidden = false;
  }else if(image){
    image.removeAttribute("src");
    image.hidden = true;
  }

  if(placeholder){
    placeholder.hidden = !!photoDataUrl;
  }

  if(deleteButton){
    deleteButton.hidden = !photoDataUrl;
  }

  if(pageImage && photoDataUrl){
    pageImage.src = photoDataUrl;
    pageImage.hidden = false;
  }else if(pageImage){
    pageImage.removeAttribute("src");
    pageImage.hidden = true;
  }

  if(pagePlaceholder){
    pagePlaceholder.hidden = !!photoDataUrl;
  }

  if(pageDelete){
    pageDelete.hidden = !photoDataUrl;
  }
}

function readImageAsDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();

    reader.onload = ()=>{
      const image = new Image();

      image.onload = ()=>{
        const maxSize = 420;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setUserMenu(user, data){
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if(!loginLink || !logoutBtn) return;

  if(user){
    const name = getUserName(user, data);

    loginLink.textContent = `${name}님`;
    loginLink.href = "mypage.html";
    logoutBtn.style.display = "";
  }else{
    loginLink.textContent = "LOGIN";
    loginLink.href = "login.html";
    logoutBtn.style.display = "none";
  }
}

function setMobileUserMenu(user, data){
  const mobileLoginLink = document.getElementById("mobileLoginLink");
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
  const mobileProfileName = document.getElementById("mobileProfileName");
  const mobileProfileText = document.getElementById("mobileProfileText");
  const mobileGuestActions = document.getElementById("mobileGuestActions");
  const mobileUserActions = document.getElementById("mobileUserActions");
  const mobileProfileInput = document.getElementById("mobileProfileInput");
  const mobileProfileUploadLabel = document.getElementById("mobileProfileUploadLabel");
  const mobileProfileDelete = document.getElementById("mobileProfileDelete");

  if(user){
    const name = getUserName(user, data);

    if(mobileLoginLink){
      mobileLoginLink.textContent = `${name}님`;
      mobileLoginLink.href = "mypage.html";
    }

    if(mobileLogoutBtn){
      mobileLogoutBtn.style.display = "";
    }

    if(mobileProfileName){
      mobileProfileName.textContent = `[${name}]님 환영합니다`;
      mobileProfileName.href = "mypage.html";
    }

    if(mobileProfileText){
      mobileProfileText.textContent = "";
    }

    if(mobileGuestActions) mobileGuestActions.hidden = true;
    if(mobileUserActions) mobileUserActions.hidden = false;
    if(mobileProfileInput) mobileProfileInput.disabled = false;
    if(mobileProfileUploadLabel) mobileProfileUploadLabel.classList.add("is-editable");
    if(mobileProfileDelete) mobileProfileDelete.disabled = false;

    setAvatar(data && data.photoDataUrl);
  }else{
    if(mobileLoginLink){
      mobileLoginLink.textContent = "LOGIN";
      mobileLoginLink.href = "login.html";
    }

    if(mobileLogoutBtn){
      mobileLogoutBtn.style.display = "none";
    }

    if(mobileProfileName){
      mobileProfileName.textContent = "로그인 하기";
      mobileProfileName.href = "login.html";
    }

    if(mobileProfileText){
      mobileProfileText.textContent = "회원 전용 메뉴를 이용해보세요.";
    }

    if(mobileGuestActions) mobileGuestActions.hidden = false;
    if(mobileUserActions) mobileUserActions.hidden = true;
    if(mobileProfileInput) mobileProfileInput.disabled = true;
    if(mobileProfileUploadLabel) mobileProfileUploadLabel.classList.remove("is-editable");
    if(mobileProfileDelete) mobileProfileDelete.disabled = true;

    setAvatar("");
  }
}

onAuthStateChanged(auth, async user=>{
  let data = null;

  if(user){
    try{
      const snap = await getDoc(doc(db, "users", user.uid));

      if(snap.exists()){
        data = snap.data();
      }
    }catch(error){
      console.log(error);
    }
  }

  setUserMenu(user, data);
  setMobileUserMenu(user, data);
});

document.addEventListener("click", async event=>{
  const deleteButton = event.target.closest("#mobileProfileDelete");

  if(!deleteButton) return;

  event.preventDefault();
  event.stopPropagation();

  const user = auth.currentUser;

  if(!user){
    alert("로그인 후 프로필 사진을 삭제할 수 있습니다.");
    return;
  }

  if(!confirm("프로필 사진을 삭제할까요?")) return;

  try{
    await updateDoc(doc(db, "users", user.uid), {
      photoDataUrl: deleteField()
    });

    setAvatar("");
  }catch(error){
    console.log(error);
    alert("프로필 사진 삭제 중 오류가 발생했습니다.");
  }
});

document.addEventListener("click", async event=>{
  const logoutButton = event.target.closest("#logoutBtn, #mobileLogoutBtn");

  if(!logoutButton) return;

  await signOut(auth);
  alert("로그아웃 완료");
  location.reload();
});

document.addEventListener("change", async event=>{
  const input = event.target.closest("#mobileProfileInput");

  if(!input) return;

  const user = auth.currentUser;

  if(!user){
    alert("로그인 후 프로필 사진을 변경할 수 있습니다.");
    input.value = "";
    return;
  }

  const file = input.files && input.files[0];

  if(!file) return;

  try{
    const photoDataUrl = await readImageAsDataUrl(file);

    await setDoc(
      doc(db, "users", user.uid),
      { photoDataUrl },
      { merge:true }
    );

    setAvatar(photoDataUrl);
  }catch(error){
    console.log(error);
    alert("프로필 사진 변경 중 오류가 발생했습니다.");
  }finally{
    input.value = "";
  }
});

const mypageBtn = document.getElementById("mypageBtn");

if(mypageBtn){
  mypageBtn.addEventListener("click", event=>{
    event.preventDefault();

    if(auth.currentUser){
      location.href = "mypage.html";
    }else{
      location.href = "login.html";
    }
  });
}

(function improveMobileHeroComfort(){
  const mobileMedia = window.matchMedia("(max-width: 768px)");
  const originalScrollTo = window.scrollTo.bind(window);
  const scrollKeys = new Set(["ArrowDown", "PageDown", " ", "Spacebar", "End", "ArrowUp", "PageUp", "Home"]);
  let lastUserScrollAt = 0;
  let patchedScrollTo = false;
  let comfortTicking = false;

  function ensureStyle(){
    if(document.getElementById("mobile-hero-comfort-style")) return;

    const style = document.createElement("style");
    style.id = "mobile-hero-comfort-style";
    style.textContent = `
      @media (max-width: 768px){
        html,
        body{
          scroll-behavior:auto !important;
        }
        .intro{
          height:560vh !important;
        }
        .hero-video-frame{
          opacity:1 !important;
          background:#050505 !important;
          transition:none !important;
          will-change:transform;
        }
        .intro-video{
          display:block !important;
          opacity:1 !important;
          backface-visibility:hidden;
          transform:translateZ(0);
          will-change:transform;
        }
        .hero-expand-sticky > .review-cover-panel{
          background:rgba(0,0,0,.24) !important;
          backdrop-filter:none !important;
        }
        .review-stats-section,
        .review-proof-section,
        .review-cards{
          will-change:opacity, transform;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function numberFromCss(value){
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  }

  function getHero(){
    return document.querySelector(".hero-expand-section");
  }

  function getHeroProgress(hero){
    if(!hero) return 0;

    return numberFromCss(
      hero.style.getPropertyValue("--hero-progress") ||
      getComputedStyle(hero).getPropertyValue("--hero-progress")
    );
  }

  function pageTop(element){
    if(!element) return null;
    return element.getBoundingClientRect().top + window.pageYOffset;
  }

  function getScrollTop(){
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function isReviewStatsAutoHoldTarget(top){
    const hero = getHero();
    const heroTop = pageTop(hero);

    if(!hero || heroTop === null || !Number.isFinite(top)) return false;

    const scrollable = Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = (top - heroTop) / scrollable;

    return progress >= 0.62 && progress <= 0.72;
  }

  function isLargeBackwardHeroJump(top){
    const hero = getHero();
    const heroTop = pageTop(hero);

    if(!hero || heroTop === null || !Number.isFinite(top)) return false;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
    const currentTop = getScrollTop();
    const heroBottom = heroTop + hero.offsetHeight;
    const progress = getHeroProgress(hero);
    const inHeroFlow =
      currentTop >= heroTop - viewportHeight * 0.2 &&
      currentTop <= heroBottom + viewportHeight * 0.8;
    const reviewFlowActive = progress >= 0.55 && progress <= 1.15;
    const jumpsBackTooFar = top < currentTop - viewportHeight * 0.7;

    return inHeroFlow && reviewFlowActive && jumpsBackTooFar;
  }

  function shouldKeepHeroVideoLive(){
    if(!mobileMedia.matches || document.hidden) return false;

    const hero = getHero();
    const progress = getHeroProgress(hero);

    return Boolean(hero && progress >= 0.45 && progress <= 1.08);
  }

  function patchScrollTo(){
    if(patchedScrollTo) return;

    patchedScrollTo = true;
    window.scrollTo = function patchedMobileHeroScrollTo(arg, y){
      if(mobileMedia.matches){
        let top = null;

        if(arg && typeof arg === "object"){
          top = Number(arg.top);
        }else if(arguments.length > 1){
          top = Number(y);
        }

        const userScrollIsActive = Date.now() - lastUserScrollAt < 3200;
        if(userScrollIsActive && (isReviewStatsAutoHoldTarget(top) || isLargeBackwardHeroJump(top))){
          return;
        }
      }

      return originalScrollTo.apply(window, arguments);
    };
  }

  function markUserScroll(event){
    if(event && event.type === "keydown" && !scrollKeys.has(event.key)) return;

    lastUserScrollAt = Date.now();
    queueUpdate();
  }

  function patchVideoPause(video){
    if(!video || video.__mobileHeroComfortPausePatched) return;

    const originalPause = video.pause.bind(video);
    video.__mobileHeroComfortPausePatched = true;
    video.pause = function comfortAwarePause(){
      if(shouldKeepHeroVideoLive()) return;
      return originalPause();
    };
  }

  function keepVideoPlaying(){
    const video = document.querySelector(".intro-video");
    if(!video) return;

    patchVideoPause(video);

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    if(video.readyState === 0){
      video.load();
    }

    if(shouldKeepHeroVideoLive() && video.paused){
      const playPromise = video.play();
      if(playPromise && typeof playPromise.catch === "function"){
        playPromise.catch(()=>{});
      }
    }
  }

  function applyComfortVars(){
    if(!mobileMedia.matches) return;

    const hero = getHero();
    if(!hero) return;

    const progress = getHeroProgress(hero);

    if(progress >= 0.45 && progress <= 1.08){
      hero.style.setProperty("--hero-video-opacity", "1");
      hero.style.setProperty("--review-bg-opacity", "0.24");
      hero.style.setProperty("--hero-overlay", progress >= 0.52 ? "0.28" : "0.18");
    }else if(progress < 0.42){
      hero.style.removeProperty("--hero-video-opacity");
    }
  }

  function update(){
    comfortTicking = false;

    if(!mobileMedia.matches) return;

    ensureStyle();
    patchScrollTo();
    applyComfortVars();
    keepVideoPlaying();
  }

  function queueUpdate(){
    if(comfortTicking) return;

    comfortTicking = true;
    requestAnimationFrame(update);
  }

  ensureStyle();
  patchScrollTo();
  queueUpdate();

  window.addEventListener("pointerdown", markUserScroll, {capture:true, passive:true});
  window.addEventListener("touchstart", markUserScroll, {capture:true, passive:true});
  window.addEventListener("touchmove", markUserScroll, {capture:true, passive:true});
  window.addEventListener("touchend", markUserScroll, {capture:true, passive:true});
  window.addEventListener("wheel", markUserScroll, {capture:true, passive:true});
  window.addEventListener("keydown", markUserScroll, {capture:true});
  window.addEventListener("scroll", queueUpdate, {passive:true});
  window.addEventListener("resize", queueUpdate, {passive:true});
  window.addEventListener("pageshow", queueUpdate, {passive:true});
  document.addEventListener("visibilitychange", queueUpdate);
  document.addEventListener("DOMContentLoaded", queueUpdate);
  setTimeout(queueUpdate, 80);
  setTimeout(queueUpdate, 350);
  setTimeout(queueUpdate, 900);
  setInterval(update, 160);
})();
