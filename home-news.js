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
