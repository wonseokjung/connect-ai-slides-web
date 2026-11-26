// pro/bars: columns grow from a hairline baseline, values count above them, one column is gold.
export const css = `
.b-pro-bars .pro-body { display: grid; grid-template-rows: minmax(0, 1fr) auto auto; gap: calc(var(--gap) * 0.4); }
.b-pro-bars .plot { position: relative; display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: calc(var(--gap) * var(--g, 1)); align-items: end; min-height: 0; border-bottom: 1px solid var(--line); padding: 0 calc(var(--gap) * 0.5); }
.b-pro-bars .grid { position: absolute; left: 0; right: 0; height: 1px; background: var(--faint); }
.b-pro-bars .col { position: relative; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; min-width: 0; }
.b-pro-bars .val { font-size: var(--lead); font-weight: var(--thin); color: var(--ivory); margin-bottom: 0.35em; white-space: nowrap; }
.b-pro-bars .val small { font-size: 0.5em; color: var(--dim); margin-left: 0.2em; letter-spacing: 0.06em; }
.b-pro-bars .bar { width: min(100%, 4.2em); font-size: var(--lead); border-radius: 0.12em 0.12em 0 0; background: color-mix(in srgb, var(--ink) 16%, transparent); transform-origin: 50% 100%; }
.b-pro-bars .col.hi .bar { background: linear-gradient(180deg, var(--gold2), var(--gold)); }
.b-pro-bars .col.hi .val { color: var(--gold2); }
.b-pro-bars .labels { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: calc(var(--gap) * var(--g, 1)); padding: 0 calc(var(--gap) * 0.5); }
.b-pro-bars .lb { text-align: center; font-size: var(--body); color: var(--dim); line-height: 1.25; }
.b-pro-bars .lb.hi { color: var(--ink); }
.b-pro-bars .nt { font-size: calc(var(--body) * 0.8); color: var(--dim); letter-spacing: 0.04em; margin-top: calc(var(--gap) * 0.3); }
.cs-frame[data-shape="tall"] .b-pro-bars .val { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-pro-bars .lb { font-size: calc(var(--body) * 0.8); }
.cs-frame[data-shape="tall"] .b-pro-bars .val small { font-size: 0.74em; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, items = (p.items || []).slice(0, 8).map((it) => ({label: String(it.label), value: Number(String(it.value).replace(/,/g, '')) || 0}));
  const max = Math.max(1e-9, ...items.map((i) => i.value)), dec = Math.max(0, p.decimals | 0);
  const hi = p.highlight == null ? items.findIndex((i) => i.value === max) : p.highlight - 1;
  el.style.setProperty('--n', items.length || 1); el.style.setProperty('--g', items.length > 5 ? 0.5 : 1);
  const comma = items.some((i) => i.value >= 10000);
  el.innerHTML = `<i class="pro-glow" style="--gx:80%;--gy:20%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">
    <div class="plot">${[0.25, 0.5, 0.75].map((g) => `<i class="grid" style="bottom:${g * 82}%" aria-hidden="true"></i>`).join('')}${items.map((it, i) => `<div class="col${i === hi ? ' hi' : ''}"><div class="val cs-num"><span class="n">${P.fmt(it.value, dec, comma)}</span>${p.unit && (i === hi || items.length <= 4) ? `<small>${cx.esc(p.unit)}</small>` : ''}</div><i class="bar" style="height:${Math.max(1.5, (it.value / max) * 82)}%" aria-hidden="true"></i></div>`).join('')}</div>
    <div class="labels">${items.map((it, i) => `<div class="lb${i === hi ? ' hi' : ''}">${cx.esc(it.label)}</div>`).join('')}</div>
    ${p.note ? `<p class="nt">${cx.esc(p.note)}</p>` : ''}
  </div>${P.foot(cx)}</div>`;
  const tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el);
  tl.fromTo(el.querySelectorAll('.grid'), {scaleX: 0}, {scaleX: 1, duration: 1.0, ease: 'expo.inOut', stagger: 0.06, transformOrigin: '0% 50%'}, t - 0.1);
  P.rise(tl, el.querySelectorAll('.lb'), t, {y: 12, stagger: 0.06});
  const ns = el.querySelectorAll('.val .n');
  el.querySelectorAll('.col').forEach((c, i) => {
    const at = t + 0.15 + i * 0.1;
    tl.fromTo(c.querySelector('.bar'), {scaleY: 0}, {scaleY: 1, duration: 1.2, ease: 'expo.out'}, at);
    tl.fromTo(c.querySelector('.val'), {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.6, ease: 'expo.out'}, at + 0.2);
    const o = {v: 0}; tl.to(o, {v: items[i].value, duration: 1.2, ease: 'expo.out', onUpdate: () => { ns[i].textContent = P.fmt(o.v, dec, comma); }}, at);
  });
  P.rise(tl, el.querySelector('.nt'), t + 1.2, {y: 10});
  return P.clip(cx, tl, el);
}
