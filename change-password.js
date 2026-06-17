import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const newPasswordConfirm = document.getElementById("newPasswordConfirm");
const submitButton = document.getElementById("changePasswordSubmit");
const message = document.getElementById("changePasswordMsg");

function setMessage(text, type){
  if(!message) return;

  message.textContent = text;
  message.style.color = type === "error" ? "#c62828" : "#167a36";
}

function isValidPassword(value){
  return (
    value.length >= 8 &&
    value.length <= 13 &&
    /[A-Za-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

onAuthStateChanged(auth, user=>{
  if(user) return;

  alert("로그인 후 비밀번호를 변경할 수 있습니다.");
  location.href = "login.html";
});

if(submitButton){
  submitButton.addEventListener("click", async ()=>{
    const user = auth.currentUser;

    if(!user || !user.email){
      alert("로그인 후 비밀번호를 변경할 수 있습니다.");
      location.href = "login.html";
      return;
    }

    const currentValue = currentPassword.value;
    const nextValue = newPassword.value;
    const confirmValue = newPasswordConfirm.value;

    if(!currentValue || !nextValue || !confirmValue){
      setMessage("모든 항목을 입력해주세요.", "error");
      return;
    }

    if(!isValidPassword(nextValue)){
      setMessage("새 비밀번호는 8~13자리, 영문자/숫자/특수문자를 포함해야 합니다.", "error");
      return;
    }

    if(nextValue !== confirmValue){
      setMessage("새 비밀번호 확인이 일치하지 않습니다.", "error");
      return;
    }

    submitButton.disabled = true;
    setMessage("비밀번호를 변경하는 중입니다.", "ok");

    try{
      const credential =
        EmailAuthProvider.credential(user.email, currentValue);

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, nextValue);

      alert("비밀번호가 변경되었습니다.");
      location.href = "mypage.html";
    }catch(error){
      console.log(error);

      if(error.code === "auth/invalid-credential" || error.code === "auth/wrong-password"){
        setMessage("현재 비밀번호가 올바르지 않습니다.", "error");
      }else if(error.code === "auth/too-many-requests"){
        setMessage("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", "error");
      }else{
        setMessage("비밀번호 변경 중 오류가 발생했습니다.", "error");
      }
    }finally{
      submitButton.disabled = false;
    }
  });
}
