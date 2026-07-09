import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, onAuthStateChanged, deleteUser } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

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
const maxBannerImages = 4;
const bannerAutoDelay = 4200;
const adminIds = new Set(["cherryruri"]);

let currentUser = null;
let profileState = null;
let shell = null;
let bannerState = {
  images: [],
  activeIndex: 0,
  timer: null,
  touchStartX: 0,
  touchEndX: 0
};

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
  renderBannerSection();

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    currentUser = user;
    root.style.display = "block";
    await loadProfile(user);
    await loadBannerImages();
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

      <section class="mobile-banner-section" id="mobileBannerSection" aria-label="이벤트 배너">
        <div class="mobile-promo-card mobile-promo-slider" id="mobileBannerSlider">
          <div class="mobile-promo-track" id="mobileBannerTrack"></div>
          <div class="mobile-promo-dots" id="mobileBannerDots" aria-label="배너 선택"></div>
        </div>
        <button type="button" class="mobile-banner-edit-button" id="mobileBannerEdit" hidden>변경하기</button>
        <div class="mobile-banner-admin" id="mobileBannerAdmin" hidden>
          <div class="mobile-banner-admin-top">
            <strong class="mobile-banner-title">배너 이미지</strong>
            <span class="mobile-banner-count" id="mobileBannerCount">0/4</span>
            <button type="button" class="mobile-banner-add-button" id="mobileBannerAdd">이미지 추가</button>
          </div>
          <input type="file" id="mobileBannerInput" accept="image/*" multiple hidden>
          <p class="mobile-banner-note">최대 4장까지 등록할 수 있어요. 등록한 이미지는 회원에게도 보입니다.</p>
          <div class="mobile-banner-list" id="mobileBannerList"></div>
          <button type="button" class="mobile-banner-close-button" id="mobileBannerClose">닫기</button>
        </div>
      </section>

      <div class="mobile-action-grid">
        <a class="mobile-action-card mobile-inquiry-card" id="mobileInquiryCard" href="board.html?board=request&category=request&scope=mine">
          <strong id="mobileInquiryTitle">나의 1:1 문의</strong>
          <span class="mobile-inquiry-new" id="mobileInquiryBadge" hidden>NEW</span>
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

  shell.querySelector("#mobileBannerEdit")?.addEventListener("click", toggleBannerAdmin);
  shell.querySelector("#mobileBannerAdd")?.addEventListener("click", () => shell.querySelector("#mobileBannerInput")?.click());
  shell.querySelector("#mobileBannerInput")?.addEventListener("change", handleBannerUpload);
  shell.querySelector("#mobileBannerClose")?.addEventListener("click", () => {
    const admin = shell.querySelector("#mobileBannerAdmin");
    if (admin) admin.hidden = true;
  });

  const slider = shell.querySelector("#mobileBannerSlider");
  slider?.addEventListener("touchstart", handleBannerTouchStart, { passive: true });
  slider?.addEventListener("touchend", handleBannerTouchEnd);

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
    photo: data.photoDataUrl || data.profileImage || user.photoURL || "",
    isAdmin: isAdminUser(data, user)
  };
}

async function loadBannerImages() {
  try {
    const snap = await getDoc(getBannerDocRef());
    const data = snap.exists() ? snap.data() : {};
    const images = Array.isArray(data.images) ? data.images : [];
    bannerState.images = images
      .map((item) => typeof item === "string" ? item : item?.src)
      .filter((src) => typeof src === "string" && src.startsWith("data:image/"))
      .slice(0, maxBannerImages);
    bannerState.activeIndex = Math.min(bannerState.activeIndex, Math.max(0, bannerState.images.length - 1));
  } catch (error) {
    console.warn("배너 이미지를 불러오지 못했습니다.", error);
    bannerState.images = await getFallbackBannerImages();
    bannerState.activeIndex = 0;
  }
}

function getBannerDocRef() {
  return doc(db, "siteSettings", "mobileMypageBanners");
}

function getUserId(user) {
  const email = user.email || "";
  return email.includes("@") ? email.split("@")[0] : (user.displayName || "회원");
}

