import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";



import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc
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
let currentPost = null;

const params = new URLSearchParams(location.search);
const postId = params.get("id");

const titleEl = document.getElementById("postTitle");
const writerEl = document.getElementById("postWriter");
const dateEl = document.getElementById("postDate");
const contentEl = document.getElementById("postContent");
const statusEl = document.getElementById("postStatus");

const actionsEl = document.getElementById("postActions");
const deleteBtn = document.getElementById("deletePostBtn");
const editBtn = document.getElementById("editPostBtn");

onAuthStateChanged(auth, async (user)=>{
  currentUser = user;
  await loadPost();
});

async function loadPost(){

  if(!postId) return;

  const snap = await getDoc(doc(db,"boards",postId));

  if(!snap.exists()){
    alert("삭제되었거나 존재하지 않는 글입니다.");
    location.href = "board.html";
    return;
  }

  currentPost = snap.data();

  titleEl.textContent = currentPost.title;
  writerEl.textContent = currentPost.writerId || "회원";

  if(currentPost.createdAt?.toDate){
    dateEl.textContent =
      currentPost.createdAt.toDate().toLocaleDateString("ko-KR");
  }

const isWriter =
  currentUser &&
  currentPost.writerUid === currentUser.uid;

if(currentPost.isSecret && !isWriter){
  contentEl.innerHTML = `
    <div class="secret-message">
      비공개 글입니다.<br>
      작성자만 내용을 확인할 수 있습니다.
    </div>
  `;
}else{
  contentEl.innerHTML = currentPost.content;
}

  statusEl.textContent =
    currentPost.isPublic ? "공개글" : "비밀글";

  if(
    currentUser &&
    currentPost.writerUid === currentUser.uid
  ){
    actionsEl.classList.add("show");
  }
}

deleteBtn.addEventListener("click", async ()=>{

  if(!confirm("정말 삭제하시겠습니까?")) return;

  await deleteDoc(doc(db,"boards",postId));

  alert("삭제되었습니다.");

  location.href = "board.html";
});

editBtn.addEventListener("click", ()=>{

  location.href =
    `editor.html?id=${postId}`;

});

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

const commentList = document.getElementById("commentList");
const commentText = document.getElementById("commentText");
const commentBtn = document.getElementById("commentBtn");

async function loadComments(){



  commentList.innerHTML = "";

  const q = query(
    collection(db, "boards", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  snap.forEach(doc=>{


    div.innerHTML = `
  <div class="comment-box">
    <div class="comment-left">
      <div class="avatar">${(c.writer || "U").charAt(0)}</div>
    </div>

    <div class="comment-right">
      <div class="comment-meta">
        <span class="writer">${c.writer}</span>
        <span class="time">${timeAgo(c.createdAt)}</span>
      </div>

      <div class="comment-text">
        ${c.text}
      </div>
    </div>
  </div>
`;
    const c = doc.data();

    const div = document.createElement("div");
    div.className = "comment";








    commentList.appendChild(div);
  });
}

commentBtn.addEventListener("click", async ()=>{

  if(!commentText.value.trim()) return;

  await addDoc(
    collection(db, "boards", postId, "comments"),
    {
      text: commentText.value,
      writer: currentUser?.email?.split("@")[0] || "익명",
      createdAt: serverTimestamp()
    }
  );

  commentText.value = "";
  loadComments();


});

loadComments();
commentList.addEventListener("click", async (e)=>{

  if(e.target.classList.contains("delete-comment-btn")){

    const id = e.target.dataset.id;

    await deleteDoc(doc(db,"boards",postId,"comments",id));

    loadComments();
  }

});

const timeAgo = (timestamp) => {
  const now = new Date();
  const time = timestamp?.toDate ? timestamp.toDate() : new Date();
  const diff = Math.floor((now - time) / 1000);

  if(diff < 60) return "방금 전";
  if(diff < 3600) return Math.floor(diff/60) + "분 전";
  if(diff < 86400) return Math.floor(diff/3600) + "시간 전";
  return Math.floor(diff/86400) + "일 전";
};