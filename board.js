import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
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
let currentBoard = "free";

const postList = document.getElementById("postList");
const writeBtn = document.getElementById("writeBtn");

onAuthStateChanged(auth, (user)=>{
  currentUser = user;
  loadPosts();
});

document.querySelectorAll(".board-tab").forEach(tab=>{
  tab.addEventListener("click", ()=>{
    document.querySelectorAll(".board-tab").forEach(t=>{
      t.classList.remove("active");
    });

    tab.classList.add("active");
    currentBoard = tab.dataset.board;

    loadPosts();
  });
});

if(writeBtn){
  writeBtn.addEventListener("click", async ()=>{

    if(!currentUser){
      alert("로그인한 회원만 글을 쓸 수 있습니다.");
      location.href = "login.html";
      return;
    }

    const title = prompt("제목을 입력해주세요.");
    if(!title) return;

    const content = prompt("내용을 입력해주세요.");
    if(!content) return;

    await addDoc(collection(db, "boards"), {
      board: currentBoard,
      title: title,
      content: content,
      writerId: currentUser.email.split("@")[0],
      writerUid: currentUser.uid,
      isSecret: true,
      isPublic: false,
      isNotice: false,
      createdAt: serverTimestamp()
    });

    alert("글이 등록되었습니다. 관리자 공개 전까지 비밀글입니다.");
    loadPosts();
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
      <div class="board-row">
        <div>-</div>
        <div class="board-title">등록된 글이 없습니다.</div>
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
      <div>${no}</div>
      <div class="board-title">🔒 ${post.title}</div>
      <div>${post.writerId || "회원"}</div>
      <div>${date}</div>
    `;

    row.addEventListener("click", ()=>{
      if(currentUser && currentUser.uid === post.writerUid){
        alert(`${post.title}\n\n${post.content}`);
      }else{
        alert("비밀글입니다. 관리자 공개 후 확인할 수 있습니다.");
      }
    });

    postList.appendChild(row);
    no--;
  });
}