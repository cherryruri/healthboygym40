import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
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

const DEFAULT_VIDEO_SRC = "센터 드론 영상.mp4";
const FALLBACK_THUMB_SRC = "헬스보이짐 사진.jpg";
const settingsRef = doc(db, "siteSettings", "homeNews");

const boardList = document.querySelector("[data-home-board-list]");
const newsThumb = document.querySelector("[data-home-news-thumb]");
const newsThumbImg = newsThumb ? newsThumb.querySelector("img") : null;
const newsThumbTitle = document.querySelector("[data-home-news-title]");
const videoCard = document.querySelector("[data-home-video-card]");
const video = document.querySelector("[data-home-video]");
const playButton = document.querySelector("[data-home-video-play]");
const emptyVideo = document.querySelector("[data-home-video-empty]");
const adminControls = document.querySelector("[data-home-video-admin]");
const editVideoButton = document.querySelector("[data-home-video-edit]");
const deleteVideoButton = document.querySelector("[data-home-video-delete]");

let latestNoticePosts = [];
let latestNewsPosts = [];
let currentVideoSrc = DEFAULT_VIDEO_SRC;
let currentUserData = null;

function escapeHTML(value){
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(post){
  if(post.createdAt && post.createdAt.toDate){
    return post.createdAt.toDate().toISOString().slice(0, 10).replace(/-/g, ".");
  }

  return "-";
}

function isAdmin(){
  return currentUserData && currentUserData.role === "admin";
}

async function loadUserData(user){
  if(!user) return null;

  try{
    const snap = await getDoc(doc(db, "users", user.uid));
    return snap.exists() ? snap.data() : null;
  }catch(error){
    console.log(error);
    return null;
  }
}

function renderBoardList(){
  if(!boardList) return;

  if(!latestNoticePosts.length){
    boardList.innerHTML = `
      <a class="news-board-item" href="board.html?board=noticeboard">
        <span>등록된 공지사항이 없습니다</span>
        <time>-</time>
      </a>
    `;
    return;
  }

  boardList.innerHTML =
    latestNoticePosts.slice(0, 4).map(({ id, data })=>`
      <a class="news-board-item" href="post.html?id=${encodeURIComponent(id)}">
        <span>${escapeHTML(data.title || "제목 없음")}</span>
        <time>${formatDate(data)}</time>
      </a>
    `).join("");
}

function isNoticePost(data){
  return data.board === "noticeboard" && (data.category === "notice" || data.isNotice || !data.category);
}

function isNewsPost(data){
  return data.board === "news" || data.category === "news";
}

function renderNewsThumbnail(){
  if(!newsThumb || !newsThumbImg) return;

  const postWithThumb =
    latestNewsPosts.find(({ data })=>data.thumbnailDataUrl) ||
    latestNewsPosts[0];

  if(!postWithThumb){
    newsThumb.href = "board.html?board=news";
    newsThumbImg.src = FALLBACK_THUMB_SRC;
    newsThumbImg.alt = "뉴스 썸네일";
    if(newsThumbTitle) newsThumbTitle.textContent = "NEWS";
    return;
  }

  const { id, data } = postWithThumb;
  newsThumb.href = `post.html?id=${encodeURIComponent(id)}`;
  newsThumbImg.src = data.thumbnailDataUrl || FALLBACK_THUMB_SRC;
  newsThumbImg.alt = data.title || "뉴스 썸네일";

  if(newsThumbTitle){
    newsThumbTitle.textContent = data.title || "NEWS";
  }
}

async function loadLatestPosts(){
  if(!boardList && !newsThumb) return;

  try{
    const noticeQuery = query(
      collection(db, "boards"),
      where("board", "==", "noticeboard"),
      orderBy("createdAt", "desc"),
      limit(12)
    );

    const newsQuery = query(
      collection(db, "boards"),
      where("board", "in", ["noticeboard", "news"]),
      orderBy("createdAt", "desc"),
      limit(24)
    );

    const [noticeSnap, newsSnap] = await Promise.all([
      getDocs(noticeQuery),
      getDocs(newsQuery)
    ]);

    latestNoticePosts =
      noticeSnap.docs.map(docSnap=>({
        id: docSnap.id,
        data: docSnap.data()
      }))
      .filter(({ data })=>isNoticePost(data))
      .slice(0, 4);

    latestNewsPosts =
      newsSnap.docs.map(docSnap=>({
        id: docSnap.id,
        data: docSnap.data()
      }))
      .filter(({ data })=>isNewsPost(data));
  }catch(error){
    console.log(error);
    latestNoticePosts = [];
    latestNewsPosts = [];
  }

  renderBoardList();
  renderNewsThumbnail();
}

function setVideoSource(src){
  currentVideoSrc = src || "";

  if(!video || !videoCard) return;

  if(!currentVideoSrc){
    video.removeAttribute("src");
    video.innerHTML = "";
    videoCard.classList.add("is-empty");
    if(playButton) playButton.hidden = true;
    if(emptyVideo) emptyVideo.hidden = false;
    return;
  }

  videoCard.classList.remove("is-empty", "is-playing");
  video.innerHTML = `<source src="${escapeHTML(currentVideoSrc)}" type="video/mp4">`;
  video.load();

  if(playButton) playButton.hidden = false;
  if(emptyVideo) emptyVideo.hidden = true;
}

async function loadVideoSettings(){
  try{
    const snap = await getDoc(settingsRef);

    if(snap.exists()){
      const data = snap.data();
      setVideoSource(data.videoDeleted ? "" : (data.videoSrc || DEFAULT_VIDEO_SRC));
      return;
    }
  }catch(error){
    console.log(error);
  }

  setVideoSource(DEFAULT_VIDEO_SRC);
}

function updateAdminControls(){
  if(!adminControls) return;

  adminControls.hidden = !isAdmin();
}

async function saveVideoSource(src, deleted = false){
  await setDoc(settingsRef, {
    videoSrc: src,
    videoDeleted: deleted,
    updatedAt: serverTimestamp()
  }, { merge:true });

  setVideoSource(deleted ? "" : src);
}

if(playButton && video && videoCard){
  playButton.addEventListener("click", ()=>{
    if(!currentVideoSrc) return;

    if(video.paused){
      video.play();
      videoCard.classList.add("is-playing");
    }else{
      video.pause();
      videoCard.classList.remove("is-playing");
    }
  });

  video.addEventListener("click", ()=>{
    playButton.click();
  });

  video.addEventListener("pause", ()=>{
    videoCard.classList.remove("is-playing");
  });
}

if(editVideoButton){
  editVideoButton.addEventListener("click", async ()=>{
    if(!isAdmin()) return;

    const nextSrc = prompt("영상 파일명 또는 URL을 입력해주세요.", currentVideoSrc || DEFAULT_VIDEO_SRC);
    if(nextSrc === null) return;

    const trimmed = nextSrc.trim();

    if(!trimmed){
      alert("영상 파일명 또는 URL을 입력해주세요.");
      return;
    }

    try{
      await saveVideoSource(trimmed, false);
      alert("영상이 변경되었습니다.");
    }catch(error){
      console.log(error);
      alert("영상을 변경하지 못했습니다.");
    }
  });
}

if(deleteVideoButton){
  deleteVideoButton.addEventListener("click", async ()=>{
    if(!isAdmin()) return;
    if(!confirm("이 섹션의 영상을 삭제할까요?")) return;

    try{
      await saveVideoSource("", true);
      alert("영상이 삭제되었습니다.");
    }catch(error){
      console.log(error);
      alert("영상을 삭제하지 못했습니다.");
    }
  });
}

onAuthStateChanged(auth, async user=>{
  currentUserData = await loadUserData(user);
  updateAdminControls();
});

loadLatestPosts();
loadVideoSettings();

(function finalizeMobileHeroProofAndVideo(){
  const mobileMedia = window.matchMedia("(max-width: 768px)");
  let ticking = false;

  function ensureStyle(){
    let style = document.getElementById("final-mobile-hero-proof-style");

    if(!style){
      style = document.createElement("style");
      style.id = "final-mobile-hero-proof-style";
    }

    style.textContent = `
      .review-proof-title{
        opacity:var(--final-proof-title-opacity, var(--stable-review-proof-opacity, var(--review-proof-opacity, 0))) !important;
        transform:translate(-50%, -50%) scale(1) !important;
        transition:opacity .16s linear !important;
      }
      .review-proof-title .review-proof-line{
        opacity:1 !important;
        transform:none !important;
      }
      .review-proof-title .review-proof-divider{
        width:var(--final-proof-divider-width, var(--proof-divider-width, var(--review-proof-divider-width, 0px))) !important;
        opacity:var(--final-proof-divider-opacity, var(--proof-divider-opacity, var(--review-proof-divider-opacity, 0))) !important;
        transition:width .22s cubic-bezier(.22,.61,.36,1), opacity .18s linear !important;
      }
      @media (max-width: 768px){
        .hero-video-frame{
          opacity:1 !important;
          transform:translate3d(-50%, 0, 0) !important;
          transition:none !important;
          will-change:auto !important;
          backface-visibility:hidden;
          contain:layout paint;
        }
        .intro-video{
          opacity:var(--final-intro-video-opacity, 1) !important;
          filter:none !important;
          transform:translate3d(0, 0, 0) !important;
          transition:opacity .18s linear !important;
          backface-visibility:hidden;
          will-change:auto !important;
        }
        .intro-statement{
          transform:translate3d(-50%, calc(-50% + var(--final-copy-y, var(--hero-copy-y))), 0) scale(1) !important;
          transition:opacity .16s linear !important;
          backface-visibility:hidden;
          will-change:opacity !important;
        }
      }
    `;

    if(document.head && style.parentNode !== document.head){
      document.head.appendChild(style);
    }else if(document.head && style.nextSibling){
      document.head.appendChild(style);
    }
  }

  function numberFromCss(value){
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function ease(value){
    const clamped = clamp(value, 0, 1);
    return clamped * clamped * (3 - 2 * clamped);
  }

  function getProgress(hero){
    return numberFromCss(
      hero.style.getPropertyValue("--hero-progress") ||
      getComputedStyle(hero).getPropertyValue("--hero-progress")
    );
  }

  function patchVideoPlay(hero){
    const video = hero.querySelector(".intro-video");
    if(!video || video.__finalMobileFreezePatched) return;

    const originalPlay = video.play.bind(video);
    video.__finalMobileFreezePatched = true;
    video.play = function finalMobilePlayGuard(){
      const currentHero = document.querySelector(".hero-expand-section");
      const progress = currentHero ? getProgress(currentHero) : 0;

      if(mobileMedia.matches && progress >= 0.16 && progress <= 0.63){
        return Promise.resolve();
      }

      return originalPlay();
    };
  }

  function stabilizeVideo(hero, progress){
    if(!mobileMedia.matches) return;

    const video = hero.querySelector(".intro-video");
    if(!video) return;

    patchVideoPlay(hero);

    const statementActive = progress >= 0.16 && progress <= 0.63;
    const reviewFade = ease((progress - 0.60) / 0.12);
    const videoOpacity = Math.max(0.08, 1 - reviewFade * 0.92);

    hero.style.setProperty("--final-intro-video-opacity", videoOpacity.toFixed(3));

    if(statementActive){
      if(!video.paused){
        video.pause();
      }
      hero.style.setProperty("--final-copy-y", "0px");
      hero.style.setProperty("--hero-copy-scale", "1");
      return;
    }

    hero.style.removeProperty("--final-copy-y");

    if(progress < 0.14 && video.paused && !document.hidden){
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");

      const promise = video.play();
      if(promise && typeof promise.catch === "function"){
        promise.catch(()=>{});
      }
    }
  }

  function stabilizeProof(hero, progress){
    const isMobile = mobileMedia.matches;
    const showStart = isMobile ? 0.735 : 0.944;
    const showRange = isMobile ? 0.04 : 0.018;
    const lineVisible = ease((progress - showStart) / showRange);
    const dividerFadeStart = isMobile ? 0.805 : 0.972;
    const dividerFadeRange = isMobile ? 0.10 : 0.022;
    const dividerVisible = lineVisible * (1 - ease((progress - dividerFadeStart) / dividerFadeRange));
    const maxWidth = isMobile ? 48 : 150;
    const minGap = isMobile ? 8 : 16;
    const extraGap = isMobile ? 8 : 18;

    hero.style.setProperty("--final-proof-title-opacity", lineVisible.toFixed(4));
    hero.style.setProperty("--final-proof-divider-opacity", clamp(dividerVisible, 0, 1).toFixed(4));
    hero.style.setProperty("--final-proof-divider-width", `${(maxWidth * dividerVisible).toFixed(2)}px`);
    hero.style.setProperty("--proof-divider-gap", `${(minGap + extraGap * dividerVisible).toFixed(2)}px`);
    hero.style.setProperty("--review-proof-y", "0px");
    hero.style.setProperty("--review-proof-scale", "1");
  }

  function update(){
    ticking = false;
    ensureStyle();

    const hero = document.querySelector(".hero-expand-section");
    if(!hero) return;

    const progress = getProgress(hero);

    stabilizeProof(hero, progress);
    stabilizeVideo(hero, progress);
  }

  function queueUpdate(){
    if(ticking) return;

    ticking = true;
    requestAnimationFrame(update);
  }

  ensureStyle();
  queueUpdate();

  window.addEventListener("scroll", queueUpdate, {passive:true});
  window.addEventListener("resize", queueUpdate, {passive:true});
  window.addEventListener("pageshow", queueUpdate, {passive:true});
  document.addEventListener("DOMContentLoaded", queueUpdate);
  document.addEventListener("visibilitychange", queueUpdate);
  setTimeout(queueUpdate, 80);
  setTimeout(queueUpdate, 420);
  setTimeout(queueUpdate, 1100);
  setInterval(queueUpdate, 80);
})();

(function correctStatsVideoAndProofTiming(){
  const mobileMedia = window.matchMedia("(max-width: 768px)");
  let ticking = false;

  function ensureStyle(){
    let style = document.getElementById("stats-video-proof-correction-style");

    if(!style){
      style = document.createElement("style");
      style.id = "stats-video-proof-correction-style";
    }

    style.textContent = `
      .hero-expand-sticky > .review-cover-panel{
        background:rgba(0,0,0,var(--correct-review-bg-opacity, var(--review-bg-live-opacity, var(--review-bg-opacity, 0)))) !important;
      }
      .review-proof-title{
        opacity:var(--correct-proof-title-opacity, var(--final-proof-title-opacity, var(--review-proof-opacity, 0))) !important;
        transform:translate(-50%, -50%) scale(1) !important;
      }
      .review-proof-title .review-proof-divider{
        width:var(--correct-proof-divider-width, var(--final-proof-divider-width, 0px)) !important;
        opacity:var(--correct-proof-divider-opacity, var(--final-proof-divider-opacity, 0)) !important;
      }
      @media (max-width: 768px){
        .hero-video-frame{
          opacity:1 !important;
          transform:translate3d(-50%, 0, 0) !important;
          transition:none !important;
          will-change:auto !important;
          backface-visibility:hidden;
          contain:paint;
        }
        .intro-video{
          opacity:var(--correct-video-opacity, 1) !important;
          filter:none !important;
          transform:translate3d(0, 0, 0) !important;
          transition:opacity .18s linear !important;
          backface-visibility:hidden;
        }
      }
    `;

    if(document.head && style.parentNode !== document.head){
      document.head.appendChild(style);
    }else if(document.head && style.nextSibling){
      document.head.appendChild(style);
    }
  }

  function numberFromCss(value){
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function ease(value){
    const clamped = clamp(value, 0, 1);
    return clamped * clamped * (3 - 2 * clamped);
  }

  function getProgress(hero){
    return numberFromCss(
      hero.style.getPropertyValue("--hero-progress") ||
      getComputedStyle(hero).getPropertyValue("--hero-progress")
    );
  }

  function update(){
    ticking = false;
    ensureStyle();

    const hero = document.querySelector(".hero-expand-section");
    if(!hero) return;

    const progress = getProgress(hero);
    const isMobile = mobileMedia.matches;
    const statsDone =
      document.documentElement.classList.contains("review-stats-counted") ||
      document.documentElement.classList.contains("review-stats-hold-complete") ||
      progress >= (isMobile ? 0.86 : 0.955);

    const statsIn = ease((progress - (isMobile ? 0.61 : 0.79)) / (isMobile ? 0.05 : 0.04));
    const statsOut = ease((progress - (isMobile ? 0.83 : 0.94)) / (isMobile ? 0.09 : 0.035));
    const statsVisible = clamp(statsIn * (1 - statsOut), 0, 1);
    const proofStart = isMobile ? 0.885 : 0.968;
    const proofVisible = statsDone ? ease((progress - proofStart) / (isMobile ? 0.085 : 0.018)) : 0;
    const dividerOut = ease((progress - (isMobile ? 0.955 : 0.988)) / (isMobile ? 0.075 : 0.012));
    const dividerOpacity = clamp(proofVisible * (1 - dividerOut), 0, 1);
    const maxWidth = isMobile ? 48 : 150;
    const dividerWidth = proofVisible > 0.02 ? maxWidth * (1 - dividerOut) : maxWidth;
    const blackIn = ease((progress - (isMobile ? 0.86 : 0.955)) / (isMobile ? 0.15 : 0.03));
    const videoFade = ease((progress - (isMobile ? 0.875 : 0.965)) / (isMobile ? 0.14 : 0.03));
    const cardsVisible = statsDone ? ease((progress - (isMobile ? 0.965 : 0.992)) / (isMobile ? 0.05 : 0.006)) : 0;

    hero.style.setProperty("--correct-review-bg-opacity", (0.16 * statsVisible + 0.92 * blackIn).toFixed(4));
    hero.style.setProperty("--review-stats-live-opacity", statsVisible.toFixed(4));
    hero.style.setProperty("--correct-proof-title-opacity", proofVisible.toFixed(4));
    hero.style.setProperty("--correct-proof-divider-opacity", dividerOpacity.toFixed(4));
    hero.style.setProperty("--correct-proof-divider-width", `${Math.max(0, dividerWidth).toFixed(2)}px`);
    hero.style.setProperty("--proof-divider-gap", `${(isMobile ? 10 : 20).toFixed(2)}px`);
    hero.style.setProperty("--review-proof-y", "0px");
    hero.style.setProperty("--review-proof-scale", "1");
    hero.style.setProperty("--review-cards-live-opacity", cardsVisible.toFixed(4));
    hero.style.setProperty("--review-cards-opacity", cardsVisible.toFixed(4));
    hero.style.setProperty("--correct-video-opacity", Math.max(0.08, 1 - videoFade * 0.92).toFixed(3));

    if(isMobile){
      const video = hero.querySelector(".intro-video");
      if(video && progress >= 0.16 && progress <= 0.875 && !video.paused){
        video.pause();
      }
    }
  }

  function queueUpdate(){
    if(ticking) return;

    ticking = true;
    requestAnimationFrame(update);
  }

  ensureStyle();
  queueUpdate();

  window.addEventListener("scroll", queueUpdate, {passive:true});
  window.addEventListener("resize", queueUpdate, {passive:true});
  window.addEventListener("pageshow", queueUpdate, {passive:true});
  document.addEventListener("DOMContentLoaded", queueUpdate);
  document.addEventListener("visibilitychange", queueUpdate);
  setTimeout(queueUpdate, 80);
  setTimeout(queueUpdate, 450);
  setTimeout(queueUpdate, 1200);
  setInterval(queueUpdate, 50);
})();
