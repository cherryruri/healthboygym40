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

const postList = document.getElementById("postList");
const writeBtn = document.getElementById("writeBtn");

onAuthStateChanged(auth, (user)=>{
  currentUser = user;
  loadPosts();
});

/* ─────────────────────────────────────────────────────────
   [수정 및 추가 구간] 메뉴 탭 설정 및 클릭 시 타이틀 애니메이션 교체
   ───────────────────────────────────────────────────────── */
document.querySelectorAll(".board-tab").forEach(tab=>{
  if(tab.dataset.board === currentBoard){
    document.querySelectorAll(".board-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
  }

  tab.addEventListener("click", function(){
    currentBoard = tab.dataset.board;

    // 1. 모든 탭에서 active 클래스 제거 후 선택된 탭에만 부여
    document.querySelectorAll(".board-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");

    // 2. ✨ 우측 상단 제목 가져와서 글자 변경 + 페이드 효과 넣기
    const boardTitle = document.querySelector(".board-header h1");
    if (boardTitle) {
      boardTitle.classList.remove("fade-in-text");      // 애니메이션 클래스 초기화
      void boardTitle.offsetWidth;                      // 브라우저가 리셋을 인지하도록 유도
      boardTitle.textContent = tab.textContent.trim();  // 누른 메뉴의 이름을 타이틀에 대입
      boardTitle.classList.add("fade-in-text");         // 애니메이션 시작 클래스 부여
    }

    // 3. 변경된 게시판 데이터 리로드
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

  const q = query(
    collection(db, "boards"),
    where("board", "==", currentBoard),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if(snap.empty){
    postList.innerHTML = `
      <div class=\"board-row\">
        <div>-</div>
        <div class=\"board-title\">등록된 글이 없습니다.</div>
        <div>-</div>
        <div>-</div>
      </div>
    `;
    return;
  }

  let no = snap.size;

  snap.forEach(docSnap=>{
    const post = docSnap.data();

    const date = post.createdAt && post.createdAt.toDate
      ? post.createdAt.toDate().toISOString().slice(0,10)
      : "-";

    const row = document.createElement("div");
    row.className = "board-row board-post";

row.innerHTML = `
  <div>${post.isNotice ? "공지" : no}</div>
  <div class=\"board-title\">${post.isPublic ? "" : "🔒"} ${post.title}</div>
  <div>${post.writerId || "회원"}</div>
  <div>${date}</div>
  <div>${post.views || 0}</div>
`;

row.addEventListener("click", ()=>{

  const post = docSnap.data();

  const isWriter =
    currentUser &&
    currentUser.uid === post.writerUid;

  if(post.isSecret && !isWriter){
    alert("🔒 비밀글입니다. 작성자만 볼 수 있어요.");
    return;
  }

  location.href = `post.html?id=${docSnap.id}`;
});

    postList.appendChild(row);

    if(!post.isNotice){
      no--;
    }
  });
}