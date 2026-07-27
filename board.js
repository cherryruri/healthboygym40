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

const officialBoards = new Set(["noticeboard", "news"]);
const adminOnlyBoards = new Set(["infoboard"]);
const communityBoards = ["free", "praise", "review"];
const adminIds = new Set(["cherryruri"]);

let currentUser = null;
let currentUserData = null;
const boardParams = new URLSearchParams(location.search);
const initialBoard = boardParams.get("board") || "free";
const initialCategory = boardParams.get("category") || "";
const initialIsRequest = initialBoard === "request" || initialCategory === "request";
let currentBoard =
  initialIsRequest
    ? "request"
    : adminOnlyBoards.has(initialBoard)
    ? initialBoard
    : officialBoards.has(initialBoard)
      ? "noticeboard"
      : communityBoards.includes(initialBoard)
        ? "free"
        : initialBoard === "teen"
          ? initialBoard
        : "free";
let currentPage = 1;
let currentCategory =
  initialIsRequest
    ? "request"
    : initialCategory
    ? initialCategory
    : initialBoard === "praise"
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

const communityCategoryGroups = [
  {
    value: "all",
    label: "전체",
    categories: []
  },
  {
    value: "community",
    label: "자유게시판",
    categories: [
      ["praise", "칭찬합니다"],
      ["free", "자유게시판"],
      ["diet", "운동&식단 인증"]
    ]
  },
  {
    value: "review",
    label: "후기",
    categories: [
      ["pt", "PT후기"],
      ["before_after", "비포&애프터"],
      ["challenge", "바디챌린지후기"]
    ]
  }
];

const communityCategoryGroupMap = {
  praise: "community",
  free: "community",
  diet: "community",
  request: "community",
  pt: "review",
  before_after: "review",
  challenge: "review"
};

