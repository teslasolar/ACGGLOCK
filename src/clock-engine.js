// ⚒ clock-engine.js — shift math, streaks, decay, leaderboard
import { escure, PRIMORIAL } from './bloom.js';

export const TYPES = ['review','author','roundtable','mentor','build','evaluate'];
const DAY = 86400000, WEEK = 7 * DAY;

export function ringsOf(shifts, member, now = Date.now()) {
  const r = [0, 0, 0, 0, 0, 0];
  for (const s of shifts) {
    if (member && s.member !== member) continue;
    const k = TYPES.indexOf(s.type);
    if (k < 0) continue;
    const out = s.clock_out ? Date.parse(s.clock_out) : now;
    const inn = Date.parse(s.clock_in);
    const min = Math.max(0, (out - inn) / 60000);
    r[k] += min / 60;
  }
  return r;
}

export function totalHours(rings) {
  return rings.reduce((a, b) => a + b, 0);
}

export function streakStatus(lastActive, now = Date.now()) {
  if (!lastActive) return 'dormant';
  const days = (now - Date.parse(lastActive)) / DAY;
  if (days < 7)  return 'active';
  if (days < 15) return 'cooling';
  return 'dormant';
}

export function activeNow(shifts) {
  return shifts.filter(s => !s.clock_out).map(s => s.member);
}

export function leaderboard(members) {
  return [...members].sort((a, b) => {
    const ah = a.clock.total_hours, bh = b.clock.total_hours;
    if (bh !== ah) return bh - ah;
    return (b.clock.streak || 0) - (a.clock.streak || 0);
  });
}

export function blooms(members) {
  return members.map(m => ({ ...m, clock: { ...m.clock, ...escure(m.clock.rings) } }));
}

export { PRIMORIAL };
