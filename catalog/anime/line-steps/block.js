// anime.js v4: a thin line draws through numbered stops, each label rises as the line reaches it.
export const css = `
.b-anime-line-steps .row { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: var(--gap); align-items: start; }
.b-anime-line-steps svg { position: absolute; left: 0; right: 0; top: calc(var(--title) * 0.5); height: 4px; width: 100%; overflow: visible; }
.b-anime-line-steps svg path { stroke: var(--gold); stroke-width: 2; fill: none; vector-effect: non-scaling-stroke; }
.b-anime-line-steps .st { position: relative; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); }
.b-anime-line-steps .n { width: var(--title); height: var(--title); border-radius: 50%; border: 1.5px solid var(--gold); background: var(--bg); display: grid; place-items: center; font-size: calc(var(--title) * 0.4); font-weight: var(--thin); color: var(--gold2); }
.b-anime-line-steps .t { font-size: var(--lead); font-weight: var(--light); color: var(--ink); line-height: 1.15; }
.b-anime-line-steps .d { font-size: var(--body); color: var(--dim); line-height: 1.35; max-width: 16em; }
.cs-frame[data-shape="tall"] .b-anime-line-steps .row { grid-auto-flow: row; grid-auto-columns: auto; gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-anime-line-steps .st { display: grid; grid-template-columns: auto 1fr; column-gap: calc(var(--gap) * 0.9); row-gap: 4px; align-items: center; }
.cs-frame[data-shape="tall"] .b-anime-line-steps .n { grid-row: span 2; width: calc(var(--title) * 1.3); height: calc(var(--title) * 1.3); }
.cs-frame[data-shape="tall"] .b-anime-line-steps svg { left: calc(var(--title) * 0.65); top: 0; width: 4px; height: 100%; right: auto; }
`;
export default function mount(el, p, cx) {
  const A = cx.anime, steps = (p.steps || []).slice(0, 5), tall = cx.shape === 'tall';
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="row">
      <svg preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true"><path d="${tall ? 'M0 0 L0 100' : 'M0 0 L100 0'}"/></svg>
      ${steps.map((s, i) => `<div class="st"><div class="n cs-num">${i + 1}</div><div class="t">${cx.esc(s.title || s)}</div>${s.text ? `<div class="d">${cx.esc(s.text)}</div>` : ''}</div>`).join('')}
    </div>
  </div>`;
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  const head = [...el.querySelectorAll('.cs-kicker, .cs-title')];
  if (head.length) tl.add(head, {opacity: [0, 1], translateY: [20, 0], duration: 700, delay: A.stagger(90)}, 0);
  const line = A.svg.createDrawable(el.querySelector('svg path'));
  const n = steps.length, t0 = 350, each = 520;
  tl.add(line, {draw: ['0 0', '0 1'], duration: each * n, ease: 'inOutSine'}, t0);
  const marks = [];
  el.querySelectorAll('.st').forEach((st, i) => {
    const at = t0 + each * i + 120;
    tl.add(st.querySelector('.n'), {scale: [0.4, 1], opacity: [0, 1], duration: 620, ease: 'outBack'}, at);
    tl.add(st.querySelectorAll('.t, .d'), {opacity: [0, 1], translateY: [16, 0], duration: 600, delay: A.stagger(80)}, at + 120);
    if (i > 0) marks.push(at / 1000);
  });
  return cx.fromAnime(tl, {steps: p.click === false ? [] : marks});
}
