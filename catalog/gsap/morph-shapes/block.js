// GSAP MorphSVG: one thin outline changes shape at every step (play button, slide, browser window, cube, circle) and the label beside it changes with it.
export const css = `
.b-gsap-morph-shapes .wrap { display: grid; grid-template-columns: 0.85fr 1.15fr; align-items: center; gap: calc(var(--gap) * 2); }
.b-gsap-morph-shapes svg { display: block; width: 100%; max-height: 62cqh; aspect-ratio: 1; overflow: visible; }
.b-gsap-morph-shapes svg path, .b-gsap-morph-shapes svg circle { fill: none; vector-effect: non-scaling-stroke; stroke-linejoin: round; stroke-linecap: round; }
.b-gsap-morph-shapes .out { stroke: var(--gold); stroke-width: 2.5px; }
.b-gsap-morph-shapes .det path { stroke: var(--ivory); stroke-width: 1.5px; }
.b-gsap-morph-shapes .det circle { fill: var(--ivory); stroke: none; }
.b-gsap-morph-shapes .txs { display: grid; }
.b-gsap-morph-shapes .tx { grid-area: 1 / 1; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.55); justify-content: center; }
.b-gsap-morph-shapes .ct { font-size: var(--label); letter-spacing: 0.26em; color: var(--gold2); }
.b-gsap-morph-shapes .ct b { font-weight: 400; color: var(--dim); }
.b-gsap-morph-shapes .cs-title { font-size: calc(var(--title) * 1.3); }
.b-gsap-morph-shapes .cs-lead { max-width: 17em; }
.b-gsap-morph-shapes .dots { display: flex; gap: 0.7em; margin-top: calc(var(--gap) * 0.6); font-size: var(--label); }
.b-gsap-morph-shapes .dots i { display: block; width: 2.4em; height: 2px; background: var(--line); }
.cs-frame[data-shape="tall"] .b-gsap-morph-shapes .wrap { grid-template-columns: 1fr; gap: var(--gap); }
.cs-frame[data-shape="tall"] .b-gsap-morph-shapes svg { max-height: 30cqh; width: auto; height: 30cqh; }
`;
const SHAPES = {
  play: {d: 'M62 42 L158 100 L62 158 Z', det: ''},
  slide: {d: 'M22 50 H178 V150 H22 Z', det: '<path d="M44 80 H112 M44 102 H142 M44 124 H96"/>'},
  browser: {d: 'M22 38 H178 V162 H22 Z', det: '<path d="M22 66 H178 M46 96 H118 M46 118 H154 M46 140 H100"/><circle cx="38" cy="52" r="3"/><circle cx="50" cy="52" r="3"/><circle cx="62" cy="52" r="3"/>'},
  cube: {d: 'M100 26 L166 63 V137 L100 174 L34 137 V63 Z', det: '<path d="M34 63 L100 100 L166 63 M100 100 V174"/>'},
  circle: {d: 'M100 28 C139.8 28 172 60.2 172 100 C172 139.8 139.8 172 100 172 C60.2 172 28 139.8 28 100 C28 60.2 60.2 28 100 28 Z', det: '<path d="M100 28 C76 52 76 148 100 172 M100 28 C124 52 124 148 100 172 M28 100 H172"/>'},
};
export default function mount(el, p, cx) {
  cx.plugin('MorphSVGPlugin');
  const g = cx.gsap, stages = (p.stages || []).slice(0, 5).map((s) => ({...s, sh: SHAPES[s.shape] || SHAPES.circle})), n = stages.length;
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="wrap">
      <svg viewBox="0 0 200 200" aria-hidden="true"><path class="out" d="${stages[0].sh.d}"/>${stages.map((s) => `<g class="det">${s.sh.det}</g>`).join('')}</svg>
      <div>
        <div class="txs">${stages.map((s, i) => `<div class="tx"><div class="ct cs-num">${String(i + 1).padStart(2, '0')} <b>/ ${String(n).padStart(2, '0')}</b></div><h3 class="cs-title">${cx.esc(s.label)}</h3>${s.text ? `<p class="cs-lead">${cx.esc(s.text)}</p>` : ''}</div>`).join('')}</div>
        <div class="dots" aria-hidden="true">${stages.map(() => '<i></i>').join('')}</div>
      </div>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), out = q('.out'), dets = el.querySelectorAll('.det'), txs = el.querySelectorAll('.tx'), dots = el.querySelectorAll('.dots i');
  const gold = getComputedStyle(el).getPropertyValue('--gold2').trim() || '#F2B45A';
  const tl = g.timeline({paused: true});
  g.set(txs, {opacity: 0}); g.set(dets, {opacity: 0});
  if (q('.cs-kicker')) tl.fromTo(q('.cs-kicker'), {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0);
  tl.fromTo(q('svg'), {opacity: 0, scale: 0.86, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out'}, 0.1);
  tl.fromTo(txs[0], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 0.35);
  tl.to(dets[0], {opacity: 1, duration: 0.5, ease: 'power1.out'}, 0.6);
  tl.fromTo(q('.dots'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.5);
  tl.to(dots[0], {backgroundColor: gold, duration: 0.4}, 0.6);
  const first = 1.5, each = 1.7;
  for (let i = 1; i < n; i++) {
    const T = first + each * (i - 1);
    tl.addLabel('step' + i, T);
    tl.to(dets[i - 1], {opacity: 0, duration: 0.25, ease: 'power1.in'}, T);
    tl.to(txs[i - 1], {opacity: 0, y: -22, duration: 0.35, ease: 'power2.in'}, T);
    tl.to(out, {morphSVG: {shape: stages[i].sh.d}, duration: 0.9, ease: 'expo.inOut'}, T + 0.05);
    tl.fromTo(txs[i], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.65, ease: 'power3.out'}, T + 0.45);
    tl.to(dets[i], {opacity: 1, duration: 0.45, ease: 'power1.out'}, T + 0.75);
    tl.to(dots[i], {backgroundColor: gold, duration: 0.4}, T + 0.4);
  }
  tl.to({}, {duration: 0.01}, first + each * (n - 1) - 0.25);
  return cx.fromGsap(tl);
}
