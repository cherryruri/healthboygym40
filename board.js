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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const officialBoards = new Set(["noticeboard", "news"]);
const adminOnlyBoards = new Set(["infoboard"]);
const communityBoards = ["free", "praise", "review"];

let currentUser = null;
let currentUserData = null;
const initialBoard = new URLSearchParams(location.search).get("board") || "free";
let currentBoard =
  adminOnlyBoards.has(initialBoard)
    ? initialBoard
    : officialBoards.has(initialBoard)
      ? "noticeboard"
      : communityBoards.includes(initialBoard) || initialBoard === "teen"
        ? initialBoard
        : "free";
let currentPage = 1;
let currentCategory =
  initialBoard === "praise"
    ? "praise"
    : initialBoard === "review"
      ? "pt"
      : initialBoard === "news"
        ? "news"
        : officialBoards.has(initialBoard)
          ? "notice"
          : "all";
let allPosts = [];

const postsPerPage = 20;
const postList = document.getElementById("postList");
const noticeList = document.getElementById("noticeList");
const paginationContainer = document.getElementById("pagination");
const writeBtn = document.getElementById("writeBtn");
const boardDesc = document.getElementById("boardDesc");
const boardSearch = document.getElementById("boardSearch");
const boardPage = document.querySelector(".board-page");
const boardHeader = document.querySelector(".board-header");
const boardTitle = document.querySelector(".board-header h1");

let boardCategoryBar = document.getElementById("boardCategoryBar");

const boardMeta = {
  free: {
    title: "자유게시판",
    desc: "수내점 회원님들의 자유로운 이야기와 칭찬, PT 후기, 건의 사항을 확인하는 공간입니다.",
    mode: "consult",
    categories: [
      ["all", "전체"],
      ["free", "자유게시판"],
      ["praise", "칭찬합니다"],
      ["pt", "PT후기"],
      ["request", "건의 사항"]
    ]
  },
  praise: {
    title: "칭찬합니다",
    desc: "트레이너와 직원들을 칭찬하고 따뜻한 격려를 나누는 공간입니다.",
    mode: "table"
  },
  noticeboard: {
    title: "공지문 / 뉴스",
    desc: "헬스보이짐 수내점의 중요한 소식과 업데이트된 정보를 빠르고 정확하게 확인하실 수 있습니다.",
    mode: "official",
    categories: [
      ["notice", "공지문"],
      ["news", "센터소식"],
      ["trainer", "이달의 트레이너"]
    ]
  },
  infoboard: {
    title: "인포게시판",
    desc: "관리자만 확인할 수 있는 내부 안내 게시판입니다.",
    mode: "table"
  },
  review: {
    title: "리얼 후기",
    desc: "회원님들이 직접 경험하고 작성해주신 100% 리얼 운동 후기입니다.",
    mode: "table"
  },
  teen: {
    title: "동기부여 모음",
    desc: "지치고 나태해질 때마다 꺼내보는 운동 자극 공간입니다.",
    mode: "table"
  },
  news: {
    title: "헬스보이짐 뉴스",
    desc: "헬스보이짐의 소식과 프로모션, 건강 정보를 가장 빠르게 전해드립니다.",
    mode: "official",
    categories: [
      ["all", "전체"],
      ["notice", "공지사항"],
      ["news", "센터소식"]
    ]
  }
};

function getMeta(){
  return boardMeta[currentBoard] || boardMeta.free;
}

function isAdmin(){
  return currentUserData && currentUserData.role === "admin";
}

function isAdminOnlyBoard(boardName = currentBoard){
  return adminOnlyBoards.has(boardName);
}

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
    return post.createdAt.toDate().toISOString().slice(0, 10).replace(/-/g, ". ");
  }

  return "-";
}

function getPostCategory(post){
  if(post.category) return post.category;

  if(post.board === "praise") return "praise";
  if(post.board === "review") return "pt";
  if(post.board === "infoboard") return "info";
  if(post.board === "news") return "news";
  if(post.isNotice || post.board === "noticeboard") return "notice";
  if(post.board === "free" && (post.isSecret || post.isPublic === false)) return "request";

  return "free";
}

function getPostCategoryLabel(post){
  const category = getPostCategory(post);

  if(category === "praise") return "칭찬합니다";
  if(category === "pt") return "PT후기";
  if(category === "trainer") return "이달의 트레이너";
  if(category === "news") return "센터소식";
  if(category === "info") return "인포게시판";
  if(category === "request") return "건의사항";
  if(category === "free") return "자유게시판";
  return "공지문";
}

