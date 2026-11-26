// pro/line: a gold line draws over quiet grid lines, the area fades in, dots land, the last value counts.
export const css = `
.b-pro-line .pro-body { display: grid; grid-template-rows: minmax(0, 1fr) auto auto; gap: calc(var(--gap) * 0.45); }
.b-pro-line .plot { position: relative; min-height: 0; margin-right: 9%; }
.b-pro-line svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-pro-line .ln { fill: none; stroke: var(--gold2); stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.b-pro-line .ar { fill: url(#pl-grad); }
.b-pro-line .gl { stroke: var(--faint); stroke-width: 1; vector-effect: non-scaling-stroke; }
.b-pro-line .bl { stroke: var(--line); stroke-width: 1; vector-effect: non-scaling-stroke; }
.b-pro-line .dot { position: absolute; width: 0.7em; height: 0.7em; margin: -0.35em 0 0 -0.35em; border-radius: 50%; background: var(--bg); border: 2px solid var(--gold2); font-size: var(--body); }
.b-pro-line .dot.last { background: var(--gold2); width: 0.9em; height: 0.9em; margin: -0.45em 0 0 -0.45em; }
.b-pro-line .end { position: absolute; transform: translate(-100%, calc(-100% - 0.35em)); text-align: right; font-size: var(--title); font-weight: var(--thin); color: var(--ink); white-space: nowrap; line-height: 1; }
.b-pro-line .end small { font-size: 0.4em; color: var(--gold2); margin-left: 0.12em; }
.b-pro-line .end.below { transform: translate(-100%, 0.45em); }
.cs-frame[data-shape="tall"] .b-pro-line .end { background: var(--bg); padding: 0.1em 0.2em; border-radius: 0.12em; }
.cs-frame[data-shape="tall"] .b-pro-line .end small { font-size: 0.62em; }
.b-pro-line .pv { position: absolute; transform: translate(-50%, -150%); font-size: var(--body); color: var(--dim); white-space: nowrap; }
.b-pro-line .xs { position: relative; height: 1.6em; font-size: var(--body); margin-right: 9%; }
.b-pro-line .x { position: absolute; transform: translateX(-50%); color: var(--dim); white-space: nowrap; line-height: 1.2; }
.b-pro-line .x.first { transform: none; } .b-pro-line .x.last { transform: translateX(-100%); color: var(--ink); }
.b-pro-line .nt { font-size: calc(var(--body) * 0.8); color: var(--dim); letter-spacing: 0.04em; }
.cs-frame[data-shape="tall"] .b-pro-line .end { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-pro-line .xs, .cs-frame[data-shape="tall"] .b-pro-line .pv { font-size: var(--label); }
.cs-frame[data-shape="tall"] .b-pro-line .plot, .cs-frame[data-shape="tall"] .b-pro-line .xs { margin-right: 22%; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, pts = (p.points || []).slice(0, 12).map((it) => ({label: String(it.label), value: Number(String(it.value).replace(/,/g, '')) || 0}));
  const n = pts.length, dec = Math.max(0, p.decimals | 0);
  const vs = pts.map((x) => x.value), lo0 = Math.min(...vs), hi0 = Math.max(...vs);
  const lo = lo0 >= 0 && lo0 <= hi0 * 0.5 ? 0 : lo0 - (hi0 - lo0) * 0.15, hi = hi0 + (hi0 - lo) * 0.08 || 1;
  const X = (i) => (n === 1 ? 50 : (i / (n - 1)) * 100), Y = (v) => 100 - ((v - lo) / (hi - lo || 1)) * 90 - 4;
  const d = pts.map((x, i) => (i ? 'L' : 'M') + X(i).toFixed(2) + ' ' + Y(x.value).toFixed(2)).join(' ');
  const comma = vs.some((v) => v >= 10000);
  const last = pts[n - 1] || {value: 0};
  const showPv = n <= 6;
  el.innerHTML = `<i class="pro-glow" style="--gx:90%;--gy:30%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">
    <div class="plot"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--gold)" stop-opacity="0.26"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></linearGradient></defs>
      ${[25, 50, 75].map((g) => `<line class="gl" x1="0" x2="100" y1="${g}" y2="${g}"/>`).join('')}<line class="bl" x1="0" x2="100" y1="100" y2="100"/>
      <path class="ar" d="${d} L100 100 L0 100 Z"/></svg><svg class="lnw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="ln" d="${d}"/></svg>
      ${pts.map((x, i) => `<i class="dot${i === n - 1 ? ' last' : ''}" style="left:${X(i)}%;top:${Y(x.value)}%" aria-hidden="true"></i>`).join('')}
      ${showPv ? pts.slice(0, -1).map((x, i) => `<span class="pv cs-num" style="left:${X(i)}%;top:${Y(x.value)}%">${P.fmt(x.value, dec, comma)}</span>`).join('') : ''}
      <span class="end cs-num${Y(last.value) < 30 ? ' below' : ''}" style="left:100%;top:${Y(last.value)}%"><span class="n">${P.fmt(last.value, dec, comma)}</span>${p.unit ? `<small>${cx.esc(p.unit)}</small>` : ''}</span>
    </div>
    <div class="xs">${pts.map((x, i) => (n <= 8 || i % Math.ceil(n / 6) === 0 || i === n - 1) ? `<span class="x${i === 0 ? ' first' : i === n - 1 ? ' last' : ''}" style="left:${X(i)}%">${cx.esc(x.label)}</span>` : '').join('')}</div>
    ${p.note ? `<p class="nt">${cx.esc(p.note)}</p>` : ''}
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el), D = 1.6;
  tl.fromTo(el.querySelectorAll('.gl, .bl'), {opacity: 0}, {opacity: 1, duration: 0.6}, t - 0.2);
  P.rise(tl, el.querySelectorAll('.x'), t, {y: 10, stagger: 0.04});
  tl.fromTo(q('.lnw'), {clipPath: 'inset(-10% 100% -10% -2%)'}, {clipPath: 'inset(-10% -2% -10% -2%)', duration: D, ease: 'power2.inOut'}, t + 0.1);
  tl.fromTo(q('.ar'), {opacity: 0}, {opacity: 1, duration: 1.0, ease: 'power1.out'}, t + 0.6);
  el.querySelectorAll('.dot').forEach((dt, i) => tl.fromTo(dt, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.2)'}, t + 0.1 + D * (n === 1 ? 1 : i / (n - 1)) * 0.92));
  el.querySelectorAll('.pv').forEach((pv, i) => tl.fromTo(pv, {opacity: 0}, {opacity: 1, duration: 0.4}, t + 0.2 + D * (i / Math.max(1, n - 1)) * 0.92));
  tl.fromTo(q('.end'), {opacity: 0}, {opacity: 1, duration: 0.7, ease: 'power2.out'}, t + D - 0.1);   // opacity only: the label's CSS transform places it
  const en = q('.end .n'), o = {v: lo0}; tl.to(o, {v: last.value, duration: 0.9, ease: 'power3.out', onUpdate: () => { en.textContent = P.fmt(o.v, dec, comma); }}, t + D - 0.1);
  P.rise(tl, q('.nt'), t + D, {y: 10});
  return P.clip(cx, tl, el);
}
