import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
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
const mypageRoot = document.getElementById("mypageRoot");
const myWelcome = document.getElementById("myWelcome");


function setText(el, value){
  if(el) el.textContent = value || "-";
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

  if(avatar){
    avatar.textContent = userId.charAt(0).toUpperCase();
  }

  try{
    console.log("현재UID", user.uid);
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
console.log("문서존재", userSnap.exists());

    if(userSnap.exists()){
      const data = userSnap.data();

      const phone = [
        data.phone1,
        data.phone2,
        data.phone3
      ].filter(Boolean).join("-");

      setText(infoName, data.name || data.signupName || userId);
      setText(infoPhone, phone || data.phone || "-");
      setText(infoMember, data.isGymMember === "yes" ? "헬스보이짐 회원" : "비회원");
      setText(infoRole, data.role === "admin" ? "관리자" : "일반 회원");
      
      const adminMenu = document.getElementById("adminMenu");

if(adminMenu && data.role === "admin"){
  adminMenu.style.display = "flex";
}

      if(data.name && myName){
        myName.textContent = `${data.name}님`;
      }

      if(data.name && avatar){
        avatar.textContent = data.name.charAt(0);
      }


    }else{
      setText(infoName, userId);
      setText(infoPhone, "-");
      setText(infoMember, "-");
      setText(infoRole, "일반 회원");
    }

   loadMyDashboard(user);


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
async function loadMyDashboard(user){

  const myPostList = document.getElementById("myPostList");
  const myCommentList = document.getElementById("myCommentList");
  const joinedDays = document.getElementById("joinedDays");
  const joinedDate = document.getElementById("joinedDate");

  const userId = user.email.split("@")[0];
  const userEmail = user.email;

  if(myPostList){
    myPostList.innerHTML = "게시물 불러오는 중...";
  }

  if(myCommentList){
    myCommentList.innerHTML = `
      <div class="dash-item">
        댓글 목록은 다음 단계에서 연결할게요.
      </div>
    `;
  }

  const postSnap = await getDocs(collection(db, "boards"));

  let myPosts = [];

  postSnap.forEach(docSnap=>{

    const post = docSnap.data();

    const isMine =
      post.writer === userId ||
      post.writerId === userId ||
      post.email === userEmail ||
      post.writerEmail === userEmail;

    if(isMine){
      myPosts.push({
        id: docSnap.id,
        ...post
      });
    }

  });

  myPosts.sort((a,b)=>{

    const at =
      a.createdAt?.toDate
        ? a.createdAt.toDate().getTime()
        : 0;

    const bt =
      b.createdAt?.toDate
        ? b.createdAt.toDate().getTime()
        : 0;

    return bt - at;

  });

  if(myPostList){

    myPostList.innerHTML = "";

    if(myPosts.length === 0){

      myPostList.innerHTML =
      `<div class="dash-item">
        작성한 게시물이 없습니다.
      </div>`;

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

  const userRef = doc(db,"users",user.uid);
  const userSnap = await getDoc(userRef);

  if(userSnap.exists()){

    const data = userSnap.data();

    if(data.createdAt?.toDate){

      const created = data.createdAt.toDate();
      const now = new Date();

      const diff =
      Math.floor(
        (now - created) /
        (1000 * 60 * 60 * 24)
      ) + 1;

      if(joinedDays){
        joinedDays.textContent = `${diff}일째`;
      }

      if(joinedDate){
        joinedDate.textContent =
        `${created.toLocaleDateString("ko-KR")} 가입`;
      }

    }

  }

}