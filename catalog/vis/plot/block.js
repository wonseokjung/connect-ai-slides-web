// vis/plot: functions drawn by a tracer. Each curve draws itself behind a glowing point, with dashed drops to both
// axes so you see x turn into y; the curve being drawn glows, its name lands at its end. Afterwards the tracer keeps
// riding the curves, one after another.
export const css = `
.b-vis-plot .pro-body { position: relative; }
.b-vis-plot svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-vis-plot .pl-grid line { stroke: var(--faint); stroke-width: 1; }
.b-vis-plot .pl-ax { stroke: color-mix(in srgb, var(--ink) 42%, transparent); stroke-width: 2; }
.b-vis-plot .pl-cv { fill: none; stroke-width: 5; stroke-linejoin: round; stroke-linecap: round; }
.b-vis-plot .pl-gl { fill: none; stroke-width: 20; stroke-linejoin: round; opacity: 0; filter: url(#plBlur); }
.b-vis-plot .pl-drop { stroke: var(--gold2); stroke-width: 1.5; stroke-dasharray: 5 7; opacity: 0.7; }
.b-vis-plot .pl-lab { position: absolute; font-size: var(--lead); white-space: nowrap; transform: translate(-100%, -130%); }
.b-vis-plot .pl-axl { position: absolute; font-size: calc(var(--label) * 1.15); color: var(--ivory); letter-spacing: 0.08em; }
.b-vis-plot .pl-nt { position: absolute; left: 0; bottom: 0; font-size: calc(var(--body) * 0.8); color: var(--dim); }
.cs-frame[data-shape="tall"] .b-vis-plot .pl-lab { font-size: var(--body); }
`;
const FN = {step: (x) => (x > 0 ? 1 : 0), sigmoid: (x) => 1 / (1 + Math.exp(-x)), relu: (x) => Math.max(0, x), tanh: (x) => Math.tanh(x), linear: (x) => x, parabola: (x) => x * x};
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc, tall = cx.shape === 'tall';
  const cols = ['var(--gold2)', 'var(--ivory)', 'var(--c2)'];
  const curves = (p.curves || []).slice(0, 3).map((c, i) => ({fn: FN[String(c.fn || '').toLowerCase()] ? String(c.fn).toLowerCase() : 'linear', label: c.label || c.fn, col: cols[i]}));
  el.innerHTML = `<i class="pro-glow" style="--gx:40%;--gy:55%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2"></div>${P.foot(cx)}</div>`;
  const body = el.querySelector('.pro-body');
  const k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1, br = body.getBoundingClientRect();
  const W = br.width / k || cx.w * 0.84, H = br.height / k || cx.h * 0.6;
  const [x0, x1] = Array.isArray(p.range) && p.range.length === 2 ? p.range.map(Number) : [-5, 5];
  let ys = []; curves.forEach((c) => { for (let s = 0; s <= 100; s++) ys.push(FN[c.fn](x0 + ((x1 - x0) * s) / 100)); });
  let y0 = Math.min(0, ...ys), y1 = Math.max(1, ...ys);
  if (curves.some((c) => /relu|linear|parabola/.test(c.fn)) && curves.some((c) => /step|sigmoid/.test(c.fn))) { y1 = Math.min(y1, 2.2); y0 = Math.max(y0, -0.25); }
  const pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
  const L0 = tall ? W * 0.02 : W * 0.06, R0 = tall ? W * 0.98 : W * 0.9, T0 = H * 0.06, B0 = H * (tall ? 0.86 : 0.88);
  const X = (x) => L0 + ((x - x0) / (x1 - x0)) * (R0 - L0), Y = (y) => B0 - ((Math.max(y0 - 1, Math.min(y1 + 1, y)) - y0) / (y1 - y0)) * (B0 - T0);
  const path = (c) => { let d = '', prev = null; for (let s = 0; s <= 240; s++) { const x = x0 + ((x1 - x0) * s) / 240, y = FN[c.fn](x); const jump = prev != null && Math.abs(y - prev) > (y1 - y0) * 0.5; d += (s === 0 ? 'M' : jump ? `L${X(x).toFixed(1)} ${Y(prev).toFixed(1)} L` : 'L') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1) + ' '; prev = y; } return d; };
  const ax = X(Math.max(x0, Math.min(x1, 0))), ay = Y(Math.max(y0, Math.min(y1, 0)));
  body.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs><filter id="plBlur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
    <radialGradient id="plDot" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF6E2"/><stop offset="0.3" stop-color="var(--gold2)" stop-opacity="0.9"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient>
    <clipPath id="plClip"><rect x="${L0 - 10}" y="${T0}" width="${R0 - L0 + 20}" height="${B0 - T0 + 10}"/></clipPath></defs>
    <g class="pl-grid">${[-4, -2, 2, 4].filter((v) => v > x0 && v < x1).map((v) => `<line x1="${X(v)}" x2="${X(v)}" y1="${T0}" y2="${B0}"/>`).join('')}${[0.5, 1, 1.5, 2].filter((v) => v < y1).map((v) => `<line x1="${L0}" x2="${R0}" y1="${Y(v)}" y2="${Y(v)}"/>`).join('')}</g>
    <line class="pl-ax" x1="${L0}" x2="${R0}" y1="${ay}" y2="${ay}"/><line class="pl-ax" x1="${ax}" x2="${ax}" y1="${T0}" y2="${B0}"/>
    <g clip-path="url(#plClip)">${curves.map((c, i) => `<path class="pl-gl" data-i="${i}" d="${path(c)}" stroke="${c.col}"/><path class="pl-cv" data-i="${i}" d="${path(c)}" stroke="${c.col}"/>`).join('')}</g>
    <line class="pl-drop dx"/><line class="pl-drop dy"/><circle class="pl-dot" r="30" fill="url(#plDot)"/><circle class="pl-pin" r="7" fill="var(--gold2)"/>
  </svg>${curves.map((c, i) => `<span class="pl-lab" data-i="${i}" style="color:${c.col}">${esc(c.label)}</span>`).join('')}
  <span class="pl-axl" style="left:${(R0 / W) * 100}%;top:${((ay + 12) / H) * 100}%">${P.math(p.xlabel || 'x')}</span>
  <span class="pl-axl" style="left:${((ax + 14) / W) * 100}%;top:${((T0 - 8) / H) * 100}%">${P.math(p.ylabel || 'y')}</span>
  ${p.note ? `<p class="pl-nt">${esc(p.note)}</p>` : ''}`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const cvs = qa('.pl-cv'), gls = qa('.pl-gl'), labs = qa('.pl-lab'), dot = q('.pl-dot'), pin = q('.pl-pin'), dx = q('.pl-drop.dx'), dy = q('.pl-drop.dy');
  const Ls = cvs.map((c) => c.getTotalLength());
  cvs.forEach((c, i) => { c.style.strokeDasharray = Ls[i]; gls[i].style.strokeDasharray = Ls[i]; });
  // label at the end of each curve, staggered so they never sit on each other
  // the label sits where the curve leaves the plot (its end, or where it runs out of the top); odd ones go under the line
  labs.forEach((l, i) => {
    let x = x1, y = FN[curves[i].fn](x);
    for (let s = 0; s <= 400 && y > y1 - (y1 - y0) * 0.04; s++) { x = x1 - ((x1 - x0) * s) / 400; y = FN[curves[i].fn](x); }
    l.style.left = (Math.min(X(x), R0) / W) * 100 + '%'; l.style.top = (Y(y) / H) * 100 + '%'; l.dataset.dn = i % 2 ? '1' : '';
  });
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  tl.fromTo(qa('.pl-grid line, .pl-ax'), {opacity: 0}, {opacity: 1, duration: 0.8, stagger: 0.03}, t0 - 0.2);
  tl.fromTo(qa('.pl-axl'), {opacity: 0}, {opacity: 1, duration: 0.6}, t0 + 0.2);
  P.rise(tl, q('.pl-nt'), t0 + 1, {y: 10});
  const D0 = t0 + 0.15, DD = 1.3, GAP = 0.25, END = D0 + curves.length * (DD + GAP);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), eio = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  function tracer(i, f, alpha) {
    const pt = cvs[i].getPointAtLength(Ls[i] * f);
    for (const c of [dot, pin]) { c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.style.opacity = alpha; }
    dx.setAttribute('x1', pt.x); dx.setAttribute('x2', pt.x); dx.setAttribute('y1', pt.y); dx.setAttribute('y2', ay);
    dy.setAttribute('x1', pt.x); dy.setAttribute('x2', ax); dy.setAttribute('y1', pt.y); dy.setAttribute('y2', pt.y);
    dx.style.opacity = dy.style.opacity = alpha * 0.7;
  }
  function draw(t) {
    let active = -1;
    curves.forEach((_, i) => {
      const a = D0 + i * (DD + GAP), f = eio(clamp((t - a) / DD, 0, 1));
      cvs[i].style.strokeDashoffset = Ls[i] * (1 - f); gls[i].style.strokeDashoffset = Ls[i] * (1 - f);
      cvs[i].style.opacity = t < a ? 0 : 1;
      if (t >= a && t < a + DD + GAP) active = i;
      const lab = clamp((t - a - DD + 0.2) / 0.4, 0, 1); labs[i].style.opacity = lab; labs[i].style.transform = `translate(${curves[i].fn === 'relu' || curves[i].fn === 'linear' || curves[i].fn === 'parabola' ? '-120%' : '-100%'}, calc(${labs[i].dataset.dn ? '40%' : '-130%'} + ${(1 - lab) * 14}px))`;
    });
    if (t < END) {
      gls.forEach((g, i) => { g.style.opacity = i === active ? 0.45 : 0; });
      if (active >= 0) { const a = D0 + active * (DD + GAP); tracer(active, eio(clamp((t - a) / DD, 0, 1)), 1); } else tracer(0, 0, 0);
    } else {
      // after the entrance: the tracer rides each curve in turn, the one it rides glows
      const PER = 3.0, u = (t - END) / PER, i = Math.floor(u) % curves.length, f = u - Math.floor(u);
      gls.forEach((g, j) => { g.style.opacity = j === i ? 0.4 * Math.sin(Math.PI * f) : 0; });
      tracer(i, eio(f), Math.min(1, (t - END) / 0.4) * Math.sin(Math.PI * Math.min(1, f * 1.1)));
    }
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: END + 0.1});
}
