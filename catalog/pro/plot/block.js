// pro/plot: built-in functions (no eval) drawn on clean axes, one colour each, the name at the end of each curve.
export const css = `
.b-pro-plot .pro-body { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: calc(var(--gap) * 1.2); }
.b-pro-plot .plot { position: relative; min-height: 0; }
.b-pro-plot svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-pro-plot svg.cvw { overflow: hidden; }
.b-pro-plot .ax { stroke: var(--line); stroke-width: 1; vector-effect: non-scaling-stroke; }
.b-pro-plot .tk { stroke: var(--faint); stroke-width: 1; vector-effect: non-scaling-stroke; }
.b-pro-plot .cv { fill: none; stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.b-pro-plot .lg { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.7); min-width: 0; }
.b-pro-plot .li { display: flex; align-items: center; gap: 0.7em; font-size: var(--lead); color: var(--ivory); white-space: nowrap; }
.b-pro-plot .li i { display: block; width: 1.6em; height: 3px; border-radius: 2px; transform-origin: 0 50%; }
.b-pro-plot .axl { position: absolute; font-size: var(--label); color: var(--dim); letter-spacing: 0.08em; white-space: nowrap; }
.b-pro-plot .nt { grid-column: 1 / -1; font-size: calc(var(--label) * 0.95); color: var(--dim); letter-spacing: 0.04em; }
.cs-frame[data-shape="tall"] .b-pro-plot .pro-body { grid-template-columns: 1fr; grid-template-rows: minmax(0, 1fr) auto auto; }
.cs-frame[data-shape="tall"] .b-pro-plot .lg { flex-direction: row; flex-wrap: wrap; gap: 0.5em 1.2em; }
.cs-frame[data-shape="tall"] .b-pro-plot .li { font-size: var(--body); }
`;
const FN = {
  step: (x) => (x > 0 ? 1 : 0), sigmoid: (x) => 1 / (1 + Math.exp(-x)), relu: (x) => Math.max(0, x), tanh: (x) => Math.tanh(x), linear: (x) => x, parabola: (x) => x * x,
};
export default function mount(el, p, cx) {
  const P = cx.pro, cols = ['var(--gold2)', 'var(--c2)', 'var(--c3)'];
  const curves = (p.curves || []).slice(0, 3).map((c, i) => ({fn: FN[String(c.fn || '').toLowerCase()] ? String(c.fn).toLowerCase() : 'linear', label: c.label || c.fn, col: cols[i]}));
  const [x0, x1] = Array.isArray(p.range) && p.range.length === 2 ? p.range.map(Number) : [-5, 5];
  const N = 160, xs = Array.from({length: N + 1}, (_, k) => x0 + ((x1 - x0) * k) / N);
  let ys = []; curves.forEach((c) => xs.forEach((x) => ys.push(FN[c.fn](x))));
  ys = ys.filter(Number.isFinite);
  let y0 = Math.min(0, ...ys), y1 = Math.max(1, ...ys);
  const capY = curves.some((c) => c.fn === 'relu' || c.fn === 'linear' || c.fn === 'parabola') && curves.some((c) => c.fn === 'step' || c.fn === 'sigmoid') ? 2.2 : null;
  if (capY) { y1 = Math.min(y1, capY); y0 = Math.max(y0, -0.2); }
  const pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
  const X = (x) => ((x - x0) / (x1 - x0)) * 100, Y = (y) => 100 - ((Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y)) - y0) / (y1 - y0)) * 100;
  const path = (c) => {
    let d = '', prev = null;
    xs.forEach((x, k) => { const y = FN[c.fn](x); const big = prev != null && Math.abs(y - prev) > (y1 - y0) * 0.5; d += (k === 0 ? 'M' : big ? 'L' + X(x).toFixed(2) + ' ' + Y(prev).toFixed(2) + ' L' : 'L') + X(x).toFixed(2) + ' ' + Y(y).toFixed(2) + ' '; prev = y; });
    return d.trim();
  };
  const ax = X(0), ay = Y(0);
  el.innerHTML = `<i class="pro-glow" style="--gx:40%;--gy:60%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">
    <div class="plot"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${[0.25, 0.5, 0.75].map((g) => `<line class="tk" x1="${g * 100}" x2="${g * 100}" y1="0" y2="100"/><line class="tk" y1="${g * 100}" y2="${g * 100}" x1="0" x2="100"/>`).join('')}
      <line class="ax" x1="0" x2="100" y1="${ay}" y2="${ay}"/><line class="ax" x1="${ax}" x2="${ax}" y1="0" y2="100"/>
    </svg>${curves.map((c, i) => `<svg class="cvw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cv c${i}" d="${path(c)}" style="stroke:${c.col}"/></svg>`).join('')}${p.xlabel ? `<span class="axl" style="right:0;top:calc(${ay}% + 0.6em)">${cx.esc(p.xlabel)}</span>` : ''}${p.ylabel ? `<span class="axl" style="left:calc(${ax}% + 0.6em);top:0">${cx.esc(p.ylabel)}</span>` : ''}</div>
    <div class="lg">${curves.map((c) => `<div class="li"><i style="background:${c.col}" aria-hidden="true"></i><span>${cx.esc(c.label)}</span></div>`).join('')}</div>
    ${p.note ? `<p class="nt">${cx.esc(p.note)}</p>` : ''}
  </div>${P.foot(cx)}</div>`;
  const tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el);
  tl.fromTo(el.querySelectorAll('.ax'), {opacity: 0}, {opacity: 1, duration: 0.6}, t - 0.2);
  tl.fromTo(el.querySelectorAll('.tk'), {opacity: 0}, {opacity: 1, duration: 0.8}, t);
  tl.fromTo(el.querySelectorAll('.axl'), {opacity: 0}, {opacity: 1, duration: 0.6}, t + 0.2);
  el.querySelectorAll('.cvw').forEach((c, i) => {
    const at = t + 0.2 + i * 0.45;
    tl.fromTo(c, {clipPath: 'inset(-10% 100% -10% -2%)'}, {clipPath: 'inset(-10% -2% -10% -2%)', duration: 1.3, ease: 'power2.inOut'}, at);
    const li = el.querySelectorAll('.li')[i];
    tl.fromTo(li.querySelector('i'), {scaleX: 0}, {scaleX: 1, duration: 0.7, ease: 'expo.out'}, at + 0.1);
    tl.fromTo(li.querySelector('span'), {opacity: 0, x: -10}, {opacity: 1, x: 0, duration: 0.7, ease: 'expo.out'}, at + 0.2);
  });
  P.rise(tl, el.querySelector('.nt'), t + 1.6, {y: 10});
  return P.clip(cx, tl, el);
}
