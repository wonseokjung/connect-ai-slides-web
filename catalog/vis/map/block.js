// vis/map: a course map or an agenda as a route of light. The camera starts close on the first station and travels
// the route while each station lights up (its picture pops in, if it has one), then pulls back to the whole map.
// The "now" station keeps a slow gold pulse.
export const css = `
.b-vis-map .pro-body { position: relative; overflow: hidden; }
.b-vis-map .mp-cam { position: absolute; left: 0; top: 0; transform-origin: 0 0; will-change: transform; }
.b-vis-map svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-vis-map .mp-base { fill: none; stroke: var(--line); stroke-width: 2.5; stroke-dasharray: 2 10; stroke-linecap: round; }
.b-vis-map .mp-draw { fill: none; stroke: var(--gold); stroke-width: 3; }
.b-vis-map .mp-glow { fill: none; stroke: var(--gold); stroke-width: 16; opacity: 0.3; filter: url(#mpBlur); }
.b-vis-map .mp-st .ring { fill: var(--bg); stroke: var(--gold2); stroke-width: 2.5; }
.b-vis-map .mp-st .core { fill: var(--gold2); }
.b-vis-map .mp-card { position: absolute; display: flex; flex-direction: column; gap: 0.25em; width: var(--cw); transform-origin: 50% 100%; }
.b-vis-map .mp-card.dn { transform-origin: 50% 0; }
.b-vis-map .mp-img { width: 100%; aspect-ratio: 16 / 9; border-radius: calc(var(--radius) * 0.45); overflow: hidden; border: 1px solid color-mix(in srgb, var(--gold2) 45%, transparent); box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45); margin-bottom: 0.45em; background: var(--bg2); }
.b-vis-map .mp-img img { width: 100%; height: 100%; object-fit: cover; }
.b-vis-map .mp-when { white-space: nowrap; font-size: var(--label); letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold2); }
.b-vis-map .mp-t { font-size: calc(var(--lead) * var(--mt, 0.92)); color: var(--ink); line-height: 1.15; }
.b-vis-map .mp-tool { font-size: calc(var(--label) * 0.95); color: var(--dim); letter-spacing: 0.02em; }
.b-vis-map .mp-card.now .mp-t { color: var(--gold2); }
.b-vis-map .mp-card.now .mp-img { border-color: var(--gold2); box-shadow: 0 0 0 2px var(--gold2), 0 20px 60px color-mix(in srgb, var(--gold) 35%, transparent); }
.cs-frame[data-shape="tall"] .b-vis-map .mp-t { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-vis-map .mp-card { flex-direction: row; align-items: center; gap: 0.7em; }
.cs-frame[data-shape="tall"] .b-vis-map .mp-img { width: 38%; flex: none; margin: 0; }
.cs-frame[data-shape="tall"] .b-vis-map .mp-tx { display: flex; flex-direction: column; gap: 0.15em; min-width: 0; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc, tall = cx.shape === 'tall';
  const stops = (p.stops || p.items || []).slice(0, 8).map((s) => (typeof s === 'string' ? {title: s} : s));
  const n = stops.length || 1, now = p.now ? +p.now - 1 : -1;
  const pics = stops.some((s) => s.src);
  // no pictures and four or more stops: the route runs through the middle and the cards take turns above and below it
  const alt = !tall && !pics && n >= 4;
  if (!tall && n >= 6) el.style.setProperty('--mt', '0.8');
  el.innerHTML = `<i class="pro-glow" style="--gx:60%;--gy:50%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2"></div>${P.foot(cx)}</div>`;
  const body = el.querySelector('.pro-body');
  const k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1, br = body.getBoundingClientRect();
  const W = br.width / k || cx.w * 0.84, H = br.height / k || cx.h * 0.6;
  const cw = tall ? W * 0.8 - 40 : alt ? Math.min((2 * W / n) * 0.78, W * 0.3) : Math.min((W / n) * 0.86, W * 0.3, pics ? ((H * 0.84 - 60 - 190) / 0.5625) : 1e9);
  // cards above the route: the whole group (cards, stalks, route) sits in the middle of the space, not on the floor
  const ry = Math.min(0.84, Math.max(0.6, (H / 2 + (60 + (pics ? cw * 0.5625 : 0) + 170) / 2) / H));
  // station positions on a wave; cards alternate above and below on a slide
  const pos = stops.map((_, i) => {
    const f = n === 1 ? 0.5 : i / (n - 1);
    return tall ? [W * (0.07 + 0.03 * Math.sin(f * 6)), H * (0.1 + 0.82 * f)] : alt ? [W * ((0.5 + i) / n), H * (0.56 + (i % 2 ? 0.07 : -0.07))] : [W * ((0.5 + i) / n), H * (ry + (i % 2 ? 0.04 : -0.04))];
  });
  let d = `M${tall ? pos[0][0] : -40} ${tall ? -40 : pos[0][1]}`;
  const pts = [[tall ? pos[0][0] : -40, tall ? -40 : pos[0][1]], ...pos, [tall ? pos[n - 1][0] : W + 40, tall ? H + 40 : pos[n - 1][1]]];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; d += tall ? ` C${a[0]} ${(a[1] + b[1]) / 2} ${b[0]} ${(a[1] + b[1]) / 2} ${b[0]} ${b[1]}` : ` C${(a[0] + b[0]) / 2} ${a[1]} ${(a[0] + b[0]) / 2} ${b[1]} ${b[0]} ${b[1]}`; }
  const cards = stops.map((s, i) => {
    const up = !tall && !(alt && i % 2);
    const style = tall ? `left:${((pos[i][0] + 40) / W) * 100}%;top:${(pos[i][1] / H) * 100}%;--cw:${cw}px;transform:translateY(-50%)` : `left:${(Math.max(0, Math.min(W - cw, pos[i][0] - cw / 2)) / W) * 100}%;${up ? `bottom:${(1 - (pos[i][1] - 60) / H) * 100}%` : `top:${((pos[i][1] + 60) / H) * 100}%`};--cw:${cw}px`;
    const img = s.src ? `<div class="mp-img"><img src="${esc(s.src)}" alt="${esc(s.alt || s.title || '')}"></div>` : '';
    const tx = `${s.when ? `<span class="mp-when">${esc(s.when)}</span>` : ''}<span class="mp-t">${esc(s.title || '')}</span>${s.tool && (tall || n <= 4) ? `<span class="mp-tool">${esc(s.tool)}</span>` : ''}`;
    return `<div class="mp-card${up ? '' : ' dn'}${i === now ? ' now' : ''}" data-i="${i}" style="${style}">${tall ? `${img}<div class="mp-tx">${tx}</div>` : up ? `${img}${tx}` : `${tx}${img ? img.replace('margin-bottom', 'x') : ''}`}</div>`;
  }).join('');
  body.innerHTML = `<div class="mp-cam" style="width:${W}px;height:${H}px">
    <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs><filter id="mpBlur" ${tall ? `filterUnits="userSpaceOnUse" x="-60" y="-60" width="${W + 120}" height="${H + 120}"` : 'x="-20%" y="-50%" width="140%" height="200%"'}><feGaussianBlur stdDeviation="7"/></filter>
      <radialGradient id="mpNow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--gold2)" stop-opacity="0.6"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient>
      <radialGradient id="mpHead" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF6E2"/><stop offset="0.3" stop-color="var(--gold2)" stop-opacity="0.9"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient></defs>
      <path class="mp-base" d="${d}"/><path class="mp-glow" d="${d}"/><path class="mp-draw" d="${d}"/>
      ${pos.map((q, i) => `<g class="mp-st" transform="translate(${q[0]} ${q[1]})">${tall ? '' : '<line class="stalk" x1="0" y1="' + (alt && i % 2 ? 22 : -22) + '" x2="0" y2="' + (alt && i % 2 ? 56 : -56) + '"'}${tall ? '' : ' stroke="var(--gold2)" stroke-opacity="0.6" stroke-width="1.5"/>'}${i === now ? '<circle class="halo" r="80" fill="url(#mpNow)"/>' : ''}<circle class="ring" r="${i === now ? 20 : 15}"/><circle class="core" r="${i === now ? 9 : 6}"/></g>`).join('')}
      <circle class="mp-head" r="34" fill="url(#mpHead)"/>
    </svg>${cards}</div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const draw0 = q('.mp-draw'), glow = q('.mp-glow'), head = q('.mp-head'), cam = q('.mp-cam'), halo = q('.halo');
  const L = draw0.getTotalLength();
  for (const e of [draw0, glow]) e.style.strokeDasharray = L;
  // where on the route each station is (length fraction), found once
  const fr = pos.map((qq) => { let best = 0, bd = 1e9; for (let s = 0; s <= 200; s++) { const pt = draw0.getPointAtLength((L * s) / 200); const dd = (pt.x - qq[0]) ** 2 + (pt.y - qq[1]) ** 2; if (dd < bd) { bd = dd; best = s / 200; } } return best; });
  const sts = qa('.mp-st'), cds = qa('.mp-card');
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  const R0 = t0 + 0.1, RD = 1.0 + n * 0.42, END = R0 + RD, PULL = 1.1;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const Z = tall ? 1.35 : 1.7;
  function draw(t) {
    const f = clamp((t - R0) / RD, 0, 1), fe = f < 1 ? f * (0.25 + 0.75 * f) * 1 + 0 : 1;
    const g = clamp(fe * (fr[n - 1] + 0.04), 0, 1);
    for (const e of [draw0, glow]) e.style.strokeDashoffset = L * (1 - g);
    const hp = draw0.getPointAtLength(L * g);
    head.setAttribute('cx', hp.x); head.setAttribute('cy', hp.y); head.style.opacity = t < R0 ? 0 : clamp((END + 0.5 - t) / 0.5, 0, 1);
    // camera: close on the light while it travels, then a pull back to the whole map
    const pull = eio(clamp((t - END + 0.25) / PULL, 0, 1)), s = Z + (1 - Z) * pull;
    const fx = tall ? W / 2 : clamp(hp.x, W / (2 * Z), W - W / (2 * Z)), fy = tall ? clamp(hp.y, H / (2 * Z), H - H / (2 * Z)) : H / 2;
    const tx = (W / 2 - fx * s) * (1 - pull), ty = (H / 2 - fy * s) * (1 - pull);
    const drift = Math.max(0, t - END - PULL);
    cam.style.transform = `translate(${tx}px, ${ty}px) scale(${s * (1 + Math.min(0.025, drift * 0.004))})`;
    cam.style.transformOrigin = '0 0';
    if (pull < 1) cam.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    sts.forEach((st, i) => {
      const on = clamp((g - fr[i] + 0.01) / 0.03, 0, 1);
      st.style.opacity = 0.35 + 0.65 * on;
      const c = cds[i], e = 1 - Math.pow(1 - on, 3);
      c.style.opacity = e;
      const base = tall ? 'translateY(-50%) ' : '';
      c.style.transform = `${base}translateY(${(1 - e) * 30}px) scale(${0.92 + 0.08 * e})`;
    });
    if (halo) { const live = Math.max(0, t - R0 - RD * fr[now]); halo.style.opacity = clamp(live / 0.5, 0, 1) * (0.55 + 0.45 * Math.sin(live * 2.2)); halo.setAttribute('r', 70 + 14 * Math.sin(live * 2.2)); }
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: END + PULL + 0.2});
}
