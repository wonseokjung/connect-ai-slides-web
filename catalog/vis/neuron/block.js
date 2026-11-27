// vis/neuron: a perceptron as a living picture. Inputs send pulses of light along weighted edges that breathe,
// the pulses gather in the sum, pass the step inside the activation and light the output. Only the symbols given.
export const css = `
.b-vis-neuron .pro-body { position: relative; }
.b-vis-neuron .nr-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-vis-neuron .nr-edge { fill: none; stroke: var(--gold); stroke-linecap: round; }
.b-vis-neuron .nr-edge.base { stroke: var(--line); }
.b-vis-neuron .nr-node { fill: var(--bg2); stroke: var(--line); stroke-width: 1.5; }
.b-vis-neuron .nr-core { fill: url(#nrCore); }
.b-vis-neuron .nr-step { fill: none; stroke: var(--gold2); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
.b-vis-neuron .nr-lab { position: absolute; transform: translate(-50%, -50%); font-size: calc(var(--title) * 0.5); color: var(--ink); white-space: nowrap; line-height: 1; }
.b-vis-neuron .nr-lab.big { font-size: calc(var(--title) * 0.62); }
.b-vis-neuron .nr-lab.w { font-size: var(--lead); color: var(--gold2); }
.b-vis-neuron .nr-lab.cap { font-size: var(--body); color: var(--dim); }
.cs-frame[data-shape="tall"] .b-vis-neuron .nr-lab { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-vis-neuron .nr-lab.w { font-size: var(--body); }
.b-vis-neuron .nr-eq { position: absolute; left: 0; right: 0; bottom: 0; text-align: center; font-size: calc(var(--lead) * 1.05); font-weight: var(--thin); color: var(--ivory); }
.b-vis-neuron .nr-nt { position: absolute; left: 0; bottom: 0; font-size: calc(var(--body) * 0.8); color: var(--dim); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc, tall = cx.shape === 'tall';
  const ins = (p.inputs && p.inputs.length ? p.inputs : ['x1', 'x2']).slice(0, 4).map(String);
  const ws = (p.weights || []).slice(0, ins.length).map(String);
  el.innerHTML = `<i class="pro-glow" style="--gx:58%;--gy:52%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2"></div>${P.foot(cx)}</div>`;
  const body = el.querySelector('.pro-body');
  const k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1, br = body.getBoundingClientRect();
  const W = br.width / k || cx.w * 0.84, H0 = br.height / k || cx.h * 0.6;
  const eqH = p.eq ? (tall ? 70 : 110) : 0, H = Math.max(120, H0 - eqH);
  // layout: left to right on a slide, top to bottom on a phone
  const u = Math.min(W, H);
  const R = tall ? u * 0.11 : u * 0.135, RS = R * 1.4;
  const at = (fx, fy) => (tall ? [fy * W, fx * H] : [fx * W, fy * H]);
  const n = ins.length;
  const inPos = ins.map((_, i) => at(0.07, n === 1 ? 0.5 : 0.14 + (0.72 * i) / (n - 1)));
  const sumP = at(0.47, 0.5), actP = at(0.72, 0.5), outP = at(0.93, 0.5), biasP = p.bias ? at(0.3, tall ? 0.12 : 0.06) : null;
  const curve = (a, b) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; return tall ? `M${a[0]} ${a[1]} C${a[0]} ${my} ${b[0]} ${my} ${b[0]} ${b[1]}` : `M${a[0]} ${a[1]} C${mx} ${a[1]} ${mx} ${b[1]} ${b[0]} ${b[1]}`; };
  const edges = inPos.map((a) => curve(a, sumP));
  if (biasP) edges.push(curve(biasP, sumP));
  const chain = [curve(sumP, actP), curve(actP, outP)];
  const sq = R * 1.25;   // activation box half-size
  const stepD = `M${actP[0] - sq * 0.62} ${actP[1] + sq * 0.38} L${actP[0]} ${actP[1] + sq * 0.38} L${actP[0]} ${actP[1] - sq * 0.38} L${actP[0] + sq * 0.62} ${actP[1] - sq * 0.38}`;
  const NP = 3;   // pulses per edge
  const svg = `<svg class="nr-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs>
      <radialGradient id="nrCore" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--gold2)" stop-opacity="0.55"/><stop offset="0.55" stop-color="var(--gold)" stop-opacity="0.16"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient>
      <radialGradient id="nrPulse" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF4DC" stop-opacity="1"/><stop offset="0.35" stop-color="var(--gold2)" stop-opacity="0.85"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient>
      <filter id="nrGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${R * 0.12}"/></filter>
    </defs>
    ${[...edges, ...chain].map((d, i) => `<path class="nr-edge base" d="${d}" stroke-width="${R * 0.05}"/><path class="nr-edge live" data-i="${i}" d="${d}"/>`).join('')}
    <circle class="nr-core" cx="${sumP[0]}" cy="${sumP[1]}" r="${RS * 2.3}"/>
    <circle class="nr-core oc" cx="${outP[0]}" cy="${outP[1]}" r="${R * 2.2}"/>
    ${inPos.map((q) => `<circle class="nr-node in" cx="${q[0]}" cy="${q[1]}" r="${R}"/>`).join('')}
    ${biasP ? `<circle class="nr-node in" cx="${biasP[0]}" cy="${biasP[1]}" r="${R * 0.8}"/>` : ''}
    <circle class="nr-node sum" cx="${sumP[0]}" cy="${sumP[1]}" r="${RS}" style="stroke:var(--gold);stroke-width:2"/>
    <rect class="nr-node act" x="${actP[0] - sq}" y="${actP[1] - sq}" width="${sq * 2}" height="${sq * 2}" rx="${sq * 0.28}"/>
    <path class="nr-step" d="${stepD}"/>
    <circle class="nr-node out" cx="${outP[0]}" cy="${outP[1]}" r="${R}"/>
    <g class="nr-pulses">${[...edges, ...chain].map((_, i) => Array.from({length: NP}, (_, j) => `<circle class="nr-p" data-e="${i}" data-j="${j}" r="${R * 0.2}" fill="url(#nrPulse)"/>`).join('')).join('')}</g>
  </svg>`;
  const pct = (q) => `left:${(q[0] / W) * 100}%;top:${(q[1] / H) * 100}%`;
  const mid = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const wl = ws.map((w, i) => { const m = mid(inPos[i], sumP, 0.42), up = inPos[i][1] <= sumP[1]; return `<span class="nr-lab w" style="${pct(tall ? [m[0] + R * 0.9, m[1]] : [m[0], m[1] + (up ? -R * 0.62 : R * 0.62)])}">${P.math(w)}</span>`; }).join('');
  const labs = `${inPos.map((q, i) => `<span class="nr-lab" style="${pct(q)}">${P.math(ins[i])}</span>`).join('')}
    ${biasP ? `<span class="nr-lab w" style="${pct(biasP)}">${P.math(p.bias)}</span>` : ''}${wl}
    <span class="nr-lab big" style="${pct(sumP)}">${P.math(p.sum || 'Σ')}</span>
    ${p.act ? `<span class="nr-lab cap" style="${pct(tall ? [actP[0] + sq + R * 0.9, actP[1]] : [actP[0], actP[1] + sq + R * 0.6])}">${P.math(p.act)}</span>` : ''}
    <span class="nr-lab" style="${pct(outP)}">${P.math(p.out || 'y')}</span>`;
  body.innerHTML = `<div style="position:absolute;left:0;top:0;width:100%;height:${H}px">${svg}${labs}</div>${p.eq ? `<div class="nr-eq">${P.math(p.eq)}</div>` : ''}${p.note && !p.eq ? `<p class="nr-nt">${esc(p.note)}</p>` : ''}`;
  const qa = (s) => [...el.querySelectorAll(s)];
  const live = qa('.nr-edge.live'), lens = live.map((e) => e.getTotalLength());
  const pulses = qa('.nr-p'), nIn = edges.length;
  live.forEach((e, i) => { e.style.strokeDasharray = lens[i]; e.style.strokeDashoffset = lens[i]; });
  // entrance
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  tl.fromTo(qa('.nr-node'), {scale: 0, transformOrigin: '50% 50%', opacity: 0}, {scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.07, transformBox: 'fill-box'}, t0);
  tl.fromTo(qa('.nr-lab'), {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.04}, t0 + 0.3);
  live.forEach((e, i) => tl.to(e, {strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut'}, t0 + 0.35 + (i < nIn ? i * 0.08 : 0.6 + (i - nIn) * 0.25)));
  const stp = el.querySelector('.nr-step'), sl = stp.getTotalLength(); stp.style.strokeDasharray = sl;
  tl.fromTo(stp, {strokeDashoffset: sl}, {strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut'}, t0 + 1.0);
  P.rise(tl, el.querySelector('.nr-eq'), t0 + 1.3, {y: 16});
  P.rise(tl, el.querySelector('.nr-nt'), t0 + 1.3, {y: 10});
  const FLOW = t0 + 1.2, PER = 1.6;   // one wave: inputs -> sum (PER), sum -> act -> out (PER * 0.9)
  const core = el.querySelector('.nr-core'), oc = el.querySelector('.nr-core.oc'), outN = el.querySelector('.nr-node.out');
  function draw(t) {
    const tt = t - FLOW;
    live.forEach((e, i) => { const breathe = i < nIn ? 1 + 0.45 * Math.sin(tt * 1.7 + i * 1.9) : 1; e.style.strokeWidth = (R * (i < nIn ? 0.085 : 0.11) * breathe).toFixed(2); e.style.opacity = i < nIn ? 0.55 + 0.25 * Math.sin(tt * 1.7 + i * 1.9) : 0.8; });
    pulses.forEach((c) => {
      const e = +c.dataset.e, j = +c.dataset.j, chainI = e - nIn;
      let f;
      if (e < nIn) f = ((tt / PER) + j / NP + e * 0.07) % 1;
      else f = ((tt / PER) + j / NP - 0.0) % 1;
      if (tt < 0) { c.style.opacity = 0; return; }
      const ph = e < nIn ? f : (chainI === 0 ? ((f + 0.0) % 1) : ((f + 0.5) % 1));
      const pt = live[e].getPointAtLength(lens[e] * ph);
      c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1));
      c.style.opacity = (Math.sin(Math.PI * ph) * Math.min(1, tt / 0.6)).toFixed(3);
    });
    const beat = tt < 0 ? 0 : 0.5 + 0.5 * Math.sin((tt / PER) * Math.PI * 2 - 1.2);
    core.style.opacity = tt < 0 ? 0 : (0.55 + 0.45 * beat) * Math.min(1, tt / 0.6);
    oc.style.opacity = tt < 0 ? 0 : (0.35 + 0.65 * (0.5 + 0.5 * Math.sin((tt / PER) * Math.PI * 2 - 3.0))) * Math.min(1, tt / 0.8);
    outN.style.stroke = tt > 0 ? 'var(--gold2)' : '';
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: FLOW + PER * 1.4});
}
