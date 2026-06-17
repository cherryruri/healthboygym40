import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userList = document.getElementById("userList");
const userSearch = document.getElementById("userSearch");
let loadedUsers = [];

function renderUsers(users){
  if(!userList) return;

  userList.innerHTML = "";

  users.forEach(user=>{
    const interests = Array.isArray(user.interests)
      ? user.interests.join(", ")
      : "-";

    const createdAt = user.createdAt?.toDate
      ? user.createdAt.toDate().toLocaleString("ko-KR")
      : "-";

    userList.innerHTML += `
      <div class="user-row user-item">
        <div>${user.name || "-"}</div>
        <div>${user.signupId || user.id || "-"}</div>
        <div>${user.phone || "-"}</div>
        <div>${interests}</div>
        <div>${createdAt}</div>
        <div class="${user.role === "admin" ? "role-admin" : "role-user"}">
          ${user.role || "user"}
        </div>
      </div>
    `;
  });
}

async function loadUsers(){
  const snap = await getDocs(collection(db, "users"));

  loadedUsers = [];

  snap.forEach(docSnap => {

    const user = docSnap.data();

    loadedUsers.push(user);
  });

  document.getElementById("totalUsers").textContent = `${loadedUsers.length}명`;
  document.getElementById("adminUsers").textContent =
    `${loadedUsers.filter(user=>user.role === "admin").length}명`;

  renderUsers(loadedUsers);
}

onAuthStateChanged(auth, async (user) => {

  if(!user){
    alert("로그인이 필요합니다.");
    location.href = "login.html";
    return;
  }

  const mySnap = await getDoc(doc(db, "users", user.uid));
  const myData = mySnap.exists() ? mySnap.data() : null;

  if(!myData || myData.role !== "admin"){
    alert("관리자만 접근할 수 있습니다.");
    location.href = "mypage.html";
    return;
  }

  await loadUsers();
});

if(userSearch){
  userSearch.addEventListener("input", ()=>{
    const keyword = userSearch.value.trim().toLowerCase();

    if(!keyword){
      renderUsers(loadedUsers);
      return;
    }

    renderUsers(
      loadedUsers.filter(user=>{
        const haystack = [
          user.name,
          user.signupName,
          user.signupId,
          user.id,
          user.phone,
          Array.isArray(user.interests) ? user.interests.join(" ") : ""
        ].join(" ").toLowerCase();

        return haystack.includes(keyword);
      })
    );
  });
}
