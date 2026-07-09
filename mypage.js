import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updatePassword,
  deleteUser
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteField,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy
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

const myName = document.getElementById("myName");
const myId = document.getElementById("myId");
const infoName = document.getElementById("infoName");
const infoId = document.getElementById("infoId");
const infoPhone = document.getElementById("infoPhone");
const infoMember = document.getElementById("infoMember");
const infoRole = document.getElementById("infoRole");
const logoutBtn = document.getElementById("logoutBtn");
const avatar = document.querySelector(".my-avatar");
const avatarImage = document.getElementById("myAvatarImage");
const profileImageInput = document.getElementById("profileImageInput");
const removeProfileImageBtn = document.getElementById("removeProfileImageBtn");
const adminUsersBtn = document.getElementById("adminUsersBtn");
const mypageRoot = document.getElementById("mypageRoot");
const myWelcome = document.getElementById("myWelcome");


function setText(el, value){
  if(el) el.textContent = value || "-";
}

function renderProfileImage(photoDataUrl, fallbackText){
  if(avatarImage && photoDataUrl){
    avatarImage.src = photoDataUrl;
    avatarImage.hidden = false;
  }else if(avatarImage){
    avatarImage.removeAttribute("src");
    avatarImage.hidden = true;
  }

  if(avatar){
    avatar.hidden = !!photoDataUrl;
    avatar.textContent = "";
  }

  if(removeProfileImageBtn){
    removeProfileImageBtn.hidden = !photoDataUrl;
  }

  renderMobileMenuImage(photoDataUrl);
}

function renderMobileMenuImage(photoDataUrl){
  const menuImage = document.getElementById("mobileProfileImage");
  const menuPlaceholder = document.getElementById("mobileProfilePlaceholder");
  const menuDelete = document.getElementById("mobileProfileDelete");

  if(menuImage && photoDataUrl){
    menuImage.src = photoDataUrl;
    menuImage.hidden = false;
  }else if(menuImage){
    menuImage.removeAttribute("src");
    menuImage.hidden = true;
  }

  if(menuPlaceholder){
    menuPlaceholder.hidden = !!photoDataUrl;
  }

  if(menuDelete){
    menuDelete.hidden = !photoDataUrl;
  }
}

function readImageAsDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();

    reader.onload = ()=>{
      const image = new Image();

      image.onload = ()=>{
        const maxSize = 520;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

onAuthStateChanged(auth, async (user)=>{

const isFirstWelcome = sessionStorage.getItem("welcomeShown");




if(!user){
  location.href = "login.html";
  return;
}

document.body.classList.add("loaded");




  const userId = user.email ? user.email.split("@")[0] : "회원";


  
const showWelcome = sessionStorage.getItem("showWelcomeOnce");

if(showWelcome === "yes"){
document.body.classList.add("welcoming");


sessionStorage.removeItem("showWelcomeOnce");

  if(myWelcome){
    myWelcome.style.display = "flex";
  }

  if(mypageRoot){
    mypageRoot.style.display = "none";
  }

  setTimeout(()=>{

    if(myWelcome){
      myWelcome.style.display = "none";
    }

    if(mypageRoot){
      mypageRoot.style.display = "block";
    }
document.body.classList.remove("welcoming");


  },4200);

}else{

  if(myWelcome){
    myWelcome.style.display = "none";
  }

  if(mypageRoot){
    mypageRoot.style.display = "block";
  }
document.body.classList.remove("welcoming");
}








  setText(myName, `${userId}님`);
  setText(myId, user.email);
  setText(infoId, userId);

  renderProfileImage("", userId);

  let dashboardUserData = {};

  try{
    console.log("현재UID", user.uid);
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
console.log("문서존재", userSnap.exists());

    if(userSnap.exists()){
      const data = userSnap.data();
      dashboardUserData = data;

      const phone = [
        data.phone1,
        data.phone2,
        data.phone3
      ].filter(Boolean).join("-");

      setText(infoName, data.name || data.signupName || userId);
      setText(infoPhone, phone || data.phone || "-");
      setText(infoMember, data.isGymMember === "yes" ? "헬스보이짐 회원" : "비회원");
      setText(infoRole, data.role === "admin" ? "관리자" : "일반 회원");
      
      if(adminUsersBtn && data.role === "admin"){
        adminUsersBtn.style.display = "inline-flex";
      }

      if(data.name && myName){
        myName.textContent = `${data.name}님`;
      }

      renderProfileImage(data.photoDataUrl, data.name || userId);


    }else{
      setText(infoName, userId);
      setText(infoPhone, "-");
      setText(infoMember, "-");
      setText(infoRole, "일반 회원");
    }

   loadMyDashboard(user, dashboardUserData);


  }catch(error){
    console.error(error);

    setText(infoName, userId);
    setText(infoPhone, "-");
    setText(infoMember, "-");
    setText(infoRole, "정보 불러오기 오류");
  }

});

if(logoutBtn){
  logoutBtn.addEventListener("click", async ()=>{
    await signOut(auth);
    alert("로그아웃 완료");
    location.href = "index.html";
  });
}


/* 여기부터 추가 */

const mypageBtn = document.getElementById("mypageBtn");

if(mypageBtn){
  mypageBtn.addEventListener("click",(e)=>{
    e.preventDefault();

    if(auth.currentUser){
      sessionStorage.removeItem("showWelcomeOnce");
      location.href = "mypage.html";
    }else{
      location.href = "login.html";
    }

  });
}


async function loadMyDashboard(user, userData = {}){

  const myPostList = document.getElementById("myPostList");
  const myCommentList = document.getElementById("myCommentList");
  const myRequestList = document.getElementById("myRequestList");
  const requestDashboardTitle = document.getElementById("requestDashboardTitle");
  const requestDashboardLink = document.getElementById("requestDashboardLink");
  const joinedDays = document.getElementById("joinedDays");
  const joinedDate = document.getElementById("joinedDate");

  const userEmail = user.email || "";
  const userId = userEmail.includes("@") ? userEmail.split("@")[0] : "회원";
  const admin = isAdminProfile(userData, user);

  if(requestDashboardTitle){
    requestDashboardTitle.textContent = admin ? "회원 1:1 문의" : "나의 1:1 문의";
  }

  if(requestDashboardLink){
    requestDashboardLink.href = admin
      ? "board.html?board=request&category=request&scope=all"
      : "board.html?board=request&category=request&scope=mine";
  }

  if(myPostList){
    myPostList.innerHTML = "게시물 불러오는 중...";
  }

  if(myCommentList){
    myCommentList.innerHTML = "댓글 불러오는 중...";
  }

  if(myRequestList){
    myRequestList.innerHTML = "문의 불러오는 중...";
  }

  const postSnap = await getDocs(collection(db, "boards"));

  let myPosts = [];
  let myComments = [];
  let requestPosts = [];

  for(const docSnap of postSnap.docs){

    const post = docSnap.data();

    const isMyPost =
      post.writer === userId ||
      post.writerId === userId ||
      post.email === userEmail ||
      post.writerEmail === userEmail;

    const isRequest = isRequestPost(post);

    if(isRequest && (admin || isMyPost)){
      requestPosts.push({
        id: docSnap.id,
        ...post
      });
    }

    if(isMyPost && !isRequest){
      myPosts.push({
        id: docSnap.id,
        ...post
      });
    }

    const commentSnap = await getDocs(
      collection(db, "boards", docSnap.id, "comments")
    );

    commentSnap.forEach(commentDoc=>{

      const comment = commentDoc.data();

      const isMyComment =
        comment.writer === userId ||
        comment.writerId === userId ||
        comment.email === userEmail ||
        comment.writerEmail === userEmail;

      if(isMyComment){
        myComments.push({
          postId: docSnap.id,
          postTitle: post.title || "제목 없음",
          text: comment.text || "",
          createdAt: comment.createdAt
        });
      }

    });

  }

  myPosts.sort((a,b)=>{
    const at = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bt = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bt - at;
  });

  myComments.sort((a,b)=>{
    const at = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bt = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bt - at;
  });

  requestPosts.sort((a,b)=>{
    const at = getPostTime(a);
    const bt = getPostTime(b);
    return bt - at;
  });

  if(myRequestList){
    myRequestList.innerHTML = "";

    if(requestPosts.length === 0){
      myRequestList.innerHTML = `<div class="dash-item">${admin ? "요청된 1:1 문의가 없습니다." : "작성한 1:1 문의가 없습니다."}</div>`;
    }else{
      requestPosts.slice(0,4).forEach(post=>{
        const answered = hasRequestAnswer(post);
        myRequestList.innerHTML += `
          <a class="dash-item request-dash-item" href="post.html?id=${post.id}">
            <strong>${escapeHTML(post.title || "제목 없음")}</strong>
            <em class="${answered ? "done" : ""}">${answered ? "답변이 완료되었습니다" : "답변대기중"}</em>
          </a>
        `;
      });
    }
  }

  if(myPostList){
    myPostList.innerHTML = "";

    if(myPosts.length === 0){
      myPostList.innerHTML = `<div class="dash-item">작성한 게시물이 없습니다.</div>`;
    }else{
      myPosts.slice(0,3).forEach(post=>{
        myPostList.innerHTML += `
          <a class="dash-item" href="post.html?id=${post.id}">
            ${post.title || "제목 없음"}
          </a>
        `;
      });
    }
  }

  if(myCommentList){
    myCommentList.innerHTML = "";

    if(myComments.length === 0){
      myCommentList.innerHTML = `<div class="dash-item">작성한 댓글이 없습니다.</div>`;
    }else{
      myComments.slice(0,3).forEach(comment=>{
        myCommentList.innerHTML += `
        <a class="dash-item" href="post.html?id=${comment.postId}">
  ${comment.text || "댓글 내용 없음"}
</a>
          </a>
        `;
      });
    }
  }

  const userRef = doc(db,"users",user.uid);
  const userSnap = await getDoc(userRef);

  if(userSnap.exists()){

    const data = userSnap.data();

    if(data.createdAt?.toDate){

      const created = data.createdAt.toDate();
      const now = new Date();
      const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24)) + 1;

      if(joinedDays){
        joinedDays.textContent = `${diff}일째`;
      }

      if(joinedDate){
        joinedDate.textContent = `${created.toLocaleDateString("ko-KR")} 가입`;
      }
    }
  }
}

