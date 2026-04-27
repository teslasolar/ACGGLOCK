// ⚒ main-clock.js — personal clock wiring
import { mountChrome, loadAll } from './nav.js';
import { ringsOf } from './clock-engine.js';
import { drawClockFace } from './clock-face.js';
import { escure } from './bloom.js';
import { clockIn, clockOut, loadSession, localHistory } from './punch.js';
import { evaluate, renderAchievements } from './achievements.js';

mountChrome('clock');

const ME_KEY = 'glock.me';
const $ = id => document.getElementById(id);

(async () => {
  const { manifest, shifts } = await loadAll();
  const me = localStorage.getItem(ME_KEY) || '';
  $('f-member').value = me;
  $('who').textContent = me || 'guest';

  const session = loadSession();
  if (session) {
    $('btn-in').disabled = true;
    $('btn-out').disabled = false;
    $('live-meta').textContent = `· in since ${session.clock_in.slice(11, 16)}Z (${session.type})`;
  }

  function refresh() {
    const handle = $('f-member').value.trim();
    localStorage.setItem(ME_KEY, handle);
    $('who').textContent = handle || 'guest';
    const all = [...shifts, ...localHistory()];
    const myShifts = all.filter(s => s.member === handle);
    const rings = ringsOf(myShifts, handle);
    drawClockFace($('me-face'), { rings, activeRing: session ? typeIdx(session.type) : -1 });
    const member = manifest.members.find(m => m.handle === handle);
    const streak = member?.clock?.streak || 0;
    const { fold } = escure(rings);
    $('me-streak').textContent = '🔥' + streak;
    $('me-fold').textContent = fold.length > 12 ? fold.slice(0, 10) + '…' : fold;
    renderAchievements($('achievements'), evaluate(rings, myShifts, handle, streak, fold));
    renderLog(myShifts);
  }

  function renderLog(my) {
    const ul = $('session-log');
    ul.innerHTML = '';
    [...my].sort((a, b) => Date.parse(b.clock_in) - Date.parse(a.clock_in)).slice(0, 12).forEach(s => {
      const dur = s.duration ? (s.duration / 60).toFixed(1) + 'h' : 'live';
      const li = document.createElement('li');
      li.innerHTML = `<span><span class="badge ${s.type}">${s.type}</span> ${dur}</span>` +
        `<span class="meta">${s.clock_in.slice(0, 10)}</span>`;
      ul.appendChild(li);
    });
  }

  $('f-member').addEventListener('input', refresh);
  $('btn-in').onclick = () => {
    try {
      clockIn({
        member: $('f-member').value.trim(),
        type: $('f-type').value,
        domain: $('f-domain').value.split(',').map(s => s.trim()).filter(Boolean),
        notes: $('f-notes').value,
        forge_ref: $('f-ref').value || null
      });
      $('msg').textContent = '⚒ clocked in';
      location.reload();
    } catch (e) { $('msg').textContent = '✗ ' + e.message; }
  };
  $('btn-out').onclick = () => {
    try {
      const s = clockOut();
      $('msg').textContent = `⚒ clocked out · ${(s.duration / 60).toFixed(2)}h`;
      location.reload();
    } catch (e) { $('msg').textContent = '✗ ' + e.message; }
  };

  refresh();
})();

function typeIdx(t) {
  return ['review','author','roundtable','mentor','build','evaluate'].indexOf(t);
}
