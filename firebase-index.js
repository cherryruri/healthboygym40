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
  const mobileProfileCard = document.getElementById("mobileProfileCard");
const mobileProfileName = document.getElementById("mobileProfileName");
const mobileProfileText = document.getElementById("mobileProfileText");

  if(!mobileLoginLink || !mobileLogoutBtn) return;

  if(user){
    const name = user.email.split("@")[0];

    mobileLoginLink.textContent = `${name}님 환영합니다`;
    mobileLoginLink.href = "#";

    mobileLogoutBtn.style.display = "";
if(mobileProfileCard){
  mobileProfileCard.href = "mypage.html";
}

if(mobileProfileName){
  mobileProfileName.textContent = `${name}님`;
}

if(mobileProfileText){
  mobileProfileText.textContent = "헬스보이짐 수내점 이용 회원님입니다.";
}




  }else{
    mobileLoginLink.textContent = "LOGIN";
    mobileLoginLink.href = "login.html";

    mobileLogoutBtn.style.display = "none";
    if(mobileProfileCard){
  mobileProfileCard.href = "login.html";
}

if(mobileProfileName){
  mobileProfileName.textContent = "LOGIN";
}

if(mobileProfileText){
  mobileProfileText.textContent = "로그인 후 마이페이지를 이용해보세요.";
}
  }
}

onAuthStateChanged(auth, (user)=>{
  setUserMenu(user);
  setMobileUserMenu(user);
});

const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){
  logoutBtn.addEventListener("click", async ()=>{
    await signOut(auth);
    alert("로그아웃 완료");
    location.reload();
  });
}

const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

if(mobileLogoutBtn){
  mobileLogoutBtn.addEventListener("click", async ()=>{
    await signOut(auth);
    alert("로그아웃 완료");
    location.reload();
  });
}

const mypageBtn = document.getElementById("mypageBtn");

if(mypageBtn){

  mypageBtn.addEventListener("click",(e)=>{

    e.preventDefault();

    const user = auth.currentUser;

    if(user){

      location.href = "mypage.html";

    }else{

  location.href = "login.html";

}

  });

}


// ===== ABOUT US 나이키 스타일 스크롤 애니메이션 연동 구동기 =====
window.addEventListener("scroll", () => {
  const aboutSection = document.querySelector(".brand-about-section");
  if (!aboutSection) return;

  const sectionTop = aboutSection.offsetTop;
  const sectionHeight = aboutSection.offsetHeight;
  const windowHeight = window.innerHeight;
  const scrollTop = window.scrollY;

  // 섹션이 화면에 등장하기 시작하는 지점부터 완전히 끝날 때까지의 절대 스크롤 범위 계산
  const startScroll = sectionTop;
  const endScroll = sectionTop + sectionHeight - windowHeight;

  if (scrollTop >= startScroll && scrollTop <= endScroll) {
    // 0에서 1 사이의 진행도 계산
    const progress = (scrollTop - startScroll) / (endScroll - startScroll);
    
    // 1. CSS 변수 주입하여 ABOUT US 타이틀 무빙 및 블러 연동
    aboutSection.style.setProperty("--brand-progress", progress);

    // 2. 진행도 구간별 카피(문구) 스위칭 (CSS data-copy와 결합)
    if (progress < 0.3) {
      aboutSection.setAttribute("data-copy", "1"); // 1번 스토리 등장
    } else if (progress >= 0.3 && progress < 0.65) {
      aboutSection.setAttribute("data-copy", "2"); // 2번 스토리 등장
    } else {
      aboutSection.setAttribute("data-copy", "3"); // 3번 스토리 등장
    }
  } else if (scrollTop < startScroll) {
    // 섹션 진입 전 초기화
    aboutSection.style.setProperty("--brand-progress", "0");
    aboutSection.setAttribute("data-copy", "0");
  } else if (scrollTop > endScroll) {
    // 섹션을 완전히 지나쳤을 때 최종 상태 고정 (텍스트가 툭 끊기며 사라지는 현상 방지)
    aboutSection.style.setProperty("--brand-progress", "1");
    aboutSection.setAttribute("data-copy", "3");
  }
});