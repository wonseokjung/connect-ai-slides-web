// GSAP DrawSVG + MotionPath: a wide road with a gold centre line is drawn across the whole screen, and four to seven stops
// (a picture card + lesson, title, tool) light up one after another as the line arrives. One stop is "now" and is gold.
// On a slide two stops come per click; on a web page the screen stays pinned and the scroll draws the road. On a phone the road runs down the side.
export const css = `
.b-gsap-lesson-map .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.4 + var(--top)) calc(var(--pad) * 0.6) calc(var(--pad) * 0.34); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); }
.b-gsap-lesson-map .hd { flex: none; display: flex; align-items: baseline; gap: calc(var(--gap) * 0.7); }
.b-gsap-lesson-map .hd .hr { flex: 1; height: 1px; background: var(--line); align-self: center; transform-origin: 0 50%; display: block; }
.b-gsap-lesson-map .ttl { font-size: calc(var(--lead) * 0.95); font-weight: var(--thin); letter-spacing: -0.02em; color: var(--ink); line-height: 1.1; }
.b-gsap-lesson-map .map { position: relative; flex: 1 1 auto; min-height: 0; }
.b-gsap-lesson-map .map svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.b-gsap-lesson-map svg path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.b-gsap-lesson-map .edge { stroke: color-mix(in srgb, var(--ivory) 34%, var(--bg)); }
.b-gsap-lesson-map .bed { stroke: color-mix(in srgb, var(--ivory) 10%, var(--bg)); }
.b-gsap-lesson-map .lane { stroke: color-mix(in srgb, var(--ivory) 40%, transparent); stroke-linecap: butt; }
.b-gsap-lesson-map .gold { stroke: var(--gold); opacity: 0; }
.b-gsap-lesson-map .dot { fill: var(--bg); stroke: var(--gold2); }
.b-gsap-lesson-map .core { fill: var(--gold2); }
.b-gsap-lesson-map .halo { fill: none; stroke: var(--gold2); }
.b-gsap-lesson-map .runner { fill: var(--ink); opacity: 0; }
.b-gsap-lesson-map .sts { position: absolute; inset: 0; }
.b-gsap-lesson-map .st { position: absolute; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.26); }
.b-gsap-lesson-map .st.up { flex-direction: column-reverse; }
.b-gsap-lesson-map .pic { position: relative; flex: none; height: var(--th, 8em); border-radius: calc(var(--radius) * 0.8); overflow: hidden; background: var(--bg2); border: 1px solid var(--line); }
.b-gsap-lesson-map .pic .in { position: absolute; inset: 0; display: grid; place-items: center; }
.b-gsap-lesson-map .pic img { width: 100%; height: 100%; object-fit: cover; }
.b-gsap-lesson-map .pic .no { height: 62%; aspect-ratio: 1; border-radius: 50%; border: 1px solid var(--gold); display: grid; place-items: center; font-size: calc(var(--lead) * 1.05); font-weight: var(--thin); color: var(--ink); letter-spacing: -0.03em; line-height: 1; }
.b-gsap-lesson-map .pic .ring { position: absolute; inset: 0; border-radius: inherit; border: 1px solid color-mix(in srgb, var(--ivory) 50%, transparent); }
.b-gsap-lesson-map .st.now .pic .ring { border: calc(var(--label) * 0.13) solid var(--gold2); }
.b-gsap-lesson-map .lb { display: flex; flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.1); min-width: 0; padding: 0 0.1em; }
.b-gsap-lesson-map .wh { font-size: var(--label); font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold2); line-height: 1.3; white-space: nowrap; }
.b-gsap-lesson-map .st.now .wh { background: var(--gold2); color: var(--bg); font-weight: 500; padding: 0.1em 0.6em 0.1em 0.8em; border-radius: 999px; margin-bottom: 0.15em; }
.b-gsap-lesson-map .t { font-size: calc(var(--lead) * 0.62); color: var(--ink); line-height: 1.13; letter-spacing: -0.012em; text-wrap: balance; }
.b-gsap-lesson-map .tool { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: var(--label); color: var(--dim); line-height: 1.3; }
.cs-frame[data-stage="deck"] .b-gsap-lesson-map .ttl { font-size: calc(var(--lead) * 1.15); }
.cs-frame[data-stage="deck"] .b-gsap-lesson-map .wh { font-size: calc(var(--label) * 1.15); }
.cs-frame[data-stage="deck"] .b-gsap-lesson-map .t { font-size: calc(var(--lead) * 0.84); }
.cs-frame[data-stage="site"][data-shape="wide"] .b-gsap-lesson-map .t { font-size: calc(var(--lead) * 0.72); }
.cs-frame[data-stage="site"][data-shape="wide"] .b-gsap-lesson-map .tool { font-size: var(--label); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .wrap { padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.5); gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .hd { flex-direction: column; align-items: flex-start; gap: 0.35em; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .hd .hr { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .ttl { font-size: calc(var(--lead) * 1.3); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .st, .cs-frame[data-shape="tall"] .b-gsap-lesson-map .st.up { display: grid; grid-template-columns: 37% 1fr; column-gap: calc(var(--gap) * 0.7); align-items: center; translate: 0 -50%; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .pic { height: auto; aspect-ratio: 16 / 10; border-radius: calc(var(--radius) * 0.6); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .pic .no { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .t { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .wh, .cs-frame[data-shape="tall"] .b-gsap-lesson-map .tool { font-size: calc(var(--label) * 0.92); }
`;
export default function mount(el, p, cx) {
  cx.plugin('DrawSVGPlugin', 'MotionPathPlugin');
  const g = cx.gsap, tall = cx.shape === 'tall';
  const stops = (p.stops || []).slice(0, 7).map((s) => (typeof s === 'string' ? {title: s} : s)), n = stops.length;
  const now = p.now == null ? -1 : (p.now | 0) - 1, click = p.click !== false;
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}<i class="hr" aria-hidden="true"></i>${p.title ? `<h2 class="ttl">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="map">
      <svg aria-hidden="true"><path class="edge"/><path class="bed"/><path class="lane"/><path class="gold"/>${stops.map(() => '<g class="nd"><circle class="halo"/><circle class="dot"/><circle class="core"/></g>').join('')}<circle class="runner"/></svg>
      <ol class="sts">${stops.map((s, i) => `<li class="st ${i % 2 ? 'dn' : 'up'}${i === now ? ' now' : ''}">
        <div class="pic"><div class="in">${s.src ? `<img src="${cx.esc(s.src)}" alt="${cx.esc(s.alt || s.title || 'Picture of this stop')}">` : `<span class="no cs-num">${String(i + 1).padStart(2, '0')}</span>`}</div><i class="ring" aria-hidden="true"></i></div>
        <div class="lb">${s.when ? `<span class="wh">${cx.esc(s.when)}</span>` : ''}<span class="t">${cx.esc(s.title || '')}</span>${s.tool ? `<span class="tool">${cx.esc(s.tool)}</span>` : ''}</div>
      </li>`).join('')}</ol>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const map = q('.map'), sts = qa('.st'), edge = q('.edge'), bed = q('.bed'), lane = q('.lane'), gold = q('.gold'), runner = q('.runner'), nds = qa('.nd');
  let tl = null, draw = null, run = null, cur = 0, frac = [];
  // the map is laid out in real pixels of the frame: cards above and below a road band (wide), or a list beside the road (tall)
  function lay() {
    const W = map.clientWidth, H = map.clientHeight; if (!W || !H || !n) return false;
    const pts = [], ox = map.offsetLeft, oy = map.offsetTop;
    let rw, d;
    const set = (pt) => { gold.setAttribute('d', d); frac.push(gold.getTotalLength()); pts.push(pt); };
    frac = [];
    if (!tall) {
      const k = 1.7, P = n > 1 ? W / (n - 1 + k) : W, w = n > 1 ? P * k : W * 0.5, gap = parseFloat(getComputedStyle(sts[0]).rowGap) || 0;
      sts.forEach((st, i) => { st.style.width = w + 'px'; st.style.left = (n > 1 ? i * P : W * 0.25) + 'px'; st.style.top = st.style.bottom = 'auto'; });
      const lbH = (odd) => Math.max(0, ...sts.filter((_, i) => (i % 2 === 1) === odd).map((st) => st.querySelector('.lb').offsetHeight));
      const up = lbH(false), dn = lbH(true);
      rw = cx.clamp(H * 0.052, 14, 56);
      const band = rw * 3.3;
      const th = Math.max(40, Math.min(w * 9 / 16, (H - band - up - dn - 2 * gap) / 2));
      const top = Math.max(0, (H - (2 * th + band + up + dn + 2 * gap)) / 2) + up + gap + th, cy = top + band / 2, amp = band / 2 - rw * 0.72;
      map.style.setProperty('--th', th + 'px');
      sts.forEach((st, i) => { if (i % 2) st.style.top = top + band + 'px'; else st.style.bottom = H - top + 'px'; });
      const X = (i) => (n > 1 ? i * P : W * 0.25) + w / 2, Y = (i) => cy + (i % 2 ? amp : -amp);
      const seg = (ax, ay, bx, by) => ` C${(ax + bx) / 2} ${ay} ${(ax + bx) / 2} ${by} ${bx} ${by}`;
      let px = -ox - rw * 2, py = cy + amp * 0.9;
      d = `M${px} ${py}`;
      for (let i = 0; i < n; i++) { d += seg(px, py, X(i), Y(i)); px = X(i); py = Y(i); set({x: px, y: py}); }
      d += seg(px, py, W + ox + rw * 2, cy + (n % 2 ? amp : -amp) * 0.9);
    } else {
      const rc = W * 0.17, row = H / n; rw = cx.clamp(W * 0.062, 12, 30);
      sts.forEach((st, i) => { st.style.left = rc + rw * 0.9 + 'px'; st.style.width = W - rc - rw * 0.9 + 'px'; st.style.top = row * (i + 0.5) + 'px'; st.style.bottom = 'auto'; });
      const X = (i) => rc * (i % 2 ? 0.78 : 0.2), Y = (i) => row * (i + 0.5);
      const seg = (ax, ay, bx, by) => ` C${ax} ${(ay + by) / 2} ${bx} ${(ay + by) / 2} ${bx} ${by}`;
      let px = rc * 0.78, py = -row * 0.12;
      d = `M${px} ${py}`;
      for (let i = 0; i < n; i++) { d += seg(px, py, X(i), Y(i)); px = X(i); py = Y(i); set({x: px, y: py}); }
      d += seg(px, py, rc * (n % 2 ? 0.78 : 0.2), H + (el.clientHeight - oy - H) + rw * 2);
    }
    [edge, bed, lane, gold].forEach((e) => e.setAttribute('d', d));
    const total = gold.getTotalLength() || 1; frac = frac.map((f) => f / total);
    edge.setAttribute('stroke-width', rw + Math.max(2, rw * 0.09)); bed.setAttribute('stroke-width', rw);
    lane.setAttribute('stroke-width', Math.max(1.5, rw * 0.055)); lane.setAttribute('stroke-dasharray', `${rw * 0.42} ${rw * 0.5}`);
    gold.setAttribute('stroke-width', Math.max(3, rw * 0.15)); runner.setAttribute('r', Math.max(4, rw * 0.2));
    nds.forEach((nd, i) => {
      const [halo, dot, core] = nd.children, r = rw * 0.3;
      [halo, dot, core].forEach((c) => { c.setAttribute('cx', pts[i].x); c.setAttribute('cy', pts[i].y); });
      dot.setAttribute('r', r); dot.setAttribute('stroke-width', Math.max(1.5, rw * 0.06)); core.setAttribute('r', r * (i === now ? 1 : 0.56));
      halo.setAttribute('r', r * 1.75); halo.setAttribute('stroke-width', Math.max(1.5, rw * 0.06));
    });
    return true;
  }
  function make() {
    if (tl) { tl.kill(); draw.kill(); run.kill(); }
    const anim = [edge, bed, lane, gold, runner, ...qa('.hd > *, .pic, .pic .in, .pic .ring, .lb > *, .dot, .core, .halo')];
    g.set(anim, {clearProps: 'all'});
    lay();
    tl = g.timeline({paused: true});
    const head = qa('.hd > *:not(.hr)');
    if (head.length) tl.fromTo(head, {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08}, 0);
    if (q('.hr')) tl.fromTo(q('.hr'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'power3.inOut'}, 0.1);
    // the empty map first: road bed, lane marks, card outlines, stop dots
    tl.fromTo([edge, bed], {opacity: 0}, {opacity: 1, duration: 0.05}, 0.1);
    tl.fromTo([edge, bed], {drawSVG: '0%'}, {drawSVG: '100%', duration: 0.85, ease: 'power2.inOut'}, 0.1);
    tl.fromTo(lane, {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out'}, 0.7);
    tl.fromTo(qa('.pic'), {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06}, 0.2);
    tl.fromTo(qa('.dot'), {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.06}, 0.4);
    g.set(qa('.core, .halo'), {opacity: 0, scale: 0, transformOrigin: '50% 50%'});
    g.set(qa('.pic .ring'), {opacity: 0});
    // the gold line and the runner are two paused tweens; the timeline moves their progress stop by stop
    draw = g.fromTo(gold, {drawSVG: '0%'}, {drawSVG: '100%', duration: 1, ease: 'none', paused: true});
    run = g.to(runner, {motionPath: {path: gold, align: gold, alignOrigin: [0.5, 0.5]}, duration: 1, ease: 'none', paused: true});
    let T = 0.8, f0 = 0, step = 0;
    tl.fromTo([gold, runner], {opacity: 0}, {opacity: 1, duration: 0.15}, T - 0.05);
    for (let a = 0; a < n; a += 2) {
      const grp = [a, a + 1].filter((j) => j < n), f1 = frac[grp[grp.length - 1]] || 1, d = 0.45 * grp.length + (a === 0 ? 0.2 : 0);
      tl.to([draw, run], {progress: f1, duration: d, ease: 'none'}, T);
      grp.forEach((j) => {
        const at = T + d * ((frac[j] - f0) / Math.max(1e-6, f1 - f0)), st = sts[j], up = !tall && j % 2 === 0;
        tl.fromTo(st.querySelector('.in'), {clipPath: tall ? 'inset(0% 100% 0% 0%)' : up ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', scale: 1.12}, {clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.7, ease: 'power3.out'}, at - 0.08);
        tl.to(st.querySelector('.ring'), {opacity: 1, duration: 0.4, ease: 'power1.out'}, at);
        tl.fromTo(st.querySelectorAll('.lb > *'), {opacity: 0, x: tall ? 16 : 0, y: tall ? 0 : up ? -14 : 14}, {opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07}, at + 0.08);
        tl.to(nds[j].querySelector('.core'), {opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.4)'}, at - 0.02);
        if (j === now) tl.to(nds[j].querySelector('.halo'), {opacity: 0.85, scale: 1, duration: 0.6, ease: 'power3.out'}, at + 0.05);
      });
      T += d + 0.7; f0 = f1;
      if (a + 2 < n) { if (click && step < 3) tl.addLabel('step' + ++step, T - 0.05); }
      else { tl.to([draw, run], {progress: 1, duration: 0.6, ease: 'power1.in'}, T - 0.65); tl.to(runner, {opacity: 0, duration: 0.2}, T - 0.2); }
    }
    tl.to({}, {duration: 0.01}, T - 0.01);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  const steps = Object.keys(tl.labels).map((k) => tl.labels[k]).sort((a, b) => a - b);
  return {lib: 'gsap', dur: tl.duration(), steps, seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); draw.kill(); run.kill(); }};
}
