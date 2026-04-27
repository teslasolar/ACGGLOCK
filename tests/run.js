// ⚒ tests/run.js — minimal ACG-TEST runner (no deps)
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
let pass = 0, fail = 0;
const log = (ok, name, why) => {
  pass += ok ? 1 : 0; fail += ok ? 0 : 1;
  console.log((ok ? '⚒ PASS' : '✗ FAIL') + ' · ' + name + (why ? ' — ' + why : ''));
};

// 1. file exists
log(existsSync(root + '.github/workflows/tick.yml'), 'tick.yml exists');

// 2. shifts schema
const shifts = JSON.parse(readFileSync(root + 'api/shifts.json', 'utf8')).shifts;
const need = ['id', 'member', 'type', 'clock_in', 'clock_out', 'duration', 'domain'];
log(shifts.every(s => need.every(f => f in s)), 'shifts schema');

// 3. streak CLI
try {
  const out = execSync('node src/tick.js --streaks', { cwd: root }).toString();
  log(/streaks recomputed/.test(out), 'streak calc triggered');
} catch (e) { log(false, 'streak calc triggered', e.message); }

// 4. decay CLI
try {
  const out = execSync('node src/tick.js --decay', { cwd: root }).toString();
  log(/decay applied/.test(out), 'decay applied');
} catch (e) { log(false, 'decay applied', e.message); }

// 5. bloom fold present on every member + timezone field present (null OK)
const m = JSON.parse(readFileSync(root + 'api/manifest.json', 'utf8'));
log(m.members.every(x => x.clock.fold !== undefined && Array.isArray(x.clock.sig)), 'bloom fold configured');
log(m.members.every(x => 'timezone' in x && 'name' in x), 'member timezone + name fields');

// 6. leaderboard sorted
const lb = JSON.parse(readFileSync(root + 'api/leaderboard.json', 'utf8')).ranked;
let sorted = true;
for (let i = 1; i < lb.length; i++) {
  if (lb[i - 1].hours < lb[i].hours) { sorted = false; break; }
  if (lb[i - 1].hours === lb[i].hours && lb[i - 1].streak < lb[i].streak) { sorted = false; break; }
}
log(sorted, 'leaderboard sorted');

// 7. anti-gaming config
const cfg = JSON.parse(readFileSync(root + 'api/config.json', 'utf8')).anti_gaming;
log(
  cfg.max_shift_minutes === 720 &&
  cfg.min_shift_minutes === 5 &&
  cfg.same_type_cooldown_minutes === 30 &&
  cfg.type_required === true &&
  cfg.overlap_allowed === false &&
  cfg.future_dates_allowed === false,
  'anti-gaming configured'
);

// 8. guardrails: future-dated rejected (validate via shifts have no future clock_in)
const future = shifts.some(s => Date.parse(s.clock_in) > Date.now() + 60_000);
log(!future, 'no future-dated shifts');

console.log(`\n${pass} passed · ${fail} failed`);
process.exit(fail ? 1 : 0);
