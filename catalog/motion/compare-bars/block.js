// Motion (motion.dev) springs: two to four thick bars grow from one gold axis to their share of the frame width.
// The label sits inside its bar and is uncovered as the bar grows; the large value rides the tip of the bar.
export const css = `
.b-motion-compare-bars .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.5 + var(--top)) calc(var(--pad) * 0.7) calc(var(--pad) * 0.46); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.75); }
.b-motion-compare-bars .hd { flex: none; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-motion-compare-bars .hd .cs-title { font-size: calc(var(--title) * 0.6); }
.b-motion-compare-bars .rows { flex: 1 1 auto; min-height: 0; display: flex; align-items: center; }
.b-motion-compare-bars .grp { position: relative; width: 100%; height: 100%; max-height: calc(var(--n) * var(--rh) + (var(--n) - 1) * var(--gap) * 0.5); --rh: 27cqh; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); padding-left: calc(var(--gap) * 0.36); }
.b-motion-compare-bars .axis { position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--gold); transform-origin: 50% 0; display: block; }
.b-motion-compare-bars .row { flex: 1 1 0; min-height: 0; display: flex; align-items: center; column-gap: calc(var(--gap) * 0.6); }
.b-motion-compare-bars .bar { position: relative; flex: none; height: 100%; width: calc(var(--w, 0px) * var(--p, 1)); overflow: hidden; border-radius: 0 calc(var(--radius) * 0.7) calc(var(--radius) * 0.7) 0; background: color-mix(in srgb, var(--ivory) 20%, var(--bg)); color: var(--ink); }
.b-motion-compare-bars .bar.hi { background: var(--gold2); color: var(--bg); }
.b-motion-compare-bars .bar.c2 { background: var(--c2); color: var(--bg); }
.b-motion-compare-bars .bar.c3 { background: var(--c3); color: var(--bg); }
.b-motion-compare-bars .lb { font-size: calc(var(--lead) * 1.05); line-height: 1.1; letter-spacing: -0.012em; white-space: nowrap; }
.b-motion-compare-bars .bar .lb { position: absolute; left: calc(var(--gap) * 0.75); top: 50%; translate: 0 -50%; font-weight: 400; }
.b-motion-compare-bars .row > .lb { color: var(--ivory); }
.b-motion-compare-bars .val { white-space: nowrap; font-size: calc(var(--title) * 1.16); font-weight: var(--thin); letter-spacing: -0.04em; line-height: 0.9; color: var(--ink); }
.b-motion-compare-bars .val small { font-size: var(--label); font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); margin-left: 0.6em; }
.b-motion-compare-bars .note { flex: none; font-size: calc(var(--label) * 0.95); color: var(--dim); line-height: 1.3; }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .wrap { padding: calc(var(--pad) * 0.9 + var(--top)) var(--pad) calc(var(--pad) * 0.8); gap: calc(var(--gap) * 1.2); }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .hd .cs-title { font-size: calc(var(--title) * 0.86); }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .grp { --rh: 14.5cqh; gap: calc(var(--gap) * 0.8); max-height: calc(var(--n) * var(--rh) + (var(--n) - 1) * var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .val small { display: block; margin: 0.5em 0 0; }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .lb { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .val { font-size: calc(var(--title) * 1.1); }
`;
export default function mount(el, p, cx) {
  const {animate} = cx.motion;
  const items = (p.items || []).slice(0, 4).map((it) => ({label: String(it.label == null ? '' : it.label), value: Math.max(0, Number(it.value) || 0), color: it.color}));
  const max = Math.max(1e-9, ...items.map((i) => i.value)), dec = Math.max(0, p.decimals | 0);
  const hi = p.highlight == null ? items.findIndex((i) => i.value === max) : p.highlight - 1;
  const fmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: p.grouping !== false});
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="rows"><div class="grp" style="--n:${items.length}"><i class="axis" aria-hidden="true"></i>${items.map((it, i) => `<div class="row"><div class="bar${i === hi ? ' hi' : it.color === 2 ? ' c2' : it.color === 3 ? ' c3' : ''}"><span class="lb">${cx.esc(it.label)}</span></div><span class="val cs-num">${fmt(it.value)}${p.unit ? `<small>${cx.esc(p.unit)}</small>` : ''}</span></div>`).join('')}</div></div>
    ${p.note ? `<p class="note">${cx.esc(p.note)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), rowsEl = q('.grp'), rows = [...el.querySelectorAll('.row')], bars = rows.map((r) => r.querySelector('.bar')), lbs = rows.map((r) => r.querySelector('.lb')), vals = rows.map((r) => r.querySelector('.val'));
  // widths in real pixels of the frame; a label that does not fit inside its bar moves to the right of it
  function lay() {
    const cs = getComputedStyle(rowsEl), W = rowsEl.clientWidth - parseFloat(cs.paddingLeft); if (!(W > 0)) return;
    const gap = parseFloat(getComputedStyle(rows[0]).columnGap) || 0, room = Math.max(...vals.map((v) => v.offsetWidth)) + gap;
    items.forEach((it, i) => {
      const lw = lbs[i].offsetWidth, inside = Math.max(4, ((W - room) * it.value) / max), fits = lw + gap * 2.6 <= inside;
      const w = fits ? inside : Math.max(4, ((W - room - lw - gap) * it.value) / max);
      bars[i].style.setProperty('--w', w + 'px');
      if (fits && lbs[i].parentNode !== bars[i]) bars[i].appendChild(lbs[i]);
      if (!fits && lbs[i].parentNode !== rows[i]) rows[i].insertBefore(lbs[i], vals[i]);
    });
  }
  lay();
  const list = [], head = el.querySelectorAll('.hd > *'), E = [0.16, 1, 0.3, 1];
  if (head.length) list.push(animate(head, {opacity: [0, 1], y: [20, 0]}, {duration: 0.65, delay: cx.motion.stagger(0.09), ease: E}));
  list.push(animate(q('.axis'), {scaleY: [0, 1]}, {duration: 0.7, delay: 0.15, ease: [0.65, 0, 0.35, 1]}));
  const t0 = 0.45, each = 0.2;
  items.forEach((it, i) => {
    const at = t0 + each * i;
    list.push(animate(bars[i], {'--p': [0, 1]}, {type: 'spring', bounce: 0.22, visualDuration: 0.85, delay: at}));
    list.push(animate(vals[i], {opacity: [0, 1]}, {duration: 0.35, delay: at + 0.1, ease: 'linear'}));
    list.push(animate(lbs[i], {opacity: [0, 1]}, {duration: 0.4, delay: at + 0.3, ease: 'linear'}));
  });
  if (q('.note')) list.push(animate(q('.note'), {opacity: [0, 1]}, {duration: 0.5, delay: t0 + each * items.length + 0.5}));
  const clip = cx.fromMotion(list, {dur: t0 + each * (items.length - 1) + 1.5});
  clip.fit = lay;
  return clip;
}
