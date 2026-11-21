// Motion (motion.dev): a line draws across, year markers spring up on it one after another, each with one line under it.
export const css = `
.b-motion-timeline-years .tl { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; column-gap: var(--gap); margin-top: calc(var(--gap) * 0.4); }
.b-motion-timeline-years .axis { position: absolute; left: 0; right: 0; top: calc(var(--hero) * 0.92 + var(--gap) * 0.7); height: 1px; background: var(--line); }
.b-motion-timeline-years .axis i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; display: block; }
.b-motion-timeline-years .it { position: relative; display: flex; flex-direction: column; }
.b-motion-timeline-years .y { font-size: calc(var(--hero) * 0.92); font-weight: var(--thin); letter-spacing: -0.045em; line-height: 1; color: var(--ink); transform-origin: 0 100%; }
.b-motion-timeline-years .it:last-child .y { color: var(--gold2); }
.b-motion-timeline-years .dot { width: calc(var(--gap) * 0.36); height: calc(var(--gap) * 0.36); border-radius: 50%; background: var(--gold2); margin-top: calc(var(--gap) * 0.7 - var(--gap) * 0.18 + 0.5px); box-shadow: 0 0 0 calc(var(--gap) * 0.18) var(--bg); }
.b-motion-timeline-years .d { font-size: var(--lead); color: var(--ivory); line-height: 1.22; margin-top: calc(var(--gap) * 0.7); max-width: 11em; }
.cs-frame[data-shape="tall"] .b-motion-timeline-years .tl { grid-auto-flow: row; grid-auto-columns: auto; row-gap: calc(var(--gap) * 1.3); padding-left: calc(var(--gap) * 1.4); }
.cs-frame[data-shape="tall"] .b-motion-timeline-years .axis { left: calc(var(--gap) * 0.18); right: auto; top: 0.4em; bottom: 0.4em; width: 1px; height: auto; }
.cs-frame[data-shape="tall"] .b-motion-timeline-years .axis i { transform-origin: 50% 0; }
.cs-frame[data-shape="tall"] .b-motion-timeline-years .y { font-size: var(--hero); }
.cs-frame[data-shape="tall"] .b-motion-timeline-years .dot { position: absolute; left: calc(var(--gap) * -1.4); top: calc(var(--hero) * 0.5); margin: 0; }
.cs-frame[data-shape="tall"] .b-motion-timeline-years .d { margin-top: calc(var(--gap) * 0.3); max-width: none; }
`;
export default function mount(el, p, cx) {
  const {animate, stagger} = cx.motion, tall = cx.shape === 'tall';
  const items = (p.items || []).slice(0, 5);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="tl"><div class="axis" aria-hidden="true"><i></i></div>
      ${items.map((it) => `<div class="it"><div class="y cs-num">${cx.esc(it.when)}</div><span class="dot" aria-hidden="true"></span><div class="d">${cx.esc(it.text || '')}</div></div>`).join('')}
    </div>
  </div>`;
  const list = [], head = el.querySelectorAll('.cs-kicker, .cs-title'), n = items.length, t0 = 0.4, each = 0.5;
  if (head.length) list.push(animate(head, {opacity: [0, 1], y: [20, 0]}, {duration: 0.6, delay: stagger(0.09), ease: [0.16, 1, 0.3, 1]}));
  list.push(animate(el.querySelector('.axis'), {opacity: [0, 1]}, {duration: 0.4, delay: 0.2}));
  list.push(animate(el.querySelector('.axis i'), tall ? {scaleY: [0, 1]} : {scaleX: [0, 1]}, {duration: each * n + 0.2, delay: t0, ease: 'linear'}));
  const steps = [];
  el.querySelectorAll('.it').forEach((it, i) => {
    const at = t0 + each * i;
    list.push(animate(it.querySelector('.y'), {opacity: [0, 1]}, {duration: 0.25, delay: at}));
    list.push(animate(it.querySelector('.y'), {y: [60, 0], scale: [0.8, 1]}, {type: 'spring', bounce: 0.4, visualDuration: 0.5, delay: at}));
    list.push(animate(it.querySelector('.dot'), {scale: [0, 1]}, {type: 'spring', bounce: 0.5, visualDuration: 0.4, delay: at + 0.1}));
    list.push(animate(it.querySelector('.d'), {opacity: [0, 1], y: [14, 0]}, {duration: 0.55, delay: at + 0.2, ease: 'easeOut'}));
    if (i > 0) steps.push(at - 0.02);
  });
  return cx.fromMotion(list, {dur: t0 + each * (n - 1) + 1.2, steps: p.click === false ? [] : steps});
}
