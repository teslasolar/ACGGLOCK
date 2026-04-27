// ⚒ main-dash.js — dashboard wiring
import { mountChrome, loadAll } from './nav.js';
import { ringsOf, totalHours, activeNow } from './clock-engine.js';
import { drawClockFace } from './clock-face.js';
import { renderLeaderboard, renderRecentShifts } from './leaderboard.js';

mountChrome('dash');

(async () => {
  const { manifest, shifts } = await loadAll();
  const members = manifest.members;

  // aggregate guild rings = sum of member rings
  const guild = [0, 0, 0, 0, 0, 0];
  for (const m of members) m.clock.rings.forEach((h, i) => guild[i] += h);

  drawClockFace(document.getElementById('guild-face'), { rings: guild });

  const totH = guild.reduce((a, b) => a + b, 0);
  document.getElementById('total-hours').textContent = totH.toFixed(0) + 'h';

  const live = activeNow(shifts);
  document.getElementById('active-now').innerHTML =
    `<span class="live-dot"></span>${live.length} active now` +
    (live.length ? ` · ${live.join(', ')}` : '');

  document.getElementById('stat-members').textContent = members.length;

  const now = Date.now(), DAY = 86400000;
  const todayShifts = shifts.filter(s => Date.parse(s.clock_in) > now - DAY);
  const weekShifts  = shifts.filter(s => Date.parse(s.clock_in) > now - 7 * DAY);
  document.getElementById('stat-today').textContent = totalHours(ringsOf(todayShifts)).toFixed(1) + 'h';
  document.getElementById('stat-week').textContent  = totalHours(ringsOf(weekShifts)).toFixed(1) + 'h';
  document.getElementById('stat-best').textContent  =
    Math.max(...members.map(m => m.clock.longest_streak || m.clock.streak || 0)) + 'w';

  renderLeaderboard(document.getElementById('leaderboard'), members);
  renderRecentShifts(document.getElementById('recent'), shifts, 12);
})();
