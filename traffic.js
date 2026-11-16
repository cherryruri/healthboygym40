import { collection, getDocsFromServer, query, where } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { authReady, db } from "./firebase-index.js?v=verified-admin-menu";
import { todayInSeoul } from "./site-traffic.js?v=verified-admin-menu";

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

function renderTrend(current, previous, start, prior) {
  const card = document.createElement("section");
  card.className = "traffic-card traffic-trend";
  const heading = document.createElement("h2");
  heading.textContent = "방문 추이";
  card.append(heading);
  if (current.status !== "fulfilled" || previous.status !== "fulfilled") {
    card.append("기간 비교를 불러오지 못했습니다.");
    return card;
  }

  const now = new Date(Date.now() + seoulOffset);
  const elapsed = mode === "hour" ? now.getUTCHours() + 1 :
    mode === "day" ? now.getUTCDate() : now.getUTCMonth() + 1;
  const selected = start.getTime() === periodStart(mode, now).getTime()
    ? current.value.slice(0, elapsed) : current.value;
  const series = [
    [previous.value, prior, "#efd5be"],
    [selected, start, "#ff8a42"]
  ];
  const size = Math.max(current.value.length, previous.value.length);
  const step = Math.max(1, Math.ceil(Math.max(...current.value, ...previous.value) / 4));
  const width = Math.max(620, size * 29 + 64);
  const x = i => 52 + i * (width - 76) / (size - 1);
  const y = value => 172 - value / (step * 4) * 144;
  const scroll = document.createElement("div");
  scroll.className = "traffic-line-scroll";
  scroll.tabIndex = 0;
  scroll.setAttribute("aria-label", "방문 추이 그래프");
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 " + width + " 202");
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", "선택 기간과 직전 기간의 방문 수");
  svg.style.minWidth = width + "px";

  function draw(tag, attributes, label, parent = svg) {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (label) node.textContent = label;
    parent.append(node);
    return node;
  }

  for (let i = 0; i <= 4; i++) {
    const value = i * step;
    draw("line", { x1: 52, x2: width - 20, y1: y(value), y2: y(value), class: "traffic-guide" });
    draw("text", { x: 44, y: y(value) + 4, "text-anchor": "end" }, number.format(value));
  }
  for (let i = 0; i < size; i++) {
    draw("text", { x: x(i), y: 194, "text-anchor": "middle" }, bucketLabel(i));
  }
  const legend = document.createElement("ul");
  legend.className = "traffic-line-legend";
  for (const [counts, date, color] of series) {
    draw("polyline", { points: counts.map((value, i) => [x(i), y(value)].join(",")).join(" "),
      fill: "none", stroke: color, "stroke-width": 2 });
    counts.forEach((value, i) => {
      const label = periodLabel(date) + " · " + bucketLabel(i) + " · " + number.format(value) + "회";
      const point = draw("circle", { cx: x(i), cy: y(value), r: 3.5, fill: color, "aria-label": label });
      draw("title", {}, label, point);
    });
    const item = document.createElement("li");
    item.style.setProperty("--series-color", color);
    item.textContent = periodLabel(date);
    legend.prepend(item);
  }
  scroll.append(svg);
  card.append(scroll, legend);
  return card;
}

function renderCalendar(results, start, end, today) {
  const card = document.createElement("section");
  card.className = "traffic-card traffic-calendar";
  const title = document.createElement("h2");
  title.textContent = "일별 통계 달력";
  const grid = document.createElement("div");
  grid.className = "traffic-calendar-grid";
  for (const day of ["일", "월", "화", "수", "목", "금", "토"]) {
    const header = document.createElement("span");
    header.textContent = day;
    grid.append(header);
  }
  for (let i = 0; i < start.getUTCDay(); i++) grid.append(document.createElement("span"));
  const detail = document.createElement("div");
  detail.className = "traffic-day-detail";
  detail.setAttribute("aria-live", "polite");
  const buttons = [];
  const days = new Date(end - 1).getUTCDate();
  const format = new Intl.NumberFormat("ko-KR", { style: "percent", maximumFractionDigits: 1 });

  function select(index) {
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    const date = document.createElement("h3");
    date.textContent = (start.getUTCMonth() + 1) + "월 " + (index + 1) + "일";
    const list = document.createElement("dl");
    const values = results.map(result => result.status === "fulfilled" ? result.value[index] : null);
    const [visits, , pilates] = values;
    const rate = visits > 0 && pilates !== null ? format.format(pilates / visits) : "—";
    const rows = metrics.map(([, name], i) => [
      name, values[i] === null ? "집계 실패" : number.format(values[i]) + "회"
    ]);
    rows.push(["필라테스 예약 링크 클릭률", rate]);
    for (const [label, value] of rows) {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const count = document.createElement("dd");
      term.textContent = label;
      count.textContent = value;
      row.append(term, count);
      list.append(row);
    }
    detail.replaceChildren(date, list);
  }

  for (let index = 0; index < days; index++) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.disabled = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), index + 1)) > today;
    button.addEventListener("click", () => select(index));
    buttons.push(button);
    grid.append(button);
  }
  select(start.getUTCFullYear() === today.getUTCFullYear() && start.getUTCMonth() === today.getUTCMonth()
    ? today.getUTCDate() - 1 : 0);
  const note = document.createElement("p");
  note.className = "traffic-note";
  note.textContent = "클릭률은 해당 날짜의 필라테스 예약 링크 클릭 수를 사이트 방문 수로 나눈 값입니다. 네이버 예약 완료 건수는 별도입니다.";
  card.append(title, grid, detail, note);
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
  const start = cursor;
  const prior = periodStart(mode, start, -1);
  const results = await Promise.allSettled([
    ...metrics.map(([kind]) => readMetric(kind, mode, start, end)),
    readMetric("visit", mode, prior, start)
  ]);
  if (request !== generation) return;
  const calendar = mode === "day" ? [renderCalendar(results.slice(0, metrics.length), start, end, today)] : [];
  charts.replaceChildren(...calendar, renderTrend(results[0], results[metrics.length], start, prior),
    ...metrics.map(([kind, title], index) => renderMetric(kind, title, results[index])));
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
