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
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc
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
const adminIds = new Set(["cherryruri"]);

let currentUser = null;
let currentUserData = null;
let thumbnailDataUrl = "";
let loadedBoard = null;

const titleInput = document.getElementById("postTitle");
const contentBox = document.getElementById("postContent");
const submitBtn = document.getElementById("submitPost");
const editorBoardName = document.getElementById("editorBoardName");
const thumbnailField = document.getElementById("editorThumbnailField");
const thumbnailInput = document.getElementById("postThumbnail");
const thumbnailLabel = document.getElementById("thumbnailLabel");
const categoryField = document.getElementById("editorCategoryField");
const postCategory = document.getElementById("postCategory");
const cancelBtn = document.querySelector(".cancel-btn");
const thumbnailPreview = document.getElementById("thumbnailPreview");
const removeThumbnail = document.getElementById("removeThumbnail");

const params = new URLSearchParams(location.search);
const board = params.get("board") || "free";
const categoryParam = params.get("category") || "";
const editId = params.get("id");
if(postCategory && ["info_fc", "info_pilates", "info_health", "info_pt"].includes(categoryParam)){
  postCategory.value = categoryParam;
}



const boardNames = {
  free: "자유게시판",
  praise: "칭찬합니다",
  request: "1:1 문의",
  noticeboard: "공지문 / 뉴스",
  infoboard: "인포게시판",
  review: "PT후기",
  teen: "동기부여 모음",
  news: "헬스보이짐 뉴스"
};

const categoryNames = {
  free: "자유게시판",
  praise: "칭찬합니다",
  diet: "운동&식단 인증",
  pt: "PT후기",
  before_after: "비포&애프터",
  challenge: "바디챌린지후기",
  request: "1:1 문의",
  info: "인포게시판",
  notice: "공지문",
  info_fc: "FC",
  info_pilates: "필라테스",
  info_health: "헬스",
  info_pt: "PT",
  news: "센터소식",
  trainer: "이달의 트레이너"
};

function isAdmin(){
  const email = currentUser?.email || "";
  const userId = email.includes("@") ? email.split("@")[0].toLowerCase() : "";
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

function getEffectiveBoard(){
  return loadedBoard || board;
}

function getEffectiveCategory(effectiveBoard){
  if(effectiveBoard === "infoboard"){
    const allowedCategories = new Set(["info_fc", "info_pilates", "info_health", "info_pt"]);
    const selectedCategory = postCategory?.value || categoryParam;
    return allowedCategories.has(selectedCategory) ? selectedCategory : "info_fc";
  }

  if(categoryParam) return categoryParam;

  if(effectiveBoard === "praise") return "praise";
  if(effectiveBoard === "review") return "pt";
  if(effectiveBoard === "news") return "news";
  if(officialBoards.has(effectiveBoard)) return "notice";
  return "free";
}

function getLegacyCategory(category){
  if(category === "diet") return "free";
  if(category === "before_after" || category === "challenge") return "pt";
  return category;
}

function getLegacyBoard(boardName, category){
  if(category === "praise") return "praise";
  if(category === "pt" || category === "before_after" || category === "challenge") return "review";
  return boardName;
}

function updateEditorHeader(){
  const effectiveBoard = getEffectiveBoard();

  if(editorBoardName){
    const category = getEffectiveCategory(effectiveBoard);
    editorBoardName.textContent =
      categoryNames[category] || boardNames[effectiveBoard] || "수내점 게시판";
  }

  if(thumbnailField){
    thumbnailField.hidden = !officialBoards.has(effectiveBoard);
  }

  if(categoryField){
    categoryField.hidden = effectiveBoard !== "infoboard";
  }

  if(cancelBtn){
    const category = getEffectiveCategory(effectiveBoard);
    cancelBtn.href = effectiveBoard === "infoboard"
      ? `board.html?board=infoboard&category=${category}`
      : "board.html";
  }
}

function ensureOfficialPermission(){
  const effectiveBoard = getEffectiveBoard();

  if(effectiveBoard === "infoboard" && !isAdmin()){
    alert("인포게시판은 관리자만 작성할 수 있습니다.");
    location.href = "board.html";
    return false;
  }

  if(officialBoards.has(effectiveBoard) && !isAdmin()){
    alert("공지와 뉴스는 관리자만 작성할 수 있습니다.");
    location.href = `board.html?board=${effectiveBoard}`;
    return false;
  }

  return true;
}

function setThumbnailPreview(dataUrl){
  thumbnailDataUrl = dataUrl || "";

  if(thumbnailPreview){
    thumbnailPreview.hidden = !thumbnailDataUrl;
    thumbnailPreview.style.backgroundImage = thumbnailDataUrl ? `url("${thumbnailDataUrl}")` : "";
  }

  if(removeThumbnail){
    removeThumbnail.hidden = !thumbnailDataUrl;
  }

  if(thumbnailLabel){
    thumbnailLabel.textContent = thumbnailDataUrl ? "이미지 변경" : "이미지 선택";
  }
}

function readImageAsDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();

    reader.onload = ()=>{
      const image = new Image();

      image.onload = ()=>{
        const maxWidth = 960;
        const maxHeight = 720;
        const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

onAuthStateChanged(auth, async user=>{
  if(!user){
    alert("로그인한 회원만 글을 쓸 수 있습니다.");
    location.href = "login.html";
    return;
  }

  currentUser = user;
  currentUserData = await loadUserData(user);
  updateEditorHeader();

  if(editId){
    await loadPostForEdit();
  }

  ensureOfficialPermission();
});

document.querySelectorAll(".editor-toolbar button[data-command]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.execCommand(btn.dataset.command, false, null);
    contentBox.focus();
  });
});

