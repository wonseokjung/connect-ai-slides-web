// vis/boundary: a truth table becomes a picture. Four points on a plane, a decision line that searches, turns and
// settles until the gold points (y = 1) sit on one side; the rows of the table light in step. Two tables: the same
// plane switches to the second one and the line finds its new side. Pure geometry of time: seek(t) draws it all.
export const css = `
.b-vis-boundary .pro-body { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: calc(var(--gap) * 1.6); align-items: center; }
.b-vis-boundary .bd-plot { position: relative; height: 100%; max-height: 100%; aspect-ratio: 1 / 1; justify-self: center; min-height: 0; }
.b-vis-boundary .bd-plot svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-vis-boundary .bd-grid line { stroke: var(--faint); stroke-width: 0.18; }
.b-vis-boundary .bd-ax line { stroke: var(--line); stroke-width: 0.3; }
.b-vis-boundary .bd-sep { stroke: var(--gold2); stroke-width: 0.55; stroke-linecap: round; }
.b-vis-boundary .bd-sepglow { stroke: var(--gold); stroke-width: 2.6; opacity: 0.35; filter: url(#bdBlur); }
.b-vis-boundary .bd-run { stroke: var(--gold2); stroke-width: 1.1; stroke-linecap: round; filter: url(#bdBlur2); }
.b-vis-boundary .bd-pt { stroke-width: 0.5; }
.b-vis-boundary .bd-axl { position: absolute; font-size: var(--label); letter-spacing: 0.08em; color: var(--ink); opacity: 0.85; white-space: nowrap; }
.b-vis-boundary .bd-tk { position: absolute; font-size: calc(var(--label) * 0.9); color: var(--dim); transform: translate(-50%, 0); }
.b-vis-boundary .bd-side { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.9); min-width: 0; }
.b-vis-boundary .bd-tabs { display: flex; gap: calc(var(--gap) * 0.9); }
.b-vis-boundary .bd-tab { flex: 1; min-width: 0; position: relative; }
.b-vis-boundary .bd-tt { font-family: var(--serif); font-style: italic; font-size: calc(var(--title) * 0.62); color: var(--ink); margin-bottom: 0.35em; letter-spacing: 0.02em; display: flex; align-items: center; gap: 0.6em; }
.b-vis-boundary .bd-tt i { display: block; width: 0.42em; height: 0.42em; border-radius: 50%; background: var(--gold2); box-shadow: 0 0 0.6em var(--gold); }
.b-vis-boundary .bd-row { display: grid; grid-template-columns: repeat(var(--nc), 1fr); position: relative; font-size: calc(var(--lead) * 1.12); font-weight: var(--thin); padding: 0.16em 0.4em; border-radius: 0.18em; color: var(--ivory); }
.b-vis-boundary .bd-row.hd { font-size: var(--body); letter-spacing: 0.14em; color: var(--dim); border-bottom: 1px solid var(--line); border-radius: 0; padding-bottom: 0.5em; margin-bottom: 0.2em; }
.b-vis-boundary .bd-row span { text-align: center; }
.b-vis-boundary .bd-row span:last-child { color: var(--gold2); }
.b-vis-boundary .bd-row .hl { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(90deg, color-mix(in srgb, var(--gold) 26%, transparent), color-mix(in srgb, var(--gold) 6%, transparent)); opacity: 0; z-index: -1; }
.b-vis-boundary .bd-row .hl::before { content: ""; position: absolute; left: 0; top: 18%; bottom: 18%; width: 3px; border-radius: 2px; background: var(--gold2); }
.b-vis-boundary .bd-big { position: absolute; right: 6%; bottom: 7%; font-family: var(--serif); font-style: italic; font-size: calc(var(--hero) * 0.62); line-height: 1; color: var(--gold2); opacity: 0; pointer-events: none; }
.b-vis-boundary .bd-lg { display: flex; gap: 1.6em; font-size: var(--body); color: var(--ink); margin-top: calc(var(--gap) * 0.4); }
.b-vis-boundary .bd-lg span { display: inline-flex; align-items: center; gap: 0.5em; }
.b-vis-boundary .bd-lg i { width: 0.7em; height: 0.7em; border-radius: 50%; }
.b-vis-boundary .bd-lg i.f { background: var(--gold2); box-shadow: 0 0 10px color-mix(in srgb, var(--gold2) 60%, transparent); }
.b-vis-boundary .bd-lg i.o { border: 1.5px solid var(--dim); }
.b-vis-boundary .bd-nt { font-size: calc(var(--body) * 0.8); color: var(--dim); }
.cs-frame[data-shape="tall"] .b-vis-boundary .pro-body { grid-template-columns: 1fr; grid-template-rows: auto auto; gap: calc(var(--gap) * 0.9); align-content: start; }
.cs-frame[data-shape="tall"] .b-vis-boundary .bd-plot { width: 100%; height: auto; }
.cs-frame[data-shape="tall"] .b-vis-boundary .bd-tabs { gap: calc(var(--gap) * 1.2); }
.cs-frame[data-shape="tall"] .b-vis-boundary .bd-row.hd { font-size: var(--label); padding-bottom: 0.4em; }
.cs-frame[data-shape="tall"] .b-vis-boundary .bd-row { font-size: calc(var(--lead) * 1.05); padding: 0.22em 0.2em; }
.cs-frame[data-shape="tall"] .b-vis-boundary .bd-tt { font-size: calc(var(--lead) * 1.15); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc;
  const tabs = (p.tables || []).slice(0, 2).map((tb) => ({title: tb.title || '', head: (tb.head || ['x1', 'x2', 'y']).slice(0, 3), rows: (tb.rows || []).slice(0, 4).map((r) => r.map(String))}));
  if (!tabs.length) tabs.push({title: '', head: ['x1', 'x2', 'y'], rows: [['0', '0', '0'], ['1', '0', '0'], ['0', '1', '0'], ['1', '1', '1']]});
  const head = tabs[0].head;
  // ----- geometry: data [-0.35, 1.35] -> svg [6, 94] -----
  const lo = -0.4, hi = 1.4, S = (v) => 6 + ((v - lo) / (hi - lo)) * 88, SY = (v) => 100 - S(v);
  const pts = (tb) => tb.rows.map((r) => ({x: +r[0] || 0, y: +r[1] || 0, on: String(r[2]).trim() === '1'}));
  // the separating line with the widest margin (deterministic search), as normal angle + offset
  function solve(ps) {
    let best = null;
    for (let a = 0; a < 360; a += 1) {
      const n = [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180)];
      const pr = ps.map((q) => q.x * n[0] + q.y * n[1]);
      const P1 = pr.filter((_, i) => ps[i].on), P0 = pr.filter((_, i) => !ps[i].on);
      const mn = P1.length ? Math.min(...P1) : Math.max(...P0) + 0.8, mx = P0.length ? Math.max(...P0) : Math.min(...P1) - 0.8;
      const m = (mn - mx) / 2;
      if (!best || m > best.m + 1e-9) best = {a, c: (mn + mx) / 2, m};
    }
    return best;
  }
  const sets = tabs.map((tb) => { const ps = pts(tb), s = solve(ps); return {ps, s, ok: s.m > 0}; });
  // ----- DOM -----
  const nc = head.length;
  const tabHtml = tabs.map((tb, k) => `<div class="bd-tab" style="--nc:${nc}">${tb.title ? `<div class="bd-tt"><i></i><span>${esc(tb.title)}</span></div>` : ''}<div class="bd-row hd">${tb.head.map((h) => `<span>${P.math(h)}</span>`).join('')}</div>${tb.rows.map((r) => `<div class="bd-row"><i class="hl" aria-hidden="true"></i>${r.slice(0, nc).map((c) => `<span class="cs-num">${esc(c)}</span>`).join('')}</div>`).join('')}</div>`).join('');
  const ticks = [0, 1];
  el.innerHTML = `<i class="pro-glow" style="--gx:28%;--gy:60%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">
    <div class="bd-plot vis-l2">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <filter id="bdBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
          <filter id="bdBlur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.7"/></filter>
          <radialGradient id="bdPt" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--gold2)" stop-opacity="0.9"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient>
          <linearGradient id="bdShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--gold)" stop-opacity="0.26"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0.02"/></linearGradient>
          <clipPath id="bdClip"><rect x="4" y="4" width="92" height="92" rx="2"/></clipPath>
        </defs>
        <g class="bd-grid">${[0, 0.5, 1].map((v) => `<line x1="${S(v)}" y1="4" x2="${S(v)}" y2="96"/><line x1="4" y1="${SY(v)}" x2="96" y2="${SY(v)}"/>`).join('')}</g>
        <g class="bd-ax"><line x1="4" y1="${SY(lo + 0.05)}" x2="96" y2="${SY(lo + 0.05)}"/><line x1="${S(lo + 0.05)}" y1="4" x2="${S(lo + 0.05)}" y2="96"/></g>
        <g clip-path="url(#bdClip)"><polygon class="bd-shade" fill="url(#bdShade)" points=""/><line class="bd-sepglow"/><line class="bd-sep"/><line class="bd-run"/></g>
        ${sets[0].ps.map((_, i) => `<g class="bd-p" data-i="${i}"><circle class="bd-halo" r="9" fill="url(#bdPt)"/><circle class="bd-ring" r="4" fill="none" stroke="var(--gold2)" stroke-width="0.35"/><circle class="bd-pt" r="2.9"/></g>`).join('')}
      </svg>
      ${ticks.map((v) => `<span class="bd-tk cs-num" style="left:${S(v)}%;top:${SY(lo + 0.05) + 1.5}%">${v}</span>`).join('')}
      ${ticks.map((v) => `<span class="bd-tk cs-num" style="left:${S(lo + 0.05) - 4}%;top:${SY(v) - 3.2}%">${v}</span>`).join('')}
      <span class="bd-axl" style="right:3%;top:${SY(lo + 0.05) + 1.5}%">${P.math(head[0] || 'x1')}</span>
      <span class="bd-axl" style="left:${S(lo + 0.05) + 1.5}%;top:1%">${P.math(head[1] || 'x2')}</span>
    </div>
    <div class="bd-side vis-l1"><div class="bd-tabs">${tabHtml}</div><div class="bd-lg"><span><i class="f"></i>${P.math(head[2] || 'y')} = 1</span><span><i class="o"></i>${P.math(head[2] || 'y')} = 0</span></div>${p.note ? `<p class="bd-nt">${esc(p.note)}</p>` : ''}</div>
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const sep = q('.bd-sep'), glow = q('.bd-sepglow'), run = q('.bd-run'), shade = q('.bd-shade');
  const gp = qa('.bd-p'), tabEls = qa('.bd-tab'), rowsBy = tabEls.map((tb) => [...tb.querySelectorAll('.bd-row:not(.hd)')]);
  const light = /look-(white|ivory|paper)/.test(document.body.className);
  // ----- the entrance (GSAP) -----
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  tl.fromTo(qa('.bd-grid line, .bd-ax line'), {opacity: 0}, {opacity: 1, duration: 0.9, stagger: 0.04, ease: 'power2.out'}, t0);
  tl.fromTo(qa('.bd-tk, .bd-axl'), {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: 'expo.out'}, t0 + 0.3);
  tabEls.forEach((tb, k) => P.rise(tl, tb.querySelectorAll('.bd-tt, .bd-row'), t0 + 0.2 + k * 0.15, {y: 24, stagger: 0.06}));
  P.rise(tl, q('.bd-nt'), t0 + 0.9, {y: 10});
  // ----- the search, as a function of time -----
  const POP = t0 + 0.5, LEARN = POP + 0.7, SEG = 0.62, KEYS = 4, ONE = SEG * KEYS + 0.5, SWITCH = 0.7;
  const plan = sets.map((s, k) => {
    const a = s.s.a, c = s.s.c, start = LEARN + k * (ONE + SWITCH);
    const keys = k === 0 ? [[a + 78, c + 0.55], [a - 42, c - 0.3], [a + 17, c + 0.16], [a - 5, c - 0.04], [a, c]] : [[sets[k - 1].s.a, sets[k - 1].s.c], [a + 35, c + 0.3], [a - 14, c - 0.12], [a + 4, c + 0.03], [a, c]];
    return {start, keys, s};
  });
  const END = plan[plan.length - 1].start + ONE;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function lineAt(t) {
    let k = 0; while (k < plan.length - 1 && t >= plan[k + 1].start - SWITCH * 0.2) k++;
    const pl = plan[k], u = clamp((t - pl.start) / SEG, 0, KEYS), i = Math.min(KEYS - 1, Math.floor(u)), f = ease(u - i);
    const A = pl.keys[i], B = pl.keys[i + 1];
    return {k, a: A[0] + (B[0] - A[0]) * f, c: A[1] + (B[1] - A[1]) * f, settle: clamp((t - pl.start - SEG * (KEYS - 0.6)) / 0.6, 0, 1), u};
  }
  function draw(t) {
    const L = lineAt(Math.max(t, plan[0].start)), set = sets[L.k];
    const n = [Math.cos(L.a * Math.PI / 180), Math.sin(L.a * Math.PI / 180)], d = [-n[1], n[0]];
    const c0 = [n[0] * L.c, n[1] * L.c];
    const P1 = [c0[0] + d[0] * 4, c0[1] + d[1] * 4], P2 = [c0[0] - d[0] * 4, c0[1] - d[1] * 4];
    const vis = clamp((t - (LEARN - 0.35)) / 0.45, 0, 1);
    const xy = (v) => `${S(v[0]).toFixed(2)},${SY(v[1]).toFixed(2)}`;
    for (const ln of [sep, glow]) { ln.setAttribute('x1', S(P1[0])); ln.setAttribute('y1', SY(P1[1])); ln.setAttribute('x2', S(P2[0])); ln.setAttribute('y2', SY(P2[1])); ln.style.opacity = vis * (ln === glow ? 0.35 + 0.25 * L.settle : 1); }
    shade.setAttribute('points', [P1, P2, [P2[0] + n[0] * 4, P2[1] + n[1] * 4], [P1[0] + n[0] * 4, P1[1] + n[1] * 4]].map(xy).join(' '));
    shade.style.opacity = vis * (0.45 + 0.55 * L.settle);
    // a bead of light runs along the line once it has settled (keeps going after the entrance)
    const life = clamp((t - END + 0.2) / 0.6, 0, 1), ph = ((t - END) * 0.32) % 1, rp = -1.6 + 3.2 * (ph < 0 ? ph + 1 : ph);
    const R1 = [c0[0] + d[0] * rp, c0[1] + d[1] * rp], R2 = [c0[0] + d[0] * (rp + 0.18), c0[1] + d[1] * (rp + 0.18)];
    run.setAttribute('x1', S(R1[0])); run.setAttribute('y1', SY(R1[1])); run.setAttribute('x2', S(R2[0])); run.setAttribute('y2', SY(R2[1])); run.style.opacity = life * 0.9;
    // the points: pop in, then glow when they sit on their right side
    const pl = plan[L.k];
    set.ps.forEach((pt, i) => {
      const g = gp[i], pop = clamp((t - POP - i * 0.1) / 0.5, 0, 1), e = 1 - Math.pow(1 - pop, 3);
      const side = pt.x * n[0] + pt.y * n[1] - L.c, right = (side > 0) === pt.on;
      const scan = clamp(1 - Math.abs(t - (pl.start + 0.15 + i * (SEG * KEYS / 4))) / 0.35, 0, 1);
      g.setAttribute('transform', `translate(${S(pt.x)} ${SY(pt.y)}) scale(${(0.2 + 0.8 * e) * (1 + 0.25 * scan)})`);
      g.style.opacity = e;
      const dot = g.querySelector('.bd-pt'), halo = g.querySelector('.bd-halo'), ring = g.querySelector('.bd-ring');
      dot.setAttribute('fill', pt.on ? 'var(--gold2)' : light ? 'var(--bg)' : 'var(--bg2)');
      dot.setAttribute('stroke', pt.on ? 'var(--gold2)' : 'var(--dim)');
      halo.style.opacity = pt.on ? (right ? 0.35 + 0.65 * L.settle : 0.15) : 0;
      ring.setAttribute('r', 3.6 + scan * 4); ring.style.opacity = scan * 0.9;
      // the table row of this point lights while the line looks at it, and stays warm when it is right
      rowsBy.forEach((rows, k) => { const hl = rows[i] && rows[i].querySelector('.hl'); if (!hl) return; hl.style.opacity = k === L.k ? Math.max(scan, right ? 0.22 * L.settle : 0) : 0; });
    });
    qa('.bd-big').forEach((b) => { const k = +b.dataset.k, on = k === L.k ? clamp((t - plan[k].start - SEG * 2) / 0.8, 0, 1) : 0; b.style.opacity = on * 0.16; b.style.transform = `translateY(${(1 - on) * 20}px)`; });
    tabEls.forEach((tb, k) => { tb.style.opacity = t < LEARN ? '' : k === L.k ? 1 : 0.7; });
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: END + 0.3});
}
