// vis/flow: steps on a rail of light. A straight rail draws across the frame (down the side on a phone), a comet
// travels it, each node blooms when the light arrives and a thin stem lights down into the step's card, whose words
// rise. Two or three steps are set large and fill the frame. The comet keeps travelling while the slide is on screen.
export const css = `
.b-vis-flow .pro-body { position: relative; }
.b-vis-flow svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-vis-flow .fl-base { fill: none; stroke: var(--line); stroke-width: 2; }
.b-vis-flow .fl-draw { fill: none; stroke: var(--gold); stroke-width: 2.5; opacity: 0.7; }
.b-vis-flow .fl-tail { fill: none; stroke: var(--gold2); stroke-width: 5; stroke-linecap: round; }
.b-vis-flow .fl-tailg { fill: none; stroke: var(--gold); stroke-width: 22; stroke-linecap: round; opacity: 0.45; }
.b-vis-flow .fl-node .core { fill: var(--gold2); }
.b-vis-flow .fl-node .ring { fill: var(--bg); stroke: var(--gold2); stroke-width: 2; }
.b-vis-flow .fl-lab { position: absolute; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0.3em; text-align: center; transform: translateX(-50%); box-sizing: border-box; padding: 0.9em 0.9em 1em; border-radius: calc(var(--radius) * 0.7); border: 1px solid var(--line); background: var(--card); word-break: keep-all; }
.b-vis-flow .fl-lab::before { content: ""; position: absolute; left: 18%; right: 18%; top: -1px; height: 1px; background: linear-gradient(90deg, transparent, var(--gold2), transparent); opacity: 0.8; }
.b-vis-flow .fl-no { font-family: var(--serif); font-style: italic; font-size: calc(var(--title) * 0.6); line-height: 1; color: var(--gold2); }
.b-vis-flow .fl-t { font-size: calc(var(--lead) * 1.4); color: var(--ink); line-height: 1.15; font-weight: var(--light); }
.b-vis-flow .fl-x { font-size: var(--body); color: var(--dim); line-height: 1.3; }
.b-vis-flow .fl-nt { position: absolute; left: 0; bottom: 0; font-size: calc(var(--body) * 0.8); color: var(--dim); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-flow .fl-no { color: color-mix(in srgb, var(--gold2) 78%, var(--ink)); }
.b-vis-flow.few .fl-no { font-size: calc(var(--title) * 0.8); }
.b-vis-flow.few .fl-t { font-size: min(calc(var(--title) * 0.82), calc(var(--cw, 400px) * 0.8 / var(--fln, 4))); white-space: nowrap; }
.b-vis-flow.few .fl-x { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-vis-flow .fl-lab { text-align: left; align-items: flex-start; transform: translateY(-50%); padding: 0.6em 0.8em; }
.cs-frame[data-shape="tall"] .b-vis-flow .fl-lab::before { left: -1px; right: auto; top: 20%; bottom: 20%; width: 1px; height: auto; background: linear-gradient(180deg, transparent, var(--gold2), transparent); }
.cs-frame[data-shape="tall"] .b-vis-flow .fl-t { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-vis-flow.few .fl-t { font-size: calc(var(--lead) * 1.3); }
.b-vis-flow .fl-t.m { font-family: var(--serif); font-style: normal; letter-spacing: 0; }
/* a formula is the main thing in its card: the step number steps back */
.b-vis-flow.few.hm .fl-no { font-size: calc(var(--title) * 0.46); }
.b-vis-flow.few.hm .fl-t.m { font-size: min(var(--title), calc(var(--cw, 400px) * 0.92 / var(--fln, 4))); }
`;
export default function mount(el, p, cx) {
  // a step that is a formula (a1(WX+b), h(), z) is set like the formulas on the other slides
  const isM = (t) => { t = String(t || '').trim(); return !!t && (/[()=+·]/.test(t) || /^[A-Za-z]{1,2}\d{0,2}$/.test(t)) && !/[가-힣]/.test(t) && !/[A-Za-z]{4,}\s/.test(t); };
  const P = cx.pro, esc = cx.esc, tall = cx.shape === 'tall';
  const steps = (p.steps || []).slice(0, 6).map((s) => (typeof s === 'string' ? {title: s} : {title: s.title || '', text: s.text || ''}));
  const n = steps.length || 1, few = n <= 3;
  // the longest step title (in em) keeps the big titles of two or three steps on one line inside their cards
  const ew = (s) => Array.from(String(s)).reduce((a, c) => a + (/[가-힣一-龥]/.test(c) ? 0.96 : /[A-Z]/.test(c) ? 0.66 : /\s/.test(c) ? 0.27 : 0.54), 0);
  el.style.setProperty('--fln', Math.max(3, ...steps.map((s) => ew(s.title))).toFixed(2));
  if (few) el.classList.add('few');
  if (steps.some((s) => isM(s.title))) el.classList.add('hm');
  el.innerHTML = `<i class="pro-glow" style="--gx:50%;--gy:40%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2"></div>${P.foot(cx)}</div>`;
  const body = el.querySelector('.pro-body');
  const k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1, br = body.getBoundingClientRect();
  const W = br.width / k || cx.w * 0.84, H = br.height / k || cx.h * 0.6;
  // the route: a long gentle wave (left to right on a slide, top to bottom on a phone)
  const N = 64, pts = [];
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    // a straight rail: the map block is the wave, this one is a line of steps
    if (tall) pts.push([W * 0.08, H * (0.02 + 0.96 * f)]);
    else pts.push([W * (-0.02 + 1.04 * f), H * (few ? 0.2 : 0.22)]);
  }
  const Z = tall ? 1 : few ? 1.6 : 1.2, GAP = 64 * Z;
  const d = 'M' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
  body.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs>
      <filter id="flBlur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
      <radialGradient id="flHead" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF6E2"/><stop offset="0.3" stop-color="var(--gold2)" stop-opacity="0.95"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient>
      <linearGradient id="flPil" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="var(--gold2)" stop-opacity="0.9"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></linearGradient>
      <radialGradient id="flBloom" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--gold2)" stop-opacity="0.55"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient>
    </defs>
    <path class="fl-base" d="${d}"/><path class="fl-draw" d="${d}"/>
    <path class="fl-tailg" d="${d}" filter="url(#flBlur)"/><path class="fl-tail" d="${d}"/>
    ${steps.map((_, i) => `<g class="fl-node" data-i="${i}"><circle class="bloom" r="${70 * Z}" fill="url(#flBloom)"/><line class="pil" x1="0" y1="0" x2="0" y2="0" stroke="url(#flPil)" stroke-width="2"/><circle class="ring" r="${26 * Z}"/><circle class="core" r="${12 * Z}"/></g>`).join('')}
    <circle class="fl-head" r="40" fill="url(#flHead)"/>
  </svg>${steps.map((s, i) => `<div class="fl-lab" data-i="${i}"><span class="fl-no cs-num">${String(i + 1).padStart(2, '0')}</span><span class="fl-t${isM(s.title) ? ' m' : ''}">${isM(s.title) ? P.math(s.title) : esc(s.title)}</span>${s.text ? `<span class="fl-x">${isM(s.text) ? P.math(s.text) : esc(s.text)}</span>` : ''}</div>`).join('')}
  ${p.note ? `<p class="fl-nt">${esc(p.note)}</p>` : ''}`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const base = q('.fl-draw'), tail = q('.fl-tail'), tailg = q('.fl-tailg'), head = q('.fl-head');
  const L = base.getTotalLength();
  base.style.strokeDasharray = L;
  const TAIL = L * (tall ? 0.16 : 0.12);
  for (const e of [tail, tailg]) e.style.strokeDasharray = `${TAIL} ${L * 2}`;
  // where each step sits on the route (at equal distances, away from the ends)
  const at = steps.map((_, i) => (n === 1 ? 0.5 : few && !tall ? 0.17 + (0.66 * i) / (n - 1) : 0.1 + (0.8 * i) / (n - 1)));
  const nodes = qa('.fl-node'), labs = qa('.fl-lab');
  at.forEach((f, i) => {
    const pt = base.getPointAtLength(L * f);
    nodes[i].setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    const lab = labs[i];
    if (tall) { lab.style.left = ((pt.x + 56) / W) * 100 + '%'; lab.style.top = (pt.y / H) * 100 + '%'; lab.style.right = '0'; }
    else {
      // cards share one top line under the rail; two or three steps get tall cards that fill the frame
      const cw = Math.min((W / n) * 0.86, few ? W * 0.3 : W * 0.24), top = pt.y + GAP;
      lab.style.width = cw + 'px'; lab.style.top = (top / H) * 100 + '%'; el.style.setProperty('--cw', cw + 'px');
      // rail and cards sit as one group in the middle of the space (four or more steps get shorter cards)
      lab.style.minHeight = Math.max(0, H * (p.note ? 0.76 : few ? 0.92 : 0.78) - top) + 'px';
      lab.style.left = (Math.max(cw / 2, Math.min(W - cw / 2, pt.x)) / W) * 100 + '%';
    }
  });
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  P.rise(tl, q('.fl-nt'), t0 + 2.6, {y: 10});
  const C0 = t0 + 0.1, CD = 0.7 + n * 0.32, END = C0 + CD, LOOP = 3.6;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), eio = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  function draw(t) {
    // first pass draws the route; later passes are a softer comet looping
    let f, inten;
    if (t < END + 0.4) { f = eio(clamp((t - C0) / CD, 0, 1)) * 1.08; inten = t < C0 ? 0 : 1; base.style.strokeDashoffset = L * (1 - clamp(f, 0, 1)); }
    else { const u = ((t - END - 0.4) / LOOP) % 1; f = -0.05 + 1.15 * eio(u); inten = 0.75; base.style.strokeDashoffset = 0; }
    const hp = base.getPointAtLength(L * clamp(f, 0, 1));
    head.setAttribute('cx', hp.x); head.setAttribute('cy', hp.y);
    head.style.opacity = inten * (f > 1.02 || f < 0 ? 0 : 1);
    for (const e of [tail, tailg]) { e.style.strokeDashoffset = -(L * f - TAIL); e.style.opacity = inten * (f > 1.08 ? 0 : 1); }
    const firstPass = t < END + 0.4;
    nodes.forEach((g, i) => {
      const reach = firstPass ? clamp((L * f - L * at[i]) / (L * 0.04), 0, 1) : 1;
      const near = clamp(1 - Math.abs(f - at[i]) / 0.06, 0, 1) * (firstPass ? 1 : 0.8);
      const s = 0.3 + 0.7 * (1 - Math.pow(1 - reach, 3));
      g.querySelector('.ring').setAttribute('r', (26 * s + near * 8) * Z);
      g.querySelector('.core').setAttribute('r', (12 * reach + near * 4) * Z);
      const pl = g.querySelector('.pil'); if (pl && !tall) { pl.setAttribute('x1', 0.01); pl.setAttribute('y1', 30 * Z); pl.setAttribute('y2', (30 * Z + (GAP - 30 * Z) * reach).toFixed(1)); pl.style.opacity = reach; }
      g.querySelector('.bloom').style.opacity = 0.35 * reach + 0.65 * near;
      g.style.opacity = reach > 0 ? 1 : 0.35;
      const lab = labs[i], e = 1 - Math.pow(1 - reach, 3);
      lab.style.opacity = e;
      const y = (1 - e) * 26;
      lab.style.transform = tall ? `translate(0, calc(-50% + ${y}px))` : `translate(-50%, ${y}px)`;
    });
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: END + 0.5});
}