const fontSizeSelect = document.getElementById("fontSizeSelect");
const textColor = document.getElementById("textColor");
const backColor = document.getElementById("backColor");
const textColorBtn = document.getElementById("textColorBtn");
const backColorBtn = document.getElementById("backColorBtn");
const dividerSelect = document.getElementById("dividerSelect");

if(thumbnailInput){
  thumbnailInput.addEventListener("change", async ()=>{
    const file = thumbnailInput.files && thumbnailInput.files[0];
    if(!file) return;

    try{
      setThumbnailPreview(await readImageAsDataUrl(file));
    }catch(error){
      console.log(error);
      alert("썸네일 이미지를 불러오지 못했습니다.");
    }finally{
      thumbnailInput.value = "";
    }
  });
}

if(removeThumbnail){
  removeThumbnail.addEventListener("click", ()=>{
    setThumbnailPreview("");
  });
}

submitBtn.addEventListener("click", async ()=>{
  const effectiveBoard = getEffectiveBoard();
  const category = getEffectiveCategory(effectiveBoard);

  if(!ensureOfficialPermission()) return;

  if(!currentUser){
    alert("로그인한 회원만 글을 쓸 수 있습니다.");
    location.href = "login.html";
    return;
  }

  const title = titleInput.value.trim();
  const content = contentBox.innerHTML.trim();
  const isOfficial = officialBoards.has(effectiveBoard);

  if(!title){
    alert("제목을 입력해주세요.");
    return;
  }

  if(!content){
    alert("내용을 입력해주세요.");
    return;
  }

  const payload = {
    board: effectiveBoard,
    title,
    content,
    category,
    isSecret: category === "request",
    isPublic: category !== "request",
    ...(isOfficial ? { thumbnailDataUrl, isNotice: true } : {})
  };

  submitBtn.disabled = true;

  try{
    if(editId){
      await updateDoc(doc(db, "boards", editId), payload);
      alert("수정되었습니다.");
      location.href = `post.html?id=${editId}`;
      return;
    }

    const writerEmail = currentUser.email || "";
    const writerId = writerEmail.includes("@") ? writerEmail.split("@")[0] : "회원";
    const newPost = {
      ...payload,
      writer: writerId,
      writerId,
      writerUid: currentUser.uid,
      writerEmail,
      views: 0,
      createdAt: serverTimestamp()
    };

    try{
      await addDoc(collection(db, "boards"), newPost);
    }catch(error){
      const legacyCategory = getLegacyCategory(category);
      const legacyBoard = getLegacyBoard(effectiveBoard, category);

      if(legacyCategory === category && legacyBoard === effectiveBoard){
        throw error;
      }

      await addDoc(collection(db, "boards"), {
        board: legacyBoard,
        title,
        content,
        category: legacyCategory,
        isSecret: legacyCategory === "request",
        isPublic: legacyCategory !== "request",
        writer: writerId,
        writerId,
        writerUid: currentUser.uid,
        writerEmail,
        views: 0,
        createdAt: serverTimestamp()
      });
    }

    alert("글이 등록되었습니다.");
    location.href = category === "request"
      ? "board.html?board=request&category=request"
      : `board.html?board=${effectiveBoard}&category=${category}`;
  }catch(error){
    console.error(error);
    alert(`게시글을 등록하지 못했습니다. ${error.code || error.message || "잠시 후 다시 시도해주세요."}`);
  }finally{
    submitBtn.disabled = false;
  }
});

