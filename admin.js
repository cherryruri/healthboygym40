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

const userList = document.getElementById("userList");

async function loadUsers(){

  const snap = await getDocs(collection(db,"users"));

  let total = 0;
  let adminCount = 0;

  userList.innerHTML = "";

  snap.forEach(docSnap=>{

    const user = docSnap.data();

    total++;

    if(user.role === "admin"){
      adminCount++;
    }

    const interests = Array.isArray(user.interests)
      ? user.interests.join(", ")
      : "-";

    userList.innerHTML += `
      <div class="user-row user-item">

        <div>${user.name || "-"}</div>

        <div>${user.signupId || "-"}</div>

        <div>${user.phone || "-"}</div>

        <div>${interests}</div>

        <div>${user.createdAt || "-"}</div>

        <div class="${
          user.role === "admin"
            ? "role-admin"
            : "role-user"
        }">
          ${user.role || "user"}
        </div>

      </div>
    `;
  });

  document.getElementById("totalUsers").textContent =
    `${total}명`;

  document.getElementById("adminUsers").textContent =
    `${adminCount}명`;
}

onAuthStateChanged(auth, async(user)=>{

  if(!user){
    alert("로그인이 필요합니다.");
    location.href = "login.html";
    return;
  }

  loadUsers();
});