function toTitleCase(value) {
  if (!value) return "회원";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isAdminUser(data, user) {
  const userId = getUserId(user).toLowerCase();
  const dataId = String(data.id || data.userId || "").toLowerCase();
  return (
    adminIds.has(userId) ||
    adminIds.has(dataId) ||
    data.role === "admin" ||
    data.isAdmin === true ||
    data.admin === true ||
    data.permission === "admin"
  );
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
  syncInquiryCard();
  renderBannerSection();
}

function syncInquiryCard() {
  if (!shell || !profileState) return;

  const card = shell.querySelector("#mobileInquiryCard");
  const title = shell.querySelector("#mobileInquiryTitle");
  const badge = shell.querySelector("#mobileInquiryBadge");
  const isAdmin = !!profileState.isAdmin;

  if (card) {
    card.href = isAdmin
      ? "board.html?board=request&category=request&scope=all"
      : "board.html?board=request&category=request&scope=mine";
  }

  if (title) {
    title.textContent = isAdmin ? "회원 1:1 문의" : "나의 1:1 문의";
  }

  if (badge) badge.hidden = true;

  if (!isAdmin) {
    refreshInquiryBadge();
  }
}

async function refreshInquiryBadge() {
  if (!currentUser || !shell || !profileState || profileState.isAdmin) return;

  const badge = shell.querySelector("#mobileInquiryBadge");
  if (!badge) return;

  try {
    const snap = await getDocs(collection(db, "boards"));
    let unreadCount = 0;

    snap.forEach((docSnap) => {
      const post = docSnap.data();
      if (!isRequestPost(post) || !isPostOwner(post) || !hasRequestAnswer(post)) return;

      const answeredAt = getRequestAnswerMarker(post);
      const readAt = Number(localStorage.getItem(getRequestReadKey(docSnap.id)) || 0);
      if (answeredAt > readAt) unreadCount += 1;
    });

    badge.hidden = unreadCount === 0;
    badge.textContent = unreadCount > 1 ? `NEW ${unreadCount}` : "NEW";
  } catch (error) {
    console.warn("1:1 문의 알림을 확인하지 못했습니다.", error);
    badge.hidden = true;
  }
}

function isRequestPost(post) {
  if (!post) return false;
  if (post.category === "request") return true;
  return post.board === "free" && (post.isSecret || post.isPublic === false);
}

function isPostOwner(post) {
  if (!currentUser || !post) return false;

  const email = currentUser.email || "";
  const userId = email.includes("@") ? email.split("@")[0] : "";

  return (
    post.writerUid === currentUser.uid ||
    post.writerEmail === email ||
    post.email === email ||
    post.writerId === userId ||
    post.writer === userId
  );
}

function hasRequestAnswer(post) {
  return !!(post && (post.isAnswered || post.answer || post.answerText || post.answeredAt));
}

function getRequestReadKey(id) {
  return `healthboyRequestRead:${currentUser?.uid || "guest"}:${id}`;
}

function getRequestAnswerMarker(post) {
  return (
    getTimestampMs(post.answeredAt) ||
    getTimestampMs(post.updatedAt) ||
    getTimestampMs(post.createdAt) ||
    1
  );
}

function getTimestampMs(value) {
  if (!value) return 0;
  if (value.toDate) return value.toDate().getTime();
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
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

function renderBannerSection() {
  if (!shell) return;

  const editButton = shell.querySelector("#mobileBannerEdit");
  if (editButton) editButton.hidden = !profileState?.isAdmin;

  renderBannerSlides();
  renderBannerAdmin();
  startBannerTimer();
}

function renderBannerSlides() {
  if (!shell) return;

  const track = shell.querySelector("#mobileBannerTrack");
  const dots = shell.querySelector("#mobileBannerDots");
  if (!track || !dots) return;

  const images = bannerState.images;

  if (images.length > 0) {
    track.innerHTML = images.map((src, index) => `
      <div class="mobile-promo-slide" aria-label="배너 ${index + 1}">
        <img src="${src}" alt="이벤트 배너 ${index + 1}">
      </div>
    `).join("");
  } else {
    track.innerHTML = `
      <div class="mobile-promo-slide mobile-promo-empty" aria-label="기본 이벤트 배너">
        <span>3월 봄맞이 세탁해봄</span>
        <strong>아우터, 침구류<br>무제한 할인 중!</strong>
        <div class="mobile-promo-basket" aria-hidden="true"><i class="mobile-promo-discount">20%</i></div>
      </div>
    `;
  }

  const dotCount = Math.max(1, images.length);
  dots.innerHTML = Array.from({ length: dotCount }, (_, index) => `
    <button type="button" class="mobile-promo-dot" data-banner-dot="${index}" aria-label="${index + 1}번째 배너"></button>
  `).join("");

  dots.querySelectorAll("[data-banner-dot]").forEach((button) => {
    button.addEventListener("click", () => goToBanner(Number(button.dataset.bannerDot)));
  });

  goToBanner(bannerState.activeIndex, false);
}

function renderBannerAdmin() {
  if (!shell) return;

  const adminPanel = shell.querySelector("#mobileBannerAdmin");
  const count = shell.querySelector("#mobileBannerCount");
  const addButton = shell.querySelector("#mobileBannerAdd");
  const list = shell.querySelector("#mobileBannerList");

  if (!adminPanel || !count || !addButton || !list) return;

  const isAdmin = !!profileState?.isAdmin;
  if (!isAdmin) adminPanel.hidden = true;

  count.textContent = `${bannerState.images.length}/${maxBannerImages}`;
  addButton.disabled = !isAdmin || bannerState.images.length >= maxBannerImages;

  if (bannerState.images.length === 0) {
    list.innerHTML = `<div class="mobile-banner-empty">등록된 배너 이미지가 없습니다.</div>`;
    return;
  }

  list.innerHTML = bannerState.images.map((src, index) => `
    <div class="mobile-banner-item">
      <img class="mobile-banner-thumb" src="${src}" alt="배너 ${index + 1}">
      <span class="mobile-banner-label">배너 이미지 ${index + 1}</span>
      <button type="button" class="mobile-banner-delete-button" data-delete-banner="${index}">삭제</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-delete-banner]").forEach((button) => {
    button.addEventListener("click", () => deleteBannerImage(Number(button.dataset.deleteBanner)));
  });
}

function toggleBannerAdmin() {
  if (!assertBannerAdmin()) return;

  const admin = shell.querySelector("#mobileBannerAdmin");
  if (!admin) return;

  admin.hidden = !admin.hidden;
  renderBannerAdmin();
}

async function handleBannerUpload(event) {
  if (!assertBannerAdmin()) return;

  const input = event.target;
  const files = Array.from(input.files || []);
  const available = maxBannerImages - bannerState.images.length;

  if (available <= 0) {
    alert("배너 이미지는 최대 4장까지 등록할 수 있습니다.");
    input.value = "";
    return;
  }

  const selected = files.slice(0, available);
  if (selected.length < files.length) {
    alert("최대 4장까지만 등록됩니다.");
  }

  try {
    const encoded = [];
    for (const file of selected) {
      encoded.push(await resizeBannerImage(file));
    }

    bannerState.images = [...bannerState.images, ...encoded].slice(0, maxBannerImages);
    bannerState.activeIndex = Math.max(0, bannerState.images.length - encoded.length);
    await saveBannerImages();
    renderBannerSection();
    alert("배너 이미지가 등록되었습니다.");
  } catch (error) {
    console.error(error);
    alert("배너 이미지를 저장하지 못했습니다. 다른 이미지를 다시 시도해주세요.");
  } finally {
    input.value = "";
  }
}

async function deleteBannerImage(index) {
  if (!assertBannerAdmin()) return;
  if (!Number.isInteger(index) || index < 0 || index >= bannerState.images.length) return;
  if (!confirm("이 배너 이미지를 삭제할까요?")) return;

  try {
    bannerState.images.splice(index, 1);
    bannerState.activeIndex = Math.min(bannerState.activeIndex, Math.max(0, bannerState.images.length - 1));
    await saveBannerImages();
    renderBannerSection();
  } catch (error) {
    console.error(error);
    alert("배너 이미지를 삭제하지 못했습니다.");
  }
}

async function saveBannerImages() {
  if (!currentUser || !profileState?.isAdmin) return;

  const payload = {
    images: bannerState.images,
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.uid
  };

  try {
    await setDoc(getBannerDocRef(), payload, { merge: true });
  } catch (error) {
    console.warn("공용 배너 저장 실패, 사용자 백업으로 저장합니다.", error);

    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        mobileMypageBanners: payload
      }, { merge: true });
    } catch (backupError) {
      console.warn("사용자 배너 백업 저장 실패, 로컬 백업만 사용합니다.", backupError);
    }
  }

  try {
    localStorage.setItem("healthboyMobileMypageBanners", JSON.stringify(payload));
  } catch (error) {
    console.warn("배너 로컬 백업 저장 실패", error);
  }
}

function resizeBannerImage(file) {
  return new Promise((resolve, reject) => {
    const imageName = file?.name || "";
    const imageType = file?.type || "";
    const looksLikeImage = /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(imageName);

    if (!file || (!imageType.startsWith("image/") && !looksLikeImage)) {
      reject(new Error("이미지 파일만 등록할 수 있습니다."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const width = 760;
        const height = 320;
        const scale = Math.max(width / image.width, height / image.height);
        const drawWidth = Math.ceil(image.width * scale);
        const drawHeight = Math.ceil(image.height * scale);
        const offsetX = Math.round((width - drawWidth) / 2);
        const offsetY = Math.round((height - drawHeight) / 2);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

        resolve(canvas.toDataURL("image/jpeg", 0.68));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getFallbackBannerImages() {
  if (currentUser) {
    try {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      const data = snap.exists() ? snap.data() : {};
      const images = data.mobileMypageBanners?.images;

      if (Array.isArray(images)) {
        return images.slice(0, maxBannerImages);
      }
    } catch (error) {
      console.warn("사용자 배너 백업 불러오기 실패", error);
    }
  }

  try {
    const raw = localStorage.getItem("healthboyMobileMypageBanners");
    const data = raw ? JSON.parse(raw) : null;
    return Array.isArray(data?.images) ? data.images.slice(0, maxBannerImages) : [];
  } catch (error) {
    return [];
  }
}

function assertBannerAdmin() {
  if (profileState?.isAdmin) return true;
  alert("관리자만 배너를 수정할 수 있습니다.");
  return false;
}

function handleBannerTouchStart(event) {
  bannerState.touchStartX = event.changedTouches[0]?.clientX || 0;
  bannerState.touchEndX = bannerState.touchStartX;
}

function handleBannerTouchEnd(event) {
  bannerState.touchEndX = event.changedTouches[0]?.clientX || bannerState.touchStartX;
  const distance = bannerState.touchStartX - bannerState.touchEndX;

  if (Math.abs(distance) < 36 || bannerState.images.length <= 1) return;
  goToBanner(distance > 0 ? bannerState.activeIndex + 1 : bannerState.activeIndex - 1);
}

function startBannerTimer() {
  window.clearInterval(bannerState.timer);
  if (bannerState.images.length <= 1) return;

  bannerState.timer = window.setInterval(() => {
    goToBanner(bannerState.activeIndex + 1, false);
  }, bannerAutoDelay);
}

function goToBanner(index, restartTimer = true) {
  const count = Math.max(1, bannerState.images.length);
  bannerState.activeIndex = ((index % count) + count) % count;

  const track = shell?.querySelector("#mobileBannerTrack");
  if (track) {
    track.style.transform = `translateX(-${bannerState.activeIndex * 100}%)`;
  }

  shell?.querySelectorAll("[data-banner-dot]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.bannerDot) === bannerState.activeIndex);
  });

  if (restartTimer) startBannerTimer();
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
