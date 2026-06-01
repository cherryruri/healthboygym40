import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
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

const titleInput = document.getElementById("postTitle");
const contentBox = document.getElementById("postContent");
const submitBtn = document.getElementById("submitPost");

const params = new URLSearchParams(location.search);
const board = params.get("board") || "free";

onAuthStateChanged(auth, (user)=>{
  if(!user){
    alert("로그인한 회원만 글을 쓸 수 있습니다.");
    location.href = "login.html";
    return;
  }

  currentUser = user;
});

document.querySelectorAll(".editor-toolbar button[data-command]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.execCommand(btn.dataset.command, false, null);
    contentBox.focus();
  });
});

const linkBtn = document.getElementById("linkBtn");
const unlinkBtn = document.getElementById("unlinkBtn");
const fontSizeSelect = document.getElementById("fontSizeSelect");
const textColor = document.getElementById("textColor");
const backColor = document.getElementById("backColor");


if(linkBtn){
  linkBtn.addEventListener("click", ()=>{
    const url = prompt("링크 주소를 입력하세요.");
    if(url){
      document.execCommand("createLink", false, url);
      contentBox.focus();
    }
  });
}

submitBtn.addEventListener("click", async ()=>{

  const title = titleInput.value.trim();
  const content = contentBox.innerHTML.trim();

  if(!title){
    alert("제목을 입력해주세요.");
    return;
  }

  if(!content){
    alert("내용을 입력해주세요.");
    return;
  }

  await addDoc(collection(db, "boards"), {
    board: board,
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

  location.href = `board.html?board=${board}`;
});

if(unlinkBtn){
  unlinkBtn.addEventListener("click", ()=>{
    document.execCommand("unlink", false, null);
    contentBox.focus();
  });
}


if(fontSizeSelect){
  fontSizeSelect.addEventListener("change", ()=>{
    document.execCommand(
      "insertHTML",
      false,
      `<span style="font-size:${fontSizeSelect.value}px">${window.getSelection()}</span>`
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

const dividerSelect = document.getElementById("dividerSelect");

if(dividerSelect){
  dividerSelect.addEventListener("change", ()=>{

    let html = "";

    switch(dividerSelect.value){

      case "line":
        html = `
          <div style="margin:30px 0;text-align:center;">
            <hr style="border:none;border-top:1px solid #ccc;">
          </div>
        `;
      break;

      case "double":
        html = `
          <div style="margin:30px 0;text-align:center;">
            <hr style="border:none;border-top:3px solid #777;width:120px;">
          </div>
        `;
      break;

      case "diamond":
        html = `
          <div style="margin:30px 0;text-align:center;color:#888;">
            ───── ◇ ─────
          </div>
        `;
      break;

      case "dots":
        html = `
          <div style="margin:30px 0;text-align:center;color:#888;">
            • • • • •
          </div>
        `;
      break;
    }

    if(html){
      document.execCommand("insertHTML", false, html);
    }

    dividerSelect.value = "";
    contentBox.focus();

  });
}