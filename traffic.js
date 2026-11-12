import { collection, getDocsFromServer, query, where } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { authReady, db } from "./firebase-index.js?v=20261112-admin";
import { todayInSeoul } from "./site-traffic.js?v=1";

const dashboard = document.querySelector("#dashboard");
const access = document.querySelector("#access");
const charts = document.querySelector("#traffic-charts");
const status = document.querySelector("#traffic-status");
const next = document.querySelector("#next");
const period = document.querySelector("#period");
const modes = document.querySelector(".traffic-modes");
const metrics = [
  ["visit", "사이트 방문"],
  ["new-member", "신규 회원 이벤트 클릭"],
  ["pilates", "필라테스 예약 클릭"]
];

const seoulOffset = 9 * 60 * 60 * 1000;
const number = new Intl.NumberFormat("ko-KR");
let mode = "day";
let cursor;
let generation = 0;

function periodStart(unit, date, delta = 0) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  if (unit === "month") return new Date(Date.UTC(year + delta, 0, 1));
  if (unit === "day") return new Date(Date.UTC(year, month + delta, 1));
  return new Date(Date.UTC(year, month, day + delta));
}

function periodLabel(date) {
  const year = date.getUTCFullYear() + "년";
  const month = (date.getUTCMonth() + 1) + "월";
  if (mode === "month") return year;
  if (mode === "day") return year + " " + month;
  return year + " " + month + " " + date.getUTCDate() + "일";
}

function bucketLabel(index) {
  if (mode === "hour") return String(index).padStart(2, "0") + "시";
  return (index + 1) + (mode === "day" ? "일" : "월");
}

async function readMetric(kind, unit, start, end) {
  const size = unit === "hour" ? 24 : unit === "day" ? new Date(end - 1).getUTCDate() : 12;
  const counts = Array(size).fill(0);
  const events = collection(db, "trafficEvents", kind, "events");
  const result = await getDocsFromServer(query(events,
    where("createdAt", ">=", new Date(start.getTime() - seoulOffset)),
    where("createdAt", "<", new Date(end.getTime() - seoulOffset))));
  result.forEach(event => {
    const date = new Date(event.data().createdAt.toMillis() + seoulOffset);
    const index = unit === "hour" ? date.getUTCHours() : unit === "day" ? date.getUTCDate() - 1 : date.getUTCMonth();
    counts[index]++;
  });
  return counts;
}

function renderMetric(kind, title, result) {
  const card = document.createElement("section");
  card.className = "traffic-card";
  card.dataset.metric = kind;
  const heading = document.createElement("h2");
  heading.textContent = title;
  card.append(heading);
  if (result.status === "rejected") {
    const error = document.createElement("p");
    error.textContent = "집계 데이터를 불러오지 못했습니다.";
    card.append(error);
    return card;
  }

  const counts = result.value;
  const total = document.createElement("strong");
  total.className = "traffic-total";
  total.textContent = number.format(counts.reduce((sum, count) => sum + count, 0)) + "회";
  const plot = document.createElement("ul");
  plot.className = "traffic-plot";
  plot.setAttribute("aria-label", title + " 그래프");
  const max = Math.max(1, ...counts);
  counts.forEach((count, index) => {
    const bar = document.createElement("li");
    const label = bucketLabel(index);
    const caption = label + " · " + number.format(count) + "회";
    bar.title = caption;
    bar.setAttribute("aria-label", caption);
    bar.style.setProperty("--bar-height", (100 * count / max) + "%");
    const value = document.createElement("span");
    value.className = "traffic-bar-value";
    value.textContent = count ? number.format(count) : "";
    const tick = document.createElement("span");
    tick.className = "traffic-tick";
    tick.textContent = label;
    bar.append(value, tick);
    plot.append(bar);
  });
  card.append(total, plot);
  return card;
}

async function refresh() {
  const request = ++generation;
  const end = periodStart(mode, cursor, 1);
  const today = new Date(todayInSeoul() + "T00:00:00Z");
  next.disabled = end > today;
  period.textContent = periodLabel(cursor);
  status.textContent = "집계 중…";
  charts.replaceChildren();
  const results = await Promise.allSettled(metrics.map(([kind]) => readMetric(kind, mode, cursor, end)));
  if (request !== generation) return;
  charts.replaceChildren(...metrics.map(([kind, title], index) => renderMetric(kind, title, results[index])));
  status.textContent = "";
}

const { verifiedAdmin } = await authReady;
if (verifiedAdmin) {
  access.hidden = true;
  dashboard.hidden = false;
  cursor = periodStart(mode, new Date(todayInSeoul() + "T00:00:00Z"));
  modes.addEventListener("click", event => {
    const button = event.target.closest("[data-mode]");
    if (!button || button.dataset.mode === mode) return;
    mode = button.dataset.mode;
    const today = new Date(todayInSeoul() + "T00:00:00Z");
    cursor = periodStart(mode, today);
    modes.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    void refresh();
  });
  document.querySelector("#previous").addEventListener("click", () => {
    cursor = periodStart(mode, cursor, -1);
    void refresh();
  });
  next.addEventListener("click", () => {
    cursor = periodStart(mode, cursor, 1);
    void refresh();
  });
  void refresh();
} else {
  access.textContent = "관리자 계정으로 로그인하면 방문 통계를 볼 수 있습니다.";
}
