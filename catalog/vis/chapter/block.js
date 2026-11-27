// vis/chapter: a chapter card. A giant serif number is filled by a sliding mask of light over its own outline, the title
// rises, a gold line draws across the whole width, and the camera keeps pushing in slowly. Behind, morning light falls
// through blinds in slanted bars that slide against the number (CSS only).
export const css = `
.b-vis-chapter { overflow: hidden; }
.b-vis-chapter .vh-cam { position: absolute; inset: 0; z-index: 1; }
.b-vis-chapter .vh-num { position: absolute; right: calc(var(--pad) * 0.6); top: 50%; transform: translateY(-56%); font-family: var(--serif); font-weight: 400; font-size: calc(var(--hero) * 3.1); line-height: 0.8; letter-spacing: -0.04em; }
.b-vis-chapter .vh-num .o { color: transparent; -webkit-text-stroke: 1.5px color-mix(in srgb, var(--gold2) 60%, transparent); }
.b-vis-chapter .vh-num .f { position: absolute; inset: 0; color: var(--gold2); background: linear-gradient(180deg, var(--gold2), var(--gold)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.b-vis-chapter .vh-words { position: absolute; z-index: 2; left: var(--pad); bottom: calc(var(--pad) * 1.1); right: 40%; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); }
.b-vis-chapter .vh-k { font-size: var(--label); letter-spacing: 0.34em; text-transform: uppercase; color: var(--gold2); }
.b-vis-chapter .vh-t { font-size: calc(var(--hero) * 0.6); font-weight: var(--thin); line-height: 1.04; letter-spacing: -0.03em; color: var(--ink); text-wrap: balance; }
.b-vis-chapter .vh-s { font-size: var(--lead); color: var(--ivory); line-height: 1.3; }
.b-vis-chapter .vh-line { position: absolute; z-index: 2; left: 0; right: 0; bottom: calc(var(--pad) * 0.6); height: 1.5px; background: linear-gradient(90deg, var(--gold2), color-mix(in srgb, var(--gold) 30%, transparent) 70%, transparent); transform-origin: 0 50%; }
.b-vis-chapter .vh-blinds { position: absolute; inset: -20%; z-index: 0; pointer-events: none; background: repeating-linear-gradient(104deg, transparent 0 3.2%, color-mix(in srgb, var(--gold2) 15%, transparent) 3.8% 6.6%, transparent 7.4% 9.5%); filter: blur(5px); -webkit-mask-image: radial-gradient(48% 56% at 66% 42%, #000 20%, transparent 78%); mask-image: radial-gradient(48% 56% at 66% 42%, #000 20%, transparent 78%); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-chapter .vh-blinds { background: repeating-linear-gradient(104deg, transparent 0 3.2%, color-mix(in srgb, var(--gold) 13%, transparent) 3.8% 6.6%, transparent 7.4% 9.5%); }
.b-vis-chapter .vh-light { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(45% 60% at 72% 46%, color-mix(in srgb, var(--gold) 16%, transparent), transparent 72%); }
.cs-frame[data-shape="tall"] .b-vis-chapter .vh-num { right: auto; left: var(--pad); top: calc(var(--top) + var(--pad)); transform: none; font-size: calc(var(--hero) * 2.6); }
.cs-frame[data-shape="tall"] .b-vis-chapter .vh-words { right: var(--pad); }
.cs-frame[data-shape="tall"] .b-vis-chapter .vh-t { font-size: calc(var(--hero) * 0.62); }
`;
export default function mount(el, p, cx) {
  const num = String(p.number == null ? String(cx.index).padStart(2, '0') : p.number);
  el.innerHTML = `<i class="vh-light" aria-hidden="true"></i><i class="vh-blinds" aria-hidden="true"></i><div class="vh-cam"><div class="vh-num cs-num"><span class="o" aria-hidden="true" data-deco>${cx.esc(num)}</span><span class="f">${cx.esc(num)}</span></div></div>
  <div class="vh-words vis-l1">${p.kicker ? `<div class="vh-k">${cx.esc(p.kicker)}</div>` : ''}<h2 class="vh-t">${cx.pro.words(p.title, p.gold)}</h2>${p.sub ? `<p class="vh-s">${cx.esc(p.sub)}</p>` : ''}</div><i class="vh-line" aria-hidden="true"></i>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  tl.fromTo(q('.vh-num .o'), {opacity: 0}, {opacity: 1, duration: 0.8, ease: 'power1.out'}, 0);
  tl.fromTo(q('.vh-num .f'), {clipPath: 'inset(100% 0 0 0)'}, {clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut'}, 0.3);
  tl.fromTo(q('.vh-line'), {scaleX: 0}, {scaleX: 1, duration: 1.5, ease: 'expo.inOut'}, 0.2);
  cx.pro.rise(tl, q('.vh-k'), 0.6, {y: 12});
  cx.pro.wordsIn(tl, q('.vh-t'), 0.75);
  cx.pro.rise(tl, q('.vh-s'), 1.2, {y: 16});
  const cam = q('.vh-cam'), bl = q('.vh-blinds');
  return cx.vis.ambient(tl, el, (t) => {
    const k = cx.prog(t, 0, 2.4, 'out'), drift = Math.max(0, t - 2.4);
    cam.style.transform = `scale(${(1.26 - 0.26 * k + Math.min(0.06, 0.004 * drift)).toFixed(4)})`; cam.style.transformOrigin = '75% 50%';
    // the blinds slide the other way, slowly: the number stands in front of the light
    bl.style.transform = `translateX(${(4 - 4 * k - Math.min(3, 0.12 * drift)).toFixed(3)}%) scale(${(0.94 + 0.06 * k).toFixed(4)})`;
    bl.style.opacity = (cx.prog(t, 0.2, 1.8, 'out') * (0.85 + 0.15 * Math.sin(t * 0.35))).toFixed(3);
  });
}
