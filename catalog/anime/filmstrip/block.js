// anime.js v4 timeline: a film strip of stills runs from right to left through the middle of the frame. The still at the gate grows a little,
// the others step back, and the frame number and caption under the film change with it. One click per still on a slide; on a web page your scroll pushes the film.
// Nothing is drawn on the pictures: the sprocket holes run above and below them.
export const css = `
.b-anime-filmstrip { --bh: 58cqh; --perf: calc(var(--bh) * 0.07); --fh: calc(var(--bh) - var(--perf) * 2 - var(--bh) * 0.07); --ar: 1.7778; --fg: calc(var(--gap) * 0.7); --cw: calc(var(--fh) * var(--ar) + var(--fg)); }
.b-anime-filmstrip .head { position: absolute; left: var(--pad); right: var(--pad); top: var(--top); height: calc(50% - var(--bh) * 0.5 - var(--top) + 1.5cqh); display: flex; align-items: center; justify-content: space-between; gap: var(--gap); }
.b-anime-filmstrip .head .cs-lead { color: var(--ink); font-weight: var(--thin); font-size: calc(var(--lead) * 1.06); text-align: right; }
.b-anime-filmstrip .gate { position: absolute; left: 0; right: 0; top: calc(50% - var(--bh) * 0.5 + 1.5cqh); height: var(--bh); overflow: hidden; background: var(--bg2); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.b-anime-filmstrip .strip { position: absolute; left: calc(50% - var(--cw) * 1.5); top: 0; height: 100%; display: flex; will-change: transform; }
.b-anime-filmstrip .strip::before, .b-anime-filmstrip .strip::after { content: ""; position: absolute; left: -120cqw; right: -120cqw; height: calc(var(--perf) * 0.42); border-radius: 2px;
  background: linear-gradient(90deg, var(--faint) 56%, transparent 56%) 0 0 / calc(var(--cw) * 0.125) 100% repeat-x; }
.b-anime-filmstrip .strip::before { top: calc(var(--perf) * 0.36); }
.b-anime-filmstrip .strip::after { bottom: calc(var(--perf) * 0.36); }
.b-anime-filmstrip .cell { flex: 0 0 var(--cw); display: grid; place-items: center; }
.b-anime-filmstrip .fr { display: block; width: calc(var(--cw) - var(--fg)); height: var(--fh); overflow: hidden; border-radius: calc(var(--radius) * 0.35); background: #000; will-change: transform, opacity; }
.b-anime-filmstrip .cell.end .fr { background: transparent; border: 1px solid var(--line); transform: scale(0.86); }
.b-anime-filmstrip .fr img { width: 100%; height: 100%; object-fit: cover; }
.b-anime-filmstrip .mark { position: absolute; left: 50%; width: 2px; margin-left: -1px; height: calc(var(--perf) * 0.9); background: var(--gold2); }
.b-anime-filmstrip .mark.t { top: 0; transform-origin: 50% 0; }
.b-anime-filmstrip .mark.b { bottom: 0; transform-origin: 50% 100%; }
.b-anime-filmstrip .foot { position: absolute; left: var(--pad); right: var(--pad); top: calc(50% + var(--bh) * 0.5 + 1.5cqh); bottom: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; column-gap: calc(var(--gap) * 1.4); }
.b-anime-filmstrip .no { display: flex; align-items: baseline; gap: 0.5em; }
.b-anime-filmstrip .digits { display: block; height: 1em; overflow: hidden; font-size: calc(var(--title) * 0.94); font-weight: var(--thin); letter-spacing: -0.04em; line-height: 1; color: var(--ink); }
.b-anime-filmstrip .digits > span { display: flex; flex-direction: column; will-change: transform; }
.b-anime-filmstrip .digits b { display: block; height: 1em; font-weight: inherit; }
.b-anime-filmstrip .no small { font-size: var(--label); letter-spacing: 0.16em; color: var(--dim); }
.b-anime-filmstrip .caps { display: grid; min-width: 0; padding-left: calc(var(--gap) * 1.4); border-left: 1px solid var(--gold); }
.b-anime-filmstrip .cp { grid-area: 1 / 1; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.2); }
.b-anime-filmstrip .cp .cs-lead { color: var(--ink); font-size: calc(var(--lead) * 1.1); font-weight: var(--thin); }
.cs-frame[data-stage="site"][data-shape="wide"] .b-anime-filmstrip { --bh: 54cqh; }
.cs-frame[data-shape="tall"] .b-anime-filmstrip { --bh: 46cqh; --ar: 0.8; --fg: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-anime-filmstrip .head { flex-direction: column; align-items: flex-start; justify-content: center; gap: calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-anime-filmstrip .head .cs-lead { text-align: left; }
.cs-frame[data-shape="tall"] .b-anime-filmstrip .foot { column-gap: var(--gap); align-items: start; padding-top: calc(var(--gap) * 1.3); }
.cs-frame[data-shape="tall"] .b-anime-filmstrip .caps { padding-left: var(--gap); }
.cs-frame[data-shape="tall"] .b-anime-filmstrip .digits { font-size: calc(var(--title) * 1.1); }
`;
export default function mount(el, p, cx) {
  const A = cx.anime, items = (p.items || []).slice(0, 8), n = items.length, pad2 = (k) => String(k).padStart(2, '0');
  el.innerHTML = `
    ${p.kicker || p.title ? `<div class="head">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : '<span></span>'}${p.title ? `<h2 class="cs-lead">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="gate">
      <div class="strip"><div class="cell end" aria-hidden="true"><i class="fr"></i></div>${items.map((it, i) => `<div class="cell"><figure class="fr"><img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || it.caption || it.label || 'Still ' + (i + 1))}"></figure></div>`).join('')}<div class="cell end" aria-hidden="true"><i class="fr"></i></div></div>
      <i class="mark t" aria-hidden="true"></i><i class="mark b" aria-hidden="true"></i>
    </div>
    <div class="foot">
      <div class="no cs-num" aria-hidden="true"><span class="digits"><span>${items.map((_, i) => `<b>${pad2(i + 1)}</b>`).join('')}</span></span><small>/ ${pad2(n)}</small></div>
      <div class="caps">${items.map((it) => `<div class="cp">${it.label ? `<div class="cs-kicker">${cx.esc(it.label)}</div>` : ''}${it.caption ? `<p class="cs-lead">${cx.esc(it.caption)}</p>` : ''}</div>`).join('')}</div>
    </div>`;
  const q = (s) => el.querySelector(s), all = (s) => [...el.querySelectorAll(s)];
  const strip = q('.strip'), frs = all('figure.fr'), caps = all('.cp'), roll = q('.digits > span');
  // anime.js is the clock: one timeline moves a few plain numbers (the film's entrance, and one number per move from still to still).
  // Everything on screen is read from those numbers, so the film looks the same wherever the timeline is put, forward or back.
  const S = {on: 0}, first = 1.5, each = 1.15, at = (k) => (first + each * (k - 1)) * 1000, steps = [];
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  tl.add(S, {on: [0, 1], duration: 1300, ease: 'outExpo'}, 0);
  tl.add(all('.mark'), {scaleY: [0, 1], duration: 600}, 500);
  if (q('.head')) tl.add(all('.head > *'), {opacity: [0, 1], translateY: [16, 0], duration: 700, delay: A.stagger(100)}, 100);
  tl.add(q('.no'), {opacity: [0, 1], duration: 600}, 600);
  tl.add(q('.caps'), {opacity: [0, 1], translateX: [24, 0], duration: 700}, 650);
  for (let k = 1; k < n; k++) { S['m' + k] = 0; steps.push(at(k) / 1000); tl.add(S, {['m' + k]: [0, 1], duration: 950, ease: 'inOutCubic'}, at(k)); }
  const base = cx.fromAnime(tl, {steps}), near = (d) => { const x = cx.clamp(1 - Math.abs(d), 0, 1); return x * x * (3 - 2 * x); };
  const draw = () => {
    let pos = 0; for (let k = 1; k < n; k++) pos += S['m' + k];
    strip.style.opacity = cx.clamp(S.on * 2.5, 0, 1);
    strip.style.transform = 'translate3d(' + (((1 - S.on) * 1.6 - pos) / (n + 2) * 100).toFixed(4) + '%,0,0)';
    frs.forEach((f, i) => { const k = near(i - pos) * (i === 0 ? cx.clamp(S.on * 1.4 - 0.4, 0, 1) : 1); f.style.transform = 'scale(' + (0.86 + 0.14 * k).toFixed(4) + ')'; f.style.opacity = (0.46 + 0.54 * k).toFixed(3); });
    roll.style.transform = 'translate3d(0,' + (-(pos / n) * 100).toFixed(4) + '%,0)';
    caps.forEach((c, i) => { const d = i - pos, o = cx.clamp(1 - Math.abs(d) * 2.4, 0, 1); c.style.opacity = o.toFixed(3); c.style.transform = 'translate3d(' + (d * 46).toFixed(1) + 'px,0,0)'; c.style.visibility = o > 0.01 ? '' : 'hidden'; });
  };
  draw();
  return Object.assign({}, base, {seek: (t) => { base.seek(t); draw(); }});
}
