// three/model: a real 3D object (your .glb) on the slide, lit like a product shot, the camera slowly pushing in and
// circling while the words rise beside it. The 3D stage is connect-ai-three (lessons 6-7), seeked by time.
export const css = `
.b-three-model { overflow: hidden; }
.b-three-model .vis-3d { position: absolute; inset: 0; }
.b-three-model .m-words { position: absolute; z-index: 2; left: var(--pad); top: 0; bottom: 0; width: 44%; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.55); }
.b-three-model[data-side="right"] .m-words { left: auto; right: var(--pad); }
.b-three-model .m-kick { display: flex; align-items: center; gap: 0.8em; font-size: var(--label); letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold2); }
.b-three-model .m-kick i { width: 3.2em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-three-model .m-title { margin: 0; font-family: var(--serif); font-weight: 400; font-size: calc(var(--hero) * 0.82); line-height: 1.04; letter-spacing: -0.01em; color: var(--ink); }
.b-three-model .m-title .cs-c { display: inline-block; will-change: transform, opacity, filter; }
.b-three-model .m-sub { margin: 0; font-size: var(--lead); font-weight: var(--thin, 300); color: var(--dim); max-width: 22em; line-height: 1.4; }
.b-three-model .m-list { list-style: none; margin: calc(var(--gap) * 0.3) 0 0; padding: 0; display: grid; gap: 0.2em; }
.b-three-model .m-list li { display: flex; align-items: baseline; gap: 0.9em; font-size: var(--lead); color: var(--ink); padding: 0.42em 0; border-top: 1px solid var(--line); }
.b-three-model .m-list li b { font-weight: 400; font-size: var(--label); color: var(--gold2); letter-spacing: 0.1em; min-width: 2em; }
.b-three-model .m-shade { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(90deg, color-mix(in srgb, var(--bg) 72%, transparent) 0%, color-mix(in srgb, var(--bg) 30%, transparent) 38%, transparent 60%); }
.b-three-model[data-side="right"] .m-shade { transform: scaleX(-1); }
.cs-frame[data-shape="tall"] .b-three-model .m-words { left: var(--pad); right: var(--pad); width: auto; top: auto; bottom: calc(var(--pad) * 1.2); justify-content: flex-end; }
.cs-frame[data-shape="tall"] .b-three-model .m-title { font-size: var(--hero); }
.cs-frame[data-shape="tall"] .b-three-model .m-shade { background: linear-gradient(0deg, color-mix(in srgb, var(--bg) 88%, transparent) 0%, color-mix(in srgb, var(--bg) 40%, transparent) 42%, transparent 62%); transform: none; }
`;
export default function mount(el, p, cx) {
  const tall = cx.shape === 'tall', side = p.side === 'right' ? 'right' : 'left';
  el.dataset.side = side;
  const pal = cx.vis.palette(el), items = (p.items || []).slice(0, 4).map((x) => (typeof x === 'string' ? x : x.title || ''));
  el.innerHTML = `<i class="m-shade" aria-hidden="true"></i><div class="m-words vis-l1">
    ${p.kicker ? `<div class="m-kick"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}
    ${p.title ? `<h2 class="m-title">${cx.spans(p.title, 'cs-c', 'chars')}</h2>` : ''}
    ${p.sub || p.text ? `<p class="m-sub">${cx.esc(p.sub || p.text)}</p>` : ''}
    ${items.length ? `<ul class="m-list">${items.map((t, i) => `<li><b class="cs-num">0${i + 1}</b><span>${cx.esc(t)}</span></li>`).join('')}</ul>` : ''}
  </div>`;
  // the object sits on the side away from the words; on a phone it sits above them
  const dx = tall ? 0 : side === 'left' ? -0.95 : 0.95, dy = tall ? -0.55 : 0;
  const bg = pal.light ? {type: 'gradient', top: pal.bg, bottom: pal.bg} : {type: 'gradient', top: '#0d0c0a', bottom: pal.bg};
  const spec = {
    name: 'model', duration: 30, look: pal.light ? 'pale-studio' : 'connect-gold-night', background: bg,
    fog: pal.light ? undefined : {color: pal.bg, density: 0.03},
    camera: {position: [0, tall ? 1.6 : 1.15, tall ? 3.9 : 2.9], target: [dx * 1.3, 0.32 + dy * 0.6, 0], fov: tall ? 38 : 30,
      motion: [{type: 'dolly', from: 1.35, to: 1.0, at: 0, dur: 9, ease: 'out'}, {type: 'orbit', from: -34, to: 30, lift: 6, at: 0, dur: 30, ease: 'inOut'}]},
    objects: [
      pal.light ? null : {id: 'floor', type: 'floor', kind: 'mirror'},
      {id: 'shadow', type: 'floor', kind: 'shadow', opacity: pal.light ? 0.38 : 0.5},
      {id: 'hero', type: 'gltf', src: p.model, fit: p.fit || 1.7, position: [0, 0.02, 0], motion: [{type: 'turntable', speed: p.spin == null ? 7 : p.spin}]},
    ].filter(Boolean),
  };
  if (!pal.light) spec.lights = [{type: 'key', color: '#fff0dc', intensity: 2.6, position: [-3.2, 4.2, 4.5]}, {type: 'rim', color: pal.gold, intensity: 9, position: [3.6, 2.6, -4.2]}, {type: 'rim', color: pal.gold2, intensity: 4, position: [-4, 1.6, -3]}, {type: 'ambient', color: '#8fa0b8', intensity: 0.12}];
  const s3 = cx.vis.three(el, spec);
  const tl = cx.gsap.timeline({paused: true});
  tl.fromTo(s3.host, {opacity: 0, scale: 1.06}, {opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out'}, 0);
  const kick = el.querySelector('.m-kick');
  if (kick) { tl.fromTo(kick.querySelector('i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0.3); tl.fromTo(kick.querySelector('span'), {opacity: 0, x: -14}, {opacity: 1, x: 0, duration: 0.8, ease: 'expo.out'}, 0.4); }
  const cs = el.querySelectorAll('.m-title .cs-c');
  tl.fromTo(cs, {opacity: 0, yPercent: 70, filter: 'blur(12px)'}, {opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: Math.min(0.045, 1.0 / Math.max(1, cs.length))}, 0.5);
  cx.pro.rise(tl, el.querySelector('.m-sub'), 1.2, {y: 18});
  cx.pro.rise(tl, el.querySelectorAll('.m-list li'), 1.45, {y: 22, stagger: 0.12});
  return cx.vis.ambient(tl, el, (t) => s3.render(t), {ready: s3.ready, dispose: s3.dispose, fit: () => s3.resize && s3.resize()});
}
