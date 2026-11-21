// GSAP: a row of cards wider than the screen slides sideways. On a web page the vertical scroll moves it; on a slide it glides to the last card and stops.
export const css = `
.b-gsap-horizontal-cards .trk { display: flex; gap: calc(var(--gap) * 0.7); width: max-content; --p: 0;
  transform: translateX(min(0px, calc((100cqw - 100% - var(--pad) * 2) * var(--p)))); }
.b-gsap-horizontal-cards .card { flex: none; width: calc((100cqw - var(--pad) * 2) * 0.31); min-height: calc(var(--title) * 4.1); padding: calc(var(--gap) * 0.95); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4);
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); }
.b-gsap-horizontal-cards .card img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: calc(var(--radius) * 0.6); }
.b-gsap-horizontal-cards .no { font-size: var(--label); letter-spacing: 0.2em; color: var(--gold2); }
.b-gsap-horizontal-cards .t { font-size: calc(var(--lead) * 1.3); color: var(--ink); line-height: 1.1; letter-spacing: -0.015em; margin-top: auto; }
.b-gsap-horizontal-cards .d { font-size: var(--body); color: var(--dim); line-height: 1.34; }
.b-gsap-horizontal-cards .bar { height: 2px; background: var(--line); position: relative; overflow: hidden; }
.b-gsap-horizontal-cards .bar i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.cs-frame[data-shape="tall"] .b-gsap-horizontal-cards .card { width: 70cqw; min-height: calc(var(--title) * 4.6); }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, items = (p.items || []).slice(0, 8), n = items.length;
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <ol class="trk">${items.map((it, i) => `<li class="card">${it.image ? `<img src="${cx.esc(it.image)}" alt="${cx.esc(it.alt || it.title || '')}">` : ''}<span class="no cs-num">${String(i + 1).padStart(2, '0')}</span><span class="t">${cx.esc(it.title || it)}</span>${it.text ? `<span class="d">${cx.esc(it.text)}</span>` : ''}</li>`).join('')}</ol>
    <div class="bar" aria-hidden="true"><i></i></div>
  </div>`;
  const trk = el.querySelector('.trk'), tl = g.timeline({paused: true});
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) tl.fromTo(head, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
  tl.fromTo(el.querySelectorAll('.card'), {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07}, 0.25);
  tl.fromTo(el.querySelector('.bar'), {opacity: 0}, {opacity: 1, duration: 0.4}, 0.5);
  const D = Math.max(1.6, 0.7 * (n - 2));
  tl.fromTo(trk, {'--p': 0}, {'--p': 1, duration: D, ease: 'power2.inOut'}, 1.05);
  tl.fromTo(el.querySelector('.bar i'), {scaleX: 1 / Math.max(1, n)}, {scaleX: 1, duration: D, ease: 'power2.inOut'}, 1.05);
  return cx.fromGsap(tl);
}
