// ⚒ punch.js — punch in/out + localStorage session
const KEY = 'glock.session';
const HISTORY = 'glock.history';
const MAX_MIN = 720, MIN_MIN = 5;

export function loadSession() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); }
  catch { return null; }
}

export function clockIn({ member, type, domain = [], notes = '', forge_ref = null }) {
  if (!member || !type) throw new Error('member + type required');
  if (loadSession()) throw new Error('already clocked in — clock out first');
  const sess = {
    id: 'local-' + Date.now().toString(36),
    member, type, domain, notes, forge_ref,
    clock_in: new Date().toISOString(),
    clock_out: null, duration: null
  };
  localStorage.setItem(KEY, JSON.stringify(sess));
  return sess;
}

export function clockOut() {
  const s = loadSession();
  if (!s) throw new Error('not clocked in');
  const out = new Date();
  const min = Math.round((out - new Date(s.clock_in)) / 60000);
  if (min < MIN_MIN) throw new Error(`min shift ${MIN_MIN} min`);
  if (min > MAX_MIN) throw new Error(`max shift ${MAX_MIN} min — split it`);
  s.clock_out = out.toISOString();
  s.duration = min;
  const hist = JSON.parse(localStorage.getItem(HISTORY) || '[]');
  hist.unshift(s);
  localStorage.setItem(HISTORY, JSON.stringify(hist.slice(0, 100)));
  localStorage.removeItem(KEY);
  return s;
}

export function localHistory() {
  return JSON.parse(localStorage.getItem(HISTORY) || '[]');
}
