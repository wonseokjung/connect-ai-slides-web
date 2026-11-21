// Web Animations API + one plain function, no library: cards on the left flow into a gold hub in the middle and out to cards on the right.
// Every curved line draws itself and a small gold dot rides its tip once. The dot position is computed from the time, so it can be seeked.
export const css = `
.b-kit-flow-diagram .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.5 + var(--top)) calc(var(--pad) * 0.7) calc(var(--pad) * 0.44); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.7); }
.b-kit-flow-diagram .hd { flex: none; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-kit-flow-diagram .hd .cs-title { font-size: calc(var(--title) * 0.56); }
.b-kit-flow-diagram .dia { position: relative; flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 23fr 9.5fr 26fr 9.5fr 32fr; align-items: center; }
.b-kit-flow-diagram .col { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.56); height: 100%; min-width: 0; }
.b-kit-flow-diagram .col.from { grid-column: 1; } .b-kit-flow-diagram .col.to { grid-column: 5; }
.b-kit-flow-diagram .nd { flex: 1 1 0; max-height: 37cqh; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.3); padding: calc(var(--gap) * 0.6) calc(var(--gap) * 0.7); border-radius: var(--radius); background: var(--bg2); border: 1px solid var(--line); }
.b-kit-flow-diagram .nd b { font-weight: var(--light); font-size: calc(var(--lead) * 1.1); color: var(--ink); line-height: 1.08; letter-spacing: -0.015em; text-wrap: balance; }
.b-kit-flow-diagram .nd span { font-size: calc(var(--body) * 0.9); color: var(--dim); line-height: 1.32; text-wrap: pretty; }
.b-kit-flow-diagram .col.to .nd { border-left: calc(var(--label) * 0.16) solid var(--gold); }
.b-kit-flow-diagram .hub { grid-column: 3; flex: none; height: min(100%, 54cqh); max-height: none; background: var(--gold2); border-color: var(--gold2); gap: calc(var(--gap) * 0.45); }
.b-kit-flow-diagram .hub b { color: var(--bg); font-weight: 400; font-size: calc(var(--lead) * 1.2); }
.b-kit-flow-diagram .hub span { color: var(--bg); opacity: 0.88; font-size: calc(var(--body) * 0.95); }
.b-kit-flow-diagram .hub i { display: block; height: 2px; width: 3em; background: var(--bg); opacity: 0.7; }
.b-kit-flow-diagram svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.b-kit-flow-diagram .ln { fill: none; stroke: var(--gold); stroke-dasharray: 1 1; }
.b-kit-flow-diagram .sk { fill: var(--bg); stroke: var(--gold2); }
.b-kit-flow-diagram .tip { fill: var(--ink); stroke: var(--gold2); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .wrap { padding: calc(var(--pad) * 0.8 + var(--top)) var(--pad) calc(var(--pad) * 0.7); gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .hd .cs-title { font-size: calc(var(--title) * 0.8); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .dia { display: flex; flex-direction: column; align-items: stretch; justify-content: center; gap: calc(var(--gap) * 1.5); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .col { height: auto; flex: none; gap: calc(var(--gap) * 0.7); padding-left: 13%; }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .nd { flex: none; max-height: none; padding: calc(var(--gap) * 1.05) calc(var(--gap) * 1.1); gap: calc(var(--gap) * 0.3); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .nd b { font-size: calc(var(--lead) * 1.2); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .nd span { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .hub { height: auto; padding-top: calc(var(--gap) * 1.7); padding-bottom: calc(var(--gap) * 1.7); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .hub b { font-size: calc(var(--lead) * 1.3); }
`;
export default function mount(el, p, cx) {
  const tall = cx.shape === 'tall';
  const norm = (x) => (typeof x === 'string' ? {title: x} : x || {});
  const from = [].concat(p.from || []).slice(0, 3).map(norm), to = [].concat(p.to || []).slice(0, 4).map(norm), hub = norm(p.hub);
  const card = (n, c) => `<div class="nd ${c}"><b>${cx.esc(n.title || '')}</b>${n.text ? `<span>${cx.esc(n.text)}</span>` : ''}</div>`;
  const nf = from.length, nt = to.length, nl = nf + nt;
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="dia">
      <div class="col from">${from.map((n) => card(n, 'f')).join('')}</div>
      <div class="nd hub"><b>${cx.esc(hub.title || '')}</b>${hub.text ? `<i aria-hidden="true"></i><span>${cx.esc(hub.text)}</span>` : ''}</div>
      <div class="col to">${to.map((n) => card(n, 't')).join('')}</div>
      <svg aria-hidden="true">${'<path class="ln" pathLength="1"/>'.repeat(nl)}${'<circle class="sk"/><circle class="sk"/>'.repeat(nl)}${'<circle class="tip"/>'.repeat(nl)}</svg>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const dia = q('.dia'), hubEl = q('.hub'), fs = qa('.nd.f'), ts = qa('.nd.t'), lns = qa('.ln'), sks = qa('.sk'), tips = qa('.tip');
  const box = (e) => ({x: e.offsetLeft, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight});
  let lens = [];
  // the lines are drawn in real pixels of the diagram, and again when the page is resized
  function draw() {
    const W = dia.clientWidth, H = dia.clientHeight; if (!W || !H) return;
    const lw = cx.clamp(Math.max(W, H) * 0.004, 3, 8), hb = box(hubEl), ends = [];
    const set = (i, d, a, b) => { lns[i].setAttribute('d', d); lns[i].setAttribute('stroke-width', lw); ends[i] = [a, b]; };
    if (!tall) {
      const s = (a, b) => `M${a.x} ${a.y} C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;
      fs.forEach((e, i) => { const f = box(e), a = {x: f.x + f.w, y: f.y + f.h / 2}, b = {x: hb.x, y: hb.y + (hb.h * (i + 1)) / (nf + 1)}; set(i, s(a, b), a, b); });
      ts.forEach((e, j) => { const t = box(e), a = {x: hb.x + hb.w, y: hb.y + (hb.h * (j + 1)) / (nt + 1)}, b = {x: t.x, y: t.y + t.h / 2}; set(nf + j, s(a, b), a, b); });
    } else {
      // a trunk runs down the left side: every card joins it with a round corner
      const first = box(fs[0] || ts[0] || hubEl), tx = hb.x + (first.x - hb.x) * 0.42, rr = (first.x - tx) * 0.9;
      fs.forEach((e, i) => { const f = box(e), a = {x: f.x, y: f.y + f.h / 2}, b = {x: tx, y: hb.y}; set(i, `M${a.x} ${a.y} L${tx + rr} ${a.y} Q${tx} ${a.y} ${tx} ${a.y + rr} L${b.x} ${b.y}`, a, b); });
      ts.forEach((e, j) => { const t = box(e), a = {x: tx, y: hb.y + hb.h}, b = {x: t.x, y: t.y + t.h / 2}; set(nf + j, `M${a.x} ${a.y} L${tx} ${b.y - rr} Q${tx} ${b.y} ${tx + rr} ${b.y} L${b.x} ${b.y}`, a, b); });
    }
    lens = lns.map((l) => l.getTotalLength());
    ends.forEach((pair, i) => pair.forEach((pt, k) => { const c = sks[i * 2 + k]; c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('r', lw * 1.5); c.setAttribute('stroke-width', Math.max(1.5, lw * 0.45)); }));
    tips.forEach((c) => { c.setAttribute('r', lw * 1.7); c.setAttribute('stroke-width', lw * 0.8); });
  }
  draw();
  const slide = tall ? 'translateY(22px)' : 'translateX(-36px)', into = tall ? 'translateY(22px)' : 'translateX(36px)';
  const L1 = 0.5, L2 = 1.25, LD = 0.5, G1 = 0.08, G2 = 0.12, DUR = L2 + G2 * Math.max(0, nt - 1) + 0.35 + 0.65;
  const head = qa('.hd > *');
  if (head.length) cx.wa(head, [{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], {duration: 0.65, stagger: 0.09});
  cx.wa(fs, [{opacity: 0, transform: slide}, {opacity: 1, transform: 'none'}], {duration: 0.65, delay: 0.15, stagger: 0.1});
  cx.wa(hubEl, [{opacity: 0, transform: 'scale(0.88)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: nf ? L1 + 0.35 : 0.3, ease: 'cubic-bezier(.2,1.3,.4,1)'});
  cx.wa(ts, [{opacity: 0, transform: into}, {opacity: 1, transform: 'none'}], {duration: 0.65, delay: L2 + 0.35, stagger: G2});
  const starts = lns.map((l, i) => (i < nf ? L1 + G1 * i : L2 + G2 * (i - nf)));
  lns.forEach((l, i) => {
    cx.wa(l, [{strokeDashoffset: 1, opacity: 0}, {strokeDashoffset: 0.96, opacity: 1, offset: 0.04}, {strokeDashoffset: 0, opacity: 1}], {duration: LD, delay: starts[i], ease: 'linear'});
    cx.wa(sks[i * 2], [{opacity: 0}, {opacity: 1}], {duration: 0.15, delay: starts[i], ease: 'linear'});
    cx.wa(sks[i * 2 + 1], [{opacity: 0}, {opacity: 1}], {duration: 0.2, delay: starts[i] + LD - 0.05, ease: 'linear'});
  });
  const anims = cx.fromWaapi(el, {dur: DUR});
  // the gold dot on the tip of each line: where it is depends only on t
  const dots = cx.fromFn(DUR, (t) => {
    tips.forEach((c, i) => {
      const pr = (t - starts[i]) / LD;
      if (pr <= 0 || pr >= 1 || !lens[i]) { c.style.opacity = 0; return; }
      const pt = lns[i].getPointAtLength(lens[i] * pr);
      c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.style.opacity = 1;
    });
  });
  dots.fit = draw;
  return cx.all(anims, dots);
}
