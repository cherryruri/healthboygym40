import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
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

let idChecked = false;
let idAvailable = false;

function makeEmail(id){
  return id.includes("@") ? id : `${id}@healthboygym.com`;
}

/* 아이디 입력 바뀌면 중복확인 초기화 */
const signupIdInput = document.getElementById("signupId");
const idCheckMsg = document.getElementById("idCheckMsg");

if(signupIdInput){
  signupIdInput.addEventListener("input", ()=>{
    idChecked = false;
    idAvailable = false;

    if(idCheckMsg){
      idCheckMsg.textContent = "";
      idCheckMsg.className = "id-check-msg";
    }
  });
}

/* 아이디 중복확인 */
window.checkSignupId = async function(){

  const id = document.getElementById("signupId").value.trim();
  const msg = document.getElementById("idCheckMsg");

  if(!msg) return;

  if(!id){
    msg.textContent = "아이디를 입력해주세요.";
    msg.className = "id-check-msg error";
    idChecked = false;
    idAvailable = false;
    return;
  }

  if(id.length < 4){
    msg.textContent = "아이디는 4자 이상 입력해주세요.";
    msg.className = "id-check-msg error";
    idChecked = false;
    idAvailable = false;
    return;
  }

  const email = makeEmail(id);

  try{
    const methods = await fetchSignInMethodsForEmail(auth, email);

    idChecked = true;

    if(methods.length > 0){
      idAvailable = false;
      msg.textContent = "이미 사용 중인 아이디입니다.";
      msg.className = "id-check-msg error";
    }else{
      idAvailable = true;
      msg.textContent = "사용 가능한 아이디입니다.";
      msg.className = "id-check-msg success";
    }

  }catch(error){
    console.log(error);
    idChecked = false;
    idAvailable = false;
    msg.textContent = "중복확인 중 오류가 발생했습니다.";
    msg.className = "id-check-msg error";
  }
};

/* 로그인 */
window.login = async function(){

  const id = document.getElementById("loginId").value.trim();
  const password = document.getElementById("loginPassword").value;
  const remember = document.querySelector(".remember input").checked;

  if(!id || !password){
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  const email = makeEmail(id);

  try{
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence
    );

    await signInWithEmailAndPassword(auth, email, password);

    alert("로그인 성공!");
    window.location.href = "./index.html";

  }catch(error){
    console.log(error);
    alert("로그인 오류 : " + error.code);
  }
};

/* 회원가입 */
window.signup = async function(){

  const id = document.getElementById("signupId").value.trim();
  const password = document.getElementById("signupPassword").value;
  const passwordConfirm = document.getElementById("signupPasswordConfirm").value;

  if(!id || !password || !passwordConfirm){
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  if(!idChecked){
    alert("아이디 중복확인을 먼저 해주세요.");
    return;
  }

  if(!idAvailable){
    alert("이미 사용 중인 아이디입니다.");
    return;
  }

  if(password !== passwordConfirm){
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  const email = makeEmail(id);

  try{
    await createUserWithEmailAndPassword(auth, email, password);

    alert("회원가입 완료!");
    window.location.href = "./index.html";

  }catch(error){
    console.log(error);

    if(error.code === "auth/email-already-in-use"){
      alert("이미 사용 중인 아이디입니다.");
      return;
    }

    alert("회원가입 오류 : " + error.code);
  }
};