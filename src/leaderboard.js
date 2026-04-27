// ⚒ leaderboard.js — render ranked member list
import { leaderboard } from './clock-engine.js';

export function renderLeaderboard(el, members) {
  const sorted = leaderboard(members);
  el.innerHTML = '';
  sorted.forEach((m, i) => {
    const li = document.createElement('li');
    const status = m.clock.status || 'active';
    const streak = m.clock.streak || 0;
    li.innerHTML =
      `<span class="rank">${i + 1}.</span>` +
      `<span class="handle">${escape(m.handle)}</span>` +
      `<span class="hours">${m.clock.total_hours}h</span>` +
      (streak ? `<span class="streak">🔥${streak}</span>` : '') +
      ` <span class="status-pill ${status}">${status}</span>`;
    el.appendChild(li);
  });
}

export function renderRecentShifts(el, shifts, limit = 20) {
  const sorted = [...shifts].sort((a, b) =>
    Date.parse(b.clock_in) - Date.parse(a.clock_in)
  ).slice(0, limit);
  el.innerHTML = '';
  for (const s of sorted) {
    const dur = s.duration ? `${(s.duration / 60).toFixed(1)}h` : 'live';
    const live = !s.clock_out ? '<span class="live-dot"></span>' : '';
    const li = document.createElement('li');
    li.innerHTML =
      `${live}<span>${escape(s.member)} · <span class="badge ${s.type}">${s.type}</span></span>` +
      `<span class="meta">${dur} · ${rel(s.clock_in)}</span>`;
    el.appendChild(li);
  }
}

function rel(ts) {
  const d = (Date.now() - Date.parse(ts)) / 86400000;
  if (d < 1) return Math.round(d * 24) + 'h ago';
  return Math.floor(d) + 'd ago';
}
function escape(s) { return String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }
