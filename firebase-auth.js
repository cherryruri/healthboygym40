import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
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

let idChecked = false;
let idAvailable = false;
let checkedId = "";

function cleanId(id){
  return id.trim().toLowerCase();
}

function cleanText(text){
  return text.trim().replace(/\s/g, "");
}

function makeEmail(id){
  return `${cleanId(id)}@healthboygym.com`;
}

function getPhone(){
  const p1 = document.getElementById("phone1").value.trim();
  const p2 = document.getElementById("phone2").value.trim();
  const p3 = document.getElementById("phone3").value.trim();
  return `${p1}${p2}${p3}`;
}

function getMemberKey(name, phone){
  return `${cleanText(name)}_${phone}`;
}

/* 아이디 바꾸면 중복확인 초기화 */
const signupIdInput = document.getElementById("signupId");

if(signupIdInput){
  signupIdInput.addEventListener("input", ()=>{
    idChecked = false;
    idAvailable = false;
    checkedId = "";

    const msg = document.getElementById("idCheckMsg");
    if(msg){
      msg.textContent = "";
      msg.className = "id-check-msg";
    }
  });
}

/* 아이디 중복확인 */
window.checkSignupId = async function(){

  const id = cleanId(document.getElementById("signupId").value);
  const msg = document.getElementById("idCheckMsg");

  if(!msg) return;

  if(!id){
    msg.textContent = "아이디를 입력해주세요.";
    msg.className = "id-check-msg error";
    return;
  }

  if(id.length < 4){
    msg.textContent = "아이디는 4자 이상 입력해주세요.";
    msg.className = "id-check-msg error";
    return;
  }

  try{
    const idRef = doc(db, "userIds", id);
    const idSnap = await getDoc(idRef);

    idChecked = true;
    checkedId = id;

    if(idSnap.exists()){
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
    msg.textContent = "중복확인 중 오류가 발생했습니다.";
    msg.className = "id-check-msg error";
  }
};

/* 로그인 */
window.login = async function(){

  const id = cleanId(document.getElementById("loginId").value);
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

  const id = cleanId(document.getElementById("signupId").value);
  const password = document.getElementById("signupPassword").value;
  const passwordConfirm = document.getElementById("signupPasswordConfirm").value;

  const name = cleanText(document.getElementById("signupName").value);
  const phone = getPhone();

  const birthYear = document.getElementById("birthYear").value.trim();
  const birthMonth = document.getElementById("birthMonth").value.trim();
  const birthDay = document.getElementById("birthDay").value.trim();
  const gender = document.getElementById("signupGender").value;
  const address = document.getElementById("signupAddress").value.trim();
  const addressDetail = document.getElementById("signupAddressDetail").value.trim();

  const agree1 = document.getElementById("agree1").checked;
  const agree2 = document.getElementById("agree2").checked;
  const adminCode = document.getElementById("adminCode").value.trim();

const role =
  adminCode === "healthboy0909!!!"
    ? "admin"
    : "user";



  if(!id || !password || !passwordConfirm){
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  if(!idChecked || !idAvailable || checkedId !== id){
    alert("아이디 중복확인을 먼저 해주세요.");
    return;
  }

  if(password !== passwordConfirm){
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  if(!name){
    alert("이름을 입력해주세요.");
    return;
  }

  if(phone.length !== 11){
    alert("전화번호를 정확히 입력해주세요.");
    return;
  }

  if(!agree1 || !agree2){
    alert("개인정보 및 이용약관에 동의해주세요.");
    return;
  }

  const email = makeEmail(id);
  const memberKey = getMemberKey(name, phone);

  try{
    const phoneSnap = await getDoc(doc(db, "phoneNumbers", phone));
    const memberSnap = await getDoc(doc(db, "memberKeys", memberKey));

    if(phoneSnap.exists() || memberSnap.exists()){
      alert("이미 가입된 계정입니다.");
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "userIds", id), {
      uid: userCredential.user.uid,
      id: id,
      email: email,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, "phoneNumbers", phone), {
      uid: userCredential.user.uid,
      id: id,
      name: name,
      phone: phone,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, "memberKeys", memberKey), {
      uid: userCredential.user.uid,
      id: id,
      name: name,
      phone: phone,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      id: id,
      email: email,
      name: name,
      phone: phone,
      role: role,
      birth: `${birthYear}-${birthMonth}-${birthDay}`,
      gender: gender,
      address: address,
      addressDetail: addressDetail,
      createdAt: serverTimestamp()
    });

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