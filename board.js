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

// 🌟 페이징 관련 변수 추가
let allPosts = [];       // 불러온 전체 게시글을 저장할 배열
let currentPage = 1;     // 현재 가리키고 있는 페이지 번호
const postsPerPage = 20; // ⚡ 한 페이지에 보여줄 게시글 수 (20개 고정)

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

    currentPage = 1; // ⚡ 게시판을 바꿀 때는 1페이지부터 보여주기
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

// 🌟 데이터베이스에서 게시글을 긁어오는 핵심 함수
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
    return;
  }

  // 1. 전체 게시글 데이터를 배열에 먼저 파싱해서 담아둡니다.
  allPosts = [];
  snap.forEach(docSnap => {
    allPosts.push({
      id: docSnap.id,
      data: docSnap.data()
    });
  });

  // 2. 쪼개진 해당 페이지의 게시글을 렌더링하는 함수 호출
  renderPage(currentPage);
}

// 🌟 20개씩 쪼개서 화면에 표출하고 하단 버튼을 그리는 함수
function renderPage(page) {
  postList.innerHTML = "";
  
  // 시작 인덱스와 끝 인덱스 계산 (예: 1페이지는 0번째부터 19번째글까지)
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, allPosts.length);
  
  // 전체 No 번호 계산 (최신 글이 가장 큰 번호를 가짐)
  let no = allPosts.length - startIndex;

  // 3. 20개 구간에 해당되는 데이터만 꺼내서 한 줄씩 화면에 생성
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

  // 4. 하단 페이지 네이션 버튼 생성 호출
  setupPagination();
}

// 🌟 하단에 < 1 2 3 > 버튼을 동적으로 그려주는 함수
function setupPagination() {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  if (totalPages <= 1) return; // 20개가 안 되어서 1페이지만 존재하면 번호판을 숨김

  // [이전 페이지 < ] 버튼 생성
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&lt;";
  prevBtn.disabled = currentPage === 1; // 1페이지면 비활성화
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
      window.scrollTo(0, 0); // 페이지 이동 시 스크롤 상단으로 이동
    }
  });
  paginationContainer.appendChild(prevBtn);

  // [숫자 1, 2, 3...] 버튼 생성
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.innerText = i;
    if (i === currentPage) {
      pageBtn.className = "active"; // 현재 보고 있는 페이지면 강조 표시
    }

    pageBtn.addEventListener("click", () => {
      currentPage = i;
      renderPage(currentPage);
      window.scrollTo(0, 0);
    });
    paginationContainer.appendChild(pageBtn);
  }

  // [다음 페이지 > ] 버튼 생성
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&gt;";
  nextBtn.disabled = currentPage === totalPages; // 마지막 페이지면 비활성화
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
      window.scrollTo(0, 0);
    }
  });
  paginationContainer.appendChild(nextBtn);
}