// vis/line: a line chart filmed like a shot. The camera starts close on the first point and pulls back as a glowing
// head draws the line, the value riding on the head counts, the area fills behind it, the labels arrive as it passes.
// After the entrance a thin light keeps travelling along the line.
export const css = `
.b-vis-line .pro-body { position: relative; overflow: hidden; }
.b-vis-line .ln-cam { position: absolute; left: 0; top: 0; transform-origin: 0 100%; will-change: transform; }
.b-vis-line svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-vis-line .ln-grid line { stroke: var(--faint); stroke-width: 1; }
.b-vis-line .ln-base { stroke: var(--line); stroke-width: 1.5; }
.b-vis-line .ln-path { fill: none; stroke: var(--gold2); stroke-width: 5; stroke-linejoin: round; stroke-linecap: round; }
.b-vis-line .ln-glow { fill: none; stroke: var(--gold); stroke-width: 18; opacity: 0.35; stroke-linejoin: round; filter: url(#lnBlur); }
.b-vis-line .ln-shim { fill: none; stroke: #FFF2D6; stroke-width: 5; stroke-linecap: round; filter: url(#lnBlur2); }
.b-vis-line .ln-dot { fill: var(--bg); stroke: var(--gold2); stroke-width: 3; }
.b-vis-line .ln-lab { position: absolute; transform: translate(-50%, 0); font-size: var(--body); color: var(--dim); white-space: nowrap; }
.b-vis-line .ln-lab.hi { color: var(--ink); }
.b-vis-line .ln-tag { position: absolute; transform: translate(-50%, -100%); padding-bottom: 0.5em; white-space: nowrap; font-size: calc(var(--title) * 0.62); font-weight: var(--thin); color: var(--ink); letter-spacing: -0.02em; line-height: 1; }
.b-vis-line .ln-tag small { font-size: 0.4em; color: var(--gold2); margin-left: 0.25em; letter-spacing: 0.08em; }
.b-vis-line .ln-yl { position: absolute; left: 0; transform: translate(0, -110%); font-size: calc(var(--label) * 0.95); color: var(--dim); }
.b-vis-line .ln-nt { position: absolute; right: 0; top: 0; font-size: calc(var(--body) * 0.8); color: var(--dim); }
.cs-frame[data-shape="tall"] .b-vis-line .ln-lab { font-size: calc(var(--label) * 0.95); }
.cs-frame[data-shape="tall"] .b-vis-line .ln-tag { font-size: var(--title); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc, tall = cx.shape === 'tall';
  const pts = (p.points || []).slice(0, 12).map((x) => ({label: String(x.label), v: Number(String(x.value).replace(/,/g, '')) || 0}));
  const dec = Math.max(0, p.decimals | 0), comma = pts.some((x) => Math.abs(x.v) >= 10000);
  el.innerHTML = `<i class="pro-glow" style="--gx:78%;--gy:22%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2"></div>${P.foot(cx)}</div>`;
  const body = el.querySelector('.pro-body');
  const k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1, br = body.getBoundingClientRect();
  const W = br.width / k || cx.w * 0.84, H = br.height / k || cx.h * 0.6;
  const n = pts.length, lo = Math.min(0, ...pts.map((x) => x.v)), hi = Math.max(...pts.map((x) => x.v), 1e-9);
  const top = H * (tall ? 0.24 : 0.2), bot = H - (tall ? 46 : 70), left = W * 0.04, right = W * (tall ? 0.86 : 0.9);
  const X = (i) => left + ((right - left) * i) / Math.max(1, n - 1), Y = (v) => bot - ((v - lo) / (hi - lo || 1)) * (bot - top);
  const xy = pts.map((q, i) => [X(i), Y(q.v)]);
  // a smooth line through the points (monotone-ish cubic)
  let d = `M${xy[0][0]} ${xy[0][1]}`;
  for (let i = 1; i < n; i++) { const a = xy[i - 1], b = xy[i], m = (b[0] - a[0]) * 0.42; d += ` C${a[0] + m} ${a[1]} ${b[0] - m} ${b[1]} ${b[0]} ${b[1]}`; }
  const area = `${d} L${xy[n - 1][0]} ${bot} L${xy[0][0]} ${bot} Z`;
  const hiI = pts.reduce((b, q, i) => (q.v > pts[b].v ? i : b), 0);
  body.innerHTML = `<div class="ln-cam" style="width:${W}px;height:${H}px">
    <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs>
        <linearGradient id="lnArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--gold)" stop-opacity="0.42"/><stop offset="0.7" stop-color="var(--gold)" stop-opacity="0.06"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></linearGradient>
        <radialGradient id="lnHead" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF4DC"/><stop offset="0.3" stop-color="var(--gold2)" stop-opacity="0.9"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient>
        <filter id="lnBlur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
        <filter id="lnBlur2" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
        <clipPath id="lnClip"><rect class="ln-cr" x="0" y="0" width="0" height="${H}"/></clipPath>
      </defs>
      <g class="ln-grid">${[0.25, 0.5, 0.75, 1].map((f) => `<line x1="${left}" x2="${right}" y1="${bot - (bot - top) * f}" y2="${bot - (bot - top) * f}"/>`).join('')}</g>
      <line class="ln-base" x1="${left}" x2="${right}" y1="${bot}" y2="${bot}"/>
      <g clip-path="url(#lnClip)"><path d="${area}" fill="url(#lnArea)"/></g>
      <path class="ln-glow" d="${d}"/><path class="ln-path" d="${d}"/><path class="ln-shim" d="${d}"/>
      ${xy.map((q, i) => `<circle class="ln-dot" data-i="${i}" cx="${q[0]}" cy="${q[1]}" r="${i === hiI ? 11 : 7}"/>`).join('')}
      <circle class="ln-head" r="34" fill="url(#lnHead)"/>
    </svg>
    ${pts.map((q, i) => `<span class="ln-lab${i === hiI ? ' hi' : ''}" style="left:${(xy[i][0] / W) * 100}%;top:${((bot + 14) / H) * 100}%">${esc(q.label)}</span>`).join('')}
    <span class="ln-tag cs-num"><b class="v" style="font-weight:inherit"></b>${p.unit ? `<small>${esc(p.unit)}</small>` : ''}</span>
  </div>${p.note ? `<p class="ln-nt">${esc(p.note)}</p>` : ''}`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const path = q('.ln-path'), glow = q('.ln-glow'), shim = q('.ln-shim'), head = q('.ln-head'), cr = q('.ln-cr'), cam = q('.ln-cam'), tag = q('.ln-tag'), tv = q('.ln-tag .v');
  const L = path.getTotalLength();
  for (const e of [path, glow]) e.style.strokeDasharray = L;
  shim.style.strokeDasharray = `${L * 0.06} ${L}`;
  const labs = qa('.ln-lab'), dots = qa('.ln-dot');
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  tl.fromTo(qa('.ln-grid line, .ln-base'), {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 1.1, ease: 'expo.inOut', stagger: 0.05}, t0 - 0.2);
  P.rise(tl, q('.ln-nt'), t0 + 2.6, {y: 10});
  const D0 = t0 + 0.2, DD = 2.6, END = D0 + DD;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const valAt = (x) => { if (x <= xy[0][0]) return pts[0].v; for (let i = 1; i < n; i++) if (x <= xy[i][0]) { const f = (x - xy[i - 1][0]) / (xy[i][0] - xy[i - 1][0]); return pts[i - 1].v + (pts[i].v - pts[i - 1].v) * f; } return pts[n - 1].v; };
  function draw(t) {
    const f = eio(clamp((t - D0) / DD, 0, 1));
    for (const e of [path, glow]) e.style.strokeDashoffset = L * (1 - f);
    const hp = path.getPointAtLength(L * f);
    cr.setAttribute('width', hp.x);
    head.setAttribute('cx', hp.x); head.setAttribute('cy', hp.y);
    head.style.opacity = t < D0 ? 0 : f >= 1 ? Math.max(0, 1 - (t - END) / 0.6) : 1;
    dots.forEach((c, i) => { const on = clamp((hp.x - xy[i][0] + 6) / 30, 0, 1); c.style.opacity = on; c.setAttribute('r', (i === hiI ? 11 : 7) * (0.5 + 0.5 * on)); });
    labs.forEach((l, i) => { const on = clamp((hp.x - xy[i][0] + 40) / 80, 0, 1); l.style.opacity = on; l.style.transform = `translate(${i === 0 ? -15 : i === n - 1 ? -85 : -50}%, ${(1 - on) * 14}px)`; });
    // the value tag rides on the head, then parks on the highest point
    const park = clamp((t - END) / 0.7, 0, 1), pe = 1 - Math.pow(1 - park, 3);
    const tx = hp.x + (xy[hiI][0] - hp.x) * pe, ty = hp.y + (xy[hiI][1] - hp.y) * pe;
    tag.style.left = (tx / W) * 100 + '%'; tag.style.top = ((ty - 14) / H) * 100 + '%';
    const an = clamp((tx / W - 0.72) / 0.22, 0, 1); tag.style.transform = `translate(${-50 - 45 * an}%, -100%)`;
    tag.style.opacity = t < D0 ? 0 : 1;
    const v = park > 0 ? valAt(hp.x) + (pts[hiI].v - valAt(hp.x)) * pe : valAt(hp.x);
    tv.textContent = P.fmt(v, dec, comma);
    // camera: close on the start, pulls back to the whole chart while drawing, then a very slow drift
    const c = eio(clamp((t - t0 + 0.3) / (DD + 0.6), 0, 1)), s = 1 + 0.9 * (1 - c), drift = Math.max(0, t - END);
    const ox = -(xy[0][0]) * (s - 1) * 0.6 * (1 - c);
    cam.style.transform = `translate(${ox}px, 0) scale(${s * (1 + Math.min(0.03, drift * 0.004))})`;
    // shimmer: a thin light travels the finished line
    const life = clamp((t - END - 0.3) / 0.5, 0, 1), ph = ((t - END) / 2.4) % 1;
    shim.style.strokeDashoffset = -L * (ph < 0 ? 0 : ph) * 1.06 + L * 0.03;
    shim.style.opacity = life * 0.9;
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: END + 0.8});
}
