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
const adminIds = new Set(["cherryruri"]);

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
const commentSection = document.querySelector(".comment-section");
const commentHeading = document.querySelector(".comment-section h3");
const commentInput = document.querySelector(".comment-input");
const postActions = document.getElementById("postActions");

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

function isAdminOnlyPost(post){
  return post && (post.board === "infoboard" || post.isAdminOnly);
}

function isRequestPost(post){
  if(!post) return false;
  if(post.category === "request") return true;
  return post.board === "free" && (post.isSecret || post.isPublic === false);
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

  if(data.isSecret && !isAdmin() && !isPostOwner(data)){
    if(currentUser){
      alert("비공개 문의입니다. 작성자만 볼 수 있어요.");
      location.href = "board.html";
    }else{
      alert("로그인 후 확인할 수 있는 비공개 문의입니다.");
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

  statusEl.textContent =
    isRequestPost(data)
      ? getRequestStatusText(data)
      : isAdminOnlyPost(data)
        ? "관리자 전용"
        : data.isPublic
          ? "공개글"
          : "비밀글";
  statusEl.classList.toggle("done", isRequestPost(data) && hasRequestAnswer(data));

  setupPostActions(data);
  setupCommentUi(data);
  markRequestAnswerRead(data);

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

  const comments = [];

  snap.forEach((docSnap) => {
    comments.push({
      id: docSnap.id,
      data: docSnap.data()
    });
  });

  const requestMode = isRequestPost(currentPost);
  const visibleComments = requestMode
    ? comments.filter(({ data })=>data.writerRole === "admin" || data.isAdminAnswer === true)
    : comments;

  if(requestMode && visibleComments.length === 0){
    commentList.innerHTML = `<div class="request-answer-empty">아직 답변이 등록되지 않았습니다.</div>`;
    return;
  }

  visibleComments.forEach(({ id, data:c }) => {

const isMine = currentUser?.email?.split("@")[0] === c.writer;
const isLiked = c.likedBy?.includes(currentUser?.email);
const canEditComment = requestMode ? isAdmin() && isMine : isMine;
const likeMarkup = requestMode ? "" : `
<button class="like-btn ${isLiked ? "liked" : ""}" data-id="${id}">
  ${isLiked ? "💛" : "🤍"} ${c.likes || 0}
</button>
`;
const actionsMarkup = canEditComment ? `
  <button class="edit-comment-btn" data-id="${id}">수정</button>
  <button class="delete-comment-btn" data-id="${id}">삭제</button>
` : "";

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

${likeMarkup}

</div>






          <div class="comment-text">
            ${c.text}
          </div>

${actionsMarkup}
  

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

  if(isRequestPost(currentPost) && !isAdmin()){
    alert("1:1 문의 답변은 관리자만 등록할 수 있습니다.");
    return;
  }

  const answerText = commentText.value.trim();

  await addDoc(
    collection(db, "boards", postId, "comments"),
    {
      text: answerText,
      writer: currentUser.email.split("@")[0],
      writerUid: currentUser.uid,
      writerRole: isAdmin() ? "admin" : "user",
      isAdminAnswer: isAdmin() && isRequestPost(currentPost),
      createdAt: serverTimestamp()
    }
  );

  if(isAdmin() && isRequestPost(currentPost)){
    await updateDoc(doc(db, "boards", postId), {
      isAnswered: true,
      answer: answerText,
      answerText,
      answeredAt: serverTimestamp(),
      answeredBy: currentUser.uid
    });

    currentPost = {
      ...currentPost,
      isAnswered: true,
      answer: answerText,
      answerText,
      answeredAt: new Date().toISOString(),
      answeredBy: currentUser.uid
    };

    if(statusEl){
      statusEl.textContent = getRequestStatusText(currentPost);
      statusEl.classList.add("done");
    }
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
    if(isRequestPost(currentPost)) return;

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
if(editBtn){
  editBtn.addEventListener("click", () => {
    if(!currentPost || (!isAdmin() && !isPostOwner(currentPost))) return;
    location.href = `editor.html?id=${postId}`;
  });
}

// 삭제
if(deleteBtn){
  deleteBtn.addEventListener("click", async () => {

    if(!currentPost || (!isAdmin() && !isPostOwner(currentPost))) return;
    if(!confirm("정말 삭제하시겠습니까?")) return;

    await deleteDoc(doc(db,"boards",postId));

    alert("삭제되었습니다.");
    location.href = isRequestPost(currentPost)
      ? "board.html?board=request&category=request"
      : `board.html?board=${currentPost?.board || "free"}`;
  });
}

function setupPostActions(post){
  if(!postActions) return;

  const canManage = isAdmin() || isPostOwner(post);
  postActions.hidden = !canManage;
  postActions.classList.toggle("show", canManage);
}

function setupCommentUi(post){
  const requestMode = isRequestPost(post);

  if(commentSection){
    commentSection.classList.toggle("request-answer-section", requestMode);
  }

  if(commentHeading){
    commentHeading.textContent = requestMode ? "관리자 답변" : "댓글";
  }

  if(commentInput){
    commentInput.hidden = requestMode && !isAdmin();
  }

  if(commentText){
    commentText.placeholder = requestMode ? "답변 내용을 입력해주세요." : "";
  }

  if(commentBtn){
    commentBtn.textContent = requestMode ? "답변달기" : "등록";
  }
}

function markRequestAnswerRead(post){
  if(!currentUser || isAdmin() || !isRequestPost(post) || !isPostOwner(post) || !hasRequestAnswer(post)) return;

  const answeredAt = getRequestAnswerMarker(post);
  localStorage.setItem(getRequestReadKey(postId), String(answeredAt));
}

function getRequestReadKey(id){
  return `healthboyRequestRead:${currentUser?.uid || "guest"}:${id}`;
}

function getRequestAnswerMarker(post){
  return (
    getTimestampMs(post.answeredAt) ||
    getTimestampMs(post.updatedAt) ||
    getTimestampMs(post.createdAt) ||
    1
  );
}

function getTimestampMs(value){
  if(!value) return 0;
  if(value.toDate) return value.toDate().getTime();
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}
