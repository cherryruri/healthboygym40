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
  query,
  where,
  orderBy
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

const params = new URLSearchParams(location.search);
const initialBoard = params.get("board") || "free";
const initialCategory = params.get("category") || "";
const communityBoardNames = ["free", "praise", "review"];
const officialBoardNames = new Set(["noticeboard", "news", "infoboard"]);
const isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

if(!isMobile || officialBoardNames.has(initialBoard)){
  // Desktop and official boards keep the existing board renderer.
}else{
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const groups = {
    all: {
      label:"전체",
      categories:[]
    },
    community: {
      label:"자유게시판",
      categories:[
        ["praise", "칭찬합니다"],
        ["free", "자유게시판"],
        ["diet", "운동&식단 인증"]
      ]
    },
    review: {
      label:"후기",
      categories:[
        ["pt", "PT후기"],
        ["before_after", "비포&애프터"],
        ["challenge", "바디챌린지후기"]
      ]
    }
  };

  const labels = {
    all:"전체",
    free:"자유게시판",
    praise:"칭찬합니다",
    diet:"운동&식단 인증",
    pt:"PT후기",
    before_after:"비포&애프터",
    challenge:"바디챌린지후기",
    request:"건의사항"
  };

  const categoryGroup = {
    praise:"community",
    free:"community",
    diet:"community",
    request:"community",
    pt:"review",
    before_after:"review",
    challenge:"review"
  };

  let currentUser = null;
  let currentUserData = null;
  let posts = [];
  let activeCategory = getInitialCategory();
  let activeGroup = getGroupForCategory(activeCategory);
  let shell = null;
  let listEl = null;
  let topTabsEl = null;
  let subtabsEl = null;

  document.addEventListener("DOMContentLoaded", initMobileBoard);

  onAuthStateChanged(auth, async user=>{
    currentUser = user;
    currentUserData = await loadUserData(user);
    renderPosts();
  });

  async function initMobileBoard(){
    mountShell();
    bindOriginalWriteButton();
    renderTabs();
    await loadPosts();
  }

  function getInitialCategory(){
    if(initialCategory && labels[initialCategory]) return initialCategory;
    if(initialBoard === "praise") return "praise";
    if(initialBoard === "review") return "pt";
    return "all";
  }

  function getGroupForCategory(category){
    return categoryGroup[category] || "all";
  }

  function mountShell(){
    const boardMain = document.querySelector(".board-main");
    if(!boardMain || shell) return;

    document.body.classList.add("mobile-board-view");

    shell = document.createElement("section");
    shell.className = "mobile-community-board";
    shell.setAttribute("aria-label", "모바일 게시판");
    shell.innerHTML = `
      <div class="mobile-board-appbar">
        <button type="button" class="mobile-board-icon" data-mobile-back aria-label="뒤로가기">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7"></path></svg>
        </button>
        <a class="mobile-board-icon" href="login.html" aria-label="내 정보">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="8" r="4"></circle></svg>
        </a>
      </div>
      <nav class="mobile-board-tabs" aria-label="게시판 큰 분류"></nav>
      <nav class="mobile-board-subtabs" aria-label="게시판 세부 분류"></nav>
      <div class="mobile-board-list"><div class="mobile-board-loading">게시글을 불러오는 중입니다</div></div>
    `;

    boardMain.insertAdjacentElement("afterbegin", shell);

    topTabsEl = shell.querySelector(".mobile-board-tabs");
    subtabsEl = shell.querySelector(".mobile-board-subtabs");
    listEl = shell.querySelector(".mobile-board-list");

    shell.addEventListener("click", event=>{
      const backButton = event.target.closest("[data-mobile-back]");
      const groupButton = event.target.closest("[data-mobile-group]");
      const categoryButton = event.target.closest("[data-mobile-category]");

      if(backButton){
        if(history.length > 1){
          history.back();
        }else{
          location.href = "index.html";
        }
        return;
      }

      if(groupButton){
        setGroup(groupButton.dataset.mobileGroup);
        return;
      }

      if(categoryButton){
        setCategory(categoryButton.dataset.mobileCategory);
      }
    });
  }

  function bindOriginalWriteButton(){
    const writeBtn = document.getElementById("writeBtn");
    if(!writeBtn) return;

    writeBtn.addEventListener("click", event=>{
      if(!document.body.classList.contains("mobile-board-view")) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if(!currentUser){
        alert("로그인한 회원만 글을 쓸 수 있습니다.");
        location.href = "login.html";
        return;
      }

      location.href = `editor.html?${getWriteQueryString()}`;
    }, true);
  }

  function setGroup(group){
    if(!groups[group]) return;

    activeGroup = group;
    activeCategory = group === "all" ? "all" : groups[group].categories[0][0];
    updateUrl();
    renderTabs();
    renderPosts();
  }

  function setCategory(category){
    if(!labels[category]) return;

    activeCategory = category;
    activeGroup = getGroupForCategory(category);
    updateUrl();
    renderTabs();
    renderPosts();
  }

  function updateUrl(){
    if(activeCategory === "all"){
      history.replaceState(null, "", "board.html");
      return;
    }

    const board = getBoardForCategory(activeCategory);
    history.replaceState(null, "", `board.html?board=${board}&category=${activeCategory}`);
  }

  function renderTabs(){
    if(!topTabsEl || !subtabsEl) return;

    topTabsEl.innerHTML = Object.entries(groups)
      .map(([value, group])=>`
        <button type="button" class="${activeGroup === value ? "active" : ""}" data-mobile-group="${value}">
          ${escapeHTML(group.label)}
        </button>
      `)
      .join("");

    const subCategories = groups[activeGroup].categories || [];
    subtabsEl.hidden = activeGroup === "all" || subCategories.length === 0;
    subtabsEl.innerHTML = subCategories
      .map(([value, label])=>`
        <button type="button" class="${activeCategory === value ? "active" : ""}" data-mobile-category="${value}">
          ${escapeHTML(label)}
        </button>
      `)
      .join("");
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

  async function loadPosts(){
    if(!listEl) return;

    listEl.innerHTML = `<div class="mobile-board-loading">게시글을 불러오는 중입니다</div>`;

    try{
      const snaps = await Promise.all(
        communityBoardNames.map(boardName=>
          getDocs(
            query(
              collection(db, "boards"),
              where("board", "==", boardName),
              orderBy("createdAt", "desc")
            )
          )
        )
      );

      posts = [];

      snaps.forEach(snap=>{
        snap.forEach(docSnap=>{
          posts.push({ id:docSnap.id, data:docSnap.data() });
        });
      });

      posts.sort((a, b)=>getCreatedTime(b.data) - getCreatedTime(a.data));
      renderPosts();
    }catch(error){
      console.log(error);
      listEl.innerHTML = `<div class="mobile-board-empty">게시글을 불러오지 못했습니다.</div>`;
    }
  }

  function renderPosts(){
    if(!listEl) return;

    const visiblePosts = getVisiblePosts();

    if(visiblePosts.length === 0){
      listEl.innerHTML = `<div class="mobile-board-empty">등록된 글이 없습니다.</div>`;
      return;
    }

    listEl.innerHTML = "";

    visiblePosts.forEach(({ id, data })=>{
      const card = document.createElement("article");
      const category = getPostCategory(data);
      const label = labels[category] || "자유게시판";
      const thumb = getPostThumbnail(data);
      const point = Number(data.points || data.point || data.reward || 0);
      const writer = data.writerId || "회원";

      card.className = "mobile-post-card";
      card.innerHTML = `
        <div class="mobile-post-author">
          <span class="mobile-post-avatar">${escapeHTML(getAvatarText(writer))}</span>
          <span>${escapeHTML(writer)}</span>
        </div>
        <div class="mobile-post-main">
          <div class="mobile-post-text">
            <h2 class="mobile-post-title">${escapeHTML(data.title || "제목 없음")}</h2>
            <span class="mobile-post-category">${escapeHTML(label)}</span>
          </div>
          ${thumb ? `<div class="mobile-post-thumb"><img src="${escapeAttr(thumb)}" alt=""></div>` : ""}
        </div>
        <div class="mobile-post-meta">
          <span class="point ${point > 0 ? "has-point" : ""}">${formatNumber(point)}원</span>
          <span>♥ ${formatNumber(data.likes || data.likeCount || 0)}</span>
          <span>● ${formatNumber(data.commentCount || data.comments || 0)}</span>
          <time>${escapeHTML(timeAgo(data.createdAt))}</time>
        </div>
      `;

      card.addEventListener("click", ()=>openPost(id, data));
      listEl.appendChild(card);
    });
  }

  function getVisiblePosts(){
    return posts.filter(({ data })=>{
      const category = getPostCategory(data);

      if(activeCategory === "all") return true;
      return category === activeCategory;
    });
  }

  function getPostCategory(post){
    if(post.category) return post.category;
    if(post.board === "praise") return "praise";
    if(post.board === "review") return "pt";
    if(post.board === "free" && (post.isSecret || post.isPublic === false)) return "request";
    return "free";
  }

  function getPostThumbnail(post){
    if(post.thumbnailDataUrl) return post.thumbnailDataUrl;

    const content = String(post.content || "");
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : "";
  }

  function openPost(id, post){
    if(!canOpenPost(post)){
      alert("비밀글입니다. 작성자만 볼 수 있어요.");
      return;
    }

    location.href = `post.html?id=${id}`;
  }

  function canOpenPost(post){
    if(!post.isSecret) return true;
    if(currentUserData && currentUserData.role === "admin") return true;
    return currentUser && currentUser.uid === post.writerUid;
  }

  function getWriteQueryString(){
    const category = activeCategory === "all" ? "free" : activeCategory;
    const board = getBoardForCategory(category);
    return `board=${board}&category=${category}`;
  }

  function getBoardForCategory(category){
    if(category === "praise") return "praise";
    if(category === "pt" || category === "before_after" || category === "challenge") return "review";
    return "free";
  }

  function getAvatarText(writer){
    const text = String(writer || "U").trim();
    return text ? text.charAt(0).toUpperCase() : "U";
  }

  function getCreatedTime(post){
    const createdAt = post.createdAt;

    if(createdAt && createdAt.toDate){
      return createdAt.toDate().getTime();
    }

    const time = new Date(createdAt || 0).getTime();
    return Number.isFinite(time) ? time : 0;
  }

  function timeAgo(timestamp){
    if(!timestamp) return "";

    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.max(0, Math.floor((Date.now() - time.getTime()) / 1000));

    if(diff < 60) return "방금";
    if(diff < 3600) return `${Math.floor(diff / 60)}분`;
    if(diff < 86400) return `${Math.floor(diff / 3600)}시간`;
    if(diff < 604800) return `${Math.floor(diff / 86400)}일`;

    return time.toLocaleDateString("ko-KR", { month:"numeric", day:"numeric" });
  }

  function formatNumber(value){
    const number = Number(value || 0);
    return Number.isFinite(number) ? number.toLocaleString("ko-KR") : "0";
  }

  function escapeHTML(value){
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value){
    return escapeHTML(value).replace(/`/g, "&#096;");
  }
}
