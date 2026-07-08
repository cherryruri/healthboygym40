import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, onAuthStateChanged, deleteUser } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

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
const mobileQuery = window.matchMedia("(max-width: 768px)");

let currentUser = null;
let profileState = null;
let shell = null;

const icons = {
  folder: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
      <path fill="#ffae42" d="M21 27h56l14 16h62c14 0 25 11 25 25v36H21z"/>
      <path fill="#ffc93d" d="M39 56h126c11 0 19 10 16 21l-11 35H18l17-46c2-6 3-10 4-10z"/>
    </svg>`),
  grayChat: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
      <path fill="#b5bfcc" d="M24 25h116c22 0 39 17 39 39s-17 39-39 39H90l-25 16c-4 3-9 0-8-5l2-11H24C11 103 1 93 1 80V48c0-13 10-23 23-23z"/>
      <circle cx="59" cy="64" r="8" fill="#fff"/>
      <circle cx="91" cy="64" r="8" fill="#fff"/>
      <circle cx="123" cy="64" r="8" fill="#fff"/>
    </svg>`),
  orangeChat: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 130">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#ffbd49"/>
          <stop offset="1" stop-color="#ff9417"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#ffcd5b"/>
          <stop offset="1" stop-color="#ff8f13"/>
        </linearGradient>
      </defs>
      <path fill="url(#g1)" d="M28 21h76c25 0 45 20 45 45s-20 45-45 45H67l-40 15 14-31c-11-8-18-20-18-34 0-22 17-40 39-40z"/>
      <path fill="url(#g2)" d="M79 39h59c23 0 41 17 41 39s-18 39-41 39h-21l-34 12 11-25c-12-7-19-18-19-31 0-19 14-34 34-34z" opacity="0.96"/>
      <circle cx="103" cy="78" r="7" fill="#fff"/>
      <circle cx="127" cy="78" r="7" fill="#fff"/>
      <circle cx="151" cy="78" r="7" fill="#fff"/>
    </svg>`)
};

const pencilIcon = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m13.5 6.5 4 4" stroke="currentColor" stroke-linecap="round"/>
  </svg>`;

function svgData(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function startMobileMypage() {
  if (!mobileQuery.matches) return;

  const root = document.getElementById("mypageRoot");
  if (!root || root.querySelector(".mobile-mypage-shell")) return;

  document.body.classList.add("mobile-mypage-ready");

  shell = document.createElement("section");
  shell.className = "mobile-mypage-shell";
  shell.setAttribute("aria-label", "모바일 마이페이지");
  shell.innerHTML = getShellMarkup();
  root.insertBefore(shell, root.firstChild);

  attachEvents(root);

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    currentUser = user;
    root.style.display = "block";
    await loadProfile(user);
    syncShell();
  });
}

