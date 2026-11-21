// Motion (motion.dev): a large serif quotation rises line by line from behind a mask, then the name settles under it.
export const css = `
.b-motion-quote .mark { font-family: var(--serif); font-size: calc(var(--hero) * 1.5); line-height: 0.6; height: 0.42em; color: var(--gold); display: block; }
.b-motion-quote .q { margin: 0; font-family: var(--serif); font-style: italic; font-weight: 400; font-size: calc(var(--title) * 1.24); line-height: 1.12; letter-spacing: -0.012em; color: var(--ink); max-width: 15em; }
.b-motion-quote .ln { display: block; overflow: hidden; padding: 0.06em 0.12em 0.14em; margin: -0.06em -0.12em -0.14em; }
.b-motion-quote .in { display: block; will-change: transform; }
.b-motion-quote .by { display: flex; align-items: center; gap: 1em; flex-wrap: wrap; }
.b-motion-quote .by i { width: 3em; height: 1px; background: var(--gold); display: block; transform-origin: 0 50%; }
.b-motion-quote .by .cs-label { color: var(--ink); }
.b-motion-quote .by .role { color: var(--dim); }
.cs-frame[data-shape="tall"] .b-motion-quote .q { font-size: calc(var(--title) * 1.02); }
`;
export default function mount(el, p, cx) {
  const {animate, stagger} = cx.motion;
  el.innerHTML = `<div class="cs-pad">
    <span class="mark" aria-hidden="true">“</span>
    <blockquote class="q">${String(p.text).split(/\s+/).map((w) => `<span class="w">${cx.esc(w)}</span>`).join(' ')}</blockquote>
    ${p.by ? `<div class="by"><i></i><span class="cs-label">${cx.esc(p.by)}</span>${p.role ? `<span class="cs-label role">${cx.esc(p.role)}</span>` : ''}</div>` : ''}
  </div>`;
  // group the words into the lines the browser made, so each line can rise on its own
  const q = el.querySelector('.q'), lines = [];
  let top = null;
  q.querySelectorAll('.w').forEach((w) => { if (top === null || Math.abs(w.offsetTop - top) > 4) { lines.push([]); top = w.offsetTop; } lines[lines.length - 1].push(w.textContent); });
  q.innerHTML = lines.map((l) => `<span class="ln"><span class="in">${cx.esc(l.join(' '))}</span></span>`).join('');
  const list = [], n = lines.length, t0 = 0.35, each = 0.14;
  list.push(animate(el.querySelector('.mark'), {opacity: [0, 1], y: [-20, 0]}, {duration: 0.7, ease: [0.16, 1, 0.3, 1]}));
  list.push(animate(q.querySelectorAll('.in'), {y: ['112%', '0%']}, {duration: 0.95, delay: stagger(each, {startDelay: t0}), ease: [0.16, 1, 0.3, 1]}));
  const t1 = t0 + each * (n - 1) + 0.6;
  if (el.querySelector('.by')) {
    list.push(animate(el.querySelector('.by i'), {scaleX: [0, 1]}, {duration: 0.7, delay: t1, ease: [0.16, 1, 0.3, 1]}));
    list.push(animate(el.querySelectorAll('.by .cs-label'), {opacity: [0, 1], x: [-12, 0]}, {duration: 0.6, delay: stagger(0.12, {startDelay: t1 + 0.15}), ease: 'easeOut'}));
  }
  return cx.fromMotion(list, {dur: t1 + 1.0});
}
