// GSAP Flip: the cards sit in one pile, then fan out into a grid. Flip records the pile, the layout changes, and the move is one seekable timeline.
export const css = `
.b-gsap-flip-grid .grid { position: relative; display: grid; grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); gap: calc(var(--gap) * 0.7); }
.b-gsap-flip-grid .card { padding: calc(var(--gap) * 0.9); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.36); background: var(--bg2); border: 1px solid var(--line); border-radius: var(--radius); min-height: calc(var(--title) * 2.2); }
.b-gsap-flip-grid .no { font-size: var(--label); letter-spacing: 0.2em; color: var(--gold2); line-height: 1.2; }
.b-gsap-flip-grid .t { font-size: var(--lead); color: var(--ink); line-height: 1.12; letter-spacing: -0.01em; }
.b-gsap-flip-grid .d { font-size: var(--body); color: var(--dim); line-height: 1.34; }
.b-gsap-flip-grid .grid.pile .card { position: absolute; left: 50%; top: 50%; width: calc((100% - (var(--cols) - 1) * var(--gap) * 0.7) / var(--cols)); transform: translate(-50%, -50%) rotate(var(--r, 0deg)); }
.cs-frame[data-shape="tall"] .b-gsap-flip-grid .card { padding: calc(var(--gap) * 0.8); min-height: 0; gap: calc(var(--gap) * 0.25); }
`;
export default function mount(el, p, cx) {
  const [Flip] = cx.plugin('Flip');
  const g = cx.gsap, items = (p.items || []).slice(0, 6), n = items.length, tall = cx.shape === 'tall';
  const cols = tall ? (n > 4 ? 2 : 1) : n <= 3 ? n : n === 4 ? 2 : 3;
  const rot = [-7, 5, -3, 8, -5, 3];
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <ol class="grid" style="--cols:${cols}">${items.map((it, i) => `<li class="card" style="--r:${rot[i]}deg"><span class="no cs-num">${String(i + 1).padStart(2, '0')}</span><span class="t">${cx.esc(it.title || it)}</span>${it.text ? `<span class="d">${cx.esc(it.text)}</span>` : ''}</li>`).join('')}</ol>
  </div>`;
  const grid = el.querySelector('.grid'), cards = [...el.querySelectorAll('.card')];
  let tl = null, cur = 0;
  function make() {
    if (tl) tl.kill();
    g.set(cards, {clearProps: 'all'}); g.set(el.querySelectorAll('.t, .d, .cs-kicker, .cs-title'), {clearProps: 'all'});
    cards.forEach((c, i) => c.style.setProperty('--r', rot[i] + 'deg'));
    grid.style.height = grid.offsetHeight + 'px';
    grid.classList.add('pile');
    const state = Flip.getState(cards);
    grid.classList.remove('pile'); grid.style.height = '';
    tl = g.timeline({paused: true});
    const head = el.querySelectorAll('.cs-kicker, .cs-title');
    if (head.length) tl.fromTo(head, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
    tl.fromTo(grid, {opacity: 0, scale: 0.92}, {opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out'}, 0.15);
    tl.add(Flip.from(state, {duration: 1.05, ease: 'expo.inOut', stagger: {each: 0.05, from: 'end'}, absolute: false}), 0.75);
    tl.fromTo(el.querySelectorAll('.t, .d'), {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.035}, 1.45);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); }};
}
