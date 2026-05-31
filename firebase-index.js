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


function setUserMenu(user){
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if(!loginLink || !logoutBtn) return;

  if(user){
    const name = user.email.split("@")[0];

    loginLink.textContent = `${name}님 환영합니다`;
    loginLink.href = "#";

    logoutBtn.style.display = "";
  }else{
    loginLink.textContent = "LOGIN";
    loginLink.href = "login.html";

    logoutBtn.style.display = "none";
  }
}

function setMobileUserMenu(user){
  const mobileLoginLink = document.getElementById("mobileLoginLink");
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

  if(!mobileLoginLink || !mobileLogoutBtn) return;

  if(user){
    const name = user.email.split("@")[0];

    mobileLoginLink.textContent = `${name}님 환영합니다`;
    mobileLoginLink.href = "#";

    mobileLogoutBtn.style.display = "";
  }else{
    mobileLoginLink.textContent = "LOGIN";
    mobileLoginLink.href = "login.html";

    mobileLogoutBtn.style.display = "none";
  }
}

/* 로그인 상태 체크 */
onAuthStateChanged(auth, async (user)=>{

  if(!user){
    setUserMenu(null);
    setMobileUserMenu(null);
    return;
  }

  const userDoc = await getDoc(
    doc(db, "users", user.uid)
  );

  const userData = userDoc.data();

  const displayName =
    userData?.role === "admin"
      ? `${userData.name} 관리자님 환영합니다`
      : `${userData.name}님 환영합니다`;

  const loginLink = document.getElementById("loginLink");
  const mobileLoginLink = document.getElementById("mobileLoginLink");

  if(loginLink){
    loginLink.textContent = displayName;
    loginLink.href = "#";
  }

  if(mobileLoginLink){
    mobileLoginLink.textContent = displayName;
    mobileLoginLink.href = "#";
  }

  document.getElementById("logoutBtn").style.display = "";
  document.getElementById("mobileLogoutBtn").style.display = "";

});
/* PC 로그아웃 */
const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){
  logoutBtn.addEventListener("click", async ()=>{
    await signOut(auth);
    alert("로그아웃 완료");
    location.reload();
  });
}

/* 모바일 로그아웃 */
const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

if(mobileLogoutBtn){
  mobileLogoutBtn.addEventListener("click", async ()=>{
    await signOut(auth);
    alert("로그아웃 완료");
    location.reload();
  });
}