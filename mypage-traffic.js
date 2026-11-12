import { authReady } from './firebase-index.js?v=20261112-admin';
import { countTraffic, todayInSeoul } from './site-traffic.js?v=1';

const panel = document.querySelector('#adminTraffic');
const date = document.querySelector('#trafficDate');
const status = document.querySelector('#trafficStatus');
const counters = [
  ['visit', document.querySelector('#trafficVisits')],
  ['new-member', document.querySelector('#trafficMembership')],
  ['pilates', document.querySelector('#trafficPilates')]
];
let generation = 0;

async function refresh() {
  const current = ++generation;
  for (const [, output] of counters) output.textContent = '—';
  if (!date.value || !date.validity.valid) return;
  status.textContent = '집계 중…';
  const results = await Promise.allSettled(counters.map(([kind]) => countTraffic(kind, date.value)));
  if (current !== generation) return;
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') counters[index][1].textContent = result.value.toLocaleString('ko-KR');
  });
  status.textContent = results.some(result => result.status === 'rejected')
    ? '통계를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' : '';
}

if ((await authReady).verifiedAdmin) {
  panel.hidden = false;
  date.max = date.value = todayInSeoul();
  date.addEventListener('change', refresh);
  panel.addEventListener('toggle', () => { if (panel.open) void refresh(); });
}
