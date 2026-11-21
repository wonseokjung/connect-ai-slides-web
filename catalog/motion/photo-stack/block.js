// Motion (motion.dev) springs: photo cards fly in one by one and settle into a fanned stack; the last one lands on top, the largest.
// The stack takes most of the frame, the title and one line stand beside it. Put a photo of a person last (on top) so no card covers it.
export const css = `
.b-motion-photo-stack .stage { position: absolute; top: var(--top); bottom: 0; right: 0; width: 68%; }
.b-motion-photo-stack .card { position: absolute; left: 63.5%; top: 53%; width: 70%; aspect-ratio: 16 / 10; margin: 0; translate: -50% -50%; border-radius: calc(var(--radius) * 0.5); overflow: hidden; background: #000;
  box-shadow: 0 0 0 1px var(--line), 0 calc(var(--gap) * 0.6) calc(var(--gap) * 1.6) rgba(0, 0, 0, 0.55); will-change: transform, opacity; }
.b-motion-photo-stack .card > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-motion-photo-stack .copy { position: absolute; top: var(--top); bottom: 0; left: 0; width: 34%; padding: var(--pad) 0 var(--pad) calc(var(--pad) * 0.62); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.7); }
.b-motion-photo-stack .cs-kicker { letter-spacing: 0.3em; }
.b-motion-photo-stack .cs-title { font-size: calc(var(--title) * 0.74); }
.b-motion-photo-stack .rule { display: block; width: calc(var(--title) * 1.1); height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-motion-photo-stack .cs-text { font-size: calc(var(--body) * 0.9); max-width: 16em; }
.b-motion-photo-stack .count { font-size: var(--label); letter-spacing: 0.22em; color: var(--dim); }
.cs-frame[data-stage="deck"] .b-motion-photo-stack .cs-kicker { font-size: calc(var(--label) * 0.86); }
.cs-frame[data-stage="site"] .b-motion-photo-stack .cs-text { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-motion-photo-stack .stage { left: 0; right: 0; width: auto; bottom: auto; height: 54%; }
.cs-frame[data-shape="tall"] .b-motion-photo-stack .card { left: 58%; top: 56%; width: 76%; aspect-ratio: 4 / 3; }
.cs-frame[data-shape="tall"] .b-motion-photo-stack .copy { top: calc(54% + var(--top)); width: auto; right: 0; padding: calc(var(--pad) * 0.6) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-motion-photo-stack .cs-title { font-size: var(--title); }
`;
export default function mount(el, p, cx) {
  const {animate, stagger} = cx.motion;
  const items = (p.items || []).map((it) => (typeof it === 'string' ? {src: it} : it)).slice(0, 5), n = items.length;
  const pos = (it) => (Array.isArray(it.face) ? `${Math.round((it.face[0] + it.face[2] / 2) * 100)}% ${Math.round(cx.clamp((it.face[1] + it.face[3] / 2) * 100 - 6, 0, 100))}%` : '50% 50%');
  const top = n - 1, topFace = n > 0 && Array.isArray(items[top].face);
  el.innerHTML = `
    <div class="stage">${items.map((it, i) => `<figure class="card"${topFace && i !== top ? ' data-face-ok' : ''}><img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || 'Picture')}" style="object-position:${pos(it)}"></figure>`).join('')}</div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      <i class="rule" aria-hidden="true"></i>
      ${p.text ? `<p class="cs-text">${cx.esc(p.text)}</p>` : ''}
      <div class="count cs-num" aria-hidden="true">${String(n).padStart(2, '0')} / ${String(n).padStart(2, '0')}</div>
    </div>`;
  const cards = Array.from(el.querySelectorAll('.card'));
  // a card under the top one may be partly covered: that is the stack. A face is only declared (and guarded) on a card nothing covers... the top one
  items.forEach((it, i) => { if (Array.isArray(it.face)) cx.face(cards[i].firstElementChild, it.face); });
  // the resting pose of each card, counted from the top (j = 0): a fan that opens up and to the left
  const k = cx.shape === 'tall' ? 0.62 : 1;
  const pose = (j) => (j === 0 ? {x: 0, y: 6, r: 2.5, s: 1} : {x: (-17.5 * j + 1.3 * j * j) * k, y: 6 - 13 * j + 1.2 * j * j, r: 2.5 - 8 * j + 0.4 * j * j, s: 1 - 0.06 * j});
  const list = [], head = el.querySelectorAll('.cs-kicker, .cs-title, .cs-text');
  if (head.length) list.push(animate(head, {opacity: [0, 1], y: [22, 0]}, {duration: 0.6, delay: stagger(0.1, {startDelay: 0.1}), ease: [0.16, 1, 0.3, 1]}));
  list.push(animate(el.querySelector('.rule'), {scaleX: [0, 1]}, {duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1]}));
  const t0 = 0.25, each = 0.3;
  cards.forEach((c, i) => {
    const q = pose(top - i), d = t0 + each * i;
    list.push(animate(c, {opacity: [0, 1]}, {duration: 0.22, delay: d, ease: 'easeOut'}));
    list.push(animate(c, {x: ['95%', q.x + '%'], y: ['60%', q.y + '%'], rotate: [q.r + 26, q.r], scale: [q.s * 0.78, q.s]}, {type: 'spring', bounce: 0.3, visualDuration: 0.7, delay: d}));
  });
  list.push(animate(el.querySelector('.count'), {opacity: [0, 1]}, {duration: 0.5, delay: t0 + each * top + 0.5, ease: 'easeOut'}));
  return cx.fromMotion(list, {dur: t0 + each * top + 1.35});
}
