// GSAP CustomEase: horizontal bars grow to their values with a small overshoot, the number at the end of each bar counts with it.
export const css = `
.b-gsap-bars .rows { display: grid; grid-template-columns: max-content 1fr; column-gap: calc(var(--gap) * 0.9); row-gap: calc(var(--gap) * 0.85); align-items: center; }
.b-gsap-bars .lb { font-size: var(--lead); color: var(--ivory); line-height: 1.15; }
.b-gsap-bars .track { display: flex; align-items: center; gap: 0.5em; padding-right: 6.4em; font-size: var(--lead); min-width: 0; }
.b-gsap-bars .bar { flex: none; display: block; height: 0.78em; width: 0%; border-radius: 0.1em; background: color-mix(in srgb, var(--ivory) 30%, transparent); }
.b-gsap-bars .bar.hi { background: var(--gold); }
.b-gsap-bars .bar.c2 { background: var(--c2); }
.b-gsap-bars .bar.c3 { background: var(--c3); }
.b-gsap-bars .val { white-space: nowrap; color: var(--ink); font-weight: var(--thin); line-height: 1; }
.b-gsap-bars .val small { font-size: var(--label); letter-spacing: 0.12em; text-transform: uppercase; color: var(--dim); margin-left: 0.5em; }
.cs-frame[data-shape="tall"] .b-gsap-bars .rows { grid-template-columns: 1fr; row-gap: calc(var(--gap) * 0.3); }
.cs-frame[data-shape="tall"] .b-gsap-bars .track { margin-bottom: calc(var(--gap) * 0.6); padding-right: 7.2em; }
`;
export default function mount(el, p, cx) {
  const [CustomEase] = cx.plugin('CustomEase');
  const g = cx.gsap, items = (p.items || []).slice(0, 6).map((it) => ({label: String(it.label), value: Number(it.value) || 0, color: it.color}));
  const max = Math.max(1e-9, ...items.map((i) => i.value)), dec = Math.max(0, p.decimals | 0);
  const hi = p.highlight == null ? items.findIndex((i) => i.value === max) : p.highlight - 1;
  const fmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="rows">${items.map((it, i) => `<div class="lb">${cx.esc(it.label)}</div><div class="track"><i class="bar${i === hi ? ' hi' : it.color === 2 ? ' c2' : it.color === 3 ? ' c3' : ''}"></i><span class="val cs-num"><span class="n">0</span>${p.unit ? `<small>${cx.esc(p.unit)}</small>` : ''}</span></div>`).join('')}</div>
    ${p.note ? `<p class="cs-text">${cx.esc(p.note)}</p>` : ''}
  </div>`;
  const ease = CustomEase.create('csBarOut', 'M0,0 C0.14,0 0.2,1.07 0.52,1.05 0.72,1.04 0.82,1 1,1');
  const vals = items.map(() => ({v: 0})), ns = [...el.querySelectorAll('.val .n')];
  const tl = g.timeline({paused: true, onUpdate: () => ns.forEach((n, i) => { n.textContent = fmt(vals[i].v); })});
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) tl.fromTo(head, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
  const t0 = head.length ? 0.5 : 0.1;
  const lbs = el.querySelectorAll('.lb'), bars = el.querySelectorAll('.bar'), valEls = el.querySelectorAll('.val');
  items.forEach((it, i) => {
    const at = t0 + 0.16 * i;
    tl.fromTo(lbs[i], {opacity: 0, x: -18}, {opacity: 1, x: 0, duration: 0.5, ease: 'power3.out'}, at);
    tl.fromTo(bars[i], {width: '0%'}, {width: (it.value / max) * 100 + '%', duration: 1.15, ease}, at + 0.1);
    tl.fromTo(valEls[i], {opacity: 0}, {opacity: 1, duration: 0.3, ease: 'power1.out'}, at + 0.15);
    tl.to(vals[i], {v: it.value, duration: 1.0, ease: 'power3.out'}, at + 0.1);
  });
  if (el.querySelector('.cs-text')) tl.fromTo(el.querySelector('.cs-text'), {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, t0 + 0.16 * items.length + 0.9);
  return cx.fromGsap(tl);
}
