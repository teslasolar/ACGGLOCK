// ⚒ world-clock.js — render member local times
export function renderWorldClock(el, members) {
  el.innerHTML = '';
  const now = new Date();
  // group members by timezone (or "?" bucket)
  const buckets = {};
  for (const m of members) {
    const k = m.timezone || '?';
    (buckets[k] ||= []).push(m);
  }
  const order = Object.keys(buckets).sort((a, b) => {
    if (a === '?') return 1;
    if (b === '?') return -1;
    return offsetMinutes(a, now) - offsetMinutes(b, now);
  });
  for (const tz of order) {
    const row = document.createElement('div');
    row.className = 'wc-row';
    const local = tz === '?' ? '— · ?' : fmt(now, tz);
    const hour = tz === '?' ? null : new Date(now.toLocaleString('en-US', { timeZone: tz })).getHours();
    const dot = workingHours(hour) ? '🟢' : sleepHours(hour) ? '🌙' : '🟡';
    const names = buckets[tz].map(m =>
      `<span class="wc-member"><span class="status-pill ${m.clock.status}">${m.handle}</span></span>`
    ).join(' ');
    row.innerHTML =
      `<span class="wc-tz mono">${dot} ${tz === '?' ? '? unknown' : tz}</span>` +
      `<span class="wc-time mono gold">${local}</span>` +
      `<span class="wc-names">${names}</span>`;
    el.appendChild(row);
  }
}

function fmt(d, tz) {
  return d.toLocaleString('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short'
  });
}

function offsetMinutes(tz, ref) {
  try {
    const utc = ref.getTime();
    const local = new Date(ref.toLocaleString('en-US', { timeZone: tz })).getTime();
    return Math.round((local - utc) / 60000);
  } catch { return 0; }
}

function workingHours(h) { return h !== null && h >= 8 && h < 19; }
function sleepHours(h)   { return h !== null && (h < 7 || h >= 23); }
