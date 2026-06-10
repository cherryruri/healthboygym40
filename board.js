각 메뉴의 성격에 딱 맞춰서 회원들이 글을 쓰고 싶게 만드는 세련되고 친절한 안내 멘트를 새로 짜왔습니다!

이 기능을 구현하려면 board.js에서 메뉴 탭을 클릭할 때 상단 타이틀 글자뿐만 아니라 그 밑에 있는 설명문(서브타이틀)도 동적으로 같이 바뀌도록 코드를 업그레이드해야 합니다.

가장 먼저 board.html에서 설명글이 들어있는 태그에 이름표(ID)를 하나 달아준 뒤, board.js 전체 코드를 업데이트해 줄게요!

1. 🛠️ board.html 딱 한 줄만 수정하기 (이름표 달기)
board.html 파일에서 수내점 건의 사항 제목 바로 밑에 있는설명 글 태그(<p>)를 찾아서 id="boardDesc"를 아래와 같이 추가해 주세요. (약 80~90번째 줄 근처에 있습니다.)

[기존 코드]

HTML
<p>헬스보이짐 수내점을 이용 중인 회원분들의 자유로운 건의 사항 게시판입니다...</p>
👇 [이렇게 id="boardDesc"를 추가해서 변경]

HTML
<p id="boardDesc">헬스보이짐 수내점을 이용 중인 회원분들의 자유로운 건의 사항 게시판입니다.</p>
2. 🤖 board.js 전체 코드 복사 붙여넣기 (메뉴별 멘트 자동 변경 로직 탑재)
이제 메뉴를 누를 때마다 멘트가 마법처럼 슥슥 바뀌도록 구현한 board.js 전체 코드입니다. 기존 내용을 싹 다 지우고 그대로 전체 복붙해 주세요!

JavaScript
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

// 🌟 각 메뉴별 맞춤형 세련된 안내 멘트 정의
const boardDescriptions = {
  "free": "헬스보이짐 수내점을 이용 중인 회원분들의 자유로운 건의 사항 게시판입니다. 기본적으로 비밀글로 표시 되어 있으며 빠른 시일 내에 답변드리도록 하겠습니다.",
  "compliment": "트레이너와 직원들을 칭찬하고 따뜻한 격려를 나누는 공간입니다. 회원님의 한마디가 저희 팀에게 가장 큰 보람과 에너지가 됩니다.",
  "notice": "헬스보이짐 수내점의 새로운 소식과 정기 휴무, 센터 운영에 관한 공식 공지사항을 안내해 드리는 공간입니다.",
  "review": "회원님들이 직접 경험하고 작성해주신 100% 리얼 운동 후기입니다. 변화된 모습과 생생한 스토리를 만나보세요!",
  "motivation": "지치고 나태해질 때마다 꺼내보는 운동 자극 공간입니다. 매일 업데이트되는 동기부여 영상과 글로 득근 본능을 깨워보세요.",
  "news": "헬스보이짐 전체 지점의 핫한 소식과 프로모션, 헬스 트렌드 및 유용한 건강 정보를 가장 빠르게 전해드립니다."
};

// 페이징 관련 변수
let allPosts = [];       
let currentPage = 1;     
const postsPerPage = 20; // 한 페이지에 게시글 20개씩 노출 고정

const postList = document.getElementById("postList");
const paginationContainer = document.getElementById("pagination");
const writeBtn = document.getElementById("writeBtn");
const boardDesc = document.getElementById("boardDesc"); // 🌟 설명문 태그 가져오기

onAuthStateChanged(auth, (user)=>{
  currentUser = user;
  loadPosts();
  updateBoardInfo(); // 🌟 첫 진입 시 초기 메뉴 멘트 세팅
});

// 메뉴 탭 클릭 이벤트 설정 및 멘트 변경 로직
document.querySelectorAll(".board-tab").forEach(tab=>{
  if(tab.dataset.board === currentBoard){
    document.querySelectorAll(".board-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
  }

  tab.addEventListener("click", function(){
    currentBoard = tab.dataset.board;

    document.querySelectorAll(".board-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");

    // 타이틀 변경 애니메이션 효과 및 글자 변경
    const boardTitle = document.querySelector(".board-header h1");
    if (boardTitle) {
      boardTitle.classList.remove("fade-in-text");
      void boardTitle.offsetWidth;
      boardTitle.textContent = tab.textContent.trim();
      boardTitle.classList.add("fade-in-text");
    }

    // 🌟 탭 클릭 시 매칭되는 안내 멘트로 실시간 전환
    updateBoardInfo();

    currentPage = 1; 
    loadPosts();
  });
});

// 🌟 현재 선택된 게시판에 맞춰 안내문을 교체해 주는 함수
function updateBoardInfo() {
  if (boardDesc) {
    boardDesc.textContent = boardDescriptions[currentBoard] || "헬스보이짐 수내점 커뮤니티입니다.";
  }
}

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

  // 3. [숫자들]
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