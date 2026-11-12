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
  updateDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

import { loadBoardCategories } from "./board-categories.js?v=1";

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
const adminOnlyBoards = new Set(["infoboard"]);
const adminIds = new Set(["cherryruri"]);

let currentUser = null;
let currentUserData = null;
let thumbnailDataUrl = "";
let loadedBoard = null;
let loadedCategory = null;

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
const noticeOption = document.getElementById("editorNoticeOption");
const noticeCheckbox = document.getElementById("postIsNotice");

const params = new URLSearchParams(location.search);
const board = params.get("board") || "free";
const categoryParam = params.get("category") || "";
const editId = params.get("id");
let customCategories = {public:[], info:[]};

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

function isAdminOnlyBoard(boardName = getEffectiveBoard()){
  return adminOnlyBoards.has(boardName);
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

function syncCategoryOptions(){
  const boardName = getEffectiveBoard();
  const scope = boardName === "infoboard" ? "info" : "public";
  const builtIns = scope === "info" ? ["info_fc","info_pilates","info_health","info_pt"] : ["free"];
  const selected = loadedCategory || categoryParam;
  const options = builtIns.map(id=>new Option(categoryNames[id],id));
  for(const item of customCategories[scope]){
    if(!item.archived || item.id === loadedCategory) options.push(new Option(item.label,item.id));
  }
  if((loadedCategory || categoryNames[selected]) && !options.some(option=>option.value === selected)){
    options.push(new Option(categoryNames[selected] || "기존 분류",selected));
  }
  postCategory.replaceChildren(...options);
  if(options.some(option=>option.value === selected)) postCategory.value = selected;
}

function getEffectiveCategory(effectiveBoard){
  if(effectiveBoard === "infoboard" || effectiveBoard === "free"){
    if(categoryParam === "request" || loadedCategory === "request") return "request";
    return postCategory.value || (effectiveBoard === "infoboard" ? "info_fc" : "free");
  }
  if(loadedCategory) return loadedCategory;

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
      postCategory.selectedOptions[0]?.value === category ? postCategory.selectedOptions[0].text :
      categoryNames[category] || boardNames[effectiveBoard] || "수내점 게시판";
  }

  if(thumbnailField){
    thumbnailField.hidden = getEffectiveCategory(effectiveBoard) === "request";
  }

  if(noticeOption){
    noticeOption.hidden = !isAdmin();
  }

  if(noticeCheckbox && !isAdmin()){
    noticeCheckbox.checked = false;
  }

  if(categoryField){
    categoryField.hidden = !["infoboard","free"].includes(effectiveBoard) || categoryParam === "request" || loadedCategory === "request";
  }

  if(cancelBtn){
    const category = getEffectiveCategory(effectiveBoard);
    cancelBtn.href = effectiveBoard === "infoboard"
      ? `board.html?board=infoboard&category=${category}`
      : "board.html";
  }
}

