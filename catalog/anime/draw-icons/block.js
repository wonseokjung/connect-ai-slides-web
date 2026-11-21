// anime.js v4 createDrawable: three or four line icons draw themselves stroke by stroke, a label rises under each.
export const css = `
.b-anime-draw-icons .row { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; }
.b-anime-draw-icons .it { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); padding: calc(var(--gap) * 0.4) var(--gap) calc(var(--gap) * 0.4) var(--gap); border-left: 1px solid var(--line); }
.b-anime-draw-icons .it:first-child { padding-left: 0; border-left: 0; }
.b-anime-draw-icons svg { width: calc(var(--title) * 1.9); height: calc(var(--title) * 1.9); overflow: visible; margin-bottom: calc(var(--gap) * 0.3); }
.b-anime-draw-icons svg * { fill: none; stroke: var(--gold2); stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }
.b-anime-draw-icons svg .s2 { stroke: var(--ivory); }
.b-anime-draw-icons .t { font-size: var(--lead); color: var(--ink); line-height: 1.14; }
.b-anime-draw-icons .d { font-size: var(--body); color: var(--dim); line-height: 1.36; max-width: 15em; }
.cs-frame[data-shape="tall"] .b-anime-draw-icons .row { grid-auto-flow: row; grid-auto-columns: auto; row-gap: calc(var(--gap) * 0.2); }
.cs-frame[data-shape="tall"] .b-anime-draw-icons .it { display: grid; grid-template-columns: auto 1fr; column-gap: calc(var(--gap) * 1.1); row-gap: 4px; align-items: center; padding: calc(var(--gap) * 0.8) 0; border-left: 0; border-top: 1px solid var(--line); }
.cs-frame[data-shape="tall"] .b-anime-draw-icons .it:first-child { border-top: 0; }
.cs-frame[data-shape="tall"] .b-anime-draw-icons svg { grid-row: span 2; width: calc(var(--title) * 1.7); height: calc(var(--title) * 1.7); margin: 0; }
.cs-frame[data-shape="tall"] .b-anime-draw-icons .t { align-self: end; }
.cs-frame[data-shape="tall"] .b-anime-draw-icons .d { align-self: start; }
`;
// our own 24x24 line drawings (CC0)
const ICONS = {
  camera: '<rect x="2.5" y="7" width="13" height="10" rx="2"/><path class="s2" d="M15.5 10.5 L21.5 7.5 V16.5 L15.5 13.5"/><circle class="s2" cx="6.2" cy="10.2" r="0.9"/>',
  slides: '<rect x="2.5" y="4" width="19" height="12" rx="1.5"/><path class="s2" d="M12 16 V20 M8 20.5 H16"/><path class="s2" d="M6.5 12.5 L10 9 L12.5 11 L17 7.5"/>',
  browser: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M2.5 8.5 H21.5"/><path class="s2" d="M5 6.3 H5.1 M7.2 6.3 H7.3 M9.4 6.3 H9.5"/><path class="s2" d="M6 12 H13 M6 15.5 H18"/>',
  cube: '<path d="M12 2.8 L20.5 7.4 V16.6 L12 21.2 L3.5 16.6 V7.4 Z"/><path class="s2" d="M3.5 7.4 L12 12 L20.5 7.4 M12 12 V21.2"/>',
  book: '<path d="M12 6.2 C9.5 4.3 6 4 3 4.8 V18.6 C6 17.8 9.5 18.1 12 20 C14.5 18.1 18 17.8 21 18.6 V4.8 C18 4 14.5 4.3 12 6.2 Z"/><path class="s2" d="M12 6.2 V20"/>',
  mic: '<rect x="9" y="2.8" width="6" height="11" rx="3"/><path class="s2" d="M5.5 11 C5.5 14.8 8.4 17.2 12 17.2 C15.6 17.2 18.5 14.8 18.5 11 M12 17.2 V21 M8.5 21.2 H15.5"/>',
};
export default function mount(el, p, cx) {
  const A = cx.anime;
  const items = (p.items || []).slice(0, 4);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="row">${items.map((it) => `<div class="it"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[it.icon] || ICONS.cube}</svg><div class="t">${cx.esc(it.title || '')}</div>${it.text ? `<div class="d">${cx.esc(it.text)}</div>` : ''}</div>`).join('')}</div>
  </div>`;
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) tl.add(head, {opacity: [0, 1], translateY: [20, 0], duration: 700, delay: A.stagger(90)}, 0);
  const steps = [], t0 = 350, each = 480;
  el.querySelectorAll('.it').forEach((it, i) => {
    const at = t0 + each * i;
    if (i > 0) tl.add(it, {borderColor: [{to: 'rgba(235,226,210,0)', duration: 0}, {to: 'rgba(235,226,210,0.18)', duration: 600}]}, at);
    tl.add(A.svg.createDrawable(it.querySelectorAll('svg *')), {draw: ['0 0', '0 1'], duration: 1100, ease: 'inOutQuad', delay: A.stagger(160)}, at);
    tl.add(it.querySelectorAll('.t, .d'), {opacity: [0, 1], translateY: [16, 0], duration: 650, delay: A.stagger(90)}, at + 380);
    if (i > 0) steps.push(at / 1000 - 0.02);
  });
  return cx.fromAnime(tl, {steps: p.click === true ? steps : []});
}
