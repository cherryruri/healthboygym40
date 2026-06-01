// firebase-login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

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

// 로그인 버튼 클릭
const loginBtn = document.getElementById("loginBtn");
if(loginBtn){
  loginBtn.addEventListener("click", async () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    try{
      const email = emailInput.value;
      const password = passwordInput.value;

      // 로그인
      await signInWithEmailAndPassword(auth, email, password);

      // 로그인 성공 → 마이페이지로
      window.location.href = "mypage.html";

    }catch(err){
      alert("로그인 실패: " + err.message);
    }
  });
}