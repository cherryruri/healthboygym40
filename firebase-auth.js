import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

/* 로그인 */
window.login = async function(){

  const id = document.getElementById("loginId").value.trim();
  const password = document.getElementById("loginPassword").value;
  const remember = document.querySelector(".remember input").checked;

  if(!id || !password){
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  const email = id.includes("@")
    ? id
    : `${id}@healthboygym.com`;

  try{

    await setPersistence(
      auth,
      remember
        ? browserLocalPersistence
        : browserSessionPersistence
    );

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("로그인 성공!");

    window.location.href = "./index.html";

  }catch(error){

    console.log(error);

    alert("로그인 오류 : " + error.code);

  }

}

/* 회원가입 */
window.signup = async function(){

  const id =
    document.getElementById("signupId")
    .value
    .trim();

  const password =
    document.getElementById("signupPassword")
    .value;

  const passwordConfirm =
    document.getElementById("signupPasswordConfirm")
    .value;

  if(!id || !password || !passwordConfirm){

    alert("아이디와 비밀번호를 입력해주세요.");

    return;

  }

  if(password !== passwordConfirm){

    alert("비밀번호가 일치하지 않습니다.");

    return;

  }

  const email = id.includes("@")
    ? id
    : `${id}@healthboygym.com`;

  try{

    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("회원가입 완료!");

    window.location.href = "./index.html";

  }catch(error){

    console.log(error);

    alert("회원가입 오류 : " + error.code);

  }

}