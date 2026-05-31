import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
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

const myName = document.getElementById("myName");
const myId = document.getElementById("myId");
const infoName = document.getElementById("infoName");
const infoId = document.getElementById("infoId");
const infoPhone = document.getElementById("infoPhone");
const infoMember = document.getElementById("infoMember");
const infoRole = document.getElementById("infoRole");
const logoutBtn = document.getElementById("logoutBtn");
const avatar = document.querySelector(".my-avatar");
const mypageRoot = document.getElementById("mypageRoot");
const myWelcome = document.getElementById("myWelcome");
const welcomeName = document.getElementById("welcomeName");

function setText(el, value){
  if(el) el.textContent = value || "-";
}

onAuthStateChanged(auth, async (user)=>{

if(!user){
  location.href = "login.html";
  return;
}







  const userId = user.email ? user.email.split("@")[0] : "회원";


  if(welcomeName){
  welcomeName.textContent = `안녕하세요, ${userId}님`;
}

setTimeout(()=>{
  if(myWelcome){
    myWelcome.classList.add("hide");
  }

  if(mypageRoot){
    mypageRoot.style.display = "flex";
  }
},4600);


  setText(myName, `${userId}님`);
  setText(myId, user.email);
  setText(infoId, userId);

  if(avatar){
    avatar.textContent = userId.charAt(0).toUpperCase();
  }

  try{
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if(userSnap.exists()){
      const data = userSnap.data();

      const phone = [
        data.phone1,
        data.phone2,
        data.phone3
      ].filter(Boolean).join("-");

      setText(infoName, data.name || data.signupName || userId);
      setText(infoPhone, phone || data.phone || "-");
      setText(infoMember, data.isGymMember === "yes" ? "헬스보이짐 회원" : "비회원");
      setText(infoRole, data.role === "admin" ? "관리자" : "일반 회원");

      if(data.name && myName){
        myName.textContent = `${data.name}님`;
      }

      if(data.name && avatar){
        avatar.textContent = data.name.charAt(0);
      }

    }else{
      setText(infoName, userId);
      setText(infoPhone, "-");
      setText(infoMember, "-");
      setText(infoRole, "일반 회원");
    }

  }catch(error){
    console.error(error);

    setText(infoName, userId);
    setText(infoPhone, "-");
    setText(infoMember, "-");
    setText(infoRole, "정보 불러오기 오류");
  }

});

if(logoutBtn){
  logoutBtn.addEventListener("click", async ()=>{
    await signOut(auth);
    alert("로그아웃 완료");
    location.href = "index.html";
  });
}