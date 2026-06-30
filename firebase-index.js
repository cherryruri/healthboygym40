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

(function applyKakaoInspiredHero(){
  const mobileMedia = window.matchMedia("(max-width: 768px)");
  const root = document.documentElement;
  const originalScrollTo = window.scrollTo.bind(window);
  const scrollKeys = new Set(["ArrowDown", "PageDown", " ", "Spacebar", "End", "ArrowUp", "PageUp", "Home"]);
  const lockClasses = [
    "hero-caption-scroll-locked",
    "hero-mobile-snap-playing",
    "hero-stats-bridge-playing"
  ];
  let lastUserScrollAt = 0;
  let patchedScrollTo = false;
  let ticking = false;
  let intervalCount = 0;

  function ensureStyle(){
    if(document.getElementById("kakao-inspired-hero-style")) return;

    const style = document.createElement("style");
    style.id = "kakao-inspired-hero-style";
    style.textContent = `
      html.kakao-inspired-hero,
      html.kakao-inspired-hero body{
        background:#fff !important;
        scroll-behavior:auto !important;
      }

      html.kakao-inspired-hero .intro{
        height:calc(100svh - 80px) !important;
        min-height:760px !important;
        overflow:visible !important;
        background:#fff !important;
        color:#050505 !important;
        text-align:left !important;
      }

      html.kakao-inspired-hero .hero-expand-sticky{
        position:relative !important;
        top:auto !important;
        height:100% !important;
        min-height:inherit !important;
        overflow:hidden !important;
        background:#fff !important;
        isolation:auto !important;
      }

      html.kakao-inspired-hero .hero-expand-sticky::before{
        background:#fff !important;
        opacity:1 !important;
      }

      html.kakao-inspired-hero .intro-inner{
        position:absolute !important;
        left:0 !important;
        top:clamp(132px, 22svh, 210px) !important;
        z-index:4 !important;
        width:100% !important;
        min-height:0 !important;
        padding:0 clamp(58px, 14vw, 150px) !important;
        align-items:flex-start !important;
        justify-content:flex-start !important;
        opacity:1 !important;
        transform:none !important;
        text-align:left !important;
      }

      html.kakao-inspired-hero .intro-main{
        align-items:flex-start !important;
        gap:4px !important;
        max-width:720px !important;
        color:#050505 !important;
        font-size:clamp(42px, 8.5vw, 96px) !important;
        line-height:1.18 !important;
        font-weight:950 !important;
        letter-spacing:0 !important;
        text-align:left !important;
      }

      html.kakao-inspired-hero .intro-title-line{
        opacity:1 !important;
        transform:none !important;
        clip-path:none !important;
      }

      html.kakao-inspired-hero .intro-desc,
      html.kakao-inspired-hero .intro-statement,
      html.kakao-inspired-hero .review-proof-title{
        display:none !important;
      }

      html.kakao-inspired-hero .hero-video-frame{
        position:absolute !important;
        left:50% !important;
        top:clamp(382px, 54svh, 520px) !important;
        bottom:auto !important;
        z-index:2 !important;
        width:min(68vw, 255px) !important;
        height:min(664px, 78svh) !important;
        border-radius:14px !important;
        overflow:hidden !important;
        background:#dfe8e8 !important;
        opacity:1 !important;
        transform:translateX(-50%) !important;
        box-shadow:none !important;
        transition:none !important;
      }

      html.kakao-inspired-hero .hero-video-frame::after{
        background:rgba(0,0,0,.06) !important;
      }

      html.kakao-inspired-hero .intro-video{
        display:block !important;
        width:100% !important;
        height:100% !important;
        object-fit:cover !important;
        opacity:1 !important;
        filter:none !important;
        transform:translateZ(0);
        backface-visibility:hidden;
      }

      html.kakao-inspired-hero .kb-story-section{
        position:relative;
        min-height:118svh;
        overflow:hidden;
        background:#fff;
        color:#050505;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:120px 0;
      }

      html.kakao-inspired-hero .kb-story-inner{
        position:relative;
        width:min(100%, 1080px);
        min-height:760px;
        display:flex;
        align-items:center;
        justify-content:center;
      }

      html.kakao-inspired-hero .kb-story-copy{
        position:relative;
        z-index:3;
        width:min(720px, calc(100% - 48px));
        margin:0 auto;
        text-align:center;
        color:#050505;
        font-size:clamp(34px, 4.3vw, 64px);
        line-height:1.36;
        font-weight:950;
        letter-spacing:0;
        word-break:keep-all;
      }

      html.kakao-inspired-hero .kb-story-copy span{
        display:block;
      }

      html.kakao-inspired-hero .kb-float{
        position:absolute;
        z-index:1;
        overflow:hidden;
        border-radius:18px;
        background:#f4f4f4;
        box-shadow:none;
      }

      html.kakao-inspired-hero .kb-float img{
        display:block;
        width:100%;
        height:100%;
        object-fit:cover;
      }

      html.kakao-inspired-hero .kb-float-photo-a{
        width:190px;
        height:142px;
        left:6%;
        top:10%;
      }

      html.kakao-inspired-hero .kb-float-photo-b{
        width:180px;
        height:138px;
        right:8%;
        bottom:12%;
      }

      html.kakao-inspired-hero .kb-proof-chip{
        position:absolute;
        z-index:2;
        min-width:132px;
        min-height:118px;
        border-radius:18px;
        padding:22px 20px;
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        background:#fff200;
        color:#050505;
        font-size:13px;
        line-height:1.35;
        font-weight:900;
        letter-spacing:0;
      }

      html.kakao-inspired-hero .kb-proof-chip strong{
        display:block;
        margin-top:14px;
        font-size:30px;
        line-height:1;
        font-weight:950;
      }

      html.kakao-inspired-hero .kb-proof-review{
        right:14%;
        top:18%;
      }

      html.kakao-inspired-hero .kb-proof-member{
        left:10%;
        bottom:16%;
        background:#eaf1ff;
      }

      html.kakao-inspired-hero .review-cover-panel.kb-review-flow{
        position:relative !important;
        inset:auto !important;
        left:auto !important;
        top:auto !important;
        display:block !important;
        width:100% !important;
        height:auto !important;
        min-height:0 !important;
        overflow:visible !important;
        opacity:1 !important;
        visibility:visible !important;
        pointer-events:auto !important;
        transform:none !important;
        background:#050505 !important;
        color:#fff !important;
        z-index:auto !important;
      }

      html.kakao-inspired-hero .review-cover-panel.kb-review-flow .review-cards,
      html.kakao-inspired-hero .review-cover-panel.kb-review-flow .review-stats-section,
      html.kakao-inspired-hero .review-cover-panel.kb-review-flow .review-proof-section{
        opacity:1 !important;
        visibility:visible !important;
        transform:none !important;
      }

      @media (max-width: 768px){
        html.kakao-inspired-hero .main-content{
          padding-top:79px !important;
          background:#fff !important;
        }

        html.kakao-inspired-hero .intro{
          height:calc(100svh - 79px) !important;
          min-height:760px !important;
        }

        html.kakao-inspired-hero .hero-expand-sticky{
          height:100% !important;
          min-height:inherit !important;
        }

        html.kakao-inspired-hero .intro-inner{
          top:clamp(130px, 22svh, 235px) !important;
          padding:0 0 0 clamp(48px, 15vw, 64px) !important;
        }

        html.kakao-inspired-hero .intro-main{
          font-size:clamp(38px, 10.2vw, 48px) !important;
          line-height:1.22 !important;
          max-width:295px !important;
        }

        html.kakao-inspired-hero .hero-video-frame{
          top:clamp(352px, 50svh, 445px) !important;
          width:min(68vw, 255px) !important;
          height:min(664px, 78svh) !important;
          border-radius:14px !important;
        }

        html.kakao-inspired-hero .kb-story-section{
          min-height:116svh;
          padding:72px 0 86px;
        }

        html.kakao-inspired-hero .kb-story-inner{
          min-height:760px;
        }

        html.kakao-inspired-hero .kb-story-copy{
          width:calc(100% - 52px);
          font-size:clamp(28px, 7vw, 34px);
          line-height:1.42;
        }

        html.kakao-inspired-hero .kb-float-photo-a{
          width:118px;
          height:92px;
          left:-22px;
          top:8%;
          border-radius:14px;
        }

        html.kakao-inspired-hero .kb-float-photo-b{
          width:122px;
          height:94px;
          right:-18px;
          bottom:9%;
          border-radius:14px;
        }

        html.kakao-inspired-hero .kb-proof-chip{
          min-width:104px;
          min-height:96px;
          padding:16px 15px;
          border-radius:16px;
          font-size:11px;
        }

        html.kakao-inspired-hero .kb-proof-chip strong{
          font-size:24px;
        }

        html.kakao-inspired-hero .kb-proof-review{
          right:8%;
          top:9%;
        }

        html.kakao-inspired-hero .kb-proof-member{
          left:5%;
          bottom:16%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getHero(){
    return document.querySelector(".hero-expand-section");
  }

  function pageTop(element){
    if(!element) return null;
    return element.getBoundingClientRect().top + window.pageYOffset;
  }

  function getScrollTop(){
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function ensureStorySection(){
    const hero = getHero();
    if(!hero) return null;

    let story = document.querySelector("[data-kb-story]");
    if(story) return story;

    story = document.createElement("section");
    story.className = "kb-story-section";
    story.dataset.kbStory = "true";
    story.setAttribute("aria-label", "헬스보이짐 수내점 소개");
    story.innerHTML = `
      <div class="kb-story-inner">
        <figure class="kb-float kb-float-photo-a" aria-hidden="true">
          <img src="프리웨이트존사진1.jpg" alt="">
        </figure>
        <div class="kb-proof-chip kb-proof-review" aria-hidden="true">
          <span>네이버 리뷰</span>
          <strong>1,000+</strong>
        </div>
        <div class="kb-proof-chip kb-proof-member" aria-hidden="true">
          <span>누적 회원 등록</span>
          <strong>5,000+</strong>
        </div>
        <div class="kb-story-copy">
          <span>헬스보이짐 수내점의 구성원은</span>
          <span>회원님의 일상이 더 건강해지도록</span>
          <span>쾌적한 공간과 운동의 기준을</span>
          <span>먼저 만들어가는 사람들입니다.</span>
        </div>
        <figure class="kb-float kb-float-photo-b" aria-hidden="true">
          <img src="리포머사진1.jpg" alt="">
        </figure>
      </div>
    `;
    hero.insertAdjacentElement("afterend", story);
    return story;
  }

  function moveReviewPanel(){
    const story = ensureStorySection();
    if(!story) return;

    const sticky = document.querySelector(".hero-expand-sticky");
    const review = sticky ? sticky.querySelector(".review-cover-panel") : document.querySelector(".review-cover-panel");
    if(!review) return;

    review.classList.add("kb-review-flow");
    if(story.nextElementSibling !== review){
      story.insertAdjacentElement("afterend", review);
    }
  }

  function resetHeroState(){
    const hero = getHero();
    if(!hero) return;

    [
      "--hero-video-opacity",
      "--review-bg-opacity",
      "--hero-overlay",
      "--review-cover-y",
      "--hero-stage-bg"
    ].forEach(name=>hero.style.removeProperty(name));

    lockClasses.forEach(className=>root.classList.remove(className));
    document.body.classList.remove("hero-mobile-snap-playing");
    document.body.style.overflow = "";
    root.style.overflow = "";
  }

  function isLargeBackwardJump(top){
    if(!Number.isFinite(top)) return false;

    const hero = getHero();
    const story = document.querySelector("[data-kb-story]");
    const heroTop = pageTop(hero);
    const storyTop = pageTop(story);
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
    const currentTop = getScrollTop();
    const flowTop = heroTop === null ? 0 : heroTop;
    const flowBottom = story && storyTop !== null
      ? storyTop + story.offsetHeight
      : (heroTop === null ? viewportHeight : heroTop + hero.offsetHeight + viewportHeight);
    const inHeroStoryFlow = currentTop >= flowTop - viewportHeight * 0.2 && currentTop <= flowBottom + viewportHeight * 0.5;

    return inHeroStoryFlow && top < currentTop - viewportHeight * 0.65;
  }

  function patchScrollTo(){
    if(patchedScrollTo) return;

    patchedScrollTo = true;
    window.scrollTo = function patchedKakaoInspiredScrollTo(arg, y){
      const userScrollIsActive = Date.now() - lastUserScrollAt < 3200;

      if(userScrollIsActive){
        let top = null;

        if(arg && typeof arg === "object"){
          top = Number(arg.top);
        }else if(arguments.length > 1){
          top = Number(y);
        }

        if(isLargeBackwardJump(top)){
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

  function shouldKeepVideoLive(){
    if(document.hidden) return false;

    const hero = getHero();
    const heroTop = pageTop(hero);
    if(!hero || heroTop === null) return false;

    const currentTop = getScrollTop();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

    return currentTop >= heroTop - viewportHeight && currentTop <= heroTop + hero.offsetHeight + viewportHeight;
  }

  function patchVideoPause(video){
    if(!video || video.__kakaoInspiredPausePatched) return;

    const originalPause = video.pause.bind(video);
    video.__kakaoInspiredPausePatched = true;
    video.pause = function kakaoInspiredPause(){
      if(shouldKeepVideoLive()) return;
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

    if(shouldKeepVideoLive() && video.paused){
      const playPromise = video.play();
      if(playPromise && typeof playPromise.catch === "function"){
        playPromise.catch(()=>{});
      }
    }
  }

  function refreshScrollTools(){
    if(window.ScrollTrigger && typeof window.ScrollTrigger.refresh === "function"){
      window.ScrollTrigger.refresh();
    }
  }

  function update(){
    ticking = false;
    root.classList.add("kakao-inspired-hero");
    ensureStyle();
    ensureStorySection();
    moveReviewPanel();
    resetHeroState();
    patchScrollTo();
    keepVideoPlaying();
    intervalCount += 1;

    if(intervalCount < 8){
      refreshScrollTools();
    }
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
  setTimeout(queueUpdate, 1800);
  setInterval(update, 500);
})();
