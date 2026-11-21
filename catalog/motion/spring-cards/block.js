// Motion (motion.dev) springs: three or four cards jump up from below, lean a little and settle upright.
export const css = `
.b-motion-spring-cards .cards { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: var(--gap); align-items: stretch; }
.b-motion-spring-cards .card { padding: calc(var(--gap) * 1.1); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); min-height: 34cqh; transform-origin: 50% 100%; will-change: transform, opacity; }
.b-motion-spring-cards .n { font-size: calc(var(--title) * 1.15); font-weight: var(--thin); line-height: 0.9; color: var(--gold2); letter-spacing: -0.04em; }
.b-motion-spring-cards .bar { display: block; width: 2.4em; height: 2px; background: var(--gold); margin-top: auto; }
.b-motion-spring-cards .t { font-size: var(--lead); color: var(--ink); line-height: 1.12; letter-spacing: -0.01em; }
.b-motion-spring-cards .d { font-size: var(--body); color: var(--dim); line-height: 1.36; }
.cs-frame[data-shape="tall"] .b-motion-spring-cards .cards { grid-auto-flow: row; grid-auto-columns: auto; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-motion-spring-cards .card { min-height: 0; display: grid; grid-template-columns: auto 1fr; column-gap: var(--gap); row-gap: 4px; align-items: center; padding: var(--gap); }
.cs-frame[data-shape="tall"] .b-motion-spring-cards .n { grid-row: span 2; font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-motion-spring-cards .bar { display: none; }
`;
export default function mount(el, p, cx) {
  const {animate, stagger} = cx.motion;
  const items = (p.items || []).slice(0, 4);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="cards">${items.map((it, i) => `<div class="card cs-card"><div class="n cs-num">${String(i + 1).padStart(2, '0')}</div><i class="bar"></i><div class="t">${cx.esc(it.title || it)}</div>${it.text ? `<div class="d">${cx.esc(it.text)}</div>` : ''}</div>`).join('')}</div>
  </div>`;
  const list = [], head = el.querySelectorAll('.cs-kicker, .cs-title'), lean = [-7, 5, -4, 6];
  if (head.length) list.push(animate(head, {opacity: [0, 1], y: [22, 0]}, {duration: 0.6, delay: stagger(0.09), ease: [0.16, 1, 0.3, 1]}));
  const t0 = 0.35, each = 0.16;
  el.querySelectorAll('.card').forEach((c, i) => {
    list.push(animate(c, {opacity: [0, 1]}, {duration: 0.3, delay: t0 + each * i, ease: 'easeOut'}));
    list.push(animate(c, {y: [cx.shape === 'tall' ? 70 : 170, 0], rotate: [lean[i], 0], scale: [0.9, 1]}, {type: 'spring', bounce: 0.38, visualDuration: 0.62, delay: t0 + each * i}));
  });
  return cx.fromMotion(list, {dur: t0 + each * (items.length - 1) + 1.35});
}
