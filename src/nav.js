// ⚒ nav.js — shared header/footer
export function mountChrome(active) {
  const head = document.createElement('header');
  head.className = 'glock-header';
  head.innerHTML = `
    <div class="glock-brand"><span class="anvil">⚒</span>GLOCK<span class="anvil">⚒</span></div>
    <nav class="glock-nav">
      <a href="index.html"      class="${active === 'dash'    ? 'active' : ''}">DASHBOARD</a>
      <a href="clock.html"      class="${active === 'clock'   ? 'active' : ''}">MY CLOCK</a>
      <a href="shifts.html"     class="${active === 'shifts'  ? 'active' : ''}">SHIFTS</a>
      <a href="forge-sync.html" class="${active === 'forge'   ? 'active' : ''}">FORGE</a>
    </nav>`;
  document.body.prepend(head);

  const foot = document.createElement('footer');
  foot.className = 'glock-footer';
  foot.innerHTML = `AI Craftspeople Guild · GLOCK v1.0 · <span class="gold">⚒ 510,510 ⚒</span> · the repo is the clock`;
  document.body.append(foot);
}

export async function loadAll() {
  const [m, s, c] = await Promise.all([
    fetch('api/manifest.json').then(r => r.json()),
    fetch('api/shifts.json').then(r => r.json()),
    fetch('api/config.json').then(r => r.json())
  ]);
  return { manifest: m, shifts: s.shifts || [], config: c };
}
