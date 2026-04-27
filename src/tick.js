// ⚒ tick.js — daily CLI: streaks, decay, leaderboard, bloom
// usage: node src/tick.js [--streaks|--decay|--leaderboard|--bloom|--all]
import { readFileSync, writeFileSync } from 'node:fs';
import { TYPES, ringsOf, leaderboard } from './clock-engine.js';
import { escure } from './bloom.js';

const root = new URL('..', import.meta.url).pathname;
const read = p => JSON.parse(readFileSync(root + p, 'utf8'));
const write = (p, o) => writeFileSync(root + p, JSON.stringify(o, null, 2) + '\n');

const args = new Set(process.argv.slice(2));
const all = args.has('--all') || args.size === 0;
const run = f => all || args.has('--' + f);

const manifest = read('api/manifest.json');
const shiftDoc = read('api/shifts.json');
const streakDoc = read('api/streaks.json');
const shifts = shiftDoc.shifts || [];
const now = Date.now(), DAY = 86400000, WEEK = 7 * DAY;

if (run('streaks')) {
  for (const m of manifest.members) {
    const my = shifts.filter(s => s.member === m.handle);
    const last = my.reduce((a, s) => Math.max(a, Date.parse(s.clock_in)), 0);
    const wks = new Set(my.map(s => weekKey(Date.parse(s.clock_in))));
    const span = wks.size;
    m.clock.streak = last ? span : 0;
    m.clock.longest_streak = Math.max(m.clock.longest_streak || 0, m.clock.streak);
    const sd = streakDoc.streaks.find(x => x.member === m.handle);
    if (sd) {
      sd.current = m.clock.streak;
      sd.longest = m.clock.longest_streak;
      sd.last_active = last ? new Date(last).toISOString() : null;
    }
  }
  console.log('⚒ streaks recomputed');
}

if (run('decay')) {
  for (const m of manifest.members) {
    const my = shifts.filter(s => s.member === m.handle);
    const last = my.reduce((a, s) => Math.max(a, Date.parse(s.clock_in)), 0);
    const days = last ? (now - last) / DAY : 999;
    m.clock.status = days < 7 ? 'active' : days < 15 ? 'cooling' : 'dormant';
    if (m.clock.status === 'dormant') m.clock.streak = 0;
    const sd = streakDoc.streaks.find(x => x.member === m.handle);
    if (sd) sd.status = m.clock.status;
  }
  console.log('⚒ decay applied');
}

if (run('bloom')) {
  for (const m of manifest.members) {
    const e = escure(m.clock.rings);
    m.clock.fold = e.fold;
    m.clock.sig = e.sig;
  }
  console.log('⚒ blooms folded');
}

if (run('leaderboard')) {
  const sorted = leaderboard(manifest.members);
  write('api/leaderboard.json', {
    updated: new Date().toISOString(),
    ranked: sorted.map((m, i) => ({
      rank: i + 1, handle: m.handle,
      hours: m.clock.total_hours, streak: m.clock.streak,
      status: m.clock.status, fold: m.clock.fold
    }))
  });
  console.log('⚒ leaderboard rebuilt');
}

manifest.updated = new Date().toISOString();
streakDoc.updated = manifest.updated;
write('api/manifest.json', manifest);
write('api/streaks.json', streakDoc);
console.log('⚒ tick complete');

function weekKey(t) {
  const d = new Date(t);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}
