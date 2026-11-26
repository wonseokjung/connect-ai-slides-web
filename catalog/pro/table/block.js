// pro/table: one or two tables, hairline rows draw in one by one, numbers line up, one column can be gold.
export const css = `
.b-pro-table .pro-body { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.8); }
.b-pro-table .tbs { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: calc(var(--gap) * 2); }
.b-pro-table .tb { min-width: 0; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-pro-table .tt { font-size: var(--lead); color: var(--gold2); font-weight: var(--light); letter-spacing: 0.02em; }
.b-pro-table table { width: 100%; border-collapse: collapse; font-size: var(--lead); font-variant-numeric: tabular-nums lining-nums; }
.b-pro-table.dense table { font-size: var(--body); }
.b-pro-table th { text-align: left; font-weight: 400; font-size: var(--body); letter-spacing: 0.04em; color: var(--ivory); padding: 0 0.8em 0.6em 0; }
.b-pro-table td { padding: 0.55em 0.8em 0.55em 0; color: var(--ivory); position: relative; line-height: 1.25; }
.b-pro-table .rl { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--line); transform-origin: 0 50%; }
.b-pro-table thead .rl { background: color-mix(in srgb, var(--ink) 45%, transparent); }
.b-pro-table td.g, .b-pro-table th.g { color: var(--gold2); }
.b-pro-table td.num, .b-pro-table th.num { text-align: right; }
.b-pro-table .nt { font-size: calc(var(--body) * 0.8); color: var(--dim); letter-spacing: 0.04em; }
.cs-frame[data-shape="tall"] .b-pro-table .tbs { grid-template-columns: 1fr; gap: var(--gap); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, tables = (p.tables || (p.rows ? [{title: '', head: p.head, rows: p.rows}] : [])).slice(0, 2);
  el.style.setProperty('--n', tables.length || 1);
  const isNum = (v) => /^[-+]?[$₩€£]?\d[\d,.]*\s*[%원$€k만억]?$/.test(String(v).trim());
  const dense = tables.some((t) => (t.rows || []).length > 6);
  el.classList.toggle('dense', dense);
  const gi = (cols) => (p.gold == null ? -1 : +p.gold === 0 ? cols - 1 : +p.gold - 1);
  el.innerHTML = `<i class="pro-glow" style="--gx:88%;--gy:80%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body"><div class="tbs">${tables.map((t) => {
    const head = (t.head || []).slice(0, 5), rows = (t.rows || []).slice(0, 8).map((r) => [].concat(r).slice(0, 5)), cols = Math.max(head.length, ...rows.map((r) => r.length)), g = gi(cols);
    const numCol = Array.from({length: cols}, (_, c) => rows.length > 0 && rows.every((r) => r[c] == null || isNum(r[c])) && !rows.every((r) => /^[01]$/.test(String(r[c]))));
    return `<div class="tb">${t.title ? `<div class="tt">${cx.esc(t.title)}</div>` : ''}<table>${head.length ? `<thead><tr>${head.map((h, c) => `<th class="${c === g ? 'g' : ''}${numCol[c] ? ' num' : ''}">${P.math(h)}<i class="rl" aria-hidden="true"></i></th>`).join('')}</tr></thead>` : ''}<tbody>${rows.map((r) => `<tr>${Array.from({length: cols}, (_, c) => `<td class="${c === g ? 'g' : ''}${numCol[c] ? ' num' : ''}">${cx.esc(r[c] == null ? '' : r[c])}${c === 0 ? '<i class="rl" aria-hidden="true"></i>' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }).join('')}</div>${p.note ? `<p class="nt">${cx.esc(p.note)}</p>` : ''}</div>${P.foot(cx)}</div>`;
  // one hairline per row spans the whole table: stretch the first cell's line to the row width
  el.querySelectorAll('tbody tr').forEach((tr) => { const l = tr.querySelector('.rl'); if (l) { l.style.right = 'auto'; l.style.width = (tr.offsetWidth || 0) + 'px'; } });
  el.querySelectorAll('thead tr').forEach((tr) => { const ls = tr.querySelectorAll('.rl'); ls.forEach((l, i) => { if (i) l.remove(); else { l.style.right = 'auto'; l.style.width = (tr.offsetWidth || 0) + 'px'; } }); });
  const tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el);
  el.querySelectorAll('.tb').forEach((tb, k) => {
    const at = t + k * 0.25;
    P.rise(tl, tb.querySelector('.tt'), at, {y: 14});
    P.rise(tl, tb.querySelectorAll('th'), at + 0.1, {y: 10, stagger: 0.03});
    tb.querySelectorAll('tbody tr').forEach((tr, i) => {
      const a = at + 0.3 + i * 0.12;
      const l = tr.querySelector('.rl'); if (l) tl.fromTo(l, {scaleX: 0}, {scaleX: 1, duration: 0.7, ease: 'expo.inOut'}, a);
      tl.fromTo(tr.querySelectorAll('td'), {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04}, a + 0.1);
    });
    const hl = tb.querySelector('thead .rl'); if (hl) tl.fromTo(hl, {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.inOut'}, at + 0.15);
  });
  P.rise(tl, el.querySelector('.nt'), t + 1.4, {y: 10});
  return P.clip(cx, tl, el);
}
