// ⚒ main-forge.js — Review Forge bridge view
import { mountChrome, loadAll } from './nav.js';
import { fetchForge, joinShifts, timePerReview, timePerSubmission, reviewVelocity } from './forge-bridge.js';

mountChrome('forge');

const $ = id => document.getElementById(id);

(async () => {
  const { shifts } = await loadAll();
  const forge = await fetchForge();
  const events = forge.events || [];
  $('m-fc').textContent = events.length ? `${events.length} events` : 'offline';
  $('m-tpr').textContent = timePerReview(shifts).toFixed(2) + 'h';
  $('m-tps').textContent = timePerSubmission(shifts).toFixed(2) + 'h';

  const velo = reviewVelocity(shifts);
  const tb = $('velo');
  Object.keys(velo).sort().forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${m}</td><td>${velo[m]}</td>`;
    tb.appendChild(tr);
  });

  const linked = shifts.filter(s => s.forge_ref);
  const lb = $('linked');
  for (const s of linked) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono">${s.forge_ref}</td>
      <td>${s.member}</td>
      <td><span class="badge ${s.type}">${s.type}</span></td>
      <td>${s.duration ? (s.duration / 60).toFixed(2) : '—'}</td>
      <td class="muted">${s.notes || ''}</td>`;
    lb.appendChild(tr);
  }
})();