if(fontSizeSelect){
  fontSizeSelect.addEventListener("change", ()=>{
    const selected = window.getSelection()?.toString() || "";

    if(!selected) return;

    document.execCommand(
      "insertHTML",
      false,
      `<span style="font-size:${fontSizeSelect.value}px">${selected}</span>`
    );
  });
}

if(textColor){
  textColor.addEventListener("input", ()=>{
    document.execCommand("foreColor", false, textColor.value);
    contentBox.focus();
  });
}

if(backColor){
  backColor.addEventListener("input", ()=>{
    document.execCommand("hiliteColor", false, backColor.value);
    contentBox.focus();
  });
}

if(dividerSelect){
  dividerSelect.addEventListener("change", ()=>{
    let html = "";

    switch(dividerSelect.value){
      case "line":
        html = `<div style="margin:30px 0;text-align:center;"><hr style="border:none;border-top:1px solid #ccc;"></div>`;
        break;
      case "double":
        html = `<div style="margin:30px 0;text-align:center;"><hr style="border:none;border-top:3px solid #777;width:120px;"></div>`;
        break;
      case "diamond":
        html = `<div style="margin:30px 0;text-align:center;color:#888;">─────────────── ◇ ───────────────</div>`;
        break;
      case "dots":
        html = `<div style="margin:30px 0;text-align:center;color:#888;">• • • • • • • • • • • • • • • • • • • • • • • • •</div>`;
        break;
    }

    if(html){
      document.execCommand("insertHTML", false, html);
    }

    dividerSelect.value = "";
    contentBox.focus();
  });
}

if(textColorBtn && textColor){
  textColorBtn.addEventListener("click", ()=>{
    textColor.click();
  });
}

if(backColorBtn && backColor){
  backColorBtn.addEventListener("click", ()=>{
    backColor.click();
  });
}

async function loadPostForEdit(){
  const snap = await getDoc(doc(db, "boards", editId));

  if(!snap.exists()) return;

  const post = snap.data();
  loadedBoard = post.board || board;
  if(postCategory && post.category){
    postCategory.value = post.category;
  }
  updateEditorHeader();



  titleInput.value = post.title || "";
  contentBox.innerHTML = post.content || "";
  setThumbnailPreview(post.thumbnailDataUrl || "");

  submitBtn.textContent = "수정하기";
  submitBtn.style.background = "#444";
}

updateEditorHeader();
if(postCategory){
  postCategory.addEventListener("change", updateEditorHeader);
}