function ensureOfficialPermission(){
  if(window.HBG_SITE_ACCESS?.adminOnlyPosting !== false && (!currentUser || !isAdmin())){
    alert("현재 게시물 작성은 관리자만 이용할 수 있습니다.");
    location.href="board.html";
    return false;
  }
  const effectiveBoard = getEffectiveBoard();

  if(isAdminOnlyBoard(effectiveBoard) && !isAdmin()){
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

async function saveInfoPost(postRef, payload, editing){
  const batch = writeBatch(db);
  const thumbnailRef = doc(postRef, "private", "thumbnail");
  const data = { ...payload, hasInfoThumbnail: Boolean(thumbnailDataUrl) };
  if(editing) batch.update(postRef, data);
  else batch.set(postRef, data);
  if(thumbnailDataUrl) batch.set(thumbnailRef, { dataUrl: thumbnailDataUrl });
  else if(editing) batch.delete(thumbnailRef);
  await batch.commit();
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
        const crop = Math.min(image.width, image.height);
        const size = Math.min(800, crop);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(image, (image.width-crop)/2, (image.height-crop)/2, crop, crop, 0, 0, size, size);
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
    alert("관리자로 로그인한 뒤 게시물을 작성할 수 있습니다.");
    location.href = "login.html";
    return;
  }

  currentUser = user;
  const [profile, categories] = await Promise.all([
    loadUserData(user),
    loadBoardCategories(db, true).catch(error=>{console.warn("분류를 불러오지 못했습니다.", error); return customCategories;})
  ]);
  currentUserData = profile;
  customCategories = categories;
  syncCategoryOptions();
  updateEditorHeader();

  if(!ensureOfficialPermission())return;
  if(editId){
    await loadPostForEdit();
  }
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


const thumbnailPalettes = {
  thumbnailBackground: [["검정","#000000"],["흰색","#ffffff"],["네이비","#17223b"],["초록","#173c32"],["버건디","#4d1725"]],
  thumbnailAccent: [["노랑","#ffce19"],["라임","#baff55"],["하늘","#70d6ff"],["분홍","#ff85bc"],["주황","#ff814a"]]
};
document.querySelectorAll(".thumbnail-palette").forEach(palette=>{
  const input = document.getElementById(palette.dataset.colorInput);
  const buttons = thumbnailPalettes[input.id].map(([label,color])=>{
    const button = document.createElement("button");
    button.type = "button";
    button.title = label;
    button.setAttribute("aria-label",label);
    button.style.setProperty("--swatch",color);
    button.addEventListener("click",()=>{
      input.value = color;
      syncSelection();
    });
    return button;
  });
  function syncSelection(){
    buttons.forEach((button,index)=>{
      button.setAttribute("aria-pressed",String(input.value === thumbnailPalettes[input.id][index][1]));
    });
  }
  input.addEventListener("input",syncSelection);
  palette.append(...buttons);
  syncSelection();
});

function makeTextThumbnail(text, highlight, background, accent){
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 800;
  const context = canvas.getContext("2d");
  const paragraphs = text.split(/\n+/).map(paragraph=>{
    const parts = highlight ? paragraph.split(highlight) : [paragraph];
    return parts.flatMap((part, index)=>[
      ...(index ? [{ text: highlight, yellow: true }] : []),
      ...(part.match(/\s+|\S+/g) || []).map(word=>({ text: /^\s/.test(word) ? " " : word }))
    ]);
  });
  const widthOf = tokens => context.measureText(tokens.map(token=>token.text).join("").trim()).width;

  let lines;
  let size;
  for(size = 110; size >= 18; size -= 2){
    context.font = '900 ' + size + 'px Pretendard, "Malgun Gothic", sans-serif';
    lines = [];
    for(const tokens of paragraphs){
      let line = [];
      for(const token of tokens){
        if(token.text === " " && !line.length) continue;
        if(line.length && token.text !== " " && widthOf([...line, token]) > 600){
          lines.push(line);
          line = [];
        }
        line.push(token);
      }
      if(line.length) lines.push(line);
    }
    if(lines.length <= 4 && lines.length * size * 1.24 <= 510 && lines.every(line=>widthOf(line) <= 600)) break;
  }
  if(size < 18 || !lines.length) return "";

  const [red, green, blue] = background.slice(1).match(/../g).map(value=>parseInt(value, 16) / 255);
  const linearize = value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  const luminance = .2126 * linearize(red) + .7152 * linearize(green) + .0722 * linearize(blue);
  const foreground = luminance > .179 ? "#000" : "#fff";
  context.fillStyle = background;
  context.fillRect(0, 0, 800, 800);
  context.textBaseline = "middle";
  lines.forEach((line, index)=>{
    const left = (800 - widthOf(line)) / 2;
    const y = 400 + (index - (lines.length - 1) / 2) * size * 1.24;
    let prefix = "";
    for(const token of line){
      context.fillStyle = token.yellow ? accent : foreground;
      context.fillText(token.text, left + context.measureText(prefix).width, y);
      prefix += token.text;
    }
  });
  return canvas.toDataURL("image/jpeg", 0.88);
}

document.getElementById("makeInfoThumbnail").addEventListener("click", ()=>{
  const text = document.getElementById("infoThumbnailText").value.trim() || titleInput.value.trim();
  const highlight = document.getElementById("infoThumbnailHighlight").value.trim();
  const status = document.getElementById("infoThumbnailStatus");
  if(!text || text.length > 32){
    status.textContent = "썸네일 문구를 1~32자로 입력해 주세요.";
    return;
  }
  if(highlight && !text.split("\n").some(line=>line.includes(highlight))){
    status.textContent = "강조할 단어를 썸네일 문구에 들어 있는 그대로 입력해 주세요.";
    return;
  }
  const background = document.getElementById("thumbnailBackground").value;
  const accent = document.getElementById("thumbnailAccent").value;
  const image = makeTextThumbnail(text, highlight, background, accent);
  if(!image){
    status.textContent = "문구를 줄이거나 줄바꿈을 조정해 주세요. 최대 4줄까지 표시됩니다.";
    return;
  }
  setThumbnailPreview(image);
  status.textContent = "썸네일을 만들었어요. 글을 저장하면 함께 등록됩니다.";
});

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

  if(!editId && category === "request"){
    alert("1:1 문의 접수가 잠시 중단되었습니다.");
    return;
  }

  if(!ensureOfficialPermission()) return;

  if(!currentUser){
    alert("관리자로 로그인한 뒤 게시물을 작성할 수 있습니다.");
    location.href = "login.html";
    return;
  }

  const title = titleInput.value.trim();
  const content = contentBox.innerHTML.trim();
  const isOfficial = officialBoards.has(effectiveBoard);
  const isAdminOnly = isAdminOnlyBoard(effectiveBoard);

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
    thumbnailDataUrl: !isAdminOnly && category !== "request" ? thumbnailDataUrl : "",
    category,
    isSecret: category === "request",
    isPublic: category !== "request",
    isAdminOnly,
    isNotice: Boolean(isAdmin() && noticeCheckbox && noticeCheckbox.checked)
  };

  submitBtn.disabled = true;

  try{
    if(editId){
      if(isAdminOnly) await saveInfoPost(doc(db, "boards", editId), payload, true);
      else await updateDoc(doc(db, "boards", editId), payload);
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
      if(isAdminOnly) await saveInfoPost(doc(collection(db, "boards")), newPost, false);
      else await addDoc(collection(db, "boards"), newPost);
    }catch(error){
      if(isAdminOnly) throw error;
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
        isNotice: Boolean(isAdmin() && noticeCheckbox && noticeCheckbox.checked),
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
  loadedCategory = post.category || null;

  syncCategoryOptions();
  updateEditorHeader();



  titleInput.value = post.title || "";
  contentBox.innerHTML = post.content || "";
  if(post.board === "infoboard" && post.hasInfoThumbnail && isAdmin()){
    const thumbnail = await getDoc(doc(db, "boards", editId, "private", "thumbnail"));
    setThumbnailPreview(thumbnail.data()?.dataUrl || "");
  }else{
    setThumbnailPreview(post.thumbnailDataUrl || "");
  }

  if(noticeCheckbox){
    noticeCheckbox.checked = post.isNotice === true;
  }

  submitBtn.textContent = "수정하기";
  submitBtn.style.background = "#444";
}

syncCategoryOptions();
updateEditorHeader();
if(postCategory){
  postCategory.addEventListener("change", updateEditorHeader);
}
