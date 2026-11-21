// GSAP MotionPath + DrawSVG: a curved road is drawn, a dot travels along it, and each stop lights up with its label as the dot arrives.
export const css = `
.b-gsap-path-journey .jr { position: relative; }
.b-gsap-path-journey .jr svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
.b-gsap-path-journey .ghost { fill: none; stroke: var(--line); stroke-width: 2px; stroke-dasharray: 2 9; stroke-linecap: round; }
.b-gsap-path-journey .road { fill: none; stroke: var(--gold); stroke-width: 3.5px; stroke-linecap: round; opacity: 0; }
.b-gsap-path-journey .stopdot { fill: var(--bg); stroke: var(--gold); stroke-width: 2px; }
.b-gsap-path-journey .runner { fill: var(--ink); }
.b-gsap-path-journey .stops { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); column-gap: calc(var(--gap) * 0.8); padding-top: calc(var(--title) * 2.1); }
.b-gsap-path-journey .st { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.3); }
.b-gsap-path-journey .wh { font-size: var(--label); letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold2); }
.b-gsap-path-journey .t { font-size: calc(var(--lead) * 1.08); color: var(--ink); line-height: 1.14; letter-spacing: -0.01em; }
.b-gsap-path-journey .d { font-size: var(--body); color: var(--dim); line-height: 1.34; }
.cs-frame[data-shape="tall"] .b-gsap-path-journey .stops { grid-auto-flow: row; grid-auto-columns: auto; row-gap: calc(var(--gap) * 1.05); padding-top: 0; padding-left: calc(var(--title) * 1.9); }
`;
export default function mount(el, p, cx) {
  cx.plugin('MotionPathPlugin', 'DrawSVGPlugin');
  const g = cx.gsap, stops = (p.stops || []).slice(0, 6), n = stops.length, tall = cx.shape === 'tall';
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="jr">
      <svg aria-hidden="true"><path class="ghost"/><path class="road"/>${stops.map(() => '<circle class="stopdot" r="7"/>').join('')}<circle class="runner" r="9"/></svg>
      <ol class="stops">${stops.map((s) => `<li class="st">${s.when ? `<span class="wh">${cx.esc(s.when)}</span>` : ''}<span class="t">${cx.esc(s.title || s)}</span>${s.text ? `<span class="d">${cx.esc(s.text)}</span>` : ''}</li>`).join('')}</ol>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), jr = q('.jr'), svg = q('svg'), road = q('.road'), ghost = q('.ghost'), sts = [...el.querySelectorAll('.st')], dots = [...el.querySelectorAll('.stopdot')], runner = q('.runner');
  let tl = null, cur = 0;
  function make() {
    if (tl) tl.kill();
    g.set([road, runner, ghost, ...dots, ...sts, ...el.querySelectorAll('.cs-kicker, .cs-title')], {clearProps: 'all'});
    const W = jr.offsetWidth, H = jr.offsetHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const band = tall ? parseFloat(getComputedStyle(q('.stops')).paddingLeft) : parseFloat(getComputedStyle(q('.stops')).paddingTop);
    const pts = sts.map((st, i) => tall
      ? {x: band * (i % 2 ? 0.62 : 0.22), y: st.offsetTop + Math.min(st.offsetHeight / 2, band * 0.35)}
      : {x: st.offsetLeft + 10, y: band * (i % 2 ? 0.22 : 0.7)});
    const seg = (a, b) => tall ? `C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}` : `C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;
    let d = `M${pts[0].x} ${pts[0].y}`; const frac = [0];
    for (let i = 1; i < n; i++) { d += ' ' + seg(pts[i - 1], pts[i]); road.setAttribute('d', d); frac.push(road.getTotalLength()); }
    const total = frac[n - 1] || 1; for (let i = 0; i < n; i++) frac[i] /= total;
    ghost.setAttribute('d', d);
    const r = Math.max(4.5, Math.min(10, parseFloat(getComputedStyle(q('.t')).fontSize) * 0.17));
    dots.forEach((c, i) => { c.setAttribute('cx', pts[i].x); c.setAttribute('cy', pts[i].y); c.setAttribute('r', r); });
    runner.setAttribute('r', r * 1.3);
    const gold = getComputedStyle(el).getPropertyValue('--gold').trim() || '#D6892A';
    tl = g.timeline({paused: true});
    const head = el.querySelectorAll('.cs-kicker, .cs-title');
    if (head.length) tl.fromTo(head, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
    tl.fromTo(ghost, {opacity: 0}, {opacity: 1, duration: 0.6, ease: 'power1.out'}, 0.2);
    tl.fromTo(dots, {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.06}, 0.3);
    const t0 = 0.75, D = 0.75 * (n - 1) + 0.2;
    tl.set(road, {opacity: 1}, t0);
    tl.fromTo(road, {drawSVG: '0%'}, {drawSVG: '100%', duration: D, ease: 'none'}, t0);
    tl.fromTo(runner, {opacity: 0}, {opacity: 1, duration: 0.2}, t0 - 0.15);
    tl.to(runner, {motionPath: {path: road, align: road, alignOrigin: [0.5, 0.5]}, duration: D, ease: 'none'}, t0);
    sts.forEach((st, i) => {
      const at = t0 + D * frac[i];
      tl.fromTo(st, {opacity: 0, y: tall ? 0 : 18, x: tall ? 18 : 0}, {opacity: 1, y: 0, x: 0, duration: 0.6, ease: 'power3.out'}, Math.max(0.4, at - 0.12));
      tl.to(dots[i], {fill: gold, duration: 0.3, ease: 'power1.out'}, at);
    });
    tl.to(runner, {scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'power2.in'}, t0 + D + 0.1);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); }};
}
