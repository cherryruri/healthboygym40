import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { authReady } from "./firebase-index.js?v=verified-admin-menu";
import { bookingUrl, loadPromotions, promotionCollection } from "./promotions.js";

const access = document.querySelector("#access");
const manager = document.querySelector("#manager");
const form = document.querySelector("#popup-form");
const name = document.querySelector("#popup-title");
const url = document.querySelector("#popup-url");
const file = document.querySelector("#popup-image");
const preview = document.querySelector("#popup-preview");
const list = document.querySelector("#popup-list");
const status = document.querySelector("#manager-status");
const cancel = document.querySelector("#cancel-edit");
let editing = null;
let previewUrl;

function showPreview(source = "") {
  preview.hidden = !source;
  if (source) preview.src = source;
  else preview.removeAttribute("src");
}

function resetForm(popup = null) {
  editing = popup;
  form.reset();
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = undefined;
  name.value = popup?.title ?? "";
  url.value = popup?.url ?? "";
  file.required = !popup;
  cancel.hidden = !popup;
  document.querySelector("#form-title").textContent = popup ? "팝업 수정" : "팝업 추가";
  showPreview(popup?.image);
}

file.addEventListener("change", () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = file.files[0] ? URL.createObjectURL(file.files[0]) : undefined;
  showPreview(previewUrl || editing?.image);
});
cancel.addEventListener("click", () => resetForm());

async function encodeImage(upload) {
  const source = URL.createObjectURL(upload);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    for (const maximum of [1200, 960, 720, 540]) {
      const scale = Math.min(1, maximum / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.fillStyle = "#111";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const encoded = canvas.toDataURL("image/jpeg", 0.84);
      if (encoded.length <= 490000) return encoded;
    }
    throw new Error("이미지 용량이 너무 큽니다.");
  } finally {
    URL.revokeObjectURL(source);
  }
}

async function refresh() {
  const active = (await loadPromotions()).filter(popup => !popup.archived);
  list.replaceChildren();
  if (!active.length) list.textContent = "게시 중인 팝업이 없습니다.";
  for (const popup of active) {
    const row = document.createElement("article");
    row.className = "popup-manager-row";
    const thumbnail = document.createElement("img");
    thumbnail.src = popup.image;
    thumbnail.alt = "";
    const title = document.createElement("strong");
    title.textContent = popup.title;
    const actions = document.createElement("div");
    actions.className = "popup-manager-actions";
    const edit = document.createElement("button");
    edit.textContent = "수정";
    edit.addEventListener("click", () => {
      resetForm(popup);
      name.focus();
    });
    const remove = document.createElement("button");
    remove.textContent = "삭제";
    remove.addEventListener("click", () => {
      if (!confirm(popup.title + " 팝업을 홈페이지에서 내릴까요? 클릭 기록은 방문 통계에 남습니다.")) return;
      const { id, ...data } = popup;
      void save(id, { ...data, archived: true }, "팝업을 홈페이지에서 내렸습니다.");
    });
    actions.append(edit, remove);
    row.append(thumbnail, title, actions);
    list.append(row);
  }
}

async function save(id, data, message) {
  manager.inert = true;
  access.hidden = false;
  access.textContent = "저장 중…";
  status.textContent = "";
  try {
    const fields = await data;
    await setDoc(doc(promotionCollection, id), fields);
    resetForm();
    try {
      await refresh();
      status.textContent = message;
    } catch {
      status.textContent = message + " 목록을 다시 보려면 새로고침해 주세요.";
    }
  } catch {
    status.textContent = "저장하지 못했습니다. 이미지나 연결 상태를 확인하고 다시 시도해 주세요.";
  } finally {
    access.hidden = true;
    manager.inert = false;
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = name.value.trim();
  const link = bookingUrl(url.value.trim());
  if (!title || !link) {
    status.textContent = "팝업 이름과 네이버 예약 페이지 주소를 입력해 주세요.";
    (title ? url : name).focus();
    return;
  }
  const upload = file.files[0];
  const popup = editing;
  const data = (async () => ({
    title, url: link, archived: false,
    image: upload ? await encodeImage(upload) : popup.image,
    theme: upload ? "" : popup.theme
  }))();
  void save(popup?.id || "promo-" + crypto.randomUUID(), data, "팝업을 게시했습니다.");
});

const { verifiedAdmin } = await authReady;
if (verifiedAdmin) {
  try {
    await refresh();
    resetForm();
    manager.hidden = false;
    access.hidden = true;
  } catch {
    access.textContent = "팝업 목록을 불러오지 못했습니다. 새로고침해 주세요.";
  }
} else {
  access.textContent = "관리자 계정으로 로그인하면 팝업을 관리할 수 있습니다.";
}
