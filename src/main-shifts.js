// ⚒ main-shifts.js — calendar + table view
import { mountChrome, loadAll } from './nav.js';

mountChrome('shifts');

const $ = id => document.getElementById(id);
const DAY = 86400000;

(async () => {
  const { manifest, shifts, config } = await loadAll();

  const sel = $('f-member');
  for (const m of manifest.members) {
    const o = document.createElement('option');
    o.value = o.textContent = m.handle;
    sel.appendChild(o);
  }

  function apply() {
    const fm = sel.value, ft = $('f-type').value;
    const filt = shifts.filter(s =>
      (!fm || s.member === fm) && (!ft || s.type === ft));
    renderCal(filt);
    renderTable(filt);
    $('f-summary').textContent =
      `${filt.length} shifts · ${(filt.reduce((a, b) => a + (b.duration || 0), 0) / 60).toFixed(1)}h`;
  }
  sel.onchange = apply;
  $('f-type').onchange = apply;

  function renderCal(filt) {
    const grid = $('cal-grid'); grid.innerHTML = '';
    const tip = $('tip');
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - 27 * DAY);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // align Sunday
    for (let i = 0; i < 35; i++) {
      const d = new Date(start.getTime() + i * DAY);
      const ds = d.toISOString().slice(0, 10);
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      const dayShifts = filt.filter(s => s.clock_in.slice(0, 10) === ds);
      let pips = '';
      for (const s of dayShifts) pips += `<span class="pip ${s.type}"></span>`;
      cell.innerHTML = `<div class="date">${ds.slice(8)}</div><div class="pips">${pips}</div>`;
      if (dayShifts.length) {
        cell.style.cursor = 'pointer';
        cell.onmouseenter = e => {
          tip.style.display = 'block';
          tip.textContent = ds + '\n' + dayShifts.map(s =>
            `${s.member} ${s.type} ${(s.duration/60||0).toFixed(1)}h`).join('\n');
        };
        cell.onmousemove = e => {
          const r = $('cal').getBoundingClientRect();
          tip.style.left = (e.clientX - r.left + 12) + 'px';
          tip.style.top  = (e.clientY - r.top + 12) + 'px';
        };
        cell.onmouseleave = () => tip.style.display = 'none';
      }
      grid.appendChild(cell);
    }
  }

  function renderTable(filt) {
    const tb = $('all-body'); tb.innerHTML = '';
    [...filt].sort((a, b) => Date.parse(b.clock_in) - Date.parse(a.clock_in))
      .forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.member}</td>
          <td><span class="badge ${s.type}">${s.type}</span></td>
          <td>${s.clock_in.slice(5, 16).replace('T', ' ')}</td>
          <td>${s.clock_out ? s.clock_out.slice(5, 16).replace('T', ' ') : '<span class="live-dot"></span>live'}</td>
          <td>${s.duration ? (s.duration / 60).toFixed(2) : '—'}</td>
          <td class="muted">${(s.domain || []).join(', ')}</td>
          <td class="muted">${s.forge_ref || ''}</td>`;
        tb.appendChild(tr);
      });
  }

  // Upcoming scheduled (recurring)
  const sch = $('scheduled');
  const now = new Date();
  for (const def of (config.shift_definitions || [])) {
    const next = new Date(now);
    next.setUTCHours(def.hour_utc, 0, 0, 0);
    while (next <= now || next.getUTCDay() !== def.weekday) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    const li = document.createElement('li');
    li.innerHTML = `<span><span class="badge ${def.type}">${def.type}</span> ${def.label}</span>` +
      `<span class="meta">${next.toISOString().slice(0, 16).replace('T', ' ')}Z · ${def.duration_minutes}min</span>`;
    sch.appendChild(li);
  }

  apply();
})();
