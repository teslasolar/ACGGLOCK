// ⚒ forge-bridge.js — map Review Forge events to time data
const FORGE_URL = 'https://teslasolar.github.io/ACG-NET/api/forge.json';

export async function fetchForge() {
  try {
    const r = await fetch(FORGE_URL, { cache: 'no-store' });
    if (!r.ok) throw 0;
    return await r.json();
  } catch { return { events: [] }; }
}

export function joinShifts(shifts, forgeEvents) {
  const byRef = {};
  for (const e of forgeEvents) byRef[e.id || e.ref] = e;
  return shifts
    .filter(s => s.forge_ref && byRef[s.forge_ref])
    .map(s => ({ ...s, forge: byRef[s.forge_ref] }));
}

export function timePerReview(shifts) {
  const reviews = shifts.filter(s => s.type === 'review' && s.duration);
  if (!reviews.length) return 0;
  const total = reviews.reduce((a, b) => a + b.duration, 0);
  return total / reviews.length / 60;
}

export function timePerSubmission(shifts) {
  const auth = shifts.filter(s => s.type === 'author' && s.duration);
  if (!auth.length) return 0;
  const byRef = {};
  for (const s of auth) {
    const k = s.forge_ref || s.id;
    byRef[k] = (byRef[k] || 0) + s.duration;
  }
  const totals = Object.values(byRef);
  return totals.reduce((a, b) => a + b, 0) / totals.length / 60;
}

export function reviewVelocity(shifts) {
  const reviews = shifts.filter(s => s.type === 'review' && s.clock_out);
  const weeks = {};
  for (const r of reviews) {
    const k = new Date(r.clock_in).toISOString().slice(0, 7);
    weeks[k] = (weeks[k] || 0) + 1;
  }
  return weeks;
}
