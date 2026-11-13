import { collection, doc, getCountFromServer, query, serverTimestamp, setDoc, where } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { authReady, db } from "./firebase-index.js?v=verified-admin-menu";

const dateFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' });
export const todayInSeoul = () => dateFormat.format(new Date());
const browserKey = 'hbg-traffic-browser';
const pending = new Map();
let browserId;

export async function recordTraffic(kind) {
  if ((await authReady).isAdmin) return;
  const day = todayInSeoul();
  const marker = 'hbg-traffic-' + kind;
  try {
    if (localStorage.getItem(marker) === day) return;
    browserId ||= localStorage.getItem(browserKey) || crypto.randomUUID();
    localStorage.setItem(browserKey, browserId);
  } catch {
    browserId ||= crypto.randomUUID();
  }

  if (!pending.has(marker)) {
    pending.set(marker, setDoc(doc(db, 'trafficEvents', kind, 'events', day + '_' + browserId), {
      createdAt: serverTimestamp()
    }).then(() => {
      try { localStorage.setItem(marker, day); } catch {}
    }).catch(error => {
      if (error.code !== 'permission-denied') console.warn('Traffic recording failed', error);
    }).finally(() => pending.delete(marker)));
  }
  return pending.get(marker);
}

export async function countTraffic(kind, day) {
  const start = new Date(day + 'T00:00:00+09:00');
  const end = new Date(start.getTime() + 86400000);
  const records = collection(db, 'trafficEvents', kind, 'events');
  const result = await getCountFromServer(query(records, where('createdAt', '>=', start), where('createdAt', '<', end)));
  return result.data().count;
}
