const loginBox = document.getElementById("loginBox");
const signupBox = document.getElementById("signupBox");
const forgotBox = document.getElementById("forgotBox");

let signupPageIndex = 1;
let phoneVerified = false;

function hideAll(){
  if(loginBox) loginBox.classList.remove("active");
  if(signupBox) signupBox.classList.remove("active");
  if(forgotBox) forgotBox.classList.remove("active");
}

function updateSignupPage(){
  document.querySelectorAll(".signup-page").forEach(page=>{
    page.classList.remove("active");
  });

  const currentPage = document.querySelector(`.signup-page[data-page="${signupPageIndex}"]`);

  if(currentPage){
    currentPage.classList.add("active");
  }

  if(signupBox){
    signupBox.dataset.page = signupPageIndex;
  }

  const fill = document.querySelector(".progress-fill");
if(fill){
  fill.style.width = `${signupPageIndex * 25}%`;
}

}

window.showSignup = function(){
  hideAll();
  signupPageIndex = 1;
  updateSignupPage();
  if(signupBox) signupBox.classList.add("active");
}

window.showLogin = function(){
  hideAll();
  if(loginBox) loginBox.classList.add("active");
}

window.showForgot = function(){
  hideAll();
  if(forgotBox) forgotBox.classList.add("active");
}

window.nextSignupPage = function(){




  
if(signupPageIndex === 1){

  const selected = document.querySelector(
    'input[name="isGymMember"]:checked'
  );

  if(!selected){
    alert("회원 여부를 선택해주세요.");
    return;
  }

  if(selected.value === "no"){
    alert("수내점 등록 회원만 이용 가능합니다.");
    return;
  }

}


if(signupPageIndex === 2){

  const checkedInterests = document.querySelectorAll(
    'input[name="interest"]:checked'
  );

  if(checkedInterests.length < 1){
    alert("관심있는 분야를 1개 이상 선택해주세요.");
    return;
  }

}

if(signupPageIndex === 3){

  const name = document.getElementById("signupName").value.trim();

  if(!name){
    alert("이름을 입력해주세요.");
    return;
  }

}


if(signupPageIndex === 4){

  const p1 = document.getElementById("phone1").value.trim();
  const p2 = document.getElementById("phone2").value.trim();
  const p3 = document.getElementById("phone3").value.trim();

  const phone = p1 + p2 + p3;

  if(phone.length !== 11){
    alert("휴대폰 번호를 정확히 입력해주세요.");
    return;
  }




}







  
if(signupPageIndex < 5){
    signupPageIndex++;
    updateSignupPage();
  }

}

window.prevSignupPage = function(){

  if(signupPageIndex > 1){
    signupPageIndex--;
    updateSignupPage();
  }

}

window.toggleAdminCode = function(){

  const box = document.getElementById("adminCodeBox");

  if(!box) return;

  box.style.display = box.style.display === "block" ? "none" : "block";

}

window.togglePassword = function(inputId, btn){

  const input = document.getElementById(inputId);

  if(!input) return;

  if(input.type === "password"){
    input.type = "text";
    btn.textContent = "✕";
  }else{
    input.type = "password";
    btn.textContent = "👁";
  }

}

const signupPassword = document.getElementById("signupPassword");
const signupPasswordConfirm = document.getElementById("signupPasswordConfirm");
const passwordStrength = document.getElementById("passwordStrength");
const passwordMatch = document.getElementById("passwordMatch");
const passwordGuide = document.getElementById("passwordGuide");

function checkPasswordLive(){

  if(!signupPassword || !signupPasswordConfirm) return false;

  const pw = signupPassword.value;
  const confirm = signupPasswordConfirm.value;

  const hasLength = pw.length >= 8 && pw.length <= 13;
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);

  const isValid = hasLength && hasLetter && hasNumber && hasSpecial;
  const isMatched = pw !== "" && confirm !== "" && pw === confirm;

  if(passwordGuide){
    passwordGuide.textContent = "8~13자리 / 영문자 + 숫자 + 특수문자 포함";
  }

  if(passwordStrength){

    if(!pw){
      passwordStrength.textContent = "";
      passwordStrength.className = "password-msg";
    }else if(isValid){
      passwordStrength.textContent = "사용 가능한 비밀번호입니다.";
      passwordStrength.className = "password-msg safe";
    }else{
      passwordStrength.textContent = "조건에 맞지 않는 비밀번호입니다.";
      passwordStrength.className = "password-msg unsafe";
    }

  }

  if(passwordMatch){

    if(!confirm){
      passwordMatch.textContent = "";
      passwordMatch.className = "password-msg";
    }else if(pw === confirm){
      passwordMatch.textContent = "비밀번호가 일치합니다.";
      passwordMatch.className = "password-msg safe";
    }else{
      passwordMatch.textContent = "비밀번호가 일치하지 않습니다.";
      passwordMatch.className = "password-msg unsafe";
    }

  }

  return isValid && isMatched;

}

if(signupPassword){
  signupPassword.oninput = checkPasswordLive;
  signupPassword.onkeyup = checkPasswordLive;
}

if(signupPasswordConfirm){
  signupPasswordConfirm.oninput = checkPasswordLive;
  signupPasswordConfirm.onkeyup = checkPasswordLive;
}

const birthYear = document.getElementById("birthYear");
const birthMonth = document.getElementById("birthMonth");
const birthDay = document.getElementById("birthDay");

if(birthYear && birthMonth && birthDay){

  birthYear.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9]/g, "");

    if(this.value.length === 4){
      birthMonth.focus();
    }
  });

  birthMonth.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9]/g, "");

    if(this.value.length === 2){
      birthDay.focus();
    }
  });

  birthDay.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9]/g, "");
  });

}

window.checkSignupId = function(){

  const msg = document.getElementById("idCheckMsg");

  if(msg){
    msg.textContent = "사용 가능한 아이디입니다.";
    msg.className = "id-check-msg success";
  }

}

window.resetPassword = function(){
  alert("비밀번호 재설정 기능 연결 전입니다.");
}

updateSignupPage();
checkPasswordLive();
