// vis/device: a laptop (or a phone) built in CSS 3D turns from a steep angle to face you while the camera pushes in; the
// clip plays on its screen, a soft contact shadow under it. A caption sits beside. A portrait clip or picture gets the phone
// body by itself (read from the media's own size once it has loaded; "device" set to "laptop" or "phone" decides it).
export const css = `
.b-vis-device { overflow: hidden; }
.b-vis-device .vd-glow { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(50% 55% at var(--gx, 38%) 46%, color-mix(in srgb, var(--gold) 20%, transparent), transparent 72%); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-device .vd-glow { opacity: 0.45; }
.b-vis-device .vd-stage { position: absolute; z-index: 1; top: 0; bottom: 0; left: 3%; width: 56%; perspective: 2200px; perspective-origin: 50% 30%; display: flex; align-items: center; justify-content: center; }
.b-vis-device .vd-rig { position: relative; width: 84%; aspect-ratio: 16 / 10.6; transform-style: preserve-3d; }
.b-vis-device .vd-lid { position: absolute; left: 0; right: 0; top: 0; height: 94%; border-radius: 1.6% / 2.4%; background: linear-gradient(160deg, #2a2724, #0d0c0b); padding: 1.6%; box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.08), 0 50px 120px rgba(0, 0, 0, 0.55); transform-origin: 50% 100%; transform-style: preserve-3d; }
.b-vis-device .vd-screen { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 0.8% / 1.2%; background: #000; }
.b-vis-device .vd-screen > img, .b-vis-device .vd-screen > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0%; }
.b-vis-device .vd-glare { position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255, 255, 255, 0.14), transparent 38%); pointer-events: none; }
.b-vis-device .vd-base { position: absolute; left: -6%; right: -6%; top: 94%; height: 60%; transform-origin: 50% 0%; transform: rotateX(76deg); border-radius: 0 0 4% 4% / 0 0 10% 10%; background: linear-gradient(180deg, #3b3833, #1b1916); box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.12); }
.b-vis-device .vd-base { transform-style: preserve-3d; }
.b-vis-device .vd-base::before { content: ""; position: absolute; left: 0.6%; right: 0.6%; top: 100%; height: 4.5%; transform-origin: 50% 0; transform: rotateX(-90deg); border-radius: 0 0 40% 40% / 0 0 100% 100%; background: linear-gradient(180deg, #2a2723, #0b0a09); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-device .vd-lid { box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.08), 0 40px 70px -30px rgba(60, 40, 10, 0.45); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-device .vd-floor { background: radial-gradient(50% 50% at 50% 30%, rgba(60, 40, 10, 0.32), transparent 70%); }
.b-vis-device .vd-base::after { content: ""; position: absolute; left: 38%; right: 38%; top: 0; height: 5%; border-radius: 0 0 10px 10px; background: rgba(0, 0, 0, 0.35); }
.b-vis-device .vd-floor { position: absolute; left: 6%; right: 6%; top: 104%; height: 24%; background: radial-gradient(50% 50% at 50% 30%, rgba(0, 0, 0, 0.55), transparent 70%); filter: blur(10px); transform: translateZ(-40px); }
.b-vis-device.phone .vd-rig { width: auto; height: 82%; aspect-ratio: 9 / 19.2; }
.b-vis-device.phone .vd-lid { height: 100%; border-radius: 12% / 5.6%; padding: 3.4%; }
.b-vis-device.phone .vd-screen { border-radius: 9% / 4.2%; }
.b-vis-device.phone .vd-base { display: none; }
.b-vis-device .vd-words { position: absolute; z-index: 2; right: 0; top: 0; bottom: 0; width: 42%; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.55); padding: calc(var(--pad) * 0.8 + var(--top)) var(--pad) var(--pad) calc(var(--pad) * 0.2); }
.b-vis-device .vd-k { display: flex; align-items: center; gap: 0.9em; font-size: var(--label); letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold2); }
.b-vis-device .vd-k i { width: 2.6em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-vis-device .vd-t { font-family: var(--serif); font-weight: 400; font-size: calc(var(--title) * 1.04); line-height: 1.06; color: var(--ink); text-wrap: balance; word-break: keep-all; }
.b-vis-device .vd-c { font-size: calc(var(--lead) * 1.12); color: var(--ivory); line-height: 1.32; word-break: keep-all; }
.b-vis-device.phone .vd-stage { width: 46%; }
.b-vis-device.phone .vd-words { width: 54%; padding-left: calc(var(--pad) * 0.4); }
.b-vis-device.phone .vd-t { font-size: calc(var(--title) * 1.16); }
.cs-frame[data-shape="tall"] .b-vis-device .vd-stage { width: 100%; top: var(--top); bottom: 42%; }
.cs-frame[data-shape="tall"] .b-vis-device .vd-words { width: 100%; left: 0; top: 58%; justify-content: flex-start; padding: calc(var(--pad) * 0.4) var(--pad) var(--pad); }
.cs-frame[data-shape="tall"] .b-vis-device .vd-rig { width: 78%; }
.cs-frame[data-shape="tall"] .b-vis-device.phone .vd-rig { width: auto; height: 92%; }
.cs-frame[data-shape="tall"] .b-vis-device.phone .vd-stage { width: 100%; }
.cs-frame[data-shape="tall"] .b-vis-device.phone .vd-words { width: 100%; padding-left: var(--pad); }
.cs-frame[data-shape="tall"] .b-vis-device.phone .vd-t { font-size: calc(var(--title) * 1.04); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, fixed = p.device === 'phone' || p.device === 'laptop';
  let phone = p.device === 'phone';
  el.classList.toggle('phone', phone);
  el.innerHTML = `<i class="vd-glow" aria-hidden="true"></i><div class="vd-stage vis-l2"><div class="vd-rig"><i class="vd-floor" aria-hidden="true"></i><i class="vd-base" aria-hidden="true"></i><div class="vd-lid"><div class="vd-screen">${P.media({...p, pos: p.pos || '50% 0%'}, 'vd-m', p.title || p.caption).replace(/^<(video|img) /, (m0) => (p.zoom > 1 ? m0 + `data-zoom="" style="object-position:${cx.esc(p.pos || '50% 0%')};transform:scale(${Math.min(2, +p.zoom).toFixed(2)});transform-origin:${cx.esc(p.pos || '50% 0%')}" ` : m0))}<i class="vd-glare" aria-hidden="true"></i></div></div></div></div>
  <div class="vd-words vis-l1">${p.kicker ? `<div class="vd-k"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}${p.title ? `<h2 class="vd-t">${P.words(p.title, p.gold)}</h2>` : ''}${p.caption ? `<p class="vd-c">${cx.esc(p.caption)}</p>` : ''}</div>`;
  const q = (s) => el.querySelector(s), rig = q('.vd-rig'), lid = q('.vd-lid'), tl = cx.gsap.timeline({paused: true});
  tl.fromTo(rig, {rotateX: 58, rotateY: -38, rotateZ: 6, scale: 0.62, y: 140, opacity: 0}, {rotateX: 17, rotateY: -14, rotateZ: 0, scale: 1, y: 0, opacity: 1, duration: 2.2, ease: 'expo.out'}, 0);
  tl.fromTo(q('.vd-screen'), {filter: 'brightness(0)'}, {filter: 'brightness(1)', duration: 1.0, ease: 'power2.out'}, 0.9);
  tl.fromTo(q('.vd-glare'), {opacity: 0.9, backgroundPosition: '0 0'}, {opacity: 0.35, duration: 1.6}, 1.0);
  if (q('.vd-k')) { tl.fromTo(q('.vd-k i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0.6); P.rise(tl, q('.vd-k span'), 0.65, {y: 10}); }
  if (q('.vd-t')) P.wordsIn(tl, q('.vd-t'), 0.8);
  P.rise(tl, q('.vd-c'), 1.2, {y: 18});
  const d = tl.duration();
  const m = q('.vd-m');
  return cx.vis.ambient(tl, el, (t) => {
    // the body follows the media: portrait means phone (known once the clip or picture has its size)
    if (!fixed && m) { const w = m.videoWidth || m.naturalWidth, h = m.videoHeight || m.naturalHeight; if (w && h && (h > w) !== phone) { phone = h > w; el.classList.toggle('phone', phone); } }
    // the lid opens on the clock (a phone has no lid)
    lid.style.transform = phone ? 'none' : `rotateX(${(-84 + 80 * cx.prog(t, 0.25, 2.05, 'out')).toFixed(3)}deg)`;
    if (t <= d) return; const k = t - d;
    rig.style.transform = `rotateX(${(17 - Math.min(4, k * 0.25) + Math.sin(k * 0.2)).toFixed(3)}deg) rotateY(${(-14 + Math.min(6, k * 0.4) + Math.sin(k * 0.16) * 2).toFixed(3)}deg) scale(${(1 + Math.min(0.05, k * 0.004)).toFixed(4)})`;
  });
}