function canWriteCurrentBoard(){
  if(isAdminOnlyBoard()) return isAdmin();
  if(officialBoards.has(currentBoard)) return isAdmin();
  return true;
}

function updateWriteButton(){
  if(!writeBtn) return;

  const official = officialBoards.has(currentBoard);
  const adminOnly = isAdminOnlyBoard();
  const canWrite = canWriteCurrentBoard();

  writeBtn.hidden = (official || adminOnly) && !canWrite;
  writeBtn.textContent = official ? "공지 작성" : "글쓰기";
}

function ensureCategoryBar(){
  if(!boardHeader) return null;

  if(!boardCategoryBar){
    boardCategoryBar = document.createElement("div");
    boardCategoryBar.id = "boardCategoryBar";
    boardCategoryBar.className = "board-category-bar";
    boardHeader.insertAdjacentElement("afterend", boardCategoryBar);
  }

  return boardCategoryBar;
}

function updateCategoryBar(){
  const meta = getMeta();
  const bar = ensureCategoryBar();

  if(!bar) return;

  if(!Array.isArray(meta.categories)){
    bar.hidden = true;
    bar.innerHTML = "";
    currentCategory = "all";
    return;
  }

  if(!meta.categories.some(([value])=>value === currentCategory)){
    currentCategory = meta.categories[0][0];
  }

  bar.hidden = false;
  bar.innerHTML = meta.categories
    .map(([value, label])=>`
      <button type="button" class="${currentCategory === value ? "active" : ""}" data-category="${value}">
        ${escapeHTML(label)}
      </button>
    `)
    .join("");
}

