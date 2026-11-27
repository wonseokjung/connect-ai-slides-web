// three/bars: the user's numbers as 3D columns on a reflecting floor (connect-ai-three stage, lessons 6-7). The columns
// grow one by one, the camera slowly circles, and every value is real text that rides on the top of its column.
export const css = `
.b-three-bars { overflow: hidden; }
.b-three-bars .vis-3d { position: absolute; inset: 0; }
.b-three-bars .pro-wrap { z-index: 2; pointer-events: none; }
.b-three-bars .tb-tags { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.b-three-bars .tb-v { position: absolute; left: 0; top: 0; transform: translate(-50%, -100%); white-space: nowrap; font-size: var(--lead); font-weight: 300; color: var(--ink); text-shadow: 0 2px 18px color-mix(in srgb, var(--bg) 70%, transparent); }
.b-three-bars .tb-v small { font-size: 0.5em; margin-left: 0.2em; color: var(--dim); letter-spacing: 0.06em; }
.b-three-bars .tb-v.hi { font-size: calc(var(--title) * 1.1); color: var(--gold2); font-family: var(--serif); padding-bottom: 0.12em; z-index: 1; }
.b-three-bars .tb-l { position: absolute; left: 0; top: 0; transform: translate(-50%, 0); white-space: nowrap; font-size: var(--body); color: var(--dim); }
:is(.look-white, .look-ivory, .look-paper) .b-three-bars .tb-l { color: var(--ink); }
.b-three-bars .tb-l.hi { color: var(--ink); }
.b-three-bars .tb-note { position: absolute; z-index: 2; right: var(--pad); bottom: calc(var(--pad) * 0.9); font-size: calc(var(--body) * 0.8); color: var(--dim); letter-spacing: 0.04em; }
.cs-frame[data-shape="tall"] .b-three-bars .tb-v { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-three-bars .tb-v.hi { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-three-bars .tb-v small { font-size: var(--label); }
.cs-frame[data-shape="tall"] .b-three-bars .tb-l { font-size: var(--body); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, tall = cx.shape === 'tall', pal = cx.vis.palette(el);
  const items = (p.items || []).slice(0, 8).map((it) => ({label: String(it.label), value: Number(String(it.value).replace(/,/g, '')) || 0}));
  const n = items.length || 1, max = Math.max(1e-9, ...items.map((i) => i.value)), dec = Math.max(0, p.decimals | 0);
  const hi = p.highlight == null ? items.findIndex((i) => i.value === max) : p.highlight - 1;
  const comma = items.some((i) => i.value >= 10000);
  const W = tall ? 0.34 : 0.5, GAP = tall ? 0.14 : 0.3, H = tall ? 2.6 : 2.2, AT = 0.5, STEP = 0.14, GROW = 1.3;
  const x0 = (i) => (i - (n - 1) / 2) * (W + GAP);
  el.innerHTML = `<div class="pro-wrap">${P.head(p)}<div class="pro-body"></div>${P.foot(cx)}</div>
    <div class="tb-tags">${items.map((it, i) => `<div class="tb-v cs-num${i === hi ? ' hi' : ''}"><span class="n">${P.fmt(it.value, dec, comma)}</span>${p.unit && (i === hi || n <= 4) ? `<small>${cx.esc(p.unit)}</small>` : ''}</div><div class="tb-l${i === hi ? ' hi' : ''}">${cx.esc(it.label)}</div>`).join('')}</div>
    ${p.note ? `<p class="tb-note">${cx.esc(p.note)}</p>` : ''}`;
  const bg = {type: 'gradient', top: pal.bg, bottom: pal.bg};
  const spec = {
    name: 'bars', duration: 40, look: pal.light ? 'pale-studio' : 'connect-gold-night', background: bg,
    fog: {color: pal.bg, density: pal.light ? 0.045 : 0.06},
    // on a phone the columns are close together: a nearly frontal camera keeps every value apart from its neighbours
    camera: {position: tall ? [0, 2.7, 3.2 + n * 0.22] : [0, 4.3, 4.6 + n * 0.5], target: [0, tall ? 1.3 : 1.05, 0], fov: tall ? 40 : 32,
      motion: [{type: 'dolly', from: tall ? 1.1 : 1.22, to: 1.0, at: 0, dur: 7, ease: 'out'}, tall ? {type: 'orbit', from: -6, to: 6, lift: 2, at: 0, dur: 40, ease: 'inOut'} : {type: 'orbit', from: -22, to: -4, lift: 3, at: 0, dur: 5, ease: 'out'}, {type: 'orbit', from: 0, to: 6, lift: 0.5, at: 5, dur: 40, ease: 'inOut'}]},
    objects: [
      pal.light ? {id: 'floor', type: 'floor', kind: 'matte', material: {preset: 'clay', color: pal.bg}, size: 300} : {id: 'floor', type: 'floor', kind: 'mirror'},
      {id: 'shadow', type: 'floor', kind: 'shadow', opacity: pal.light ? 0.3 : 0.45},
      {id: 'bars', type: 'bars', values: items.map((i) => i.value), highlight: hi, height: H, barWidth: W, gap: GAP, at: AT, position: [0, 0, 0], material: 'gold', material2: pal.light ? {preset: 'paint', color: '#4a4238'} : 'black'},
    ],
  };
  if (!pal.light) spec.lights = [{type: 'key', color: '#fff0dc', intensity: 2.4, position: [-3.2, 5, 4.5]}, {type: 'rim', color: pal.gold, intensity: 8, position: [3.6, 2.6, -4.2]}, {type: 'rim', color: pal.gold2, intensity: 3, position: [-4, 1.6, -3]}, {type: 'ambient', color: '#8fa0b8', intensity: 0.14}];
  const s3 = cx.vis.three(el, spec);
  const vs = [...el.querySelectorAll('.tb-v')], ls = [...el.querySelectorAll('.tb-l')], ns = vs.map((v) => v.querySelector('.n'));
  const ease = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  let V = null;
  function place(t) {
    const st = s3.stage; if (!st) return;
    const T = st.THREE, cam = st.camera, w = el.offsetWidth, h = el.offsetHeight;
    if (!V) V = new T.Vector3();
    items.forEach((it, i) => {
      const k = ease(cx.clamp((t - AT - i * STEP) / GROW, 0, 1)), top = Math.max(0.02, (it.value / max) * H) * k;
      V.set(x0(i), top + 0.08, 0).project(cam);
      vs[i].style.transform = `translate(${((V.x + 1) / 2) * w}px, ${((1 - V.y) / 2) * h}px) translate(-50%, -100%)`;
      vs[i].style.opacity = cx.clamp((t - AT - i * STEP - 0.15) / 0.5, 0, 1);
      ns[i].textContent = P.fmt(it.value * k, dec, comma);
      V.set(x0(i), 0, W / 2 + 0.05).project(cam);
      ls[i].style.transform = `translate(${((V.x + 1) / 2) * w}px, ${((1 - V.y) / 2) * h + 10}px) translate(-50%, 0)`;
      ls[i].style.opacity = cx.clamp((t - AT - i * STEP) / 0.6, 0, 1);
    });
  }
  const tl = cx.gsap.timeline({paused: true});
  tl.fromTo(s3.host, {opacity: 0}, {opacity: 1, duration: 1.2, ease: 'power2.out'}, 0);
  P.headIn(tl, el, 0.1);
  if (p.note) P.rise(tl, el.querySelector('.tb-note'), AT + n * STEP + 0.6, {y: 10});
  tl.set({}, {}, AT + (n - 1) * STEP + GROW + 0.2);
  return cx.vis.ambient(tl, el, (t) => { s3.render(t); place(t); }, {ready: s3.ready, dispose: s3.dispose, fit: () => { s3.resize && s3.resize(); }});
}
