// vis/matrix: a matrix formula you can watch compute. The matrices of A = XW + B stand as grids of glowing cells,
// the row of X sweeps down each column of W (cells light in pairs), B adds in, and each result drops into A.
// Only the symbols given are written; the cells of a matrix without symbols stay unnamed.
export const css = `
.b-vis-matrix .pro-body { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: calc(var(--gap) * 1.0); perspective: 1600px; }
.b-vis-matrix .mx-row { display: flex; align-items: center; justify-content: center; gap: calc(var(--gap) * 0.4); flex-wrap: nowrap; }
.b-vis-matrix .mx { display: flex; flex-direction: column; align-items: center; gap: 0.35em; }
.b-vis-matrix .mx-n { font-family: var(--serif); font-style: italic; font-size: calc(var(--title) * 0.7); color: var(--gold2); line-height: 1; }
.b-vis-matrix .mx-g { position: relative; display: grid; grid-template-columns: repeat(var(--c), var(--cell)); grid-auto-rows: var(--cell); gap: calc(var(--cell) * 0.12); padding: calc(var(--cell) * 0.16) calc(var(--cell) * 0.24); --cell: calc(var(--lead) * 2.1); }
.b-vis-matrix .mx-g::before, .b-vis-matrix .mx-g::after { content: ""; position: absolute; top: 0; bottom: 0; width: calc(var(--cell) * 0.14); border: 2px solid var(--gold); transform-origin: 50% 50%; transform: scaleY(var(--br, 1)); }
.b-vis-matrix .mx-g::before { left: 0; border-right: 0; border-radius: 6px 0 0 6px; }
.b-vis-matrix .mx-g::after { right: 0; border-left: 0; border-radius: 0 6px 6px 0; }
.b-vis-matrix .cl { position: relative; display: grid; place-items: center; border-radius: calc(var(--cell) * 0.16); background: var(--card); border: 1px solid var(--line); font-size: calc(var(--lead) * 1.15); color: var(--ink); }
.b-vis-matrix .cl .g { position: absolute; inset: -1px; border-radius: inherit; background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--gold2) 55%, transparent), color-mix(in srgb, var(--gold) 18%, transparent) 70%); box-shadow: 0 0 34px color-mix(in srgb, var(--gold) 50%, transparent); opacity: 0; }
.b-vis-matrix .cl span { position: relative; }
/* a cell without a symbol shows its weight as a picture: a gold dot whose size is the strength (no invented names) */
.b-vis-matrix .cl .wt { position: relative; width: 58%; aspect-ratio: 1; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--gold2) 35%, transparent); display: grid; place-items: center; }
.b-vis-matrix .cl .wt::after { content: ""; width: calc(var(--k) * 100%); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 40% 35%, var(--gold2), var(--gold) 70%); box-shadow: 0 0 14px color-mix(in srgb, var(--gold2) 45%, transparent); }
.b-vis-matrix .op { font-size: calc(var(--title) * 0.8); font-weight: var(--thin); color: var(--gold2); padding-top: calc(var(--title) * 0.7); }
.b-vis-matrix .mx-t { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4em 1.8em; font-size: var(--lead); color: var(--dim); }
.b-vis-matrix .mx-t b { color: var(--gold2); font-weight: 400; margin-right: 0.4em; }
.cs-frame[data-shape="tall"] .b-vis-matrix .mx-row { flex-wrap: wrap; gap: 0.6em; }
.cs-frame[data-shape="tall"] .b-vis-matrix .pro-body { gap: calc(var(--gap) * 1.4); }
.cs-frame[data-shape="tall"] .b-vis-matrix .mx-row { row-gap: 1.2em; }
.cs-frame[data-shape="tall"] .b-vis-matrix .mx-g { --cell: 10.5cqw; }
.cs-frame[data-shape="tall"] .b-vis-matrix .cl { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-vis-matrix .mx-t { font-size: var(--lead); gap: 0.3em 1.2em; }
.cs-frame[data-shape="tall"] .b-vis-matrix .op { padding-top: calc(var(--title) * 0.5); font-size: var(--title); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc;
  const eq = String(p.eq || 'A = XW + B');
  const terms = (p.terms || []).map((t) => (typeof t === 'string' ? (() => { const m = /^([^:：]+)[:：]\s*(.*)$/.exec(t); return m ? {sym: m[1], text: m[2]} : {sym: t, text: ''}; })() : t));
  const cellsOf = {};
  terms.forEach((t) => { const m = /\(([^)]*)\)/.exec(t.text || ''); const sym = String(t.sym || '').trim(); if (m && sym) cellsOf[sym] = m[1].split(/[\s,]+/).filter(Boolean); });
  // read the formula: capitals are matrices, = and + are operators; XW is a product
  const [lhsS, rhsS] = eq.split('=').map((s) => s.trim());
  const lhs = (lhsS || 'A').replace(/[^A-Za-z]/g, '').slice(0, 1) || 'A';
  const parts = [];
  String(rhsS || '').split(/\s*\+\s*/).forEach((term, ti) => { if (ti) parts.push({op: '+'}); const caps = term.replace(/[^A-Z]/g, '').split(''); caps.forEach((c) => parts.push({m: c})); });
  const nOut = (cellsOf[lhs] || []).length || 3;
  const mats = {};
  const mk = (name, rows, cols, labels) => (mats[name] = {name, rows, cols, labels});
  mk(lhs, 1, nOut, cellsOf[lhs] || []);
  parts.forEach((x, i) => {
    if (!x.m || mats[x.m]) return;
    if (cellsOf[x.m]) { mk(x.m, 1, cellsOf[x.m].length, cellsOf[x.m]); return; }
    // a matrix without symbols: rows from the vector before it, columns from the result
    const prev = parts[i - 1] && parts[i - 1].m ? mats[parts[i - 1].m] : null;
    mk(x.m, prev ? prev.cols : 2, nOut, []);
  });
  const prodIn = parts.findIndex((x, i) => x.m && parts[i + 1] && parts[i + 1].m);   // X in XW
  const Xn = prodIn >= 0 ? parts[prodIn].m : null, Wn = prodIn >= 0 ? parts[prodIn + 1].m : null;
  const Bn = parts.slice(prodIn + 2).find((x) => x.m)?.m || null;
  const grid = (m) => `<div class="mx" data-m="${esc(m.name)}"><span class="mx-n">${esc(m.name)}</span><div class="mx-g" style="--c:${m.cols}">${Array.from({length: m.rows * m.cols}, (_, i) => `<div class="cl" data-r="${Math.floor(i / m.cols)}" data-c="${i % m.cols}"><i class="g" aria-hidden="true"></i>${m.labels[i] ? `<span>${P.math(m.labels[i])}</span>` : `<i class="wt" aria-hidden="true" style="--k:${(0.3 + 0.62 * ((Math.sin((i + 1) * 12.9898 + m.cols * 78.233) * 43758.5453) % 1 + 1) % 1).toFixed(2)}"></i>`}</div>`).join('')}</div></div>`;
  const row = [grid(mats[lhs]), `<span class="op">=</span>`, ...parts.map((x) => (x.op ? `<span class="op">+</span>` : grid(mats[x.m])))].join('');
  el.innerHTML = `<i class="pro-glow" style="--gx:50%;--gy:50%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2"><div class="mx-row">${row}</div>
    ${terms.length ? `<div class="mx-t">${terms.slice(0, 4).map((t) => `<span><b>${P.math(t.sym)}</b>${P.math(t.text || '')}</span>`).join('')}</div>` : ''}
    ${p.note ? `<p class="mx-t">${esc(p.note)}</p>` : ''}</div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  { const rowEl = q('.mx-row'), bw = q('.pro-body').clientWidth, rw = rowEl.scrollWidth; if (rw > bw * 0.98 && rw > 0) rowEl.style.zoom = ((bw * 0.96) / rw).toFixed(3); }
  const cell = (m, r, c) => el.querySelector(`.mx[data-m="${m}"] .cl[data-r="${r}"][data-c="${c}"]`);
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  qa('.mx').forEach((m, i) => {
    tl.fromTo(m, {opacity: 0, z: -700, rotationY: -25, filter: 'blur(12px)'}, {opacity: 1, z: 0, rotationY: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out'}, t0 + i * 0.12);
    tl.fromTo(m.querySelector('.mx-g'), {'--br': 0}, {'--br': 1, duration: 0.8, ease: 'expo.out'}, t0 + i * 0.12 + 0.2);
  });
  tl.fromTo(qa('.op'), {opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.1}, t0 + 0.3);
  P.rise(tl, qa('.mx-t'), t0 + 0.6, {y: 14});
  // A starts empty: its symbols drop in as each column is computed
  const outs = qa(`.mx[data-m="${lhs}"] .cl > span`);
  let t = t0 + 1.0;
  const PAIR = 0.28;
  for (let j = 0; j < nOut; j++) {
    if (Xn && Wn) {
      const xr = mats[Xn].cols;
      for (let kk = 0; kk < xr; kk++) {
        const a = cell(Xn, 0, kk), b = cell(Wn, kk, j);
        for (const c of [a, b]) if (c) tl.fromTo(c.querySelector('.g'), {opacity: 0}, {opacity: 1, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut'}, t + kk * PAIR);
        if (b) tl.fromTo(b, {scale: 1}, {scale: 1.08, duration: 0.18, yoyo: true, repeat: 1}, t + kk * PAIR);
      }
      t += xr * PAIR;
    }
    if (Bn && cell(Bn, 0, j)) { tl.fromTo(cell(Bn, 0, j).querySelector('.g'), {opacity: 0}, {opacity: 1, duration: 0.18, yoyo: true, repeat: 1}, t); t += 0.22; }
    const o = cell(lhs, 0, j);
    if (o) { tl.fromTo(o.querySelector('.g'), {opacity: 0}, {opacity: 0.85, duration: 0.25}, t); tl.to(o.querySelector('.g'), {opacity: 0.18, duration: 0.6}, t + 0.3); }
    if (outs[j]) tl.fromTo(outs[j], {opacity: 0, y: -40, scale: 1.4}, {opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)'}, t);
    t += 0.35;
  }
  const END = t + 0.3;
  // afterwards: one column at a time breathes, the row of X and the cell of A it makes
  const gs = (m, r, c) => (cell(m, r, c) || {querySelector: () => null}).querySelector('.g');
  function draw(tt) {
    if (tt < END) return;
    const u = (tt - END) / 1.6, j = Math.floor(u) % nOut, f = Math.sin(Math.PI * (u - Math.floor(u)));
    for (let jj = 0; jj < nOut; jj++) {
      const on = jj === j ? f * 0.55 : 0;
      if (Wn) for (let r = 0; r < mats[Wn].rows; r++) { const g = gs(Wn, r, jj); if (g) g.style.opacity = on; }
      const ga = gs(lhs, 0, jj); if (ga) ga.style.opacity = 0.18 + on * 0.8;
    }
    if (Xn) for (let c = 0; c < mats[Xn].cols; c++) { const g = gs(Xn, 0, c); if (g) g.style.opacity = f * 0.35; }
  }
  return cx.vis.ambient(tl, el, draw, {dur: END});
}
