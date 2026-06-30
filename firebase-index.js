import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function getUserId(user){
  return user && user.email ? user.email.split("@")[0] : "회원";
}

function getUserName(user, data){
  return (data && (data.name || data.signupName || data.id)) || getUserId(user);
}

function setAvatar(photoDataUrl){
  const image = document.getElementById("mobileProfileImage");
  const placeholder = document.getElementById("mobileProfilePlaceholder");
  const deleteButton = document.getElementById("mobileProfileDelete");
  const pageImage = document.getElementById("myAvatarImage");
  const pagePlaceholder = document.querySelector(".my-avatar");
  const pageDelete = document.getElementById("removeProfileImageBtn");

  if(image && photoDataUrl){
    image.src = photoDataUrl;
    image.hidden = false;
  }else if(image){
    image.removeAttribute("src");
    image.hidden = true;
  }

  if(placeholder){
    placeholder.hidden = !!photoDataUrl;
  }

  if(deleteButton){
    deleteButton.hidden = !photoDataUrl;
  }

  if(pageImage && photoDataUrl){
    pageImage.src = photoDataUrl;
    pageImage.hidden = false;
  }else if(pageImage){
    pageImage.removeAttribute("src");
    pageImage.hidden = true;
  }

  if(pagePlaceholder){
    pagePlaceholder.hidden = !!photoDataUrl;
  }

  if(pageDelete){
    pageDelete.hidden = !photoDataUrl;
  }
}

function readImageAsDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();

    reader.onload = ()=>{
      const image = new Image();

      image.onload = ()=>{
        const maxSize = 420;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setUserMenu(user, data){
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if(!loginLink || !logoutBtn) return;

  if(user){
    const name = getUserName(user, data);

    loginLink.textContent = `${name}님`;
    loginLink.href = "mypage.html";
    logoutBtn.style.display = "";
  }else{
    loginLink.textContent = "LOGIN";
    loginLink.href = "login.html";
    logoutBtn.style.display = "none";
  }
}

function setMobileUserMenu(user, data){
  const mobileLoginLink = document.getElementById("mobileLoginLink");
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
  const mobileProfileName = document.getElementById("mobileProfileName");
  const mobileProfileText = document.getElementById("mobileProfileText");
  const mobileGuestActions = document.getElementById("mobileGuestActions");
  const mobileUserActions = document.getElementById("mobileUserActions");
  const mobileProfileInput = document.getElementById("mobileProfileInput");
  const mobileProfileUploadLabel = document.getElementById("mobileProfileUploadLabel");
  const mobileProfileDelete = document.getElementById("mobileProfileDelete");

  if(user){
    const name = getUserName(user, data);

    if(mobileLoginLink){
      mobileLoginLink.textContent = `${name}님`;
      mobileLoginLink.href = "mypage.html";
    }

    if(mobileLogoutBtn){
      mobileLogoutBtn.style.display = "";
    }

    if(mobileProfileName){
      mobileProfileName.textContent = `[${name}]님 환영합니다`;
      mobileProfileName.href = "mypage.html";
    }

    if(mobileProfileText){
      mobileProfileText.textContent = "";
    }

    if(mobileGuestActions) mobileGuestActions.hidden = true;
    if(mobileUserActions) mobileUserActions.hidden = false;
    if(mobileProfileInput) mobileProfileInput.disabled = false;
    if(mobileProfileUploadLabel) mobileProfileUploadLabel.classList.add("is-editable");
    if(mobileProfileDelete) mobileProfileDelete.disabled = false;

    setAvatar(data && data.photoDataUrl);
  }else{
    if(mobileLoginLink){
      mobileLoginLink.textContent = "LOGIN";
      mobileLoginLink.href = "login.html";
    }

    if(mobileLogoutBtn){
      mobileLogoutBtn.style.display = "none";
    }

    if(mobileProfileName){
      mobileProfileName.textContent = "로그인 하기";
      mobileProfileName.href = "login.html";
    }

    if(mobileProfileText){
      mobileProfileText.textContent = "회원 전용 메뉴를 이용해보세요.";
    }

    if(mobileGuestActions) mobileGuestActions.hidden = false;
    if(mobileUserActions) mobileUserActions.hidden = true;
    if(mobileProfileInput) mobileProfileInput.disabled = true;
    if(mobileProfileUploadLabel) mobileProfileUploadLabel.classList.remove("is-editable");
    if(mobileProfileDelete) mobileProfileDelete.disabled = true;

    setAvatar("");
  }
}

onAuthStateChanged(auth, async user=>{
  let data = null;

  if(user){
    try{
      const snap = await getDoc(doc(db, "users", user.uid));

      if(snap.exists()){
        data = snap.data();
      }
    }catch(error){
      console.log(error);
    }
  }

  setUserMenu(user, data);
  setMobileUserMenu(user, data);
});

document.addEventListener("click", async event=>{
  const deleteButton = event.target.closest("#mobileProfileDelete");

  if(!deleteButton) return;

  event.preventDefault();
  event.stopPropagation();

  const user = auth.currentUser;

  if(!user){
    alert("로그인 후 프로필 사진을 삭제할 수 있습니다.");
    return;
  }

  if(!confirm("프로필 사진을 삭제할까요?")) return;

  try{
    await updateDoc(doc(db, "users", user.uid), {
      photoDataUrl: deleteField()
    });

    setAvatar("");
  }catch(error){
    console.log(error);
    alert("프로필 사진 삭제 중 오류가 발생했습니다.");
  }
});

document.addEventListener("click", async event=>{
  const logoutButton = event.target.closest("#logoutBtn, #mobileLogoutBtn");

  if(!logoutButton) return;

  await signOut(auth);
  alert("로그아웃 완료");
  location.reload();
});

document.addEventListener("change", async event=>{
  const input = event.target.closest("#mobileProfileInput");

  if(!input) return;

  const user = auth.currentUser;

  if(!user){
    alert("로그인 후 프로필 사진을 변경할 수 있습니다.");
    input.value = "";
    return;
  }

  const file = input.files && input.files[0];

  if(!file) return;

  try{
    const photoDataUrl = await readImageAsDataUrl(file);

    await setDoc(
      doc(db, "users", user.uid),
      { photoDataUrl },
      { merge:true }
    );

    setAvatar(photoDataUrl);
  }catch(error){
    console.log(error);
    alert("프로필 사진 변경 중 오류가 발생했습니다.");
  }finally{
    input.value = "";
  }
});

const mypageBtn = document.getElementById("mypageBtn");

if(mypageBtn){
  mypageBtn.addEventListener("click", event=>{
    event.preventDefault();

    if(auth.currentUser){
      location.href = "mypage.html";
    }else{
      location.href = "login.html";
    }
  });
}

(function restoreMobileReviewVideoLayer(){
  const mobileMedia = window.matchMedia("(max-width: 768px)");

  function ensureStyle(){
    if(document.getElementById("mobile-review-video-restore-style")) return;

    const style = document.createElement("style");
    style.id = "mobile-review-video-restore-style";
    style.textContent = `
      @media (max-width: 768px){
        .hero-video-frame{
          opacity:var(--hero-video-opacity, 1) !important;
        }
        .hero-expand-sticky > .review-cover-panel{
          background:rgba(0,0,0,.30) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function numberFromCss(value){
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  }

  function update(){
    if(!mobileMedia.matches) return;

    const hero = document.querySelector(".hero-expand-section");
    if(!hero) return;

    ensureStyle();

    const progress = numberFromCss(
      hero.style.getPropertyValue("--hero-progress") ||
      getComputedStyle(hero).getPropertyValue("--hero-progress")
    );

    if(progress >= 0.58 && progress <= 0.98){
      hero.style.setProperty("--hero-video-opacity", "1");
      hero.style.setProperty("--review-bg-opacity", "0.30");
      hero.style.setProperty("--hero-overlay", "0.32");

      const video = document.querySelector(".intro-video");
      if(video && video.paused && !document.hidden){
        const playPromise = video.play();
        if(playPromise && typeof playPromise.catch === "function"){
          playPromise.catch(()=>{});
        }
      }
    }else if(progress < 0.56){
      hero.style.removeProperty("--hero-video-opacity");
    }
  }

  function queueUpdate(){
    requestAnimationFrame(update);
  }

  ensureStyle();
  queueUpdate();
  window.addEventListener("scroll", queueUpdate, {passive:true});
  window.addEventListener("resize", queueUpdate, {passive:true});
  document.addEventListener("visibilitychange", queueUpdate);
  setInterval(update, 350);
})();
