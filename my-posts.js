import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs
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

const list = document.getElementById("myPostList");

onAuthStateChanged(auth, async(user)=>{

  if(!user){
    location.href = "login.html";
    return;
  }

  const userId = user.email.split("@")[0];
  const userEmail = user.email;

  const snap = await getDocs(collection(db,"boards"));

  let posts = [];

  snap.forEach(docSnap=>{

    const post = docSnap.data();

    const isMine =
      post.writer === userId ||
      post.writerId === userId ||
      post.email === userEmail ||
      post.writerEmail === userEmail;

    if(isMine){
      posts.push({
        id: docSnap.id,
        ...post
      });
    }

  });

  posts.sort((a,b)=>{

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

  list.innerHTML = "";

  posts.forEach((post,index)=>{

    let date = "-";

    if(post.createdAt?.toDate){
      date = post.createdAt
        .toDate()
        .toLocaleDateString("ko-KR");
    }

  list.innerHTML += `
  <a href="post.html?id=${post.id}" class="board-row my-post-row">
        <div>${posts.length-index}</div>

<div>
  ${
    (post.title || "제목 없음").length > 12
      ? (post.title || "제목 없음").substring(0,12) + "..."
      : (post.title || "제목 없음")
  }
</div>
        <div>
          ${post.writerId || post.writer || "-"}
        </div>

        <div>${date}</div>

      </a>
    `;
  });

});