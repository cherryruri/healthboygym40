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

const list = document.getElementById("myCommentList");

onAuthStateChanged(auth, async(user)=>{

  if(!user){
    location.href = "login.html";
    return;
  }

  const userId = user.email.split("@")[0];
  const userEmail = user.email;

  const postSnap = await getDocs(collection(db,"boards"));

  let comments = [];

  for(const postDoc of postSnap.docs){

    const post = postDoc.data();

    const commentSnap = await getDocs(
      collection(db,"boards",postDoc.id,"comments")
    );

    commentSnap.forEach(commentDoc=>{

      const comment = commentDoc.data();

      const isMine =
        comment.writer === userId ||
        comment.writerId === userId ||
        comment.email === userEmail ||
        comment.writerEmail === userEmail;

      if(isMine){
        comments.push({
          postId: postDoc.id,
          postTitle: post.title || "제목 없음",
          text: comment.text || "댓글 내용 없음",
          createdAt: comment.createdAt
        });
      }

    });

  }

  comments.sort((a,b)=>{
    const at = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bt = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bt - at;
  });

  list.innerHTML = "";

  comments.forEach((comment,index)=>{

    let date = "-";

    if(comment.createdAt?.toDate){
      date = comment.createdAt
        .toDate()
        .toLocaleDateString("ko-KR");
    }

    list.innerHTML += `
      <a href="post.html?id=${comment.postId}" class="board-row my-post-row">
        <div>${comments.length - index}</div>
        <div>${comment.text}</div>
       <div>${
  comment.postTitle.length > 5
    ? comment.postTitle.substring(0,5) + "..."
    : comment.postTitle
}</div>
        <div>${date}</div>
      </a>
    `;
  });

});