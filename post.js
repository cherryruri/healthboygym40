import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
  
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

/* ================= FIREBASE ================= */

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

/* ================= STATE ================= */

let currentUser = null;

const postId = new URLSearchParams(location.search).get("id");

const titleEl = document.getElementById("postTitle");
const writerEl = document.getElementById("postWriter");
const dateEl = document.getElementById("postDate");
const contentEl = document.getElementById("postContent");
const statusEl = document.getElementById("postStatus");

const commentList = document.getElementById("commentList");
const commentText = document.getElementById("commentText");
const commentBtn = document.getElementById("commentBtn");

/* ================= LOAD POST ================= */

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  loadPost();
  loadComments();
});

async function loadPost() {

  const snap = await getDoc(doc(db, "boards", postId));

  if (!snap.exists()) {
    alert("없는 글입니다");
    location.href = "board.html";
    return;
  }

  const data = snap.data();

  titleEl.textContent = data.title;
  writerEl.textContent = data.writerId || "회원";
  contentEl.innerHTML = data.content;

  if (data.createdAt?.toDate) {
    dateEl.textContent = data.createdAt.toDate().toLocaleDateString("ko-KR");
  }

  statusEl.textContent = data.isPublic ? "공개글" : "비밀글";
}

/* ================= COMMENTS ================= */

async function loadComments() {

  commentList.innerHTML = "";

  const q = query(
    collection(db, "boards", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  snap.forEach((docSnap) => {

    const c = docSnap.data();

    const div = document.createElement("div");
    div.className = "comment";

    const isMine =
      currentUser?.email?.split("@")[0] === c.writer;

    div.innerHTML = `



      <div class="comment-box">

        <div class="comment-left">
          <div class="avatar">
            ${(c.writer || "U").charAt(0).toUpperCase()}
          </div>
        </div>

        <div class="comment-right">

          <div class="comment-meta">
          <button class="like-btn" data-id="${docSnap.id}">
  ❤️ ${c.likes || 0}
</button>
            <span class="writer">${c.writer}</span>
            <span class="time">${timeAgo(c.createdAt)}</span>
          </div>

          <div class="comment-text">
            ${c.text}
          </div>

          ${isMine ? `
            <button class="delete-comment-btn" data-id="${docSnap.id}">
              삭제
            </button>
          ` : ""}

        </div>

      </div>
    `;

    commentList.appendChild(div);
  });
}

/* ================= ADD COMMENT ================= */

commentBtn.addEventListener("click", async () => {

  if (!commentText.value.trim()) return;

  await addDoc(
  collection(db, "boards", postId, "comments"),
  {
    text: commentText.value,
    writer: currentUser?.email?.split("@")[0] || "익명",
    createdAt: serverTimestamp(),
    likes: 0   // ⭐ 이거 한 줄 추가
  }
);

  commentText.value = "";
  loadComments();
});

/* ================= DELETE COMMENT ================= */

commentList.addEventListener("click", async (e) => {

  if (e.target.classList.contains("delete-comment-btn")) {

    const id = e.target.dataset.id;

    await deleteDoc(doc(db, "boards", postId, "comments", id));

    loadComments();
  }
});

/* ================= TIME ================= */

function timeAgo(timestamp) {

  if (!timestamp) return "";

  const now = new Date();
  const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 3600) return Math.floor(diff / 60) + "분 전";
  if (diff < 86400) return Math.floor(diff / 3600) + "시간 전";

  return Math.floor(diff / 86400) + "일 전";
}

commentList.addEventListener("click", async (e)=>{

  if(e.target.classList.contains("like-btn")){

    const id = e.target.dataset.id;

    const ref = doc(db,"boards",postId,"comments",id);
    const snap = await getDoc(ref);

    await updateDoc(ref,{
      likes: (snap.data().likes || 0) + 1
    });

    loadComments();
  }

});