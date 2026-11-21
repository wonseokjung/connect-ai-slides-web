// GSAP DrawSVG: a thick gold line is drawn from the left over thin grid lines, a dot lands on every value as the line arrives,
// and the very large number beside the title follows the line: it shows the value the line has reached, and ends on the last one.
let uid = 0;
export const css = `
.b-gsap-line-chart .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.74 + var(--top)) calc(var(--pad) * 0.7) calc(var(--pad) * 0.4); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); }
.b-gsap-line-chart .top { flex: none; display: flex; justify-content: space-between; align-items: flex-end; gap: var(--gap); }
.b-gsap-line-chart .hd { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); min-width: 0; padding-bottom: calc(var(--gap) * 0.3); }
.b-gsap-line-chart .hd .cs-title { font-size: calc(var(--title) * 0.62); max-width: 13em; }
.b-gsap-line-chart .big { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: calc(var(--gap) * 0.28); }
.b-gsap-line-chart .row { display: flex; align-items: baseline; gap: 0.07em; font-size: calc(var(--hero) * 1.22); line-height: 0.8; }
.b-gsap-line-chart .v { font-weight: var(--thin); letter-spacing: -0.05em; color: var(--ink); }
.b-gsap-line-chart .u { font-size: calc(var(--title) * 0.6); font-weight: var(--thin); letter-spacing: -0.02em; color: var(--gold2); line-height: 1; }
.b-gsap-line-chart .at { color: var(--ivory); white-space: nowrap; }
.b-gsap-line-chart .big .cs-rule { width: 100%; transform-origin: 100% 50%; }
.b-gsap-line-chart .plot { position: relative; flex: 1 1 auto; min-height: 0; }
.b-gsap-line-chart .plot svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; }
.b-gsap-line-chart .grid line { stroke: var(--line); stroke-width: 1px; }
.b-gsap-line-chart .grid line.base { stroke: color-mix(in srgb, var(--ivory) 46%, transparent); }
.b-gsap-line-chart .ln { fill: none; stroke: var(--gold); stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
.b-gsap-line-chart .lead { stroke: var(--gold2); stroke-dasharray: 3 7; stroke-linecap: round; }
.b-gsap-line-chart .pt { fill: var(--bg); stroke: var(--gold2); }
.b-gsap-line-chart .pt.last { fill: var(--gold2); }
.b-gsap-line-chart .halo { fill: none; stroke: var(--gold2); }
.b-gsap-line-chart .yl span, .b-gsap-line-chart .xl span { position: absolute; white-space: nowrap; font-size: var(--label); line-height: 1.2; color: var(--dim); }
.b-gsap-line-chart .yl span { translate: -100% -50%; }
.b-gsap-line-chart .xl span { translate: -50% 0; letter-spacing: 0.14em; text-transform: uppercase; }
.b-gsap-line-chart .xl span.last { color: var(--gold2); }
.b-gsap-line-chart .many .xl span { font-size: calc(var(--label) * 0.8); letter-spacing: 0.06em; }
.b-gsap-line-chart .note { flex: none; font-size: calc(var(--body) * 0.72); color: var(--dim); line-height: 1.3; }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .wrap { padding: calc(var(--pad) * 0.9 + var(--top)) var(--pad) calc(var(--pad) * 0.8); gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .top { flex-direction: column; align-items: stretch; gap: calc(var(--gap) * 1.2); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .hd .cs-title { font-size: calc(var(--title) * 0.86); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .big { align-items: flex-start; }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .row { font-size: calc(var(--hero) * 1.9); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .u { font-size: calc(var(--title) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .big .cs-rule { transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .note { font-size: calc(var(--body) * 0.95); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .xl span { writing-mode: vertical-rl; rotate: 180deg; translate: -50% 0; letter-spacing: 0.1em; }
`;
// a smooth line that never overshoots a value (monotone cubic)
function curve(P) {
  const n = P.length; if (n < 3) return P.map((q, i) => (i ? 'L' : 'M') + q.x + ' ' + q.y).join(' ');
  const dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = P[i + 1].x - P[i].x; m[i] = (P[i + 1].y - P[i].y) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${P[0].x} ${P[0].y}`;
  for (let i = 0; i < n - 1; i++) d += ` C${P[i].x + dx[i] / 3} ${P[i].y + (t[i] * dx[i]) / 3} ${P[i + 1].x - dx[i] / 3} ${P[i + 1].y - (t[i + 1] * dx[i]) / 3} ${P[i + 1].x} ${P[i + 1].y}`;
  return d;
}
export default function mount(el, p, cx) {
  cx.plugin('DrawSVGPlugin');
  const g = cx.gsap, tall = cx.shape === 'tall', id = 'b-lc-' + ++uid;
  const pts = (p.points || []).slice(0, 8).map((q) => ({label: String(q.label == null ? '' : q.label), value: Number(q.value) || 0})), n = pts.length;
  const dec = Math.max(0, p.decimals | 0), fmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  // 3-4 grid lines on round numbers
  const top = Math.max(1e-9, ...pts.map((q) => q.value)), raw = top / 3, pow = Math.pow(10, Math.floor(Math.log10(raw))), unit = [1, 2, 2.5, 5, 10].find((u) => u * pow >= raw) * pow;
  const max = Math.ceil(top / unit - 1e-9) * unit, ticks = []; for (let v = 0; v <= max + 1e-9; v += unit) ticks.push(v);
  const tdec = Math.max(dec, unit < 1 ? Math.ceil(-Math.log10(unit)) : 0), tfmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: tdec, maximumFractionDigits: tdec});
  el.innerHTML = `<div class="wrap">
    <div class="top">
      <div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>
      <div class="big"><div class="row"><span class="v cs-num">${fmt(pts[0] ? pts[0].value : 0)}</span>${p.unit ? `<span class="u">${cx.esc(p.unit)}</span>` : ''}</div><div class="at cs-label">${cx.esc(pts[0] ? pts[0].label : '')}</div><i class="cs-rule" aria-hidden="true"></i></div>
    </div>
    <div class="plot${n > 6 ? ' many' : ''}">
      <svg aria-hidden="true"><defs><linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="0" x2="0"><stop offset="0" style="stop-color:var(--gold);stop-opacity:0.34"/><stop offset="1" style="stop-color:var(--gold);stop-opacity:0"/></linearGradient><clipPath id="${id}-c"><rect x="0" y="-50" width="0" height="10"/></clipPath></defs>
        <g class="grid">${ticks.map((v, i) => `<line${i ? '' : ' class="base"'}/>`).join('')}</g>
        <path class="area" fill="url(#${id}-g)" clip-path="url(#${id}-c)"/><line class="lead"/><path class="ln"/>
        <circle class="halo"/>${pts.map((q, i) => `<circle class="pt${i === n - 1 ? ' last' : ''}"/>`).join('')}</svg>
      <div class="yl cs-num" aria-hidden="true">${ticks.map((v) => `<span>${tfmt(v)}</span>`).join('')}</div>
      <div class="xl">${pts.map((q, i) => `<span${i === n - 1 ? ' class="last"' : ''}>${cx.esc(q.label)}</span>`).join('')}</div>
    </div>
    ${p.note ? `<p class="note">${cx.esc(p.note)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const plot = q('.plot'), ln = q('.ln'), area = q('.area'), lead = q('.lead'), halo = q('.halo'), dots = qa('.pt'), grid = qa('.grid line'), yl = qa('.yl span'), xl = qa('.xl span'), clip = q('clipPath rect'), grad = q('linearGradient'), vEl = q('.v'), atEl = q('.at');
  const T0 = 0.75, D = 1.5, ease = g.parseEase('sine.inOut');
  let tl = null, cur = 0, total = 1, lens = [], X0 = 0, lw = 4, shown = -1;
  function lay() {
    const W = plot.clientWidth, H = plot.clientHeight; if (!W || !H || !n) return;
    const fs = parseFloat(getComputedStyle(xl[0]).fontSize) || 16;
    lw = cx.clamp(Math.min(W * 0.0045, H * 0.014), 3, 9); const r = lw * 1.5;
    const xw = (e) => (tall ? e.offsetHeight : e.offsetWidth), ylW = Math.max(0, ...yl.map((e) => e.offsetWidth));
    const L = tall ? ylW + fs * 0.9 : Math.max(ylW + fs * 0.9, xl[0].offsetWidth / 2), R = tall ? r * 2.4 : Math.max(xl[n - 1].offsetWidth / 2, r * 2.4);
    const B = (tall ? Math.max(...xl.map(xw)) : xl[0].offsetHeight) + fs * 0.9, T = r * 2.6, y0 = H - B;
    const X = (i) => L + (n > 1 ? ((W - L - R) * i) / (n - 1) : (W - L - R) / 2), Y = (v) => T + (y0 - T) * (1 - v / max);
    const P = pts.map((pt, i) => ({x: X(i), y: Y(pt.value)}));
    const d = p.smooth === false ? P.map((a, i) => (i ? 'L' : 'M') + a.x + ' ' + a.y).join(' ') : curve(P);
    ln.setAttribute('d', d); ln.setAttribute('stroke-width', lw);
    area.setAttribute('d', `${d} L${P[n - 1].x} ${y0} L${P[0].x} ${y0} Z`);
    grad.setAttribute('y1', T); grad.setAttribute('y2', y0);
    clip.setAttribute('x', P[0].x - lw); clip.setAttribute('y', 0); clip.setAttribute('height', H); X0 = P[0].x - lw;
    grid.forEach((e, i) => { const y = Y(ticks[i]); e.setAttribute('x1', L - fs * 0.4); e.setAttribute('x2', W); e.setAttribute('y1', y); e.setAttribute('y2', y); yl[i].style.left = L - fs * 0.8 + 'px'; yl[i].style.top = y + 'px'; });
    xl.forEach((e, i) => { e.style.left = P[i].x + 'px'; e.style.top = y0 + fs * 0.7 + 'px'; });
    dots.forEach((c, i) => { c.setAttribute('cx', P[i].x); c.setAttribute('cy', P[i].y); c.setAttribute('r', i === n - 1 ? r * 1.25 : r); c.setAttribute('stroke-width', Math.max(1.5, lw * 0.45)); });
    halo.setAttribute('cx', P[n - 1].x); halo.setAttribute('cy', P[n - 1].y); halo.setAttribute('r', r * 2.6); halo.setAttribute('stroke-width', Math.max(1.5, lw * 0.35));
    lead.setAttribute('x1', P[n - 1].x); lead.setAttribute('x2', P[n - 1].x); lead.setAttribute('y1', P[n - 1].y - r * 3.2); lead.setAttribute('y2', -fs * 0.4); lead.setAttribute('stroke-width', Math.max(1.5, lw * 0.3));
    // how far along the line each value sits (the dots and the big number follow the drawing)
    total = ln.getTotalLength() || 1;
    lens = P.map((a) => { let lo = 0, hi = total; for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (ln.getPointAtLength(mid).x < a.x) lo = mid; else hi = mid; } return hi; });
    lens[0] = 0; lens[n - 1] = total;
  }
  function sync(t) {
    const pr = ease(cx.clamp((t - T0) / D, 0, 1)), len = total * pr;
    clip.setAttribute('width', Math.max(0, ln.getPointAtLength(len).x - X0 + (pr >= 1 ? lw * 2 : 0)));
    let k = 0; for (let i = 0; i < n; i++) if (lens[i] <= len + 0.5) k = i;
    if (k !== shown) { shown = k; vEl.textContent = fmt(pts[k].value); atEl.textContent = pts[k].label; }
  }
  function make() {
    if (tl) tl.kill();
    g.set([ln, lead, halo, ...dots, ...grid, ...yl, ...xl, ...qa('.hd > *, .big > *, .note')], {clearProps: 'opacity,transform,scale,x,y,strokeDasharray,strokeDashoffset'});
    lay();
    tl = g.timeline({paused: true});
    const head = qa('.hd > *');
    if (head.length) tl.fromTo(head, {opacity: 0, y: 22}, {opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.1}, 0);
    tl.fromTo(grid, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.8, ease: 'power3.inOut', stagger: 0.06}, 0.1);
    tl.fromTo(yl, {opacity: 0}, {opacity: 1, duration: 0.4, stagger: 0.06}, 0.25);
    tl.fromTo(xl, {opacity: 0}, {opacity: 1, duration: 0.4, stagger: 0.05}, 0.35);
    tl.fromTo(qa('.big .row, .big .at'), {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08}, 0.4);
    tl.fromTo(ln, {opacity: 0}, {opacity: 1, duration: 0.05}, T0 - 0.05);
    tl.fromTo(ln, {drawSVG: '0%'}, {drawSVG: '100%', duration: D, ease: 'sine.inOut'}, T0);
    dots.forEach((c, i) => {
      const at = T0 + (D * Math.acos(1 - 2 * cx.clamp(lens[i] / total, 0, 1))) / Math.PI;
      tl.fromTo(c, {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.6)'}, Math.max(0.3, at - 0.06));
    });
    tl.fromTo(halo, {opacity: 0, scale: 0.3, transformOrigin: '50% 50%'}, {opacity: 0.9, scale: 1, duration: 0.6, ease: 'power3.out'}, T0 + D);
    tl.fromTo(lead, {opacity: 0}, {opacity: 1, duration: 0.05}, T0 + D);
    tl.fromTo(lead, {scaleY: 0, transformOrigin: '50% 100%'}, {scaleY: 1, duration: 0.55, ease: 'power3.out'}, T0 + D + 0.05);
    tl.fromTo(q('.big .cs-rule'), {scaleX: 0}, {scaleX: 1, duration: 0.6, ease: 'power3.out'}, T0 + D + 0.2);
    if (q('.note')) tl.fromTo(q('.note'), {opacity: 0}, {opacity: 1, duration: 0.5}, T0 + D);
    shown = -1; tl.time(Math.min(cur, tl.duration()), false); sync(cur);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); sync(t); }, fit() { make(); }, dispose() { tl.kill(); }};
}
