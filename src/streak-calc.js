// ⚒ streak-calc.js — consecutive active week computation
import { streakStatus } from './clock-engine.js';

const WEEK = 7 * 86400000;

export function weekKey(ts) {
  const d = new Date(ts);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // Sunday anchor
  return d.toISOString().slice(0, 10);
}

export function memberStreak(shifts, member, now = Date.now()) {
  const weeks = new Set();
  let last = 0;
  for (const s of shifts) {
    if (s.member !== member) continue;
    const t = Date.parse(s.clock_in);
    weeks.add(weekKey(t));
    if (t > last) last = t;
  }
  if (!last) return { current: 0, longest: 0, last_active: null, status: 'dormant' };

  const sortedWeeks = [...weeks].sort();
  let cur = 1, best = 1;
  for (let i = 1; i < sortedWeeks.length; i++) {
    const a = Date.parse(sortedWeeks[i - 1]);
    const b = Date.parse(sortedWeeks[i]);
    if (b - a <= WEEK + DAY()) cur++; else cur = 1;
    if (cur > best) best = cur;
  }
  const status = streakStatus(new Date(last).toISOString(), now);
  return {
    current: status === 'dormant' ? 0 : cur,
    longest: best,
    last_active: new Date(last).toISOString(),
    status
  };
}

function DAY() { return 86400000; }
