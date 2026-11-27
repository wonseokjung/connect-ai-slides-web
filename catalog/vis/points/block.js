// vis/points: a kinetic list. Each point arrives huge in the middle of the frame, holds a beat, then flies to its place in
// the list while its number counts; the newest point is gold. A pool of light, like a spotlight from above, follows the
// point that is speaking: first the middle of the frame, then its line in the list (CSS only, with a vignette).
export const css = `
.b-vis-points { overflow: hidden; }
.b-vis-points .pro-wrap { z-index: 1; }
.b-vis-points .vt-list { position: absolute; z-index: 2; left: var(--pad); right: var(--pad); top: calc(var(--pad) * 0.74 + var(--top) + var(--title) * 1.7); bottom: calc(var(--pad) * 0.7); display: flex; flex-direction: column; justify-content: center; }
.b-vis-points li { display: grid; grid-template-columns: 1.6em 1fr; column-gap: 0.5em; align-items: baseline; padding: 0.28em 0; border-top: 1px solid var(--line); font-size: calc(var(--title) * 0.72); line-height: 1.15; will-change: transform; transform-origin: 0 50%; }
.b-vis-points li .n { font-family: var(--serif); color: var(--dim); font-size: 0.9em; }
.b-vis-points li .tt { color: var(--ink); font-weight: var(--light); letter-spacing: -0.02em; }
.b-vis-points li .tx { grid-column: 2; font-size: calc(var(--body) * 0.95); color: var(--dim); line-height: 1.35; margin-top: 0.15em; letter-spacing: 0; }
.b-vis-points li.on .n, .b-vis-points li.on .tt { color: var(--gold2); }
.b-vis-points .vt-big { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
.b-vis-points .vt-big span { position: absolute; left: var(--pad); right: var(--pad); top: 50%; margin-top: -0.6em; text-align: center; font-family: var(--serif); font-size: calc(var(--hero) * 0.72); line-height: 1.1; color: var(--gold2); opacity: 0; text-wrap: balance; }
.cs-frame[data-shape="tall"] .b-vis-points .vt-big span { font-size: calc(var(--hero) * 0.58); margin-top: -1.2em; }
.b-vis-points .vt-spot { position: absolute; z-index: 0; left: 0; top: 0; width: 70%; height: 70%; margin: -35% 0 0 -35%; pointer-events: none; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--gold2) 19%, transparent), color-mix(in srgb, var(--gold) 7%, transparent) 55%, transparent); filter: blur(18px); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-points .vt-spot { background: radial-gradient(closest-side, rgba(255, 251, 240, 0.55), color-mix(in srgb, var(--gold) 6%, transparent) 60%, transparent); }
.b-vis-points .vt-vig { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(90% 90% at 50% 50%, transparent 50%, color-mix(in srgb, var(--bg) 75%, transparent)); }
.b-vis-points .vt-glow { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(45% 50% at 50% 50%, color-mix(in srgb, var(--gold) 14%, transparent), transparent 72%); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-points .vt-glow { display: none; }
.cs-frame[data-shape="tall"] .b-vis-points .vt-list { top: calc(var(--pad) * 0.74 + var(--top) + var(--title) * 2.6); }
.cs-frame[data-shape="tall"] .b-vis-points li { font-size: calc(var(--title) * 0.62); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  const items = (p.items || []).slice(0, 4).map((it) => { if (typeof it !== 'string') return it; const m = /^([^:：]{1,40})[:：]\s*(.+)$/.exec(it); return m ? {title: m[1], text: m[2]} : {title: it}; });
  el.innerHTML = `<i class="vt-glow" aria-hidden="true"></i><i class="vt-spot" aria-hidden="true"></i><i class="vt-vig" aria-hidden="true"></i><div class="pro-wrap">${P.head(p)}</div><div class="vt-big" aria-hidden="true" data-deco>${items.map((it) => `<span>${cx.esc(it.title || '')}</span>`).join('')}</div><ul class="vt-list vis-l2">${items.map((it, i) => `<li><span class="n cs-num">0${i + 1}</span><span class="tt">${cx.esc(it.title || '')}</span>${it.text ? `<span class="tx">${cx.esc(it.text)}</span>` : ''}</li>`).join('')}</ul>`;
  const lis = [...el.querySelectorAll('li')], tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el, 0);
  const bigs = [...el.querySelectorAll('.vt-big span')];
  lis.forEach((li, i) => {
    const at = t0 + 0.1 + i * 0.95, n = li.querySelector('.n'), big = bigs[i];
    const before = lis.slice(0, i);
    if (before.length) tl.to(before, {opacity: 0.08, duration: 0.3, ease: 'power1.out'}, at);
    tl.fromTo(big, {opacity: 0, scale: 1.12, filter: 'blur(16px)', y: 0}, {opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out'}, at);
    tl.to(big, {opacity: 0, scale: 0.42, y: `${(i - (lis.length - 1) / 2) * 12 + 8}%`, duration: 0.6, ease: 'expo.in'}, at + 0.55);
    tl.fromTo(li, {opacity: 0, scale: 1.35, y: -40}, {opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'expo.out'}, at + 0.95);
    if (before.length) tl.to(before, {opacity: 1, duration: 0.5, ease: 'power1.out'}, at + 0.95);
    tl.set(li, {className: 'on'}, at + 0.95);
    if (i > 0) tl.set(lis[i - 1], {className: ''}, at + 0.95);
    const o = {v: 0}; tl.to(o, {v: i + 1, duration: 0.6, ease: 'power2.out', onUpdate: () => { n.textContent = '0' + Math.round(o.v); }}, at + 0.95);
  });
  const glow = el.querySelector('.vt-glow'), spot = el.querySelector('.vt-spot'), list = el.querySelector('.vt-list');
  return cx.vis.ambient(tl, el, (t) => {
    glow.style.opacity = (0.7 + 0.3 * Math.sin(t * 0.5)).toFixed(3);
    // where the light is: the middle while a point is big, then its line (positions without transforms, so the same every time)
    const W = el.offsetWidth, H = el.offsetHeight; if (!W) return;
    let x = 0.5 * W, y = 0.5 * H, s = 1;
    lis.forEach((li, i) => {
      const at = t0 + 0.1 + i * 0.95; if (t < at) return;
      const lx = list.offsetLeft + W * 0.16, ly = list.offsetTop + li.offsetTop + li.offsetHeight / 2, k = cx.prog(t, at + 0.55, 0.8, 'inOut');
      const k0 = cx.prog(t, at, 0.5, 'out'); x = x + (0.5 * W - x) * k0; y = y + (0.5 * H - y) * k0;
      x += (lx - x) * k; y += (ly - y) * k; s = 1.25 - 0.45 * k;
    });
    spot.style.transform = `translate(${(x + Math.sin(t * 0.3) * W * 0.01).toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)}, ${(s * 0.62).toFixed(3)})`;
    spot.style.opacity = cx.prog(t, 0, 1.0, 'out').toFixed(3);
  });
}
