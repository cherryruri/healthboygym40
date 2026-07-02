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

let latestIsAdmin = false;

function setAdminOnlyMenus(isAdmin){
  latestIsAdmin = Boolean(isAdmin);

  document.querySelectorAll("[data-admin-only]").forEach(element=>{
    element.hidden = !latestIsAdmin;
    element.setAttribute("aria-hidden", String(!latestIsAdmin));
  });
}

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
  setAdminOnlyMenus(data && data.role === "admin");
});

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", ()=>setAdminOnlyMenus(latestIsAdmin));
}else{
  setAdminOnlyMenus(latestIsAdmin);
}

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

(function tuneKakaoStyleIntroStatement(){
  return;

  const mobileMedia = window.matchMedia("(max-width: 768px)");
  const originalScrollTo = window.scrollTo.bind(window);
  const scrollKeys = new Set(["ArrowDown", "PageDown", " ", "Spacebar", "End", "ArrowUp", "PageUp", "Home"]);
  let lastUserScrollAt = 0;
  let patchedScrollTo = false;
  let ticking = false;

  function ensureStyle(){
    if(document.getElementById("kakao-statement-hero-style")) return;

    const wrongStyle = document.getElementById("kakao-inspired-hero-style");
    if(wrongStyle){
      wrongStyle.remove();
    }

    const style = document.createElement("style");
    style.id = "kakao-statement-hero-style";
    style.textContent = `
      .hero-expand-sticky::before{
        opacity:var(--hero-white-bg-opacity, var(--hero-title-opacity, 1)) !important;
        transition:opacity .5s cubic-bezier(.22,.61,.36,1) !important;
      }
      .hero-expand-sticky > .review-cover-panel{
        background:rgba(0,0,0,var(--review-bg-live-opacity, var(--review-bg-opacity, 0))) !important;
        backdrop-filter:none !important;
        transition:background .5s cubic-bezier(.22,.61,.36,1) !important;
      }
      .hero-expand-sticky > .review-cover-panel .review-stats-section{
        opacity:var(--review-stats-live-opacity, var(--review-stats-opacity, 0)) !important;
        transition:opacity .28s linear !important;
      }
      .review-proof-title{
        top:var(--review-proof-top, 50%) !important;
        transform:translate(-50%, -50%) scale(var(--review-proof-scale, 1)) !important;
        flex-direction:row !important;
        align-items:center !important;
        justify-content:center !important;
        flex-wrap:nowrap !important;
        gap:var(--proof-divider-gap, var(--review-proof-gap, 18px)) !important;
        white-space:nowrap !important;
        z-index:9 !important;
      }
      .review-proof-title .review-proof-line{
        display:inline-block !important;
        width:auto !important;
        white-space:nowrap !important;
      }
      .review-proof-title .review-proof-divider{
        display:block !important;
        flex:0 0 auto !important;
        width:var(--proof-divider-width, 0px) !important;
        min-width:0 !important;
        height:2px !important;
        border-radius:999px !important;
        background:rgba(255,255,255,.94) !important;
        opacity:var(--proof-divider-opacity, 0) !important;
        transform:scaleX(var(--proof-divider-scale, 1)) translateZ(0) !important;
        transform-origin:center !important;
        box-shadow:0 0 24px rgba(255,255,255,.34) !important;
        transition:width .26s cubic-bezier(.22,.61,.36,1), opacity .22s linear !important;
      }
      .hero-expand-sticky > .review-cover-panel .all_slider{
        position:absolute !important;
        left:50% !important;
        top:var(--review-cards-top, 61%) !important;
        width:100% !important;
        max-width:100vw !important;
        opacity:var(--review-cards-live-opacity, var(--review-cards-opacity, 0)) !important;
        transform:translate(-50%, var(--review-cards-live-y, 24px)) !important;
        z-index:8 !important;
        transition:opacity .28s linear, transform .34s cubic-bezier(.22,.61,.36,1) !important;
      }
      .review-cover-panel .review-slide{
        width:min(72vw, 292px) !important;
        max-width:292px !important;
        aspect-ratio:1 / 1 !important;
        height:auto !important;
        min-height:0 !important;
        overflow:hidden !important;
        border-radius:16px !important;
        background:#fff !important;
        opacity:var(--review-cards-live-opacity, var(--slide-opacity, 0)) !important;
        transform:translateX(var(--review-cards-live-x, 0px)) !important;
        box-shadow:0 22px 52px rgba(0,0,0,.24) !important;
      }
      .review-cover-panel .review-slide a,
      #brand #inc01 .list .review01 a,
      #brand #inc01 .list .review02 a,
      #brand #inc01 .list .review03 a,
      #brand #inc01 .list .review04 a,
      #brand #inc01 .list .review05 a,
      #brand #inc01 .list .review06 a,
      #brand #inc01 .list .review07 a,
      #brand #inc01 .list .review08 a{
        display:block !important;
        position:relative !important;
        height:100% !important;
        min-height:0 !important;
        background-image:none !important;
        background:#fff !important;
        color:#111 !important;
      }
      .review-cover-panel .review-slide a::before,
      .review-cover-panel .review-slide a::after{
        display:none !important;
      }
      .review-cover-panel .review-card-text{
        position:absolute !important;
        inset:0 !important;
        left:0 !important;
        right:0 !important;
        bottom:auto !important;
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
        padding:22px 20px 18px !important;
        display:flex !important;
        flex-direction:column !important;
        justify-content:space-between !important;
        gap:10px !important;
        color:#111 !important;
        opacity:1 !important;
        transform:none !important;
      }
      .review-cover-panel .review-title{
        color:#111 !important;
        font-size:20px !important;
        line-height:1.22 !important;
        letter-spacing:0 !important;
      }
      .review-cover-panel .review-meta,
      .review-cover-panel .review-copy{
        color:#333 !important;
        text-shadow:none !important;
      }
      .review-cover-panel .review-copy{
        max-height:108px !important;
        overflow:hidden !important;
        font-size:14px !important;
        line-height:1.55 !important;
      }
      .review-cover-panel .review-tags{
        display:none !important;
      }
      .review-cover-panel .review-more{
        color:#111 !important;
        border-color:rgba(0,0,0,.18) !important;
      }
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
        .intro-statement{
          width:calc(100% - 38px) !important;
          max-width:720px !important;
          color:#fff !important;
          text-shadow:none !important;
        }
        .intro-reveal-copy p{
          font-size:clamp(30px, 7.2vw, 39px) !important;
          line-height:1.38 !important;
          font-weight:950 !important;
          letter-spacing:0 !important;
        }
        .intro-reveal-copy .reveal-line{
          width:auto !important;
          max-width:100% !important;
          margin-left:auto !important;
          margin-right:auto !important;
        }
        .intro-reveal-copy .intro-greeting-line,
        .intro-reveal-copy .intro-comfort-line,
        .intro-reveal-copy .intro-branch-line{
          font-size:inherit !important;
          line-height:1.38 !important;
          font-weight:950 !important;
          white-space:normal !important;
        }
        .intro-reveal-copy .intro-comfort-line,
        .intro-reveal-copy .intro-branch-line{
          margin-top:6px !important;
        }
        .review-proof-title{
          width:min(620px, 96vw) !important;
          top:var(--review-proof-top, 35%) !important;
          gap:var(--proof-divider-gap, 10px) !important;
          font-size:clamp(27px, 7vw, 34px) !important;
          line-height:1 !important;
        }
        .review-proof-title .review-proof-divider{
          height:2px !important;
        }
        .hero-expand-sticky > .review-cover-panel .all_slider{
          top:var(--review-cards-top, 59%) !important;
          padding:0 !important;
        }
        .review-cover-panel .review-slide{
          width:min(76vw, 286px) !important;
          max-width:286px !important;
          border-radius:15px !important;
        }
        .review-cover-panel .review-card-text{
          padding:20px 18px 17px !important;
        }
        .review-cover-panel .review-title{
          font-size:19px !important;
        }
        .review-cover-panel .review-copy{
          max-height:104px !important;
          font-size:13px !important;
          line-height:1.55 !important;
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

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function easeInOut(value){
    const clamped = clamp(value, 0, 1);
    return clamped * clamped * (3 - 2 * clamped);
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

  function restoreOriginalHeroFlow(){
    document.querySelectorAll("[data-kb-story], .kb-story-section").forEach(section=>section.remove());

    const heroSticky = document.querySelector(".hero-expand-sticky");
    const review = document.querySelector(".review-cover-panel");

    if(review){
      review.classList.remove("kb-review-flow");
    }

    if(heroSticky && review && review.parentElement !== heroSticky){
      heroSticky.appendChild(review);
    }

    document.documentElement.classList.remove("kakao-inspired-hero");
  }

  function syncReviewScene(){
    const hero = getHero();
    if(!hero) return;

    const progress = getHeroProgress(hero);
    const isMobile = mobileMedia.matches;

    const whiteFadeStart = isMobile ? 0.54 : 0.74;
    const whiteFadeRange = isMobile ? 0.15 : 0.14;
    const whiteOpacity = 1 - easeInOut((progress - whiteFadeStart) / whiteFadeRange);

    const blackFadeStart = isMobile ? 0.57 : 0.78;
    const blackFadeRange = isMobile ? 0.17 : 0.16;
    const blackOpacity = easeInOut((progress - blackFadeStart) / blackFadeRange) * 0.92;

    const proofStart = isMobile ? 0.735 : 0.944;
    const proofRange = isMobile ? 0.055 : 0.02;
    const proofVisible = easeInOut((progress - proofStart) / proofRange);

    const cardStart = isMobile ? 0.775 : 0.958;
    const cardRange = isMobile ? 0.055 : 0.022;
    const cardExitStart = isMobile ? 0.984 : 0.997;
    const cardExitRange = isMobile ? 0.03 : 0.004;
    const cardShow = easeInOut((progress - cardStart) / cardRange);
    const cardExit = easeInOut((progress - cardExitStart) / cardExitRange);
    const cardVisible = clamp(cardShow * (1 - cardExit), 0, 1);

    const dividerAppear = easeInOut((progress - (isMobile ? 0.748 : 0.95)) / (isMobile ? 0.045 : 0.016));
    const dividerDisappear = easeInOut((progress - (isMobile ? 0.915 : 0.986)) / (isMobile ? 0.062 : 0.012));
    const dividerVisible = clamp(dividerAppear * (1 - dividerDisappear), 0, 1);
    const dividerWidth = (isMobile ? 48 : 150) * dividerVisible;
    const dividerGap = (isMobile ? 8 : 16) + (isMobile ? 8 : 18) * dividerVisible;

    hero.style.setProperty("--hero-white-bg-opacity", clamp(whiteOpacity, 0, 1).toFixed(4));
    hero.style.setProperty("--review-bg-live-opacity", clamp(blackOpacity, 0, 0.92).toFixed(4));
    hero.style.setProperty("--review-proof-top", isMobile ? "35%" : "40%");
    hero.style.setProperty("--review-cards-top", isMobile ? "59%" : "61%");
    hero.style.setProperty("--review-cards-live-opacity", cardVisible.toFixed(4));
    hero.style.setProperty("--review-cards-live-y", `${((1 - cardVisible) * 26).toFixed(2)}px`);
    hero.style.setProperty("--review-cards-live-x", "0px");
    hero.style.setProperty("--review-stats-live-opacity", clamp(1 - proofVisible, 0, 1).toFixed(4));
    hero.style.setProperty("--proof-divider-width", `${dividerWidth.toFixed(2)}px`);
    hero.style.setProperty("--proof-divider-opacity", dividerVisible.toFixed(4));
    hero.style.setProperty("--proof-divider-gap", `${dividerGap.toFixed(2)}px`);
    hero.style.setProperty("--proof-divider-scale", dividerVisible > 0.001 ? "1" : "0.2");
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

    return Boolean(hero && progress >= 0.12 && progress <= 1.08);
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
    const hero = getHero();
    if(!hero) return;

    const progress = getHeroProgress(hero);

    if(progress >= 0.14 && progress <= 1.08){
      hero.style.setProperty("--hero-video-opacity", "1");
      hero.style.setProperty("--hero-overlay", progress >= 0.16 && progress <= 0.58 ? "0.36" : "0.22");
    }else if(progress < 0.12){
      hero.style.removeProperty("--hero-video-opacity");
    }
  }

  function update(){
    ticking = false;

    ensureStyle();
    restoreOriginalHeroFlow();
    syncReviewScene();

    if(!mobileMedia.matches) return;

    patchScrollTo();
    applyComfortVars();
    keepVideoPlaying();
  }

  function queueUpdate(){
    if(ticking) return;

    ticking = true;
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
  setInterval(update, 120);
})();
