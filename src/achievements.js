// ⚒ achievements.js — match shifts/rings against config triggers
export function evaluate(rings, shifts, member, streak, fold) {
  const total = rings.reduce((a, b) => a + b, 0);
  const ringsFilled = rings.filter(r => r > 0).length;
  const my = shifts.filter(s => s.member === member && s.duration);
  const maxShift = Math.max(0, ...my.map(s => s.duration / 60));
  const dayHours = {};
  for (const s of my) {
    const k = s.clock_in.slice(0, 10);
    dayHours[k] = (dayHours[k] || 0) + s.duration / 60;
  }
  const maxDay = Math.max(0, ...Object.values(dayHours));
  const owl = my.some(s => { const h = new Date(s.clock_in).getUTCHours(); return h < 6; });
  const bird = my.some(s => new Date(s.clock_in).getUTCHours() < 7);

  return [
    { id: 'first_punch', name: 'First Punch',  icon: '⏱', rarity: 'common',     got: my.length >= 1 },
    { id: 'full_day',    name: 'Full Day',     icon: '☀',  rarity: 'common',     got: maxDay >= 8 },
    { id: 'night_owl',   name: 'Night Owl',    icon: '🦉', rarity: 'uncommon',   got: owl },
    { id: 'early_bird',  name: 'Early Bird',   icon: '🐦', rarity: 'uncommon',   got: bird },
    { id: 'marathon',    name: 'Marathon',     icon: '🏃', rarity: 'uncommon',   got: maxShift >= 4 },
    { id: 'the_streak',  name: 'The Streak',   icon: '🔥', rarity: 'rare',       got: streak >= 12 },
    { id: 'all_rings',   name: 'All Rings',    icon: '💍', rarity: 'rare',       got: ringsFilled >= 6 },
    { id: 'time_lord',   name: 'Time Lord',    icon: '⌛', rarity: 'rare',       got: total >= 500 },
    { id: 'clock_tower', name: 'Clock Tower',  icon: '🏰', rarity: 'epic',       got: total >= 1000 },
    { id: 'primorial',   name: 'Primorial',    icon: '⚒',  rarity: 'legendary',  got: BigInt(fold || 0) >= 510510n }
  ];
}

export function renderAchievements(el, list) {
  el.innerHTML = '';
  for (const a of list) {
    const d = document.createElement('div');
    d.className = 'achievement' + (a.got ? '' : ' muted');
    d.style.opacity = a.got ? 1 : 0.35;
    d.innerHTML = `<span class="icon">${a.icon}</span><span>${a.name}</span><span class="rarity ${a.rarity}">${a.rarity}</span>`;
    el.appendChild(d);
  }
}
