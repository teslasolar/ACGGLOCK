// ⚒ clock-face.js — canvas: 7 concentric rings
const COLORS = ['#58a6ff','#bc8cff','#e3b341','#3fb950','#d29922','#f85149','#c9d1d9'];

export function drawClockFace(canvas, opts) {
  const { rings, activeRing = -1, max = null, animate = true } = opts;
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.clientWidth || 320;
  canvas.width = size * dpr; canvas.height = size * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const total = rings.reduce((a, b) => a + b, 0);
  const all = [...rings, total];
  const cap = max || Math.max(...all, 1);

  const cx = size / 2, cy = size / 2;
  const outer = size * 0.46;
  const ringW = outer / 9;
  const gap = ringW * 0.18;

  let frame = 0, total_frames = animate ? 40 : 1;
  function draw() {
    ctx.clearRect(0, 0, size, size);
    const k = animate ? Math.min(1, frame / total_frames) : 1;
    for (let i = 0; i < 7; i++) {
      const r = outer - i * (ringW + gap);
      // bg
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = ringW; ctx.strokeStyle = '#21262d'; ctx.stroke();
      // fg
      const pct = Math.min(1, all[i] / cap);
      const a = -Math.PI / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a, a + Math.PI * 2 * pct * k);
      ctx.strokeStyle = COLORS[i];
      ctx.lineWidth = (i === activeRing && Math.floor(Date.now() / 400) % 2) ? ringW + 2 : ringW;
      ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.fillStyle = '#e3b341';
    ctx.font = '600 ' + (size * 0.11) + 'px IBM Plex Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(total.toFixed(1) + 'h', cx, cy);
    if (frame < total_frames) { frame++; requestAnimationFrame(draw); }
    else if (activeRing >= 0) { setTimeout(draw, 400); }
  }
  draw();
}