function updateBoardInfo(){
  const meta = getMeta();

  if(boardTitle){
    boardTitle.textContent = meta.title;
  }

  if(boardDesc){
    boardDesc.innerHTML = escapeHTML(meta.desc);
  }

  if(boardPage){
    boardPage.dataset.boardMode = meta.mode;
    boardPage.dataset.board = currentBoard;
  }

  document.body.dataset.boardMode = meta.mode;
  document.body.dataset.board = currentBoard;

  updateCategoryBar();
  updateWriteButton();
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

onAuthStateChanged(auth, async user=>{
  currentUser = user;
  currentUserData = await loadUserData(user);
  updateBoardInfo();
  if(!ensureBoardAccess()) return;
  loadPosts();
});

function ensureBoardAccess(){
  if(!isAdminOnlyBoard() || isAdmin()) return true;

  if(postList){
    postList.innerHTML = `<div class="board-empty">관리자만 볼 수 있는 게시판입니다.</div>`;
  }

  if(paginationContainer) paginationContainer.innerHTML = "";
  if(writeBtn) writeBtn.hidden = true;

  if(currentUser){
    alert("관리자만 볼 수 있는 게시판입니다.");
    location.href = "board.html";
  }else{
    alert("관리자 로그인 후 이용할 수 있습니다.");
    location.href = "login.html";
  }

  return false;
}

document.querySelectorAll(".board-tab").forEach(tab=>{
  if(tab.dataset.board === currentBoard){
    document.querySelectorAll(".board-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
  }

  tab.addEventListener("click", ()=>{
    currentBoard = tab.dataset.board;
    currentPage = 1;
    currentCategory = "all";
    history.replaceState(null, "", `board.html?board=${currentBoard}`);

    document.querySelectorAll(".board-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");

    updateBoardInfo();
    loadPosts();
  });
});

document.addEventListener("click", event=>{
  const categoryButton = event.target.closest("#boardCategoryBar button");

  if(!categoryButton) return;

  currentCategory = categoryButton.dataset.category || "all";
  currentPage = 1;
  updateCategoryBar();
  renderPage(currentPage);
});

if(boardSearch){
  boardSearch.addEventListener("input", ()=>{
    currentPage = 1;
    renderPage(currentPage);
  });
}

if(writeBtn){
  writeBtn.addEventListener("click", ()=>{
    if(isAdminOnlyBoard() && !isAdmin()){
      alert("관리자만 인포게시판에 글을 쓸 수 있습니다.");
      return;
    }

    if(officialBoards.has(currentBoard) && !isAdmin()){
      alert("관리자만 공지와 뉴스를 작성할 수 있습니다.");
      return;
    }

    if(!currentUser){
      alert("로그인한 회원만 글을 쓸 수 있습니다.");
      location.href = "login.html";
      return;
    }

    location.href = `editor.html?${getWriteQueryString()}`;
  });
}

updateBoardInfo();

function getWriteQueryString(){
  if(currentBoard === "infoboard"){
    return "board=infoboard&category=info";
  }

  if(currentBoard === "noticeboard"){
    if(currentCategory === "news"){
      return "board=news&category=news";
    }

    if(currentCategory === "trainer"){
      return "board=noticeboard&category=trainer";
    }

    return "board=noticeboard&category=notice";
  }

  if(currentCategory === "praise"){
    return "board=praise&category=praise";
  }

  if(currentCategory === "pt"){
    return "board=review&category=pt";
  }

  if(currentCategory === "request"){
    return "board=free&category=request";
  }

  return "board=free&category=free";
}

function getQueryBoards(){
  if(currentBoard === "free") return communityBoards;
  if(currentBoard === "noticeboard") return ["noticeboard", "news"];
  if(currentBoard === "infoboard") return ["infoboard"];
  return [currentBoard];
}

async function loadPosts(){
  if(!postList) return;

  postList.innerHTML = "";
  if(noticeList) noticeList.innerHTML = "";
  if(paginationContainer) paginationContainer.innerHTML = "";

  try{
    const boards = getQueryBoards();
    const q =
      boards.length > 1
        ? query(
            collection(db, "boards"),
            where("board", "in", boards),
            orderBy("createdAt", "desc")
          )
        : query(
            collection(db, "boards"),
            where("board", "==", boards[0]),
            orderBy("createdAt", "desc")
          );

    const snap = await getDocs(q);
    allPosts = [];

    snap.forEach(docSnap=>{
      allPosts.push({
        id: docSnap.id,
        data: docSnap.data()
      });
    });

    renderPage(currentPage);
  }catch(error){
    console.log(error);
    postList.innerHTML = `<div class="board-empty">게시글을 불러오지 못했습니다.</div>`;
  }
}

function getVisiblePosts(){
  const search = boardSearch ? boardSearch.value.trim().toLowerCase() : "";
  const meta = getMeta();

  return allPosts.filter(({ data })=>{
    const category = getPostCategory(data);
    const categoryMatches =
      currentCategory === "all" ||
      category === currentCategory ||
      (meta.mode === "official" && currentCategory === "notice" && data.isNotice);

    const searchMatches =
      !search ||
      String(data.title || "").toLowerCase().includes(search) ||
      String(data.content || "").toLowerCase().includes(search) ||
      String(data.writerId || "").toLowerCase().includes(search);

    return categoryMatches && searchMatches;
  });
}

function canOpenPost(post){
  if((post.board === "infoboard" || post.isAdminOnly) && !isAdmin()) return false;
  if(!post.isSecret) return true;
  if(isAdmin()) return true;
  return currentUser && currentUser.uid === post.writerUid;
}

function openPost(docId, post){
  if((post.board === "infoboard" || post.isAdminOnly) && !isAdmin()){
    alert("관리자만 볼 수 있는 게시글입니다.");
    return;
  }

  if(!canOpenPost(post)){
    alert("비밀글입니다. 작성자만 볼 수 있어요.");
    return;
  }

  location.href = `post.html?id=${docId}`;
}

function renderPage(page){
  if(!postList) return;

  postList.innerHTML = "";

  const meta = getMeta();
  const posts = getVisiblePosts();

  if(posts.length === 0){
    postList.innerHTML = `<div class="board-empty">등록된 글이 없습니다.</div>`;
    setupPagination(posts.length);
    return;
  }

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, posts.length);
  const pagePosts = posts.slice(startIndex, endIndex);

  if(meta.mode === "official"){
    renderOfficialPosts(pagePosts);
  }else if(meta.mode === "consult"){
    renderConsultPosts(pagePosts, startIndex);
  }else{
    renderTablePosts(pagePosts, startIndex, posts.length);
  }

  setupPagination(posts.length);
}

function renderOfficialPosts(posts){
  const list = document.createElement("div");
  list.className = "official-post-grid";

  posts.forEach(({ id, data })=>{
    const card = document.createElement("article");
    card.className = "official-post-card board-post";

    const label = getPostCategoryLabel(data);
    const title = escapeHTML(data.title);
    const date = formatDate(data);
    const thumb = data.thumbnailDataUrl;

    card.innerHTML = `
      <div class="official-post-thumb ${thumb ? "" : "no-thumb"}">
        ${thumb ? `<img src="${thumb}" alt="">` : `<span>${escapeHTML(label)}</span>`}
        <strong>${escapeHTML(label)}</strong>
      </div>
      <div class="official-post-body">
        <span class="official-post-kicker">${escapeHTML(label)}</span>
        <h2>${title}</h2>
        <time>${date}</time>
      </div>
    `;

    card.addEventListener("click", ()=>openPost(id, data));
    list.appendChild(card);
  });

  postList.appendChild(list);
}

function renderConsultPosts(posts){
  const list = document.createElement("div");
  list.className = "consult-post-list";

  posts.forEach(({ id, data })=>{
    const card = document.createElement("article");
    card.className = "consult-post-card board-post";

    const label = getPostCategoryLabel(data);
    const isRequest = getPostCategory(data) === "request" && currentCategory === "request";
    const status = data.answer || data.isAnswered ? "상담완료" : "상담대기";
    const locked = data.isPublic ? "" : "비밀글";

    if(isRequest){
      card.classList.add("has-status");
    }

    card.innerHTML = `
      <div class="consult-post-meta-top">${escapeHTML(label)}</div>
      <div class="consult-post-main">
        <h2>${escapeHTML(data.title)}</h2>
        ${isRequest ? `<span class="consult-status ${status === "상담완료" ? "done" : ""}">${status}</span>` : ""}
      </div>
      <div class="consult-post-meta-bottom">
        <span>${escapeHTML(data.writerId || "회원")}</span>
        <time>${formatDate(data)}</time>
        ${locked ? `<em>${locked}</em>` : ""}
      </div>
    `;

    card.addEventListener("click", ()=>openPost(id, data));
    list.appendChild(card);
  });

  postList.appendChild(list);
}

function renderTablePosts(posts, startIndex, totalCount){
  let no = totalCount - startIndex;

  posts.forEach(({ id, data })=>{
    const row = document.createElement("div");
    row.className = "board-row board-post";

    row.innerHTML = `
      <div>${data.isNotice ? "공지" : no}</div>
      <div class="board-title">${data.isPublic ? "" : "비밀"} ${escapeHTML(data.title)}</div>
      <div>${escapeHTML(data.writerId || "회원")}</div>
      <div>${formatDate(data)}</div>
      <div>${data.views || 0}</div>
    `;

    row.addEventListener("click", ()=>openPost(id, data));
    postList.appendChild(row);

    if(!data.isNotice){
      no--;
    }
  });
}

function setupPagination(totalCount){
  if(!paginationContainer) return;

  paginationContainer.innerHTML = "";

  const actualTotalPages = Math.ceil(totalCount / postsPerPage) || 1;
  const displayTotalPages = Math.max(actualTotalPages, 5);

  const makeButton = (label, className, disabled, onClick)=>{
    const button = document.createElement("button");
    button.innerHTML = label;
    if(className) button.className = className;
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    paginationContainer.appendChild(button);
  };

  makeButton("&lt;&lt;", "page-arrow", currentPage === 1, ()=>{
    currentPage = 1;
    renderPage(currentPage);
    window.scrollTo(0, 0);
  });

  makeButton("&lt;", "page-arrow", currentPage === 1, ()=>{
    currentPage = Math.max(1, currentPage - 1);
    renderPage(currentPage);
    window.scrollTo(0, 0);
  });

  for(let i = 1; i <= displayTotalPages; i++){
    const pageBtn = document.createElement("button");
    pageBtn.innerText = i;

    if(i > actualTotalPages){
      pageBtn.classList.add("dummy-page");
      pageBtn.disabled = true;
    }else if(i === currentPage){
      pageBtn.className = "active";
    }

    pageBtn.addEventListener("click", ()=>{
      if(i <= actualTotalPages){
        currentPage = i;
        renderPage(currentPage);
        window.scrollTo(0, 0);
      }
    });

    paginationContainer.appendChild(pageBtn);
  }

  makeButton("&gt;", "page-arrow", currentPage === actualTotalPages, ()=>{
    currentPage = Math.min(actualTotalPages, currentPage + 1);
    renderPage(currentPage);
    window.scrollTo(0, 0);
  });

  makeButton("&gt;&gt;", "page-arrow", currentPage === actualTotalPages, ()=>{
    currentPage = actualTotalPages;
    renderPage(currentPage);
    window.scrollTo(0, 0);
  });
}
