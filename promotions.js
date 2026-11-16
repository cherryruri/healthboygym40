import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { db } from "./firebase-index.js?v=verified-admin-menu";

const defaults = [
  { id: "pilates", title: "필라테스 체험", image: "home-pilates-trial.jpg", theme: "pilates",
    url: "https://m.booking.naver.com/booking/6/bizes/593585/items/6528116?area=pll&lang=ko&startDate=2026-11-12&theme=place" },
  { id: "exam-discount", title: "수험생 할인", image: "home-exam-discount.png", theme: "exam",
    url: "https://m.booking.naver.com/booking/6/bizes/593585/items/8206620?area=pll&lang=ko&startDate=2026-11-16&theme=place" }
];

export const promotionCollection = collection(db, "homePromotions");

export function bookingUrl(value) {
  try {
    const url = new URL(value);
    if (url.origin === "https://m.booking.naver.com" && /^\/booking\/\d+\/bizes\/\d+(?:\/items\/\d+)?\/?$/.test(url.pathname)) return url.href;
  } catch {}
  return "";
}

export async function loadPromotions() {
  const snapshot = await getDocs(promotionCollection);
  const promotions = new Map(defaults.map(promotion => [promotion.id, { ...promotion, archived: false }]));
  const entries = snapshot.docs.sort((a, b) => a.id.localeCompare(b.id));
  for (const item of entries) {
    const data = item.data();
    promotions.set(item.id, { ...data, id: item.id, url: bookingUrl(data.url) });
  }
  return [...promotions.values()];
}
