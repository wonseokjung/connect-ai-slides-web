// vis/gallery: pictures float at different depths and the camera flies forward through the space until they settle in an
// asymmetric editorial layout; a slow parallax drift keeps the depth alive. CSS 3D, captions are real text.
export const css = `
.b-vis-gallery { overflow: hidden; }
.b-vis-gallery .pro-wrap { z-index: 3; pointer-events: none; }
.b-vis-gallery .vg-space { position: absolute; z-index: 2; left: var(--pad); right: var(--pad); top: calc(var(--pad) * 0.74 + var(--top) + var(--title) * 1.55); bottom: calc(var(--pad) * 0.62); perspective: 1600px; perspective-origin: 50% 40%; }
.b-vis-gallery .vg-cam { position: absolute; inset: 0; transform-style: preserve-3d; }
.b-vis-gallery figure { position: absolute; display: flex; flex-direction: column; gap: 0.5em; transform-style: preserve-3d; will-change: transform, opacity; }
.b-vis-gallery .vg-pic { position: relative; flex: 1; min-height: 0; overflow: hidden; border-radius: calc(var(--radius) * 0.35); box-shadow: 0 40px 90px rgba(0, 0, 0, 0.5); }
/* a dark picture on a dark slide keeps its edge: a hairline of gold */
.b-vis-gallery .vg-pic::after { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit; pointer-events: none; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gold2) 22%, transparent); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-gallery .vg-pic { box-shadow: 0 14px 34px rgba(70, 45, 15, 0.16); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-gallery figcaption b { color: var(--ivory); }
.b-vis-gallery .vg-pic > img, .b-vis-gallery .vg-pic > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-vis-gallery figcaption { flex: none; display: flex; align-items: baseline; gap: 0.7em; font-size: calc(var(--body) * 0.9); line-height: 1.25; color: var(--ink); letter-spacing: 0.01em; word-break: keep-all; overflow-wrap: anywhere; }
.b-vis-gallery figcaption span { min-width: 0; }
.cs-frame[data-shape="wide"] .b-vis-gallery figcaption { min-height: 2.5em; align-items: flex-start; }
.b-vis-gallery figcaption b { flex: none; }
.b-vis-gallery figcaption b { font-weight: 400; font-size: var(--label); color: var(--gold2); letter-spacing: 0.12em; }
:is(.look-white, .look-ivory, .look-paper) .b-vis-gallery .vg-glow { opacity: 0.45; }
.b-vis-gallery .vg-glow { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(60% 60% at 60% 55%, color-mix(in srgb, var(--gold) 14%, transparent), transparent 70%); }
.cs-frame[data-shape="tall"] .b-vis-gallery figcaption { font-size: calc(var(--body) * 0.82); }
.cs-frame[data-shape="tall"] .b-vis-gallery .vg-space { top: calc(var(--pad) * 0.74 + var(--top) + var(--title) * 2.6); bottom: calc(var(--pad) * 0.8); }
`;
// boxes [x, y, w, h] in 0..1 of the space (caption under each picture), and a depth for the parallax. Boxes in one row
// share their top and bottom edges, and every caption on a slide gets two lines of room, so the pictures line up too
const WIDE = {
  2: [[0, 0, 0.56, 1], [0.6, 0.16, 0.4, 0.84]],
  3: [[0, 0, 0.48, 1], [0.52, 0, 0.48, 0.5], [0.52, 0.54, 0.3, 0.46]],
  4: [[0, 0, 0.42, 1], [0.46, 0, 0.26, 0.5], [0.75, 0, 0.25, 0.5], [0.46, 0.55, 0.54, 0.45]],
  5: [[0, 0, 0.4, 1], [0.44, 0, 0.27, 0.48], [0.74, 0, 0.26, 0.48], [0.44, 0.54, 0.27, 0.46], [0.74, 0.54, 0.26, 0.46]],
  6: [[0, 0, 0.36, 1], [0.39, 0, 0.3, 0.48], [0.72, 0, 0.28, 0.48], [0.39, 0.54, 0.19, 0.46], [0.61, 0.54, 0.18, 0.46], [0.82, 0.54, 0.18, 0.46]],
};
const TALL = {
  2: [[0, 0, 1, 0.55], [0.18, 0.6, 0.82, 0.4]],
  3: [[0, 0, 1, 0.52], [0, 0.56, 0.48, 0.44], [0.52, 0.56, 0.48, 0.44]],
  4: [[0, 0, 1, 0.42], [0, 0.46, 0.48, 0.26], [0.52, 0.46, 0.48, 0.26], [0, 0.76, 1, 0.24]],
};
export default function mount(el, p, cx) {
  const P = cx.pro, tall = cx.shape === 'tall';
  const items = (p.items || []).slice(0, tall ? 4 : 6);
  const L = (tall ? TALL : WIDE)[Math.max(2, items.length)] || WIDE[4];
  el.innerHTML = `<i class="vg-glow" aria-hidden="true"></i><div class="pro-wrap">${P.head(p)}</div>
  <div class="vg-space vis-l2"><div class="vg-cam">${items.map((it, i) => { const b = L[i]; return `<figure style="left:${b[0] * 100}%;top:${b[1] * 100}%;width:${b[2] * 100}%;height:${b[3] * 100}%"><div class="vg-pic">${P.media(it, 'vg-m', it.caption)}</div>${it.caption ? `<figcaption><b class="cs-num">0${i + 1}</b><span>${cx.esc(it.caption)}</span></figcaption>` : ''}</figure>`; }).join('')}</div></div>`;
  const figs = [...el.querySelectorAll('figure')], cam = el.querySelector('.vg-cam');
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el, 0);
  // each picture starts far away and off its place; the camera flies in, the nearest arrive first
  figs.forEach((f, i) => {
    const b = L[i], cxp = b[0] + b[2] / 2 - 0.5, cyp = b[1] + b[3] / 2 - 0.5;
    tl.fromTo(f, {opacity: 0, z: -2600 - i * 700, x: cxp * 900, y: cyp * 500, rotateY: (i % 2 ? -18 : 18), rotateX: 6}, {opacity: 1, z: 0, x: 0, y: 0, rotateY: 0, rotateX: 0, duration: 1.9, ease: 'expo.out'}, t0 + 0.05 + i * 0.16);
    const img = f.querySelector('.vg-m'); if (img) tl.fromTo(img, {scale: 1.35}, {scale: 1.04, duration: 2.4, ease: 'power3.out'}, t0 + i * 0.16);
    const cap = f.querySelector('figcaption'); if (cap) P.rise(tl, cap, t0 + 1.0 + i * 0.12, {y: 14});
  });
  const depth = figs.map((_, i) => [1.0, 0.55, 0.8, 0.35, 0.65, 0.45][i]);
  return cx.vis.ambient(tl, el, (t) => {
    const k = Math.max(0, t - tl.duration() * 0.6);
    cam.style.transform = `translateZ(${(Math.min(1, k / 8) * 40).toFixed(2)}px) rotateY(${(Math.sin(t * 0.13) * 1.6).toFixed(3)}deg)`;
    if (t > 2.2) figs.forEach((f, i) => { const m = f.querySelector('.vg-m'); if (m) m.style.transform = `scale(1.04) translate(${(Math.sin(t * 0.2 + i) * depth[i] * 1.4).toFixed(3)}%, ${(Math.cos(t * 0.17 + i * 2) * depth[i] * 1.0).toFixed(3)}%)`; });
  });
}
