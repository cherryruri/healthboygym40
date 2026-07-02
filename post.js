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
  doc,
  getDoc,
  deleteDoc,
  updateDoc, 
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  setDoc
  
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= STATE ================= */

let currentUser = null;
let currentUserData = null;
let currentPost = null;

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
  currentUserData = await loadUserData(user);
  const loaded = await loadPost();
  if(loaded) loadComments();
});

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

function isAdmin(){
  return currentUserData && currentUserData.role === "admin";
}

function isAdminOnlyPost(post){
  return post && (post.board === "infoboard" || post.isAdminOnly);
}

function isRequestPost(post){
  if(!post) return false;
  if(post.category === "request") return true;
  return post.board === "free" && (post.isSecret || post.isPublic === false);
}

async function loadPost() {

  if(!postId){
    alert("게시글 ID가 없습니다.");
    location.href = "board.html";
    return false;
  }

  const snap = await getDoc(doc(db, "boards", postId));

  if (!snap.exists()) {
    alert("없는 글입니다");
    location.href = "board.html";
    return false;
  }

  const data = snap.data();

  if(isAdminOnlyPost(data) && !isAdmin()){
    if(currentUser){
      alert("관리자만 볼 수 있는 게시글입니다.");
      location.href = "board.html";
    }else{
      alert("관리자 로그인 후 이용할 수 있습니다.");
      location.href = "login.html";
    }

    return false;
  }

  currentPost = data;

  titleEl.textContent = data.title;
  writerEl.textContent = data.writerId || "회원";
  contentEl.innerHTML = data.content;

  if (data.createdAt?.toDate) {
    dateEl.textContent = data.createdAt.toDate().toLocaleDateString("ko-KR");
  }

  statusEl.textContent = isAdminOnlyPost(data) ? "관리자 전용" : data.isPublic ? "공개글" : "비밀글";

  return true;
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

const isMine = currentUser?.email?.split("@")[0] === c.writer;
const isLiked = c.likedBy?.includes(currentUser?.email);

const div = document.createElement("div");
div.className = "comment";

div.innerHTML = `

      <div class="comment-box">

        <div class="comment-left">
          <div class="avatar">
            ${(c.writer || "U").charAt(0).toUpperCase()}
          </div>
        </div>

        <div class="comment-right">


<div class="comment-meta">

  <span class="writer">${c.writer}</span>
  <span class="time">${timeAgo(c.createdAt)}</span>


<button class="like-btn ${isLiked ? "liked" : ""}" data-id="${docSnap.id}">
  ${isLiked ? "💛" : "🤍"} ${c.likes || 0}
</button>

</div>






          <div class="comment-text">
            ${c.text}
          </div>

${isMine ? `
  <button class="edit-comment-btn" data-id="${docSnap.id}">수정</button>
  <button class="delete-comment-btn" data-id="${docSnap.id}">삭제</button>
` : ""}
  

        </div>

      </div>
    `;

    commentList.appendChild(div);
  });
}

/* ================= ADD COMMENT ================= */
commentBtn.addEventListener("click", async ()=>{

  if(!currentUser){
    alert("로그인 필요");
    return;
  }

  if(!postId){
    alert("게시글 ID 없음");
    return;
  }

  if(!commentText.value.trim()) return;

  await addDoc(
    collection(db, "boards", postId, "comments"),
    {
      text: commentText.value,
      writer: currentUser.email.split("@")[0],
      writerUid: currentUser.uid,
      writerRole: isAdmin() ? "admin" : "user",
      createdAt: serverTimestamp()
    }
  );

  if(isAdmin() && isRequestPost(currentPost)){
    await updateDoc(doc(db, "boards", postId), {
      isAnswered: true,
      answeredAt: serverTimestamp(),
      answeredBy: currentUser.uid
    });
  }

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





/* ================= EDIT COMMENT ================= */

commentList.addEventListener("click", async (e)=>{

  if(e.target.classList.contains("edit-comment-btn")){

    const comment = e.target.closest(".comment");
    const textEl = comment.querySelector(".comment-text");
    const oldText = textEl.textContent.trim();
    const id = e.target.dataset.id;

    textEl.innerHTML = `
      <textarea class="comment-edit-input">${oldText}</textarea>

      <div class="comment-edit-actions">
        <button class="save-comment-btn" data-id="${id}">저장</button>
        <button class="cancel-comment-btn">취소</button>
      </div>
    `;

    return;
  }

  if(e.target.classList.contains("save-comment-btn")){

    const id = e.target.dataset.id;
    const comment = e.target.closest(".comment");
    const textarea = comment.querySelector(".comment-edit-input");
    const newText = textarea.value.trim();

    if(!newText){
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    await updateDoc(doc(db, "boards", postId, "comments", id), {
      text: newText
    });

    loadComments();
    return;
  }

  if(e.target.classList.contains("cancel-comment-btn")){
    loadComments();
    return;
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

const data = snap.data();

const userId = currentUser?.email;

let likedBy = data.likedBy || [];



if(likedBy.includes(userId)){
  likedBy = likedBy.filter(email => email !== userId);
}else{
  likedBy.push(userId);
}

await updateDoc(ref,{
  likes: likedBy.length,
  likedBy: likedBy
});







    loadComments();
  }

});

const likeBtn = document.getElementById("likeBtn");

if(likeBtn){

  let liked = false;

  async function loadLikeStatus() {
    if (!currentUser || !postId) return;

    const likeSnap = await getDoc(doc(db, "boards", postId, "likes", currentUser.uid));
    liked = likeSnap.exists();
    likeBtn.classList.toggle("liked", liked);
  }

  likeBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("로그인 후 좋아요 가능합니다.");
      return;
    }

    const likeRef = doc(db, "boards", postId, "likes", currentUser.uid);

    if (liked) {
      await deleteDoc(likeRef);
      liked = false;
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      liked = true;
    }

    likeBtn.classList.toggle("liked", liked);
  });

  loadLikeStatus();
}

const editBtn = document.getElementById("editPostBtn");
const deleteBtn = document.getElementById("deletePostBtn");

// 수정
editBtn.addEventListener("click", () => {
  location.href = `editor.html?id=${postId}`;
});

// 삭제
deleteBtn.addEventListener("click", async () => {

  if(!confirm("정말 삭제하시겠습니까?")) return;

  await deleteDoc(doc(db,"boards",postId));

  alert("삭제되었습니다.");
  location.href = `board.html?board=${currentPost?.board || "free"}`;
});