const boardMeta = {
  free: {
    title: "자유게시판",
    desc: "수내점 회원님들의 자유로운 이야기와 칭찬, PT 후기를 확인하는 공간입니다.",
    mode: "consult",
    categories: [
      ["all", "전체"],
      ["free", "자유게시판"],
      ["praise", "칭찬합니다"],
      ["diet", "운동&식단 인증"],
      ["pt", "PT후기"],
      ["before_after", "비포&애프터"],
      ["challenge", "바디챌린지후기"]
    ]
  },
  request: {
    title: "1:1 문의",
    desc: "문의 내용은 작성자와 관리자만 확인할 수 있는 비공개 공간입니다.",
    mode: "consult",
    categories: [
      ["request", "1:1 문의"]
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
    desc: "로그인한 관리자만 확인할 수 있는 내부 인포 게시판입니다.",
    mode: "consult",
    categories: [
      ["all", "전체"],
      ["info_fc", "FC"],
      ["info_pilates", "필라테스"],
      ["info_health", "헬스"],
      ["info_pt", "PT"]
    ]
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

function getCurrentUserId(){
  const email = currentUser?.email || "";
  return email.includes("@") ? email.split("@")[0].toLowerCase() : "";
}

function isAdmin(){
  const userId = getCurrentUserId();
  const dataId = String(currentUserData?.id || currentUserData?.userId || "").toLowerCase();

  return (
    currentUserData?.role === "admin" ||
    currentUserData?.isAdmin === true ||
    currentUserData?.admin === true ||
    currentUserData?.permission === "admin" ||
    adminIds.has(userId) ||
    adminIds.has(dataId)
  );
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
  if(post.board === "infoboard") return "info_fc";
  if(post.board === "news") return "news";
  if(post.isNotice || post.board === "noticeboard") return "notice";
  if(post.board === "free" && (post.isSecret || post.isPublic === false)) return "request";

  return "free";
}

function getPostCategoryLabel(post){
  const category = getPostCategory(post);

  if(category === "praise") return "칭찬합니다";
  if(category === "diet") return "운동&식단 인증";
  if(category === "pt") return "PT후기";
  if(category === "before_after") return "비포&애프터";
  if(category === "challenge") return "바디챌린지후기";
  if(category === "trainer") return "이달의 트레이너";
  if(category === "news") return "센터소식";
  if(category === "info") return "인포게시판";
  if(category === "info_fc") return "FC";
  if(category === "info_pilates") return "필라테스";
  if(category === "info_health") return "헬스";
  if(category === "info_pt") return "PT";
  if(category === "request") return "1:1 문의";
  if(category === "free") return "자유게시판";
  return "공지문";
}

function isRequestContext(){
  return currentBoard === "request" || currentCategory === "request";
}

function isPostOwner(post){
  if(!currentUser || !post) return false;

  const email = currentUser.email || "";
  const userId = email.includes("@") ? email.split("@")[0] : "";

  return (
    post.writerUid === currentUser.uid ||
    post.writerEmail === email ||
    post.email === email ||
    post.writerId === userId ||
    post.writer === userId
  );
}

function hasRequestAnswer(post){
  return !!(post && (post.isAnswered || post.answer || post.answerText || post.answeredAt));
}

function getRequestStatusText(post){
  return hasRequestAnswer(post) ? "답변이 완료되었습니다" : "답변대기중";
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
  writeBtn.textContent = currentBoard === "request" ? "문의 작성" : official ? "공지 작성" : "글쓰기";
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

  if(Array.isArray(meta.categoryGroups)){
    const knownCategories = new Set(
      meta.categoryGroups.flatMap(group=>group.categories.map(([value])=>value))
    );
    knownCategories.add("all");

    if(!knownCategories.has(currentCategory)){
      currentCategory = "all";
    }

    const activeGroup = getActiveCommunityGroup();
    const activeGroupMeta =
      meta.categoryGroups.find(group=>group.value === activeGroup) || meta.categoryGroups[0];
    const subCategories = activeGroupMeta.categories || [];

    bar.hidden = false;
    bar.classList.add("is-grouped");
    bar.innerHTML = `
      <div class="board-category-primary">
        ${meta.categoryGroups
          .map(group=>`
            <button type="button" class="${activeGroup === group.value ? "active" : ""}" data-category-group="${group.value}">
              ${escapeHTML(group.label)}
            </button>
          `)
          .join("")}
      </div>
      <div class="board-category-secondary" ${subCategories.length ? "" : "hidden"}>
        ${subCategories
          .map(([value, label])=>`
            <button type="button" class="${currentCategory === value ? "active" : ""}" data-category="${value}">
              ${escapeHTML(label)}
            </button>
          `)
          .join("")}
      </div>
    `;
    return;
  }

  if(!Array.isArray(meta.categories)){
    bar.hidden = true;
    bar.innerHTML = "";
    currentCategory = "all";
    bar.classList.remove("is-grouped");
    return;
  }

  if(!meta.categories.some(([value])=>value === currentCategory)){
    currentCategory = meta.categories[0][0];
  }

  bar.hidden = false;
  bar.classList.remove("is-grouped");
  bar.innerHTML = meta.categories
    .map(([value, label])=>`
      <button type="button" class="${currentCategory === value ? "active" : ""}" data-category="${value}">
        ${escapeHTML(label)}
      </button>
    `)
    .join("");
}

function getActiveCommunityGroup(){
  if(currentCategory === "all") return "all";
  return communityCategoryGroupMap[currentCategory] || "all";
}

function getFirstCategoryForGroup(groupValue){
  const meta = getMeta();
  const group =
    Array.isArray(meta.categoryGroups)
      ? meta.categoryGroups.find(item=>item.value === groupValue)
      : null;

  if(!group || !group.categories.length) return "all";
  return group.categories[0][0];
}

function updateBoardUrl(){
  if(currentBoard === "request"){
    history.replaceState(null, "", "board.html?board=request&category=request");
    return;
  }

  if(currentBoard === "free"){
    if(currentCategory === "all"){
      history.replaceState(null, "", "board.html");
      return;
    }

    const boardName = getBoardForCategory(currentCategory);
    history.replaceState(null, "", `board.html?board=${boardName}&category=${currentCategory}`);
    return;
  }

  if(currentBoard === "infoboard"){
    const categoryQuery = currentCategory === "all" ? "" : `&category=${currentCategory}`;
    history.replaceState(null, "", `board.html?board=infoboard${categoryQuery}`);
    return;
  }

  history.replaceState(null, "", `board.html?board=${currentBoard}`);
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
    postList.innerHTML = `<div class="board-empty">로그인한 관리자만 볼 수 있는 게시판입니다.</div>`;
  }

  if(paginationContainer) paginationContainer.innerHTML = "";
  if(writeBtn) writeBtn.hidden = true;

  if(currentUser){
    alert("관리자만 이용할 수 있는 게시판입니다.");
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
  const groupButton = event.target.closest("#boardCategoryBar [data-category-group]");
  const categoryButton = event.target.closest("#boardCategoryBar button");

  if(groupButton){
    currentCategory = getFirstCategoryForGroup(groupButton.dataset.categoryGroup);
    currentPage = 1;
    updateBoardUrl();
    updateCategoryBar();
    renderPage(currentPage);
    return;
  }

  if(!categoryButton || !categoryButton.dataset.category) return;

  currentCategory = categoryButton.dataset.category || "all";
  currentPage = 1;
  updateBoardUrl();
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
    const category = currentCategory === "all" ? "info_fc" : currentCategory;
    return `board=infoboard&category=${category}`;
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

  if(currentBoard === "request" || currentCategory === "request"){
    return "board=free&category=request";
  }

  if(currentCategory === "praise"){
    return "board=praise&category=praise";
  }

  if(currentCategory === "diet"){
    return "board=free&category=diet";
  }

  if(currentCategory === "pt"){
    return "board=review&category=pt";
  }

  if(currentCategory === "before_after"){
    return "board=review&category=before_after";
  }

  if(currentCategory === "challenge"){
    return "board=review&category=challenge";
  }

  return "board=free&category=free";
}

function getBoardForCategory(category){
  if(category === "request") return "request";
  if(category === "praise") return "praise";
  if(category === "pt" || category === "before_after" || category === "challenge") return "review";
  return "free";
}

function getQueryBoards(){
  if(currentBoard === "request") return ["free"];
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
    const snapshots = await Promise.all(
      boards.map(boardName=>getDocs(
        query(collection(db, "boards"), where("board", "==", boardName))
      ))
    );
    allPosts = [];

    snapshots.forEach(snap=>{
      snap.forEach(docSnap=>{
        allPosts.push({
          id: docSnap.id,
          data: docSnap.data()
        });
      });
    });

    allPosts.sort((a, b)=>{
      const aTime = a.data.createdAt?.toMillis?.() || 0;
      const bTime = b.data.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
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
    const isRequest = category === "request";

    if(isRequest){
      if(!isRequestContext()) return false;
      if(!isAdmin() && !isPostOwner(data)) return false;
    }else if(currentBoard === "request"){
      return false;
    }

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
  return isPostOwner(post);
}

function openPost(docId, post){
  if((post.board === "infoboard" || post.isAdminOnly) && !isAdmin()){
    alert("관리자만 볼 수 있는 게시글입니다.");
    return;
  }

  if(!canOpenPost(post)){
    alert("비공개 문의입니다. 작성자만 볼 수 있어요.");
    return;
  }

  location.href = `post.html?id=${docId}`;
}

function renderPage(page){
  if(!postList) return;

  postList.innerHTML = "";

  const meta = getMeta();
  const posts = getVisiblePosts().sort((a, b)=>{
    return Number(Boolean(b.data.isNotice)) - Number(Boolean(a.data.isNotice));
  });

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
    if(data.isNotice) card.classList.add("is-notice");

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
        <h2>${data.isNotice ? '<span class="notice-title-prefix">(공지)</span> ' : ""}${title}</h2>
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
    if(data.isNotice) card.classList.add("is-notice");

    const label = getPostCategoryLabel(data);
    const isRequest = getPostCategory(data) === "request" && isRequestContext();
    const status = getRequestStatusText(data);
    const locked = isRequest ? "비공개" : data.isPublic ? "" : "비밀글";

    if(isRequest){
      card.classList.add("has-status");
    }

    card.innerHTML = `
      <div class="consult-post-meta-top">${escapeHTML(label)}</div>
      <div class="consult-post-main">
        <h2>${data.isNotice ? '<span class="notice-title-prefix">(공지)</span> ' : ""}${escapeHTML(data.title)}</h2>
        ${isRequest ? `<span class="consult-status ${hasRequestAnswer(data) ? "done" : ""}">${status}</span>` : ""}
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
    if(data.isNotice) row.classList.add("is-notice");

    row.innerHTML = `
      <div>${data.isNotice ? "공지" : no}</div>
      <div class="board-title">${data.isPublic ? "" : "비밀"} ${data.isNotice ? '<span class="notice-title-prefix">(공지)</span> ' : ""}${escapeHTML(data.title)}</div>
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