function isAdminProfile(data, user){
  const adminIds = new Set(["cherryruri"]);
  const email = user?.email || "";
  const userId = email.includes("@") ? email.split("@")[0].toLowerCase() : "";
  const dataId = String(data?.id || data?.userId || "").toLowerCase();

  return (
    data?.role === "admin" ||
    data?.isAdmin === true ||
    data?.admin === true ||
    data?.permission === "admin" ||
    adminIds.has(userId) ||
    adminIds.has(dataId)
  );
}

function isRequestPost(post){
  if(!post) return false;
  if(post.category === "request") return true;
  return post.board === "free" && (post.isSecret || post.isPublic === false);
}

function hasRequestAnswer(post){
  return !!(post && (post.isAnswered || post.answer || post.answerText || post.answeredAt));
}

function getPostTime(post){
  const createdAt = post?.createdAt;
  if(createdAt?.toDate) return createdAt.toDate().getTime();
  const time = new Date(createdAt || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function escapeHTML(value){
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
const editProfileBtn = document.getElementById("editProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");

if(editProfileBtn){
  editProfileBtn.addEventListener("click", ()=>{

    infoName.innerHTML = `
      <input class="edit-input" id="editNameInput" value="${infoName.textContent}">
    `;

    infoPhone.innerHTML = `
      <input class="edit-input" id="editPhoneInput" value="${infoPhone.textContent}">
    `;

    editProfileBtn.style.display = "none";
    saveProfileBtn.style.display = "inline-flex";
  });
}

if(saveProfileBtn){
  saveProfileBtn.addEventListener("click", async ()=>{

    const user = auth.currentUser;
    if(!user) return;

    const newName = document.getElementById("editNameInput").value.trim();
    const newPhone = document.getElementById("editPhoneInput").value.trim();

    await updateDoc(doc(db, "users", user.uid), {
      name: newName,
      phone: newPhone
    });

    alert("수정되었습니다.");
    location.reload();
  });
}

const changePasswordBtn = document.getElementById("changePasswordBtn");

if(changePasswordBtn){
  changePasswordBtn.addEventListener("click", ()=>{
    location.href = "change-password.html";
  });
}

if(profileImageInput){
  profileImageInput.addEventListener("change", async ()=>{
    const user = auth.currentUser;
    const file = profileImageInput.files && profileImageInput.files[0];

    if(!user || !file) return;

    try{
      const photoDataUrl = await readImageAsDataUrl(file);

      await setDoc(
        doc(db, "users", user.uid),
        { photoDataUrl },
        { merge:true }
      );

      renderProfileImage(photoDataUrl, infoName ? infoName.textContent : "H");
      alert("프로필 사진이 변경되었습니다.");
    }catch(error){
      console.log(error);
      alert("프로필 사진 변경 중 오류가 발생했습니다.");
    }finally{
      profileImageInput.value = "";
    }
  });
}

if(removeProfileImageBtn){
  removeProfileImageBtn.addEventListener("click", async ()=>{
    const user = auth.currentUser;

    if(!user) return;
    if(!confirm("프로필 사진을 삭제할까요?")) return;

    try{
      await updateDoc(doc(db, "users", user.uid), {
        photoDataUrl: deleteField()
      });

      renderProfileImage("", infoName ? infoName.textContent : "H");
      alert("프로필 사진이 삭제되었습니다.");
    }catch(error){
      console.log(error);
      alert("프로필 사진 삭제 중 오류가 발생했습니다.");
    }
  });
}

if(adminUsersBtn){
  adminUsersBtn.addEventListener("click", ()=>{
    location.href = "admin.html";
  });
}