function getShellMarkup() {
  return `
    <section class="mobile-mypage-page mobile-mypage-home" data-mobile-panel="home">
      <div class="mobile-profile-head">
        <button type="button" class="mobile-profile-avatar" id="mobileAvatarButton" aria-label="프로필 사진 변경">
          <img id="mobileProfilePhoto" alt="" hidden>
          <span class="mobile-profile-camera" aria-hidden="true"></span>
        </button>
        <h1 class="mobile-profile-name" id="mobileProfileNameText">회원님</h1>
      </div>

      <div class="mobile-notice-pill">
        <strong>[공지]</strong>
        <span>지금부터 바로 운동 시작하세요! 이벤트</span>
      </div>

      <div class="mobile-promo-card" aria-label="이벤트 배너">
        <span>3월 봄맞이 세탁해봄</span>
        <strong>아우터, 침구류<br>무제한 할인 중!</strong>
        <div class="mobile-promo-basket" aria-hidden="true"><i class="mobile-promo-discount">20%</i></div>
        <div class="mobile-promo-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      </div>

      <div class="mobile-action-grid">
        <a class="mobile-action-card mobile-inquiry-card" href="board.html?board=free&category=request">
          <strong>나의 1:1 문의</strong>
          <img src="${icons.orangeChat}" alt="">
        </a>
        <a class="mobile-action-card" href="my-posts.html">
          <strong>내가 쓴 게시물</strong>
          <img src="${icons.folder}" alt="">
        </a>
        <a class="mobile-action-card" href="my-comments.html">
          <strong>내가 쓴 댓글</strong>
          <img src="${icons.grayChat}" alt="">
        </a>
      </div>

      <div class="mobile-mypage-actions">
        <button type="button" class="mobile-text-button" id="mobileOpenProfileEdit">개인정보 수정하기</button>
        <button type="button" class="mobile-text-button" id="mobileDeleteAccount">탈퇴하기</button>
      </div>
    </section>

    <section class="mobile-mypage-page mobile-mypage-edit" data-mobile-panel="edit" hidden>
      <section class="mobile-edit-section">
        <h2 class="mobile-edit-title">개인 정보</h2>
        <div class="mobile-edit-line"></div>
        ${fieldRow("이름", "mobileEditName", "text", false)}
        ${fieldRow("번호", "mobileEditPhone", "tel", false)}
        ${fieldRow("이메일", "mobileEditEmail", "email", true)}
      </section>

      <section class="mobile-edit-section">
        <h2 class="mobile-edit-title">회원 정보</h2>
        <div class="mobile-edit-line"></div>
        <div class="mobile-form-row">
          <span class="mobile-form-label">회원 여부</span>
          <div class="mobile-static-field" id="mobileMemberText">관리자 승인 필요합니다.</div>
        </div>
        <div class="mobile-form-row">
          <span class="mobile-form-label">선택 종목</span>
          <div class="mobile-program-options" role="group" aria-label="선택 종목">
            <button type="button" class="mobile-program-option is-active" data-program="health">헬스</button>
            <button type="button" class="mobile-program-option" data-program="pilates">필라테스</button>
          </div>
        </div>
        ${fieldRow("아이디", "mobileEditId", "text", true)}
        ${fieldRow("비밀번호", "mobileEditPassword", "text", true, "mobilePasswordChange")}
        <div class="mobile-save-wrap">
          <button type="button" class="mobile-save-button" id="mobileSaveProfile">수정 하기</button>
        </div>
      </section>
    </section>
  `;
}

function fieldRow(label, id, type, readonly, actionId = "") {
  return `
    <div class="mobile-form-row">
      <label class="mobile-form-label" for="${id}">${label}</label>
      <div class="mobile-field">
        <input id="${id}" type="${type}" ${readonly ? "readonly" : ""}>
        <button type="button" class="mobile-field-edit" ${actionId ? `id="${actionId}"` : ""} data-focus-target="${id}" aria-label="${label} 수정">${pencilIcon}</button>
      </div>
    </div>`;
}

function attachEvents(root) {
  shell.querySelector("#mobileOpenProfileEdit")?.addEventListener("click", () => {
    syncShell();
    showPanel("edit");
  });

  shell.querySelector("#mobileSaveProfile")?.addEventListener("click", handleSaveProfile);
  shell.querySelector("#mobileDeleteAccount")?.addEventListener("click", handleDeleteAccount);

  shell.querySelector("#mobileAvatarButton")?.addEventListener("click", () => {
    document.getElementById("profileImageInput")?.click();
  });

  shell.querySelectorAll("[data-focus-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-focus-target");
      if (targetId === "mobileEditPassword") {
        location.href = "change-password.html";
        return;
      }
      const input = shell.querySelector(`#${targetId}`);
      if (input && !input.readOnly) input.focus();
    });
  });

  shell.querySelectorAll(".mobile-program-option").forEach((button) => {
    button.addEventListener("click", () => {
      if (!profileState) return;
      profileState.program = button.dataset.program || "health";
      syncProgramButtons();
    });
  });

  document.getElementById("profileImageInput")?.addEventListener("change", () => {
    window.setTimeout(async () => {
      if (!currentUser) return;
      await loadProfile(currentUser);
      syncShell();
    }, 1200);
  });

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.id === "deleteAccountBtn") handleDeleteAccount();
  });
}

async function loadProfile(user) {
  const userId = getUserId(user);
  let data = {};

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) data = snap.data() || {};
  } catch (error) {
    console.warn("프로필 정보를 불러오지 못했습니다.", error);
  }

  profileState = {
    uid: user.uid,
    email: user.email || "",
    homeName: userId,
    name: data.name || data.signupName || user.displayName || toTitleCase(userId),
    id: data.id || data.userId || toTitleCase(userId),
    phone: getPhone(data),
    memberText: getMemberText(data),
    program: getProgram(data),
    photo: data.photoDataUrl || data.profileImage || user.photoURL || ""
  };
}

