// vis/statement: one sentence as kinetic typography. Words fly in from deep in the frame and come into focus, the camera
// keeps pushing in slowly, a light sweeps across the gold words. Behind, a shaft of light falls from above through two
// drifting pools (CSS only); the light moves against the words for depth.
export const css = `
.b-vis-statement { overflow: hidden; perspective: 1400px; }
.b-vis-statement .vs-light { position: absolute; inset: -20%; z-index: 0; pointer-events: none; }
.b-vis-statement .vs-light i { position: absolute; width: 70%; height: 80%; border-radius: 50%; filter: blur(40px); }
.b-vis-statement .vs-light i:nth-child(1) { left: 0; top: 10%; background: radial-gradient(closest-side, color-mix(in srgb, var(--gold) 34%, transparent), transparent); }
.b-vis-statement .vs-light i:nth-child(2) { right: 0; bottom: 0; background: radial-gradient(closest-side, color-mix(in srgb, var(--gold2) 16%, transparent), transparent); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-statement .vs-light i:nth-child(1) { background: radial-gradient(closest-side, rgba(255, 244, 222, 0.95), transparent); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-statement .vs-light i:nth-child(2) { background: radial-gradient(closest-side, color-mix(in srgb, var(--gold) 14%, transparent), transparent); }
.b-vis-statement .vs-shaft { position: absolute; inset: -30% -10% -10%; z-index: 0; pointer-events: none; background: conic-gradient(from 168deg at 24% 0%, transparent 0deg, color-mix(in srgb, var(--gold2) 15%, transparent) 9deg, color-mix(in srgb, var(--gold) 7%, transparent) 17deg, transparent 30deg); filter: blur(24px); transform-origin: 24% 0%; mix-blend-mode: screen; }
:is(.look-white, .look-ivory, .look-paper) .b-vis-statement .vs-shaft { mix-blend-mode: normal; background: conic-gradient(from 168deg at 24% 0%, transparent 0deg, rgba(255, 250, 238, 0.9) 9deg, rgba(255, 244, 222, 0.5) 17deg, transparent 30deg); }
.b-vis-statement .vs-vig { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(85% 85% at 50% 48%, transparent 55%, color-mix(in srgb, var(--bg) 70%, transparent)); }
.b-vis-statement .vs-cam { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: center; padding: calc(var(--pad) * 0.9 + var(--top)) calc(var(--pad) * 1.1); gap: calc(var(--gap) * 0.7); transform-style: preserve-3d; }
.b-vis-statement .vs-k { display: flex; align-items: center; gap: 0.9em; font-size: var(--label); letter-spacing: 0.34em; text-transform: uppercase; color: var(--gold2); }
.b-vis-statement .vs-k i { width: 3em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-vis-statement .vs-t { font-size: calc(var(--hero) * 0.8); font-weight: var(--thin); line-height: 1.12; letter-spacing: -0.03em; color: var(--ink); max-width: 12.5em; text-wrap: balance; transform-style: preserve-3d; }
.b-vis-statement .vs-t.short { font-size: calc(var(--hero) * 1.1); }
.b-vis-statement .vs-t.long { font-size: calc(var(--hero) * 0.58); max-width: 16em; }
.b-vis-statement .vs-w { display: inline-block; will-change: transform, opacity, filter; }
.b-vis-statement .vs-g { position: relative; display: inline-block; font-family: var(--serif); font-style: italic; font-weight: 400; letter-spacing: -0.01em; color: var(--gold2); }
.b-vis-statement .vs-sh { position: absolute; inset: 0; color: transparent; background: linear-gradient(100deg, transparent 35%, rgba(255, 246, 225, 0.95) 50%, transparent 65%); background-size: 300% 100%; background-repeat: no-repeat; -webkit-background-clip: text; background-clip: text; pointer-events: none; }
:is(.look-white, .look-ivory, .look-paper) .b-vis-statement .vs-sh { background-image: linear-gradient(100deg, transparent 35%, rgba(255, 214, 140, 0.9) 50%, transparent 65%); }
.b-vis-statement .vs-u { position: absolute; left: 0; right: 0; bottom: 0.04em; height: 2px; background: var(--gold); transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-vis-statement .vs-t { font-size: calc(var(--hero) * 0.8); }
.cs-frame[data-shape="tall"] .b-vis-statement .vs-t.short { font-size: calc(var(--hero) * 0.78); }
.cs-frame[data-shape="tall"] .b-vis-statement .vs-t.long { font-size: calc(var(--hero) * 0.5); }
`;
export default function mount(el, p, cx) {
  const text = String(p.text || ''), gold = [].concat(p.gold || []).filter(Boolean).map(String);
  const marks = []; gold.forEach((g) => { const i = text.indexOf(g); if (i >= 0) marks.push([i, i + g.length]); });
  let pos = 0, html = '';
  text.split(/(\s+)/).forEach((w) => { const a = pos; pos += w.length; if (!w) return; if (/^\s+$/.test(w)) { html += ' '; return; }
    const on = marks.some((m) => a < m[1] && pos > m[0]);
    html += on ? `<span class="vs-w vs-g">${cx.esc(w)}<span class="vs-sh" aria-hidden="true" data-deco>${cx.esc(w)}</span><i class="vs-u" aria-hidden="true"></i></span>` : `<span class="vs-w">${cx.esc(w)}</span>`; });
  const n = text.replace(/\s/g, '').length, ko = /[가-힣]/.test(text);
  const size = n <= (ko ? 10 : 22) ? ' short' : n > (ko ? 34 : 70) ? ' long' : '';
  el.innerHTML = `<div class="vs-light" aria-hidden="true"><i></i><i></i></div><i class="vs-shaft" aria-hidden="true"></i><i class="vs-vig" aria-hidden="true"></i><div class="vs-cam vis-l1">
    ${p.kicker ? `<div class="vs-k"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}
    <p class="vs-t${size}">${html}</p></div>`;
  const q = (s) => el.querySelector(s), ws = el.querySelectorAll('.vs-w'), tl = cx.gsap.timeline({paused: true});
  if (q('.vs-k')) { tl.fromTo(q('.vs-k i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0); tl.fromTo(q('.vs-k span'), {opacity: 0, x: -14}, {opacity: 1, x: 0, duration: 0.8, ease: 'expo.out'}, 0.1); }
  const st = Math.min(0.11, 1.3 / Math.max(1, ws.length));
  ws.forEach((w, i) => {
    const sx = ((i * 37) % 7 - 3) * 40, sy = ((i * 53) % 5 - 2) * 30;
    tl.fromTo(w, {opacity: 0, z: -900, x: sx, y: sy, rotateX: 24, filter: 'blur(18px)'}, {opacity: 1, z: 0, x: 0, y: 0, rotateX: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out'}, 0.2 + i * st);
  });
  const end = 0.2 + ws.length * st + 0.6;
  el.querySelectorAll('.vs-u').forEach((u, i) => tl.fromTo(u, {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.inOut'}, end + i * 0.1));
  el.querySelectorAll('.vs-sh').forEach((s, i) => tl.fromTo(s, {backgroundPosition: '120% 0'}, {backgroundPosition: '-20% 0', duration: 1.4, ease: 'power2.inOut'}, end + 0.2 + i * 0.15));
  const cam = q('.vs-cam'), L = el.querySelectorAll('.vs-light i'), shaft = q('.vs-shaft'), field = q('.vs-light');
  return cx.vis.ambient(tl, el, (t) => {
    const k = cx.prog(t, 0, 2.6, 'out'), drift = Math.max(0, t - 2.6);
    cam.style.transform = `scale(${(0.86 + 0.14 * k + Math.min(0.03, 0.002 * drift)).toFixed(4)})`;
    // the light field moves the other way: depth between the words and the room
    field.style.transform = `scale(${(1.14 - 0.14 * k - 0.002 * drift).toFixed(4)})`;
    shaft.style.transform = `rotate(${(Math.sin(t * 0.13) * 4 - 3 + 3 * k).toFixed(3)}deg)`;
    shaft.style.opacity = (cx.prog(t, 0.1, 1.8, 'out') * (0.85 + 0.15 * Math.sin(t * 0.4))).toFixed(3);
    L[0].style.transform = `translate(${(Math.sin(t * 0.21) * 9).toFixed(2)}%, ${(Math.cos(t * 0.17) * 7).toFixed(2)}%)`;
    L[1].style.transform = `translate(${(Math.cos(t * 0.19) * 10).toFixed(2)}%, ${(Math.sin(t * 0.23) * 8).toFixed(2)}%)`;
    el.querySelector('.vs-light').style.opacity = cx.prog(t, 0, 1.4, 'out').toFixed(3);
  });
}
