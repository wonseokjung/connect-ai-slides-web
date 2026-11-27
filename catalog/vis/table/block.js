// vis/table: a word table that turns into place. Rows flip down out of the dark one after another, a line of light
// scans the table top to bottom, the gold column glows behind its cells. The scan comes back now and then.
export const css = `
.b-vis-table .pro-body { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.7); min-height: 0; }
.b-vis-table .tbs { display: flex; gap: calc(var(--gap) * 1.4); align-items: flex-start; justify-content: center; min-height: 0; --rs: 1; }
.b-vis-table .tb { position: relative; flex: 1; min-width: 0; max-width: 100%; perspective: 1400px; }
.b-vis-table .tb-t { font-family: var(--serif); font-style: italic; font-size: calc(var(--title) * 0.55 * var(--rs)); color: var(--ink); margin-bottom: 0.3em; line-height: 1.1; }
.b-vis-table .tr { position: relative; display: grid; grid-template-columns: repeat(var(--nc), minmax(0, 1fr)); align-items: center; padding: calc(0.62em * var(--rs)) 0.7em; font-size: calc(var(--lead) * 1.15 * var(--rs)); color: var(--ivory); border-bottom: 1px solid var(--line); transform-origin: 50% 0; backface-visibility: hidden; }
.b-vis-table .tr.hd { font-size: calc(var(--body) * min(1, var(--rs) * 1.1)); padding-bottom: 0.5em; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); border-bottom-color: color-mix(in srgb, var(--gold) 60%, transparent); }
.b-vis-table .tr:not(.hd) { background: linear-gradient(90deg, var(--card), transparent); }
.b-vis-table .tr span { min-width: 0; padding-right: 0.6em; }
.b-vis-table .tr span.gc { color: var(--gold2); }
.b-vis-table .tr.hd span.gc { color: var(--gold2); }
.b-vis-table .band { position: absolute; top: 0; bottom: 0; border-radius: 0.4em; background: linear-gradient(180deg, color-mix(in srgb, var(--gold) 18%, transparent), color-mix(in srgb, var(--gold) 4%, transparent)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gold) 30%, transparent); z-index: -1; transform-origin: 50% 0; }
.b-vis-table .scan { position: absolute; left: -2%; right: -2%; height: 2px; top: 0; background: linear-gradient(90deg, transparent, var(--gold2), transparent); box-shadow: 0 0 24px 6px color-mix(in srgb, var(--gold) 45%, transparent); opacity: 0; pointer-events: none; }
.b-vis-table .nt { flex: none; margin: 0; font-size: calc(var(--body) * 0.85); color: var(--dim); }
.cs-frame[data-shape="tall"] .b-vis-table .pro-body { justify-content: flex-start; }
.cs-frame[data-shape="tall"] .b-vis-table .tbs { flex-direction: column; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-vis-table .tr { font-size: calc(var(--body) * var(--rs)); }
.cs-frame[data-shape="tall"] .b-vis-table .tb { width: 100%; flex: none; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc;
  const tabs = (p.tables || []).slice(0, 2).map((tb) => ({title: tb.title || '', head: tb.head || null, rows: (tb.rows || []).slice(0, 8)}));
  const html = tabs.map((tb) => {
    const nc = Math.min(5, Math.max(...[tb.head || [], ...tb.rows].map((r) => r.length)));
    const gi = p.gold == null ? -1 : +p.gold === 0 ? nc - 1 : +p.gold - 1;
    const cell = (c, j) => `<span class="${j === gi ? 'gc' : ''}">${esc(c)}</span>`;
    return `<div class="tb" style="--nc:${nc}" data-g="${gi}">${tb.title ? `<div class="tb-t">${esc(tb.title)}</div>` : ''}${tb.head ? `<div class="tr hd">${tb.head.slice(0, nc).map(cell).join('')}</div>` : ''}${tb.rows.map((r) => `<div class="tr">${r.slice(0, nc).map(cell).join('')}</div>`).join('')}${gi >= 0 ? '<i class="band" aria-hidden="true"></i>' : ''}<i class="scan" aria-hidden="true"></i></div>`;
  }).join('');
  el.innerHTML = `<i class="pro-glow" style="--gx:70%;--gy:30%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2"><div class="tbs">${html}</div>${p.note ? `<p class="nt">${esc(p.note)}</p>` : ''}</div>${P.foot(cx)}</div>`;
  const qa = (s, r = el) => [...r.querySelectorAll(s)];
  // fit: the tables and the note stay inside the body (rows get shorter when there are many)
  { const body = el.querySelector('.pro-body'), tbs = el.querySelector('.tbs'), nt = el.querySelector('.nt');
    const maxRows = Math.max(0, ...tabs.map((tb) => tb.rows.length + (tb.head ? 1 : 0)));
    let rs = maxRows >= 5 ? 0.85 : 1; tbs.style.setProperty('--rs', rs);
    const gap = nt ? parseFloat(getComputedStyle(body).rowGap) || 0 : 0;
    for (let it = 0; it < 3; it++) { const avail = body.clientHeight - (nt ? nt.offsetHeight + gap : 0), need = tbs.scrollHeight; if (!avail || need <= avail * 0.98) break; rs = Math.max(0.5, rs * (avail * 0.97) / need); tbs.style.setProperty('--rs', rs.toFixed(3)); } }
  // the gold column band sits behind the cells of that column
  const k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1;
  qa('.tb').forEach((tb) => {
    const band = tb.querySelector('.band'); if (!band) return;
    const gi = +tb.dataset.g, cells = qa('.tr > span:nth-child(' + (gi + 1) + ')', tb); if (!cells.length) return;
    const tr = tb.getBoundingClientRect(), a = cells[0].getBoundingClientRect(), z = cells[cells.length - 1].getBoundingClientRect();
    band.style.left = ((a.left - tr.left) / k - 14) + 'px'; band.style.width = (Math.max(...cells.map((c) => c.getBoundingClientRect().width)) / k + 10) + 'px';
    band.style.top = ((a.top - tr.top) / k - 10) + 'px'; band.style.height = ((z.bottom - a.top) / k + 20) + 'px';
  });
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  let end = t0;
  qa('.tb').forEach((tb, ti) => {
    const at = t0 + ti * 0.3;
    P.rise(tl, tb.querySelector('.tb-t'), at, {y: 20});
    const rows = qa('.tr', tb);
    rows.forEach((r, i) => tl.fromTo(r, {rotationX: -92, opacity: 0, y: -10}, {rotationX: 0, opacity: 1, y: 0, duration: 0.9, ease: 'expo.out'}, at + 0.1 + i * 0.11));
    const band = tb.querySelector('.band'); if (band) tl.fromTo(band, {scaleY: 0, opacity: 0}, {scaleY: 1, opacity: 1, duration: 1.0, ease: 'expo.inOut'}, at + 0.4);
    end = Math.max(end, at + 0.1 + rows.length * 0.11 + 0.8);
  });
  P.rise(tl, el.querySelector('.nt'), end - 0.3, {y: 10});
  const scans = qa('.scan'), tbs = qa('.tb');
  function draw(t) {
    tbs.forEach((tb, i) => {
      const h = tb.offsetHeight, s = scans[i];
      const first = (t - t0 - 0.1 - i * 0.3) / ((end - t0) * 0.95), PER = 5.5;
      let f = -1, a = 1;
      if (first >= 0 && first <= 1) f = first; else if (t > end + 1) { const u = ((t - end - 1) % PER) / 1.6; if (u <= 1) { f = u; a = 0.6; } }
      if (f < 0) { s.style.opacity = 0; return; }
      s.style.top = f * h + 'px'; s.style.opacity = Math.sin(Math.PI * f) * a;
    });
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: end + 0.2});
}