function getUserId(user) {
  const email = user.email || "";
  return email.includes("@") ? email.split("@")[0] : (user.displayName || "회원");
}

function toTitleCase(value) {
  if (!value) return "회원";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getPhone(data) {
  if (data.phone) return data.phone;
  if (data.phone1 || data.phone2 || data.phone3) {
    return [data.phone1, data.phone2, data.phone3].filter(Boolean).join("-");
  }
  return "";
}

function getMemberText(data) {
  const status = String(data.memberStatus || data.approvalStatus || data.status || "").toLowerCase();
  if (data.isGymMember === "yes" || status === "approved") return "헬스보이짐 회원";
  return "관리자 승인 필요합니다.";
}

function getProgram(data) {
  const raw = String(data.program || data.selectedProgram || data.preferredProgram || data.membershipType || "").toLowerCase();
  if (raw.includes("pilates") || raw.includes("필라")) return "pilates";
  return "health";
}

function syncShell() {
  if (!shell || !profileState) return;

  setText("mobileProfileNameText", `${profileState.homeName}님`);
  setValue("mobileEditName", profileState.name);
  setValue("mobileEditPhone", profileState.phone);
  setValue("mobileEditEmail", profileState.email);
  setValue("mobileEditId", profileState.id);
  setValue("mobileEditPassword", "********");
  setText("mobileMemberText", profileState.memberText);
  syncProgramButtons();
  syncPhoto();
}

function syncPhoto() {
  const photo = shell.querySelector("#mobileProfilePhoto");
  if (!photo) return;

  if (profileState.photo) {
    photo.src = profileState.photo;
    photo.hidden = false;
  } else {
    photo.removeAttribute("src");
    photo.hidden = true;
  }
}

function syncProgramButtons() {
  if (!shell || !profileState) return;
  shell.querySelectorAll(".mobile-program-option").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.program === profileState.program);
  });
}

function setText(id, value) {
  const element = shell.querySelector(`#${id}`);
  if (element) element.textContent = value || "";
}

function setValue(id, value) {
  const element = shell.querySelector(`#${id}`);
  if (element) element.value = value || "";
}

function showPanel(name) {
  shell.querySelectorAll("[data-mobile-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.mobilePanel !== name;
  });
  document.body.classList.toggle("mobile-mypage-editing", name === "edit");
  window.scrollTo(0, 0);
}

async function handleSaveProfile() {
  if (!currentUser || !profileState) return;

  const button = shell.querySelector("#mobileSaveProfile");
  const name = shell.querySelector("#mobileEditName")?.value.trim() || profileState.name;
  const phone = shell.querySelector("#mobileEditPhone")?.value.trim() || "";
  const program = profileState.program || "health";

  button.disabled = true;

  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      name,
      phone,
      preferredProgram: program === "pilates" ? "필라테스" : "헬스",
      updatedAt: new Date().toISOString()
    }, { merge: true });

    profileState.name = name;
    profileState.phone = phone;
    profileState.program = program;
    updateDesktopFields(name, phone);
    syncShell();
    alert("수정되었습니다.");
    showPanel("home");
  } catch (error) {
    console.error(error);
    alert("수정 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    button.disabled = false;
  }
}

function updateDesktopFields(name, phone) {
  const desktopName = document.getElementById("infoName");
  const desktopPhone = document.getElementById("infoPhone");
  if (desktopName) desktopName.textContent = name;
  if (desktopPhone) desktopPhone.textContent = phone || "-";
}

async function handleDeleteAccount() {
  if (!currentUser) return;
  if (!confirm("정말 탈퇴하시겠습니까?")) return;

  try {
    await deleteDoc(doc(db, "users", currentUser.uid)).catch(() => {});
    await deleteUser(currentUser);
    alert("탈퇴가 완료되었습니다.");
    location.href = "index.html";
  } catch (error) {
    console.error(error);
    alert("보안을 위해 다시 로그인한 뒤 탈퇴를 진행해주세요.");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startMobileMypage);
} else {
  startMobileMypage();
}
