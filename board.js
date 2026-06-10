import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  collection,
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentBoard = new URLSearchParams(location.search).get("board") || "free";

// 페이징 관련 변수
let allPosts = [];       
let currentPage = 1;     
const postsPerPage = 20; // ⚡ 한 페이지에 게시글 20개씩 노출 고정!

const postList = document.getElementById("postList");
const paginationContainer = document.getElementById("pagination");
const writeBtn = document.getElementById("writeBtn");

onAuthStateChanged(auth, (user)=>{
  currentUser = user;
  loadPosts();
});

// 메뉴 탭 클릭 이벤트 설정
document.querySelectorAll(".board-tab").forEach(tab=>{
  if(tab.dataset.board === currentBoard){
    document.querySelectorAll(".board-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
  }

  tab.addEventListener("click", function(){
    currentBoard = tab.dataset.board;

    document.querySelectorAll(".board-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");

    const boardTitle = document.querySelector(".board-header h1");
    if (boardTitle) {
      boardTitle.classList.remove("fade-in-text");
      void boardTitle.offsetWidth;
      boardTitle.textContent = tab.textContent.trim();
      boardTitle.classList.add("fade-in-text");
    }

    currentPage = 1; 
    loadPosts();
  });
});

if(writeBtn){
  writeBtn.addEventListener("click", ()=>{
    if(!currentUser){
      alert("로그인한 회원만 글을 쓸 수 있습니다.");
      location.href = "login.html";
      return;
    }
    location.href = `editor.html?board=${currentBoard}`;
  });
}

async function loadPosts(){
  if(!postList) return;

  postList.innerHTML = "";
  if(paginationContainer) paginationContainer.innerHTML = "";

  const q = query(
    collection(db, "boards"),
    where("board", "==", currentBoard),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if(snap.empty){
    postList.innerHTML = `
      <div class="board-row">
        <div>-</div>
        <div class="board-title">등록된 글이 없습니다.</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
      </div>
    `;
    allPosts = [];
    setupPagination();
    return;
  }

  allPosts = [];
  snap.forEach(docSnap => {
    allPosts.push({
      id: docSnap.id,
      data: docSnap.data()
    });
  });

  renderPage(currentPage);
}

function renderPage(page) {
  if (!postList) return;
  postList.innerHTML = "";
  
  if (allPosts.length === 0) {
    setupPagination();
    return;
  }

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, allPosts.length);
  
  let no = allPosts.length - startIndex;

  for (let i = startIndex; i < endIndex; i++) {
    const docId = allPosts[i].id;
    const post = allPosts[i].data;

    const date = post.createdAt && post.createdAt.toDate
      ? post.createdAt.toDate().toISOString().slice(0,10)
      : "-";

    const row = document.createElement("div");
    row.className = "board-row board-post";

    row.innerHTML = `
      <div>${post.isNotice ? "공지" : no}</div>
      <div class="board-title">${post.isPublic ? "" : "🔒"} ${post.title}</div>
      <div>${post.writerId || "회원"}</div>
      <div>${date}</div>
      <div>${post.views || 0}</div>
    `;

    row.addEventListener("click", () => {
      const isWriter = currentUser && currentUser.uid === post.writerUid;
      if (post.isSecret && !isWriter) {
        alert("🔒 비밀글입니다. 작성자만 볼 수 있어요.");
        return;
      }
      location.href = `post.html?id=${docId}`;
    });

    postList.appendChild(row);

    if(!post.isNotice){
      no--;
    }
  }

  setupPagination();
}

function setupPagination() {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  const actualTotalPages = Math.ceil(allPosts.length / postsPerPage) || 1; 
  const displayTotalPages = Math.max(actualTotalPages, 5); 

  // 1. [<<]
  const firstBtn = document.createElement("button");
  firstBtn.innerHTML = "&lt;&lt;";
  firstBtn.className = "page-arrow";
  firstBtn.disabled = currentPage === 1;
  firstBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage = 1;
      renderPage(currentPage);
      window.scrollTo(0, 0);
    }
  });
  paginationContainer.appendChild(firstBtn);

  // 2. [<]
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&lt;";
  prevBtn.className = "page-arrow";
  prevBtn.disabled = currentPage === 1; 
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
      window.scrollTo(0, 0); 
    }
  });
  paginationContainer.appendChild(prevBtn);

  // 3. [1 2 3 4 5]
  for (let i = 1; i <= displayTotalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.innerText = i;
    
    if (i > actualTotalPages) {
      pageBtn.classList.add("dummy-page");
      pageBtn.disabled = true; 
    } else if (i === currentPage) {
      pageBtn.className = "active"; 
    }

    pageBtn.addEventListener("click", () => {
      if (i <= actualTotalPages) {
        currentPage = i;
        renderPage(currentPage);
        window.scrollTo(0, 0);
      }
    });
    paginationContainer.appendChild(pageBtn);
  }

  // 4. [>]
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&gt;";
  nextBtn.className = "page-arrow";
  nextBtn.disabled = currentPage === actualTotalPages; 
  nextBtn.addEventListener("click", () => {
    if (currentPage < actualTotalPages) {
      currentPage++;
      renderPage(currentPage);
      window.scrollTo(0, 0);
    }
  });
  paginationContainer.appendChild(nextBtn);

  // 5. [>>]
  const lastBtn = document.createElement("button");
  lastBtn.innerHTML = "&gt;&gt;";
  lastBtn.className = "page-arrow";
  lastBtn.disabled = currentPage === actualTotalPages;
  lastBtn.addEventListener("click", () => {
    if (currentPage < actualTotalPages) {
      currentPage = actualTotalPages;
      renderPage(currentPage);
      window.scrollTo(0, 0);
    }
  });
  paginationContainer.appendChild(lastBtn);
}