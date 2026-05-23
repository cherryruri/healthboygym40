import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

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

/* 로그인 상태 체크 */
onAuthStateChanged(auth, (user)=>{

  const loginLink =
    document.getElementById("loginLink");

  const logoutBtn =
    document.getElementById("logoutBtn");

  if(!loginLink || !logoutBtn) return;

  if(user){

    const name =
      user.email.split("@")[0];

    loginLink.textContent =
      `${name}님 환영합니다`;

    loginLink.href = "#";

    logoutBtn.style.display =
      "inline-block";

  }else{

    loginLink.textContent = "LOGIN";

    loginLink.href = "login.html";

    logoutBtn.style.display = "none";

  }

});

/* 로그아웃 */
const logoutBtn =
  document.getElementById("logoutBtn");

if(logoutBtn){

  logoutBtn.addEventListener(
    "click",
    async ()=>{

      await signOut(auth);

      alert("로그아웃 완료");

      location.reload();

    }
  );

}