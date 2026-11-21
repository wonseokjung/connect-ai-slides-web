/* anime/donut-chart */
(function(){
// anime.js v4 svg.createDrawable: the slices of a thick ring are drawn one after another from 12 o'clock (stroke-dasharray),
// the total in the middle counts with the sweep, and the legend lines come in as their slices start.
const css = `
.b-anime-donut-chart .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.5 + var(--top)) var(--pad) calc(var(--pad) * 0.5) calc(var(--pad) * 0.8); display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; grid-template-areas: "ring hd" "ring lg"; align-content: center; align-items: center; column-gap: calc(var(--gap) * 1.9); row-gap: calc(var(--gap) * 0.9); }
.b-anime-donut-chart .hd { grid-area: hd; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); align-self: end; }
.b-anime-donut-chart .hd .cs-title { font-size: calc(var(--title) * 0.62); }
.b-anime-donut-chart .ring { grid-area: ring; position: relative; width: min(74cqh, 42cqw); aspect-ratio: 1; }
.b-anime-donut-chart .ring svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-anime-donut-chart .ring path, .b-anime-donut-chart .ring circle { fill: none; }
.b-anime-donut-chart .track { stroke: color-mix(in srgb, var(--ivory) 8%, transparent); }
.b-anime-donut-chart .rim { stroke: var(--line); stroke-width: 0.5; }
.b-anime-donut-chart .mid { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.1em; text-align: center; }
.b-anime-donut-chart .tot { font-size: calc(var(--hero) * 1.32); font-weight: var(--thin); letter-spacing: -0.05em; line-height: 0.82; color: var(--ink); }
.b-anime-donut-chart .unit { font-size: calc(var(--lead) * 0.9); font-weight: var(--light); color: var(--gold2); line-height: 1.1; }
.b-anime-donut-chart .lg { grid-area: lg; align-self: start; display: flex; flex-direction: column; }
.b-anime-donut-chart .li { display: grid; grid-template-columns: auto 1fr auto; align-items: center; column-gap: calc(var(--gap) * 0.55); padding: calc(var(--gap) * 0.36) 0; border-top: 1px solid var(--line); }
.b-anime-donut-chart .li:last-child { border-bottom: 1px solid var(--line); }
.b-anime-donut-chart .sw { display: block; width: calc(var(--lead) * 0.5); height: calc(var(--lead) * 0.5); border-radius: 22%; background: var(--k); }
.b-anime-donut-chart .nm { font-size: calc(var(--lead) * 0.86); color: var(--ink); line-height: 1.15; letter-spacing: -0.01em; }
.b-anime-donut-chart .vl { font-size: calc(var(--lead) * 1.05); font-weight: var(--thin); color: var(--ink); line-height: 1; }
.b-anime-donut-chart .k1 { --k: var(--gold); } .b-anime-donut-chart .k2 { --k: var(--gold2); } .b-anime-donut-chart .k3 { --k: var(--c2); }
.b-anime-donut-chart .k4 { --k: var(--c3); } .b-anime-donut-chart .k5 { --k: color-mix(in srgb, var(--ivory) 88%, var(--bg)); } .b-anime-donut-chart .k6 { --k: color-mix(in srgb, var(--gold) 48%, var(--bg)); }
.b-anime-donut-chart .ring path.sl { stroke: var(--k); }
.cs-frame[data-shape="tall"] .b-anime-donut-chart .wrap { padding: calc(var(--pad) * 0.9 + var(--top)) var(--pad) calc(var(--pad) * 0.8); grid-template-columns: 1fr; grid-template-rows: auto auto auto; grid-template-areas: "hd" "ring" "lg"; justify-items: stretch; row-gap: calc(var(--gap) * 1.3); }
.cs-frame[data-shape="tall"] .b-anime-donut-chart .hd .cs-title { font-size: calc(var(--title) * 0.86); }
.cs-frame[data-shape="tall"] .b-anime-donut-chart .ring { width: min(76cqw, 38cqh); justify-self: center; }
.cs-frame[data-shape="tall"] .b-anime-donut-chart .tot { font-size: calc(var(--hero) * 1.7); }
.cs-frame[data-shape="tall"] .b-anime-donut-chart .unit { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-anime-donut-chart .li { padding: calc(var(--gap) * 0.42) 0; }
.cs-frame[data-shape="tall"] .b-anime-donut-chart .nm { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-anime-donut-chart .vl { font-size: calc(var(--body) * 1.2); }
`;
const __mount = function mount(el, p, cx) {
  const A = cx.anime;
  const parts = (p.parts || []).slice(0, 6).map((q) => ({label: String(q.label == null ? '' : q.label), value: Math.max(0, Number(q.value) || 0), color: q.color}));
  const sum = parts.reduce((s, q) => s + q.value, 0) || 1, dec = Math.max(0, p.decimals | 0);
  const fmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  const total = p.total == null ? sum : Number(p.total);
  // slices as arcs on a 200 x 200 field, clockwise from 12 o'clock, with a small gap between them
  const R = 87, SW = 26, GAP = parts.length > 1 ? 1.5 : 0, pt = (deg) => { const a = ((deg - 90) * Math.PI) / 180; return (100 + R * Math.cos(a)).toFixed(3) + ' ' + (100 + R * Math.sin(a)).toFixed(3); };
  let acc = 0;
  const arcs = parts.map((q, i) => {
    const a0 = (acc / sum) * 360 + GAP / 2, a1 = ((acc + q.value) / sum) * 360 - GAP / 2, from = acc / sum; acc += q.value;
    const k = q.color >= 1 && q.color <= 6 ? q.color | 0 : (i % 6) + 1;
    const d = a1 - a0 >= 359.9 ? `M${pt(0)} A${R} ${R} 0 1 1 ${pt(180)} A${R} ${R} 0 1 1 ${pt(359.99)}` : `M${pt(a0)} A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(Math.max(a0 + 0.01, a1))}`;
    return {d, k, from, share: q.value / sum};
  });
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="ring">
      <svg viewBox="0 0 200 200" aria-hidden="true"><circle class="rim" cx="100" cy="100" r="${R + SW / 2 + 3.2}"/><circle class="track" cx="100" cy="100" r="${R}" stroke-width="${SW}"/>${arcs.map((a) => `<path class="sl k${a.k}" d="${a.d}" stroke-width="${SW}"/>`).join('')}</svg>
      <div class="mid"><span class="tot cs-num">${fmt(0)}</span>${p.unit ? `<span class="unit">${cx.esc(p.unit)}</span>` : ''}</div>
    </div>
    <ul class="lg">${parts.map((q, i) => `<li class="li k${arcs[i].k}"><i class="sw" aria-hidden="true"></i><span class="nm">${cx.esc(q.label)}</span><span class="vl cs-num">${fmt(q.value)}</span></li>`).join('')}</ul>
  </div>`;
  const q = (s) => el.querySelector(s), tot = q('.tot'), lis = el.querySelectorAll('.li'), sls = [...el.querySelectorAll('.sl')];
  const T0 = 500, SWEEP = 1700;
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  const head = el.querySelectorAll('.hd > *');
  if (head.length) tl.add(head, {opacity: [0, 1], translateY: [22, 0], duration: 700, delay: A.stagger(100)}, 0);
  tl.add(el.querySelectorAll('.track, .rim'), {opacity: [0, 1], duration: 600, ease: 'outQuad'}, 100);
  tl.add(q('.mid'), {opacity: [0, 1], scale: [0.86, 1], duration: 700}, 250);
  sls.forEach((s, i) => {
    const at = T0 + SWEEP * arcs[i].from, d = Math.max(60, SWEEP * arcs[i].share);
    tl.add(A.svg.createDrawable(s), {draw: ['0 0', '0 1'], duration: d, ease: 'linear'}, at);
    tl.add(lis[i], {opacity: [0, 1], translateX: [26, 0], duration: 600}, Math.max(200, at - 60));
  });
  tl.add(q('.rim'), {scale: [0.94, 1], duration: 900}, T0 + SWEEP - 300);
  // anime.js sets a "from" value only when its animation first runs: one pass to the end and back makes t = 0 the empty screen
  tl.seek(tl.duration); tl.seek(0);
  const clip = cx.fromAnime(tl);
  // the number in the middle shows how much of the ring is drawn; it ends on the total
  const count = cx.fromFn(clip.dur, (t) => { const pr = cx.clamp((t * 1000 - T0) / SWEEP, 0, 1), k = Math.pow(10, dec); tot.textContent = fmt(pr >= 1 ? total : Math.floor(sum * pr * k + 1e-6) / k); });
  return cx.all(clip, count);
}

CS.register("anime/donut-chart", __mount, typeof css === "string" ? css : "", {"kind":"anime/donut-chart","title":"Donut chart","use":"chart","family":"donut-sweep","lead":"picture","site":null,"dur":2.8,"source":{"type":"anime","package":"animejs","version":"4.5.0"},"license":"MIT","data":{}});
})();

/* anime/draw-icons */
(function(){
// anime.js v4 createDrawable: three or four line icons draw themselves stroke by stroke, a label rises under each.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("anime/draw-icons", __mount, typeof css === "string" ? css : "", {"kind":"anime/draw-icons","title":"Draw icons","use":"list","family":"icon-draw","lead":"type","site":null,"dur":2.9,"source":{"type":"anime","package":"animejs","version":"4.5.0"},"license":"MIT","data":{}});
})();

/* anime/filmstrip */
(function(){
// anime.js v4 timeline: a film strip of stills runs from right to left through the middle of the frame. The still at the gate grows a little,
// the others step back, and the frame number and caption under the film change with it. One click per still on a slide; on a web page your scroll pushes the film.
// Nothing is drawn on the pictures: the sprocket holes run above and below them.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("anime/filmstrip", __mount, typeof css === "string" ? css : "", {"kind":"anime/filmstrip","title":"Film strip","use":"timeline","family":"film-strip","lead":"picture","site":{"mode":"scrub","len":3},"dur":7.05,"source":{"type":"anime","package":"animejs","version":"4.5.0"},"license":"MIT","data":{}});
})();

/* anime/grid-reveal */
(function(){
// anime.js v4 stagger on a grid: tiles cover the picture and fold away from the centre outwards, then the caption comes in.
const css = `
.b-anime-grid-reveal .pic { position: absolute; left: 0; right: 0; top: 0; height: 72%; overflow: hidden; background: #000; }
.b-anime-grid-reveal .pic > img, .b-anime-grid-reveal .pic > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-anime-grid-reveal .tiles { position: absolute; inset: -1px; display: grid; grid-template-columns: repeat(var(--cols), 1fr); grid-template-rows: repeat(var(--rows), 1fr); }
.b-anime-grid-reveal .tiles i { display: block; background: var(--bg); outline: 1px solid var(--bg); will-change: transform, opacity; }
.b-anime-grid-reveal .cap { position: absolute; left: var(--pad); right: var(--pad); top: 72%; bottom: 0; display: grid; grid-template-columns: 1.15fr 1fr; align-items: center; column-gap: calc(var(--gap) * 2); }
.b-anime-grid-reveal .l { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-anime-grid-reveal .cs-title { font-size: calc(var(--title) * 0.8); }
.b-anime-grid-reveal .r { display: flex; align-items: center; gap: var(--gap); }
.b-anime-grid-reveal .r i { flex: none; width: 1px; align-self: stretch; background: var(--gold); transform-origin: 50% 0; display: block; }
.cs-frame[data-shape="tall"] .b-anime-grid-reveal .pic { top: var(--top); height: 50%; }
.cs-frame[data-shape="tall"] .b-anime-grid-reveal .cap { top: calc(50% + var(--top)); grid-template-columns: 1fr; align-content: start; row-gap: var(--gap); padding-top: calc(var(--gap) * 1.4); }
.cs-frame[data-shape="tall"] .b-anime-grid-reveal .cs-title { font-size: var(--title); }
`;
const __mount = function mount(el, p, cx) {
  const A = cx.anime, tall = cx.shape === 'tall';
  const cols = tall ? 6 : 12, rows = tall ? 6 : 5;
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const fx = p.face ? Math.round((p.face[0] + p.face[2] / 2) * 100) : 50, fy = p.face ? Math.round(cx.clamp((p.face[1] + p.face[3] / 2) * 100 - 10, 0, 100)) : 40;
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}" style="object-position:${fx}% ${fy}%"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}" style="object-position:${fx}% ${fy}%">`;
  el.innerHTML = `
    <div class="pic">${media}<div class="tiles" aria-hidden="true" style="--cols:${cols};--rows:${rows}">${'<i></i>'.repeat(cols * rows)}</div></div>
    <div class="cap">
      <div class="l">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>
      ${p.caption ? `<div class="r"><i></i><p class="cs-lead">${cx.esc(p.caption)}</p></div>` : ''}
    </div>`;
  const m = el.querySelector('.pic > img, .pic > video');
  if (p.face) cx.face(m, p.face);
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  // every tile is gone at the end (opacity 0, scale 0): nothing stays on the picture
  tl.add(el.querySelectorAll('.tiles i'), {scale: [1, 0], opacity: [{to: 1, duration: 0}, {to: 0, duration: 280, delay: 340}], duration: 620, ease: 'inOutQuad', delay: A.stagger(110, {grid: [cols, rows], from: 'center'})}, 150);
  const end = tl.duration;
  const head = el.querySelectorAll('.l > *');
  if (head.length) tl.add(head, {opacity: [0, 1], translateY: [22, 0], duration: 700, delay: A.stagger(100)}, end - 650);
  if (el.querySelector('.r')) { tl.add(el.querySelector('.r i'), {scaleY: [0, 1], duration: 700}, end - 450); tl.add(el.querySelector('.r p'), {opacity: [0, 1], translateX: [20, 0], duration: 700}, end - 350); }
  const clip = cx.fromAnime(tl);
  return isVideo ? cx.all(clip, cx.fromVideo(m)) : clip;
}

CS.register("anime/grid-reveal", __mount, typeof css === "string" ? css : "", {"kind":"anime/grid-reveal","title":"Grid reveal","use":"media","family":"tile-reveal","lead":"picture","site":null,"dur":1.8,"source":{"type":"anime","package":"animejs","version":"4.5.0"},"license":"MIT","data":{}});
})();

/* anime/letter-wave */
(function(){
// anime.js v4: the letters of one large line rise like a wave from the centre outwards while the tracking closes in.
const css = `
.b-anime-letter-wave .word { font-size: calc(var(--hero) * 1.12 * var(--fit, 1)); font-weight: var(--thin); line-height: 1.02; color: var(--ink); letter-spacing: -0.03em; max-width: 100%; }
.b-anime-letter-wave .wd { display: inline-block; white-space: nowrap; margin: 0 0.05em; }
.b-anime-letter-wave .ch { display: inline-block; will-change: transform, opacity; }
.b-anime-letter-wave .cs-rule { width: calc(var(--hero) * 1.6); transform-origin: 50% 50%; }
.b-anime-letter-wave .cs-lead { max-width: 24em; }
.cs-frame[data-shape="tall"] .b-anime-letter-wave .word { font-size: calc(var(--hero) * var(--fit, 1)); }
.cs-frame[data-shape="tall"] .b-anime-letter-wave .cs-rule { width: calc(var(--hero) * 1.2); }
`;
const __mount = function mount(el, p, cx) {
  const A = cx.anime;
  const html = String(p.word).split(/\s+/).map((w) => `<span class="wd">${Array.from(w).map((c) => `<span class="ch">${cx.esc(c)}</span>`).join('')}</span>`).join(' ');
  el.innerHTML = `<div class="cs-pad cs-center">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <h2 class="word" aria-label="${cx.esc(p.word)}">${html}</h2>
    <i class="cs-rule"></i>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), chars = el.querySelectorAll('.ch');
  // keep the line on one row when a slightly smaller size is enough (down to 62 %); a longer line wraps between words
  const word = q('.word'), room = word.parentElement.clientWidth - 2 * parseFloat(getComputedStyle(word.parentElement).paddingLeft);
  word.style.whiteSpace = 'nowrap';
  const need = word.scrollWidth;
  if (need > room) { const k = room / need; if (k >= 0.62) word.style.setProperty('--fit', (k * 0.985).toFixed(3)); else word.style.whiteSpace = ''; }
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  if (q('.cs-kicker')) tl.add(q('.cs-kicker'), {opacity: [0, 1], translateY: [14, 0], duration: 600}, 0);
  tl.add(chars, {translateY: ['0.9em', '0em'], rotate: [14, 0], opacity: [0, 1], duration: 1000, ease: 'outBack(1.6)', delay: A.stagger(42, {from: 'center'})}, 150);
  tl.add(q('.word'), {letterSpacing: ['0.16em', '-0.03em'], duration: 1500, ease: 'outQuart'}, 150);
  const end = 150 + 42 * (chars.length / 2) + 600;
  tl.add(q('.cs-rule'), {scaleX: [0, 1], duration: 900}, end - 250);
  if (q('.cs-lead')) tl.add(q('.cs-lead'), {opacity: [0, 1], translateY: [18, 0], duration: 700}, end);
  return cx.fromAnime(tl);
}

CS.register("anime/letter-wave", __mount, typeof css === "string" ? css : "", {"kind":"anime/letter-wave","title":"Letter wave","use":"title","family":"letter-wave","lead":"type","site":null,"dur":1.7,"source":{"type":"anime","package":"animejs","version":"4.5.0"},"license":"MIT","data":{}});
})();

/* anime/line-steps */
(function(){
// anime.js v4: a thin line draws through numbered stops, each label rises as the line reaches it.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("anime/line-steps", __mount, typeof css === "string" ? css : "", {"kind":"anime/line-steps","title":"Line steps","use":"steps","family":"line-steps","lead":"type","site":null,"dur":2.6,"source":{"type":"anime","package":"animejs","version":"4.5.0"},"license":"MIT","data":{}});
})();

/* anime/orbit */
(function(){
// anime.js v4: labels travel along two thin rings around a word in the middle, slow down and stop where they can be read.
const css = `
.b-anime-orbit { --rx1: 26cqw; --ry1: 25cqh; --rx2: 36cqw; --ry2: 36cqh; }
.b-anime-orbit .kick { position: absolute; left: var(--pad); top: calc(var(--pad) * 0.62 + var(--top)); }
.b-anime-orbit .space { position: absolute; left: 0; right: 0; top: var(--top); bottom: 0; }
.b-anime-orbit .ring { position: absolute; left: 50%; top: 50%; translate: -50% -50%; border: 1px solid var(--line); border-radius: 50%; }
.b-anime-orbit .ring.a { width: calc(var(--rx1) * 2); height: calc(var(--ry1) * 2); }
.b-anime-orbit .ring.b { width: calc(var(--rx2) * 2); height: calc(var(--ry2) * 2); border-style: dashed; border-color: var(--faint); }
.b-anime-orbit .core { position: absolute; left: 50%; top: 50%; translate: -50% -50%; max-width: calc(var(--rx1) * 1.5); text-align: center; font-size: calc(var(--title) * 0.86); font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1.02; color: var(--ink); text-wrap: balance; }
.b-anime-orbit .lab { position: absolute; --a: 0; --rx: var(--rx1); --ry: var(--ry1); left: calc(50% + cos(calc(var(--a) * 1deg)) * var(--rx)); top: calc(50% + sin(calc(var(--a) * 1deg)) * var(--ry)); translate: -50% -50%;
  display: flex; align-items: center; gap: 0.5em; padding: 0.42em 1em 0.46em 0.8em; border-radius: 999px; background: var(--bg2); border: 1px solid var(--line); font-size: var(--lead); line-height: 1.1; color: var(--ivory); white-space: nowrap; }
.b-anime-orbit .lab.o { --rx: var(--rx2); --ry: var(--ry2); }
.b-anime-orbit .lab i { width: 0.34em; height: 0.34em; border-radius: 50%; background: var(--gold2); display: block; flex: none; }
.cs-frame[data-shape="tall"] .b-anime-orbit { --rx1: 27cqw; --ry1: 21cqh; --rx2: 27cqw; --ry2: 33cqh; }
.cs-frame[data-shape="tall"] .b-anime-orbit .ring.b { width: calc(var(--rx1) * 2.5); }
.cs-frame[data-shape="tall"] .b-anime-orbit .core { font-size: var(--title); max-width: 46cqw; }
.cs-frame[data-shape="tall"] .b-anime-orbit .lab { font-size: var(--body); padding: 0.4em 0.85em 0.44em 0.7em; }
`;
const __mount = function mount(el, p, cx) {
  const A = cx.anime, tall = cx.shape === 'tall';
  const labels = (p.labels || []).slice(0, 6), n = labels.length;
  // final angles: spread around the ellipse; on a wide frame nothing sits straight above or below the word
  const start = tall ? -90 : -90 + 180 / n;
  const ang = labels.map((_, i) => start + (360 / n) * i);
  const outer = (i) => (tall ? Math.abs(Math.sin((ang[i] * Math.PI) / 180)) > 0.9 : n > 4 && Math.abs(Math.cos((ang[i] * Math.PI) / 180)) > 0.7);
  el.innerHTML = `
    ${p.kicker ? `<div class="kick cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="space">
      <span class="ring a" aria-hidden="true"></span><span class="ring b" aria-hidden="true"></span>
      <div class="core">${cx.esc(p.center || '')}</div>
      ${labels.map((t, i) => `<div class="lab${outer(i) ? ' o' : ''}" style="--a:${ang[i]}"><i></i>${cx.esc(t)}</div>`).join('')}
    </div>`;
  const tl = A.createTimeline({autoplay: false, defaults: {ease: 'outExpo'}});
  if (el.querySelector('.kick')) tl.add(el.querySelector('.kick'), {opacity: [0, 1], duration: 600}, 0);
  tl.add(el.querySelector('.core'), {opacity: [0, 1], scale: [0.86, 1], duration: 900}, 100);
  tl.add(el.querySelectorAll('.ring'), {opacity: [0, 1], scale: [0.7, 1], duration: 1100, delay: A.stagger(140)}, 200);
  el.querySelectorAll('.lab').forEach((lab, i) => {
    tl.add(lab, {'--a': [ang[i] - 150, ang[i]], duration: 1700, ease: 'outQuart'}, 400 + i * 110);
    tl.add(lab, {opacity: [0, 1], duration: 500, ease: 'outQuad'}, 400 + i * 110);
  });
  return cx.fromAnime(tl);
}

CS.register("anime/orbit", __mount, typeof css === "string" ? css : "", {"kind":"anime/orbit","title":"Orbit","use":"diagram","family":"orbit-labels","lead":"picture","site":null,"dur":2.6,"source":{"type":"anime","package":"animejs","version":"4.5.0"},"license":"MIT","data":{}});
})();

/* clip/result-reel */
(function(){
// A reel of result clips: one plays large (about 70 % of the slide), the others wait as stills in small frames beside it.
// Every step the large clip and the next one trade places. One click per clip on a slide; on a web page the scroll moves through the reel and winds the film.
// Nothing is drawn on the pictures: the labels stand under them.
const css = `
.b-clip-result-reel .wrap { position: absolute; inset: calc(var(--pad) * 0.42 + var(--top)) calc(var(--pad) * 0.5) calc(var(--pad) * 0.42); margin: 0 auto; max-width: calc(((100cqh - var(--top) - var(--pad) * 0.84 - var(--title) * 1.62) * 1.7778 + var(--gap) * 0.8) / (1 - var(--sidef, 0.235)));
  display: grid; grid-template-columns: minmax(0, 1fr) calc(var(--sidef, 0.235) * 100%); grid-template-rows: auto auto; column-gap: calc(var(--gap) * 0.8); row-gap: calc(var(--gap) * 0.56); align-content: center; }
.b-clip-result-reel .slot { display: block; width: 100%; aspect-ratio: 16 / 9; }
.b-clip-result-reel .side { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); min-width: 0; }
.b-clip-result-reel .cell { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.26); min-width: 0; }
.b-clip-result-reel .mini { display: grid; }
.b-clip-result-reel .mini span { grid-area: 1 / 1; font-size: var(--label); letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.b-clip-result-reel .caps { display: grid; align-content: start; min-width: 0; }
.b-clip-result-reel .cp { grid-area: 1 / 1; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.24); }
.b-clip-result-reel .cp .cs-title { font-size: calc(var(--title) * 0.62); }
.b-clip-result-reel .count { display: flex; flex-direction: column; justify-content: flex-start; gap: calc(var(--gap) * 0.4); min-width: 0; }
.b-clip-result-reel .count .n { display: flex; align-items: baseline; gap: 0.3em; font-size: calc(var(--title) * 0.62); font-weight: var(--thin); letter-spacing: -0.02em; line-height: 1.04; color: var(--ink); margin-top: calc(var(--label) * 1.3 + var(--gap) * 0.24); }
.b-clip-result-reel .count .n small { font-size: var(--label); letter-spacing: 0.14em; color: var(--dim); }
.b-clip-result-reel .segs { display: flex; gap: 0.5em; }
.b-clip-result-reel .segs b { flex: 1; height: 2px; background: var(--line); position: relative; overflow: hidden; }
.b-clip-result-reel .segs b i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.b-clip-result-reel .tile { position: absolute; left: 0; top: 0; overflow: hidden; background: #000; border-radius: calc(var(--radius) * 0.5); border: 1px solid var(--line); will-change: transform, width, height; }
.b-clip-result-reel .tile > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.cs-frame[data-shape="tall"] .b-clip-result-reel .wrap { inset: calc(var(--pad) * 0.7 + var(--top)) calc(var(--pad) * 0.7) calc(var(--pad) * 0.8); max-width: none; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto auto auto; row-gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-clip-result-reel .side { flex-direction: row; grid-row: 3; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-clip-result-reel .cell { flex: 1 1 0; }
.cs-frame[data-shape="tall"] .b-clip-result-reel .caps { grid-row: 2; }
.cs-frame[data-shape="tall"] .b-clip-result-reel .count { grid-row: 4; flex-direction: row; align-items: center; gap: var(--gap); }
.cs-frame[data-shape="tall"] .b-clip-result-reel .count .n { margin-top: 0; font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-clip-result-reel .segs { flex: 1; }
.cs-frame[data-shape="tall"] .b-clip-result-reel .cp .cs-title { font-size: calc(var(--title) * 0.86); }
`;
const __mount = function mount(el, p, cx) {
  const items = (p.items || []).slice(0, 4), n = items.length, G = window.CS || {};
  const seg = cx.clamp(Number(p.seconds) || 2, 1.2, 4), T = (k) => 0.2 + k * seg, dur = T(n), pad2 = (k) => String(k).padStart(2, '0');
  const isV = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  el.innerHTML = `<div class="wrap">
    <i class="slot big" aria-hidden="true"></i>
    <div class="side">${items.slice(1).map((_, j) => `<div class="cell"><i class="slot sm" aria-hidden="true"></i><div class="mini">${[j + 1, j].map((c) => `<span data-c="${c}">${cx.esc(items[c].label || items[c].title || '')}</span>`).join('')}</div></div>`).join('')}</div>
    <div class="caps">${items.map((it) => `<div class="cp">${it.label ? `<div class="cs-kicker">${cx.esc(it.label)}</div>` : ''}${it.title ? `<h3 class="cs-title">${cx.esc(it.title)}</h3>` : ''}</div>`).join('')}</div>
    <div class="count" aria-hidden="true"><div class="n cs-num"><span class="now">01</span><small>/ ${pad2(n)}</small></div><div class="segs">${items.map(() => '<b><i></i></b>').join('')}</div></div>
    ${items.map((it, i) => `<div class="tile">${isV(it.src)
      ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted playsinline preload="auto" aria-label="${cx.esc(it.alt || it.title || it.label || 'Result clip ' + (i + 1))}"></video>`
      : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || it.title || it.label || 'Result ' + (i + 1))}">`}</div>`).join('')}
  </div>`;
  const all = (s) => [...el.querySelectorAll(s)], wrap = el.querySelector('.wrap');
  if (n > 3) wrap.style.setProperty('--sidef', 0.157);      // three small frames must fit beside the large one
  const tiles = all('.tile'), big = el.querySelector('.slot.big'), sms = all('.slot.sm'), caps = all('.cp'), minis = all('.mini'), fills = all('.segs i'), now = el.querySelector('.now');
  const vids = tiles.map((t) => t.querySelector('video'));
  const want = [];      // the video time every clip should show
  vids.forEach((v, i) => { if (!v) return; v.muted = true; v.loop = true; v.addEventListener('loadedmetadata', () => { if (v.paused && want[i] > 0.04 && Math.abs(v.currentTime - want[i]) > 0.04) v.currentTime = want[i]; }); });
  // where the frames are (layout px inside .wrap); measured again when the frame changes size
  let R = null;
  const rect = (s) => { let x = 0, y = 0, e = s; while (e && e !== wrap) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return [x, y, s.offsetWidth, s.offsetHeight]; };
  const measure = () => { R = {big: rect(big), sm: sms.map(rect)}; };
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const mode = () => (cx.stage === 'deck' && !G.reduced ? 'live' : 'wind');
  const film = cx.fromFn(dur, (t, exact) => {
    if (!R || !R.big[2]) measure();
    const eIn = (k) => (k <= 0 ? 1 : k >= n ? 0 : cx.prog(t, T(k) + 0.16, 0.84, 'inOut')), eOut = (k) => (k <= 0 ? 1 : k >= n ? 0 : cx.prog(t, T(k), 0.8, 'inOut'));     // how far swap k has gone: the large clip leaves first, the next one follows
    let cur = 0; for (let k = 1; k < n; k++) if (t >= T(k) + 0.45) cur = k;
    tiles.forEach((tile, i) => {
      const start = i === 0 ? R.big : R.sm[i - 1], back = i < n - 1 ? R.sm[i] : R.big, a = eIn(i), b = eOut(i + 1);
      const r = mix(mix(start, R.big, a), back, b), inn = cx.prog(t, 0.05 + i * 0.12, 0.8, 'out');
      tile.style.width = r[2].toFixed(2) + 'px'; tile.style.height = r[3].toFixed(2) + 'px';
      tile.style.transform = 'translate3d(' + r[0].toFixed(2) + 'px,' + (r[1] + (1 - inn) * 40).toFixed(2) + 'px,0)';
      tile.style.opacity = inn; tile.style.zIndex = (a > 0 && a < 1) || (i === cur && b === 0) ? 3 : b > 0 && b < 1 ? 2 : 1;
    });
    caps.forEach((c, i) => { const a = (i === 0 ? cx.prog(t, 0.35, 0.6, 'out') : cx.prog(t, T(i) + 0.4, 0.5, 'out')), b = i < n - 1 ? cx.prog(t, T(i + 1), 0.3, 'lin') : 0; c.style.opacity = a * (1 - b); c.style.transform = 'translateY(' + ((1 - a) * 18 - b * 10).toFixed(1) + 'px)'; c.style.visibility = a * (1 - b) > 0.01 ? '' : 'hidden'; });
    minis.forEach((m, j) => { const sw = cx.prog(t, T(j + 1), 0.3, 'lin'), inn = cx.prog(t, 0.5 + j * 0.12, 0.6, 'out'), bk = cx.prog(t, T(j + 1) + 0.55, 0.4, 'out'); m.children[0].style.opacity = inn * (1 - sw); m.children[1].style.opacity = bk; });
    fills.forEach((f, i) => { f.style.transform = 'scaleX(' + (i === 0 ? cx.prog(t, 0.3, 0.7, 'out') : cx.prog(t, T(i) + 0.3, 0.7, 'out')) + ')'; });
    now.textContent = pad2(cur + 1);
    // film: the large clip runs, the others hold a still
    const md = exact ? 'exact' : mode(), waits = [];
    vids.forEach((v, i) => {
      if (!v) return;
      const at = Number(items[i].at) || 0, a0 = i === 0 ? 0.2 : T(i) + 0.3, a1 = i < n - 1 ? T(i + 1) + 0.3 : dur, active = t >= a0 && (t < a1 || i === n - 1);
      let tt = at + cx.clamp(t - a0, 0, a1 - a0); const d = v.duration || 0; if (d && tt >= d - 0.02) tt = tt % d;
      want[i] = tt;
      if (md === 'live') {
        if (active) { if (v.paused) { if (t - a0 < 0.3 && Math.abs(v.currentTime - tt) > 0.3) v.currentTime = tt; const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } }
        else { if (!v.paused) v.pause(); if (t < a0 && Math.abs(v.currentTime - at) > 0.04) v.currentTime = at; }
        return;
      }
      if (!v.paused) v.pause();
      if (v.error || v.readyState < 1) return;
      if (md === 'exact') {
        if (Math.abs(v.currentTime - tt) < 0.001 && v.readyState >= 2) return;
        waits.push(new Promise((res) => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); v.removeEventListener('error', fin); res(); }; v.addEventListener('seeked', fin); v.addEventListener('error', fin); v.currentTime = tt; }));
      } else if (Math.abs(v.currentTime - tt) > 0.04 && !v.seeking) v.currentTime = tt;      // the scroll winds the film
    });
    if (waits.length) return Promise.all(waits);
  }, {steps: Array.from({length: Math.max(0, n - 1)}, (_, k) => T(k + 1))});
  const pending = vids.filter((v) => v && v.readyState < 2);
  const ready = pending.length ? Promise.all(pending.map((v) => new Promise((res) => { const ok = () => { v.removeEventListener('loadeddata', ok); v.removeEventListener('error', ok); res(); }; v.addEventListener('loadeddata', ok); v.addEventListener('error', ok); }))) : null;
  return Object.assign(film, {lib: 'fn', ready, fit: () => { measure(); },
    visible: (on) => { if (!on) vids.forEach((v) => { if (v && !v.paused) v.pause(); }); },
    dispose: () => vids.forEach((v) => v && v.pause())});
}

CS.register("clip/result-reel", __mount, typeof css === "string" ? css : "", {"kind":"clip/result-reel","title":"Result reel","use":"media","family":"clip-reel","lead":"picture","site":{"mode":"scrub","len":2.5},"dur":6.2,"source":{"type":"clip","package":"none (HTML video element)"},"license":"MIT","data":{}});
})();

/* clip/scrub-video */
(function(){
// A video clip you move with the scroll: on a web page the scroll winds it forward and back, on a slide it simply plays.
// A time code and a thin progress line follow the picture. Give the face box and the words stay beside the person.
const css = `
.b-clip-scrub-video .media { position: absolute; top: 0; bottom: 0; right: 0; width: 68%; overflow: hidden; background: #000; }
.b-clip-scrub-video.flip .media { right: auto; left: 0; }
.b-clip-scrub-video .media video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-clip-scrub-video .copy { position: absolute; top: var(--top); bottom: 0; left: 0; width: 32%; padding: var(--pad) calc(var(--gap) * 1.2) var(--pad) var(--pad); display: flex; flex-direction: column; justify-content: center; gap: var(--gap); }
.b-clip-scrub-video.flip .copy { left: auto; right: 0; padding: var(--pad) var(--pad) var(--pad) calc(var(--gap) * 1.2); }
.b-clip-scrub-video .cs-title { font-size: calc(var(--title) * 0.82); }
.b-clip-scrub-video .meter { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); margin-top: calc(var(--gap) * 0.4); }
.b-clip-scrub-video .tc { display: flex; align-items: baseline; gap: 0.5em; font-size: var(--lead); font-weight: var(--thin); color: var(--ink); line-height: 1; }
.b-clip-scrub-video .tc small { font-size: var(--label); letter-spacing: 0.14em; color: var(--dim); }
.b-clip-scrub-video .rail { position: relative; height: 2px; background: var(--line); }
.b-clip-scrub-video .rail i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.cs-frame[data-shape="tall"] .b-clip-scrub-video .media { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 54%; }
.cs-frame[data-shape="tall"] .b-clip-scrub-video .copy { top: calc(54% + var(--top)); left: 0; right: 0; width: auto; padding: calc(var(--pad) * 0.9) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-clip-scrub-video .cs-title { font-size: var(--title); }
`;
const __mount = function mount(el, p, cx) {
  const face = p.face || null;
  if (p.side === 'right') el.classList.add('flip');
  let dur = Number(p.seconds) > 0 ? Number(p.seconds) : 6, known = Number(p.seconds) > 0;
  el.innerHTML = `
    <div class="media"><video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video clip')}"></video></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      ${p.text ? `<p class="cs-text">${cx.esc(p.text)}</p>` : ''}
      <div class="meter" aria-hidden="true"><div class="tc cs-num"><span class="now">0.0</span><small>/ <span class="len">${dur.toFixed(1)}</span> s</small></div><div class="rail"><i></i></div></div>
    </div>`;
  const q = (s) => el.querySelector(s), v = q('video'), box = q('.media'), now = q('.now'), len = q('.len'), bar = q('.rail i');
  v.muted = true; v.loop = false;
  const place = () => {
    const mw = v.videoWidth || 16, mh = v.videoHeight || 9, bw = box.offsetWidth, bh = box.offsetHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    v.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place();
  v.addEventListener('loadedmetadata', () => { place(); if (!known && v.duration) len.textContent = Math.min(dur, v.duration).toFixed(1); });
  if (face) cx.face(v, face);
  cx.wa(el.querySelectorAll('.cs-kicker, .cs-title, .cs-text, .meter'), [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.1, stagger: 0.1});
  const text = cx.fromWaapi(q('.copy'));
  const live = cx.stage === 'deck';
  const film = cx.fromFn(dur, (t, exact) => {
    const end = v.duration ? Math.min(dur, v.duration - 0.04) : dur, tt = cx.clamp(t, 0, end);
    now.textContent = tt.toFixed(1); bar.style.transform = 'scaleX(' + (end > 0 ? tt / end : 0) + ')';
    if (exact) {
      if (Math.abs(v.currentTime - tt) < 0.001 && v.readyState >= 2) return;
      if (v.error) return;
      return new Promise((res) => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); v.removeEventListener('error', fin); res(); }; v.addEventListener('seeked', fin); v.addEventListener('error', fin); v.currentTime = tt; });
    }
    if (live) {
      // on a slide the clock runs forward: let the video play and only correct it when it drifts
      if (tt >= end - 0.02 || tt <= 0) { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - tt) > 0.04) v.currentTime = tt; return; }
      if (Math.abs(v.currentTime - tt) > 0.3) v.currentTime = tt;
      if (v.paused) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
      return;
    }
    if (!v.paused) v.pause();
    if (Math.abs(v.currentTime - tt) > 0.04 && !v.seeking) v.currentTime = tt;      // the scroll winds the film
  });
  const clip = cx.all(text, film);
  // recording waits for the first frame of the file before it asks for exact frames
  const ready = v.readyState >= 2 ? null : new Promise((res) => { const ok = () => { v.removeEventListener('loadeddata', ok); v.removeEventListener('error', ok); res(); }; v.addEventListener('loadeddata', ok); v.addEventListener('error', ok); });
  return Object.assign(clip, {ready, fit: place, visible: (on) => { if (!on && !v.paused) v.pause(); }, dispose: () => v.pause()});
}

CS.register("clip/scrub-video", __mount, typeof css === "string" ? css : "", {"kind":"clip/scrub-video","title":"Scrub video","use":"media","family":"scrub-film","lead":"picture","site":{"mode":"scrub","len":2},"dur":6,"source":{"type":"clip","package":"none (HTML video element)"},"license":"MIT","data":{}});
})();

/* css/big-number */
(function(){
// Plain CSS @keyframes, no library: one very large thin number rises from behind a mask until it stands on a gold hairline,
// an outline copy of the same number slips out behind it, and the unit and one line come in beside it.
const css = `
.b-css-big-number .wrap { position: absolute; inset: 0; padding: var(--top) var(--pad) 0 calc(var(--pad) * 0.8); display: grid; grid-template-columns: auto 1fr; align-items: end; align-content: center; column-gap: calc(var(--gap) * 1.5); }
.b-css-big-number .fig { position: relative; margin-bottom: -0.018em; font-size: min(84cqh, calc(118cqw / var(--n))); line-height: 0.8; font-weight: var(--thin); letter-spacing: -0.05em; white-space: nowrap; }
.b-css-big-number .box { clip-path: inset(-0.1em -0.1em 0.018em -0.1em); padding: 0 0.06em 0 0.01em; }
.b-css-big-number .num { display: block; color: var(--ink); animation: b-bn-rise 1.15s cubic-bezier(.16,1,.3,1) 0.15s both; }
.b-css-big-number .ghost { position: absolute; left: 0.01em; top: 0; color: transparent; -webkit-text-fill-color: transparent; -webkit-text-stroke: calc(var(--label) * 0.07) color-mix(in srgb, var(--gold) 72%, transparent); animation: b-bn-ghost 1s cubic-bezier(.16,1,.3,1) 0.7s both; }
.b-css-big-number .copy { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.62); padding-bottom: calc(var(--gap) * 0.95); min-width: 0; }
.b-css-big-number .copy > * { animation: b-bn-slide 0.85s cubic-bezier(.16,1,.3,1) both; }
.b-css-big-number .copy > :nth-child(1) { animation-delay: 0.7s; } .b-css-big-number .copy > :nth-child(2) { animation-delay: 0.82s; } .b-css-big-number .copy > :nth-child(3) { animation-delay: 0.94s; }
.b-css-big-number .unit { font-size: var(--title); font-weight: var(--thin); letter-spacing: -0.025em; line-height: 1; color: var(--gold2); }
.b-css-big-number .cs-lead { max-width: 15em; }
.b-css-big-number .line { grid-column: 1 / -1; display: block; height: 2px; margin-right: calc(var(--pad) * -1); background: var(--gold); transform-origin: 0 50%; animation: b-bn-line 1.1s cubic-bezier(.65,0,.35,1) 0.05s both; }
.b-css-big-number .long { grid-template-columns: 1fr; }
.b-css-big-number .long .fig { font-size: min(56cqh, calc(118cqw / var(--n))); }
.b-css-big-number .long .line { grid-row: 2; }
.b-css-big-number .long .copy { grid-row: 3; flex-direction: row; align-items: baseline; gap: calc(var(--gap) * 1.3); padding: calc(var(--gap) * 0.9) 0 0; }
.cs-frame[data-shape="tall"] .b-css-big-number .wrap { grid-template-columns: 1fr; padding: calc(var(--top) + var(--pad)) var(--pad) var(--pad); }
.cs-frame[data-shape="tall"] .b-css-big-number .fig { font-size: min(46cqh, calc(128cqw / var(--n))); }
.cs-frame[data-shape="tall"] .b-css-big-number .line { grid-row: 2; }
.cs-frame[data-shape="tall"] .b-css-big-number .copy { grid-row: 3; flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.9); padding: calc(var(--gap) * 1.6) 0 0; }
.cs-frame[data-shape="tall"] .b-css-big-number .unit { font-size: calc(var(--title) * 1.25); }
@keyframes b-bn-rise { from { transform: translateY(104%); opacity: 0; } 8% { opacity: 1; } to { transform: none; opacity: 1; } }
@keyframes b-bn-ghost { from { opacity: 0; transform: none; } to { opacity: 1; transform: translate(0.055em, -0.04em); } }
@keyframes b-bn-slide { from { opacity: 0; transform: translateX(48px); } to { opacity: 1; transform: none; } }
@keyframes b-bn-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so the adapter collects them at every seek.
const __mount = function mount(el, p, cx) {
  const v = String(p.value == null ? '' : p.value).slice(0, 5), n = Math.max(1, v.length);
  el.innerHTML = `<div class="wrap${n > 2 ? ' long' : ''}" style="--n:${n}">
    <div class="fig"><span class="ghost cs-num" aria-hidden="true" data-deco>${cx.esc(v)}</span><div class="box"><span class="num cs-num">${cx.esc(v)}</span></div></div>
    <div class="copy">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.unit ? `<div class="unit">${cx.esc(p.unit)}</div>` : ''}${p.text ? `<p class="cs-lead">${cx.esc(p.text)}</p>` : ''}</div>
    <i class="line" aria-hidden="true"></i>
  </div>`;
  return cx.fromWaapi(el);
}

CS.register("css/big-number", __mount, typeof css === "string" ? css : "", {"kind":"css/big-number","title":"Big number","use":"number","family":"giant-number-ghost","lead":"type","site":null,"dur":1.8,"source":{"type":"css","package":"none (browser CSS + Web Animations API)"},"license":"MIT","data":{}});
})();

/* css/clip-reveal */
(function(){
// Plain CSS @keyframes, no library: a portrait picture opens from a small circle to the full frame, the words slide in beside it.
const css = `
.b-css-clip-reveal .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.6); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 2.2); }
.b-css-clip-reveal.flip .wrap { grid-template-columns: 1fr auto; }
.b-css-clip-reveal.flip .frame { order: 2; }
.b-css-clip-reveal .frame { position: relative; height: 100%; aspect-ratio: 4 / 5; max-width: 46cqw; }
.b-css-clip-reveal .pic { position: absolute; inset: 0; border-radius: var(--radius); overflow: hidden; background: #000;
  animation: b-cr-open 1.5s cubic-bezier(.65,0,.2,1) 0.1s both; }
.b-css-clip-reveal .pic > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: b-cr-settle 1.9s cubic-bezier(.16,1,.3,1) 0.1s both; }
.b-css-clip-reveal .edge { position: absolute; left: calc(var(--gap) * -0.5); top: 12%; bottom: 12%; width: 2px; background: var(--gold); transform-origin: 50% 0; animation: b-cr-edge 1s cubic-bezier(.16,1,.3,1) 1.0s both; }
.b-css-clip-reveal.flip .edge { left: auto; right: calc(var(--gap) * -0.5); }
.b-css-clip-reveal .copy { display: flex; flex-direction: column; gap: var(--gap); min-width: 0; }
.b-css-clip-reveal .copy > * { animation: b-cr-slide 0.9s cubic-bezier(.16,1,.3,1) both; }
.b-css-clip-reveal .copy > :nth-child(1) { animation-delay: 0.75s; }
.b-css-clip-reveal .copy > :nth-child(2) { animation-delay: 0.9s; }
.b-css-clip-reveal .copy > :nth-child(3) { animation-delay: 1.05s; }
.b-css-clip-reveal .cs-title { font-size: calc(var(--title) * 1.08); }
.b-css-clip-reveal .cs-lead { max-width: 18em; }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .wrap { grid-template-columns: 1fr !important; grid-template-rows: auto auto; align-content: center; row-gap: calc(var(--gap) * 1.6); padding-top: calc(var(--pad) * 0.5 + var(--top)); }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .frame { order: 0 !important; height: 46cqh; aspect-ratio: auto; width: 100%; max-width: none; }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .edge { left: 12%; right: 12%; top: auto; bottom: calc(var(--gap) * -0.7); width: auto; height: 2px; transform-origin: 0 50%; animation-name: b-cr-edge-x; }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .cs-title { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-css-clip-reveal .copy { gap: calc(var(--gap) * 0.8); }
@keyframes b-cr-open { from { clip-path: circle(0% at 50% 38%); } to { clip-path: circle(125% at 50% 38%); } }
@keyframes b-cr-settle { from { transform: scale(1.08); } to { transform: none; } }
@keyframes b-cr-edge { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes b-cr-edge-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes b-cr-slide { from { opacity: 0; transform: translateX(46px); } to { opacity: 1; transform: none; } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek, not once.
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  if (p.side === 'right') el.classList.add('flip');
  const fx = p.face ? Math.round((p.face[0] + p.face[2] / 2) * 100) : 50, fy = p.face ? Math.round(cx.clamp((p.face[1] + p.face[3] / 2) * 100 - 6, 0, 100)) : 40;
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}" style="object-position:${fx}% ${fy}%"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}" style="object-position:${fx}% ${fy}%">`;
  el.innerHTML = `<div class="wrap">
    <div class="frame"><div class="pic">${media}</div><i class="edge" aria-hidden="true"></i></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      ${p.text ? `<p class="cs-lead">${cx.esc(p.text)}</p>` : ''}
    </div>
  </div>`;
  const m = el.querySelector('.pic > *');
  if (p.face) cx.face(m, p.face);
  const clip = cx.fromWaapi(el);
  return isVideo ? cx.all(clip, cx.fromVideo(m)) : clip;
}

CS.register("css/clip-reveal", __mount, typeof css === "string" ? css : "", {"kind":"css/clip-reveal","title":"Clip reveal","use":"media","family":"clip-portrait","lead":"picture","site":null,"dur":2,"source":{"type":"css","package":"none (browser CSS + Web Animations API)"},"license":"MIT","data":{}});
})();

/* css/ken-burns */
(function(){
// Plain CSS @keyframes, no library: a still (or a clip) fills the whole frame and the camera pushes in very slowly (the Ken Burns move).
// A thin caption band at the bottom carries a label and one line; only the band is darkened.
// For a photo of a person give the face box (and the body box if you have it): the caption becomes a corner column on the free
// side of the person, so nothing is on the face or the body, and the picture is never shown above its own size.
const css = `
.b-css-ken-burns { background: #000; }
.b-css-ken-burns .pic { position: absolute; inset: 0; overflow: hidden; background: #000; animation: b-kb-in 1.1s ease-out both; }
.b-css-ken-burns .pic img, .b-css-ken-burns .pic video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: var(--ox, 50%) var(--oy, 50%); will-change: transform;
  animation: b-kb-push var(--kbd, 6s) cubic-bezier(.3, .1, .45, 1) both; }
.b-css-ken-burns .band { position: absolute; left: 0; right: 0; bottom: 0; padding: calc(var(--pad) * 1.15) var(--pad) calc(var(--pad) * 0.5); display: grid; grid-template-columns: auto 1fr; align-items: end; column-gap: calc(var(--gap) * 1.2); row-gap: calc(var(--gap) * 0.4);
  background: linear-gradient(0deg, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.84) 44%, rgba(8, 7, 5, 0.56) 66%, rgba(8, 7, 5, 0.22) 84%, rgba(8, 7, 5, 0) 100%);
  animation: b-kb-in 0.9s ease-out 0.45s both; }
/* a person in the picture: the caption is a column in the bottom corner of the free side, it ends before the person */
.b-css-ken-burns.person .band { right: auto; width: var(--free, 26%); grid-template-columns: minmax(0, 1fr); row-gap: calc(var(--gap) * 0.5); padding: calc(var(--pad) * 1.6) calc(var(--gap) * 0.9) calc(var(--pad) * 0.56) calc(var(--pad) * 0.5);
  background: linear-gradient(90deg, rgba(8, 7, 5, 0.88) 0%, rgba(8, 7, 5, 0.8) 34%, rgba(8, 7, 5, 0.6) 56%, rgba(8, 7, 5, 0.3) 74%, rgba(8, 7, 5, 0.08) 87%, rgba(8, 7, 5, 0) 94%);
  -webkit-mask-image: linear-gradient(0deg, #000 0%, #000 58%, transparent 100%); mask-image: linear-gradient(0deg, #000 0%, #000 58%, transparent 100%); }
.b-css-ken-burns.person.right .band { left: auto; right: 0; padding-left: calc(var(--gap) * 0.9); padding-right: calc(var(--pad) * 0.5);
  background: linear-gradient(270deg, rgba(8, 7, 5, 0.88) 0%, rgba(8, 7, 5, 0.8) 34%, rgba(8, 7, 5, 0.6) 56%, rgba(8, 7, 5, 0.3) 74%, rgba(8, 7, 5, 0.08) 87%, rgba(8, 7, 5, 0) 94%); }
.b-css-ken-burns.person .line { text-align: left; text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-css-ken-burns.person .cs-kicker { white-space: normal; padding-bottom: 0; }
.b-css-ken-burns .rule { grid-column: 1 / -1; display: block; height: 1px; background: var(--gold); transform-origin: 0 50%; animation: b-kb-line 1.1s cubic-bezier(.16, 1, .3, 1) 0.7s both; }
.b-css-ken-burns .cs-kicker { letter-spacing: 0.3em; white-space: nowrap; padding-bottom: 0.5em; animation: b-kb-up 0.8s cubic-bezier(.16, 1, .3, 1) 0.95s both; }
.b-css-ken-burns .line { font-size: calc(var(--lead) * 1.08); font-weight: var(--thin); letter-spacing: -0.015em; line-height: 1.12; color: var(--ink); text-wrap: balance; text-align: right; animation: b-kb-up 0.8s cubic-bezier(.16, 1, .3, 1) 1.1s both; }
/* phone: a wide picture is shown whole (not cropped to a sliver), the caption sits under it on the page colour */
.cs-frame[data-shape="tall"] .b-css-ken-burns { background: var(--bg); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .pic { top: calc(var(--top) + 17cqh); bottom: auto; height: var(--ph, 56.25cqw); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .band { grid-template-columns: 1fr; top: calc(var(--top) + 17cqh + var(--ph, 56.25cqw)); bottom: auto; background: none; padding: var(--pad); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .pic { top: var(--top); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .pic { bottom: auto; height: calc(66% - var(--top)); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .band { top: 66%; bottom: 0; right: 0; width: auto; align-content: center; padding: var(--pad); background: none; -webkit-mask-image: none; mask-image: none; }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .line { text-shadow: none; }
.cs-frame[data-shape="tall"] .b-css-ken-burns .line { text-align: left; font-size: calc(var(--lead) * 1.2); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .cs-kicker { white-space: normal; padding-bottom: 0; }
@keyframes b-kb-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes b-kb-push { from { transform: translate(var(--dx, 0%), var(--dy, 0%)) scale(var(--k0, 1)); } to { transform: translate(0%, 0%) scale(var(--k1, 1.08)); } }
@keyframes b-kb-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes b-kb-up { from { opacity: 0; transform: translateY(0.5em); } to { opacity: 1; transform: none; } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek (cx.fromWaapi does that).
const __mount = function mount(el, p, cx) {
  const face = Array.isArray(p.face) ? p.face : null, body = Array.isArray(p.body) ? p.body : null, tall = cx.shape === 'tall';
  // the room a person takes: the body box, or (face only) shoulders guessed from the face
  const person = body || (face ? [face[0] - face[2] * 0.6, face[1], face[2] * 2.2, 1 - face[1]] : null);
  if (person) el.classList.add('person');
  const focus = Array.isArray(p.focus) ? p.focus : face ? [face[0] + face[2] / 2, face[1] + face[3] / 2] : [0.5, 0.5];
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const secs = cx.clamp(Number(p.seconds) || 6, 3, 20);
  el.style.setProperty('--kbd', secs + 's');
  el.innerHTML = `
    <div class="pic">${isVideo ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.text || 'Clip')}"></video>` : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.text || 'Picture')}">`}</div>
    <div class="band">
      <i class="rule" aria-hidden="true"></i>
      ${p.label ? `<div class="cs-kicker">${cx.esc(p.label)}</div>` : '<span></span>'}
      ${p.text ? `<p class="line">${cx.esc(p.text)}</p>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.pic > *'), box = q('.pic');
  const place = () => {
    if (tall && !person) { const r0 = (m.videoHeight || m.naturalHeight || 9) / (m.videoWidth || m.naturalWidth || 16); el.style.setProperty('--ph', Math.min(r0 * 100, 110).toFixed(2) + 'cqw'); }
    const bw = box.offsetWidth, bh = box.offsetHeight; if (!bw || !bh) return;
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s;
    const px = w - bw > 1 ? cx.clamp((focus[0] * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((focus[1] * h - bh / 2) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
    const x0 = (bw - w) * px, y0 = (bh - h) * py;
    el.style.setProperty('--ox', cx.clamp((x0 + focus[0] * w) / bw * 100, 0, 100).toFixed(2) + '%');
    el.style.setProperty('--oy', cx.clamp((y0 + focus[1] * h) / bh * 100, 0, 100).toFixed(2) + '%');
    // a drawing or a result still may push in by 8 %; a person is never shown above the picture's own size
    const k1 = face ? cx.clamp(1 / s, 1, 1.08) : 1.08, k0 = 1 + (k1 - 1) * 0.3;
    el.style.setProperty('--k1', k1.toFixed(4)); el.style.setProperty('--k0', k0.toFixed(4));
    el.style.setProperty('--dx', ((k0 - 1) * (focus[0] < 0.5 ? 40 : -40)).toFixed(3) + '%'); el.style.setProperty('--dy', ((k0 - 1) * 30).toFixed(3) + '%');
    if (person && !tall) {
      // free room beside the person at the end of the push (the picture grows around the focus point): the caption column gets the wider side
      const fxp = x0 + focus[0] * w, L = Math.max(0, fxp - (fxp - (x0 + person[0] * w)) * k1), R = Math.max(0, bw - (fxp + (x0 + (person[0] + person[2]) * w - fxp) * k1));
      const right = p.side ? p.side === 'right' : R > L + 2;
      el.classList.toggle('right', right);
      el.style.setProperty('--free', Math.max(Math.floor(right ? R : L) - 2, bw * 0.14) + 'px');
    } else el.style.removeProperty('--free');
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (body) cx.face(m, body, 'body');
  const move = cx.fromWaapi(el);
  return Object.assign(isVideo ? cx.all(move, cx.fromVideo(m)) : move, {fit: place});
}

CS.register("css/ken-burns", __mount, typeof css === "string" ? css : "", {"kind":"css/ken-burns","title":"Ken Burns still","use":"media","family":"ken-burns","lead":"picture","site":null,"dur":6,"source":{"type":"css","package":"none (browser CSS + Web Animations API)"},"license":"MIT","data":{}});
})();

/* css/light-sweep */
(function(){
// Plain CSS @keyframes, no library: one large word, a light passes through it once, a line settles under it.
const css = `
.b-css-light-sweep .word { font-size: calc(var(--hero) * 1.25); font-weight: var(--thin); letter-spacing: -0.04em; line-height: 1; white-space: nowrap;
  background: linear-gradient(100deg, var(--ivory) 0%, var(--ivory) 38%, #fff 47%, var(--gold2) 50%, #fff 53%, var(--ivory) 62%, var(--ivory) 100%);
  background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: var(--ivory); -webkit-text-fill-color: transparent;
  animation: b-ls-sweep 1.9s cubic-bezier(.3,.1,.2,1) 0.25s both, b-ls-in 0.9s cubic-bezier(.16,1,.3,1) both; }
.b-css-light-sweep .cs-kicker { animation: b-ls-fade 0.6s ease-out both; }
.b-css-light-sweep .cs-lead { animation: b-ls-up 0.8s cubic-bezier(.16,1,.3,1) 1.1s both; max-width: 22em; }
.b-css-light-sweep .cs-rule { animation: b-ls-rule 1s cubic-bezier(.16,1,.3,1) 0.8s both; width: calc(var(--hero) * 0.9); }
.cs-frame[data-shape="tall"] .b-css-light-sweep .word { font-size: var(--hero); white-space: normal; }
@keyframes b-ls-sweep { from { background-position: 100% 0; } to { background-position: 0% 0; } }
@keyframes b-ls-in { from { opacity: 0; transform: translateY(0.18em); letter-spacing: 0.02em; } to { opacity: 1; transform: none; letter-spacing: -0.04em; } }
@keyframes b-ls-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes b-ls-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes b-ls-rule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;
const __mount = function mount(el, p, cx) {
  el.innerHTML = `<div class="cs-pad cs-center">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="word">${cx.esc(p.word)}</div>
    <i class="cs-rule" style="transform-origin:50% 50%"></i>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
  </div>`;
  return cx.fromWaapi(el);
}

CS.register("css/light-sweep", __mount, typeof css === "string" ? css : "", {"kind":"css/light-sweep","title":"Light sweep","use":"chapter","family":"light-sweep","lead":"type","site":null,"dur":2.2,"source":{"type":"css","package":"none (browser CSS + Web Animations API)"},"license":"MIT","data":{}});
})();

/* css/outline-chapter */
(function(){
// Plain CSS @keyframes, no library: a very large outlined chapter number rises behind a mask, the title slides in beside it.
const css = `
.b-css-outline-chapter .wrap { position: absolute; inset: 0; padding: var(--top) var(--pad) 0; display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 1.8); }
.b-css-outline-chapter .numbox { overflow: hidden; padding: 0 0.04em; }
.b-css-outline-chapter .num { display: block; font-size: min(62cqh, 34cqw); font-weight: var(--thin); line-height: 0.86; letter-spacing: -0.05em; color: var(--gold); -webkit-text-fill-color: transparent; -webkit-text-stroke: 2px var(--gold);
  animation: b-oc-rise 1.2s cubic-bezier(.16,1,.3,1) both; }
.b-css-outline-chapter .copy { display: flex; flex-direction: column; gap: var(--gap); min-width: 0; }
.b-css-outline-chapter .copy > * { animation: b-oc-slide 0.9s cubic-bezier(.16,1,.3,1) both; }
.b-css-outline-chapter .cs-kicker { animation-delay: 0.45s; }
.b-css-outline-chapter .cs-hero { font-size: calc(var(--hero) * 0.86); animation-delay: 0.58s; }
.b-css-outline-chapter .cs-rule { width: 100%; max-width: calc(var(--hero) * 3); animation: b-oc-rule 1.1s cubic-bezier(.16,1,.3,1) 0.85s both; }
.b-css-outline-chapter .cs-lead { animation-delay: 1.0s; max-width: 20em; }
.cs-frame[data-shape="tall"] .b-css-outline-chapter .wrap { grid-template-columns: 1fr; align-content: center; row-gap: calc(var(--gap) * 1.2); padding-bottom: var(--pad); }
.cs-frame[data-shape="tall"] .b-css-outline-chapter .num { font-size: min(34cqh, 62cqw); -webkit-text-stroke-width: 1.5px; }
.cs-frame[data-shape="tall"] .b-css-outline-chapter .cs-hero { font-size: var(--hero); }
.cs-frame[data-shape="tall"] .b-css-outline-chapter .copy { gap: calc(var(--gap) * 0.9); }
@keyframes b-oc-rise { from { transform: translateY(100%); } to { transform: none; } }
@keyframes b-oc-slide { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: none; } }
@keyframes b-oc-rule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek, not once.
const __mount = function mount(el, p, cx) {
  el.innerHTML = `<div class="wrap">
    <div class="numbox"><span class="num cs-num">${cx.esc(p.number)}</span></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-hero">${cx.esc(p.title)}</h2>
      <i class="cs-rule"></i>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    </div>
  </div>`;
  return cx.fromWaapi(el);
}

CS.register("css/outline-chapter", __mount, typeof css === "string" ? css : "", {"kind":"css/outline-chapter","title":"Outline chapter","use":"chapter","family":"outline-number","lead":"type","site":null,"dur":2,"source":{"type":"css","package":"none (browser CSS + Web Animations API)"},"license":"MIT","data":{}});
})();

/* css/type-stack */
(function(){
// Plain CSS @keyframes, no library: short lines come in from the left and the right in turn and stack like stairs; one of them is gold.
const css = `
.b-css-type-stack .stack { display: flex; flex-direction: column; }
.b-css-type-stack .ln { position: relative; padding: calc(var(--gap) * 0.42) 0; }
.b-css-type-stack .ln::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: var(--line); transform-origin: 0 50%; animation: b-ts-rule 1s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--i) * 0.22s + 0.1s); }
.b-css-type-stack .ln:nth-child(even)::before { transform-origin: 100% 50%; }
.b-css-type-stack .tx { display: block; font-size: calc(var(--hero) * 0.86 * var(--k, 1)); font-weight: var(--thin); letter-spacing: -0.035em; line-height: 1.04; color: var(--ink); margin-left: calc(var(--i) * 7cqw);
  animation: b-ts-left 1s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--i) * 0.22s + 0.2s); }
.b-css-type-stack .ln:nth-child(even) .tx { animation-name: b-ts-right; }
.b-css-type-stack .ln.on .tx { color: var(--gold2); }
.b-css-type-stack .cs-kicker { animation: b-ts-fade 0.6s ease-out both; margin-bottom: calc(var(--gap) * -0.3); }
.cs-frame[data-shape="tall"] .b-css-type-stack .tx { margin-left: calc(var(--i) * 4cqw); font-size: calc(var(--hero) * 0.92 * var(--k, 1)); }
@keyframes b-ts-left { from { opacity: 0; transform: translateX(-14cqw); } to { opacity: 1; transform: none; } }
@keyframes b-ts-right { from { opacity: 0; transform: translateX(14cqw); } to { opacity: 1; transform: none; } }
@keyframes b-ts-rule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes b-ts-fade { from { opacity: 0; } to { opacity: 1; } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek, not once.
const __mount = function mount(el, p, cx) {
  const lines = (p.lines || []).slice(0, 4), gold = p.gold == null ? lines.length : Number(p.gold);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="stack" style="--k:${lines.length > 3 ? 0.78 : 1}">${lines.map((t, i) => `<div class="ln${i + 1 === gold ? ' on' : ''}" style="--i:${i}"><span class="tx">${cx.esc(t)}</span></div>`).join('')}</div>
  </div>`;
  return cx.fromWaapi(el);
}

CS.register("css/type-stack", __mount, typeof css === "string" ? css : "", {"kind":"css/type-stack","title":"Type stack","use":"statement","family":"type-stairs","lead":"type","site":null,"dur":1.6,"source":{"type":"css","package":"none (browser CSS + Web Animations API)"},"license":"MIT","data":{}});
})();

/* gsap/bars */
(function(){
// GSAP CustomEase: horizontal bars grow to their values with a small overshoot, the number at the end of each bar counts with it.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("gsap/bars", __mount, typeof css === "string" ? css : "", {"kind":"gsap/bars","title":"Bars","use":"chart","family":"bar-grow","lead":"picture","site":null,"dur":2.5,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["CustomEase"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/compare-wipe */
(function(){
// GSAP: two columns side by side. The left one is there first; a gold line travels across and the right one is revealed behind it.
const css = `
.b-gsap-compare-wipe .cmp { position: relative; display: grid; grid-template-columns: 1fr 1fr; }
.b-gsap-compare-wipe .side { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.7); padding: calc(var(--gap) * 1.5) calc(var(--gap) * 1.6); min-height: 46cqh; }
.b-gsap-compare-wipe .a { padding-left: 0; }
.b-gsap-compare-wipe .b { position: relative; --p: 0; background: var(--card); border-radius: 0 var(--radius) var(--radius) 0; clip-path: inset(0 calc((1 - var(--p)) * 100%) 0 0); }
.b-gsap-compare-wipe .tag { font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--dim); }
.b-gsap-compare-wipe .b .tag { color: var(--gold2); }
.b-gsap-compare-wipe .hd { font-size: calc(var(--title) * 1.08); font-weight: var(--thin); letter-spacing: -0.025em; line-height: 1.05; color: var(--ivory); }
.b-gsap-compare-wipe .b .hd { color: var(--ink); }
.b-gsap-compare-wipe ul { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.42); margin-top: calc(var(--gap) * 0.2); }
.b-gsap-compare-wipe li { display: flex; gap: 0.7em; align-items: baseline; font-size: var(--lead); line-height: 1.26; color: var(--dim); }
.b-gsap-compare-wipe .b li { color: var(--ivory); }
.b-gsap-compare-wipe li::before { content: ""; flex: none; width: 0.7em; height: 1px; background: var(--dim); transform: translateY(-0.3em); }
.b-gsap-compare-wipe .b li::before { height: 2px; background: var(--gold); }
.b-gsap-compare-wipe .mid { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--gold); transform-origin: 50% 0; }
.b-gsap-compare-wipe .wipe { position: absolute; top: 0; bottom: 0; left: calc(50% + 50% * var(--p, 0)); width: 2px; margin-left: -1px; background: var(--gold2); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .cmp { grid-template-columns: 1fr; }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .side { padding: calc(var(--gap) * 1.1) calc(var(--gap) * 0.9); min-height: 0; gap: calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe li { font-size: calc(var(--lead) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .hd { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .a { padding-left: 0; padding-top: 0; }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .b { border-radius: 0 0 var(--radius) var(--radius); clip-path: inset(0 0 calc((1 - var(--p)) * 100%) 0); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .mid { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .wipe { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .b::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2px; background: var(--gold); }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, L = p.left || {}, R = p.right || {};
  const side = (s, cls) => `<div class="side ${cls}">
      ${s.tag ? `<div class="tag">${cx.esc(s.tag)}</div>` : ''}
      <h3 class="hd">${cx.esc(s.title || '')}</h3>
      <ul>${(s.items || []).slice(0, 4).map((t) => `<li><span>${cx.esc(t)}</span></li>`).join('')}</ul>
    </div>`;
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="cmp">${side(L, 'a')}${side(R, 'b')}<i class="mid" aria-hidden="true"></i><i class="wipe" aria-hidden="true"></i></div>
  </div>`;
  const q = (s) => el.querySelector(s), tl = g.timeline({paused: true}), cmp = q('.cmp'), b = q('.b');
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) tl.fromTo(head, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
  tl.fromTo(el.querySelectorAll('.a .tag, .a .hd, .a li'), {opacity: 0, x: -24}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08}, 0.3);
  tl.fromTo(q('.mid'), {scaleY: 0}, {scaleY: 1, duration: 0.7, ease: 'expo.out'}, 0.7);
  tl.addLabel('step1', 1.5);
  tl.fromTo(q('.wipe'), {opacity: 0}, {opacity: 1, duration: 0.15}, 1.5);
  tl.fromTo([cmp, b], {'--p': 0}, {'--p': 1, duration: 1.1, ease: 'power2.inOut'}, 1.55);
  tl.fromTo(el.querySelectorAll('.b .tag, .b .hd, .b li'), {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.09}, 1.85);
  tl.to(q('.wipe'), {opacity: 0, duration: 0.3}, 2.65);
  return cx.fromGsap(tl);
}

CS.register("gsap/compare-wipe", __mount, typeof css === "string" ? css : "", {"kind":"gsap/compare-wipe","title":"Compare wipe","use":"compare","family":"wipe-compare","lead":"type","site":null,"dur":3,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/counter */
(function(){
// GSAP: a very large number counts up to its value while a thin ruler slides under it.
const css = `
.b-gsap-counter .row { display: flex; align-items: baseline; gap: 0.12em; font-size: calc(var(--hero) * 2.1); line-height: 0.84; }
.b-gsap-counter .num { font-weight: var(--thin); letter-spacing: -0.05em; color: var(--ink); }
.b-gsap-counter .unit { font-size: var(--title); font-weight: var(--thin); letter-spacing: -0.02em; color: var(--gold2); line-height: 1; }
.b-gsap-counter .cs-lead { max-width: 22em; }
.b-gsap-counter .ruler { position: relative; height: calc(var(--label) * 2.4); overflow: hidden; margin-top: calc(var(--gap) * 0.4);
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 70%, transparent 100%); mask-image: linear-gradient(90deg, #000 0%, #000 70%, transparent 100%); }
.b-gsap-counter .ticks { position: absolute; left: 0; bottom: 0; width: 260%; height: 100%;
  background-image: linear-gradient(90deg, var(--gold) 0 2px, transparent 2px), linear-gradient(90deg, var(--line) 0 1px, transparent 1px);
  background-size: calc(var(--label) * 6) 100%, calc(var(--label) * 0.6) 46%; background-repeat: repeat-x; background-position: 0 100%, 0 100%; opacity: 0.9; }
.b-gsap-counter .pin { position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--gold2); }
.cs-frame[data-shape="tall"] .b-gsap-counter .row { flex-wrap: wrap; font-size: calc(var(--hero) * 2.4); }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, value = Number(p.value) || 0, from = Number(p.from) || 0, dec = Math.max(0, p.decimals | 0);
  const fmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="row"><span class="num cs-num">${fmt(from)}</span>${p.unit ? `<span class="unit">${cx.esc(p.unit)}</span>` : ''}</div>
    ${p.label ? `<p class="cs-lead">${cx.esc(p.label)}</p>` : ''}
    <div class="ruler" aria-hidden="true"><div class="ticks"></div><i class="pin"></i></div>
  </div>`;
  const q = (s) => el.querySelector(s), num = q('.num'), o = {v: from};
  const tl = g.timeline({paused: true, onUpdate: () => { num.textContent = fmt(o.v); }});
  if (q('.cs-kicker')) tl.fromTo(q('.cs-kicker'), {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0);
  tl.fromTo(num, {opacity: 0, filter: 'blur(18px)', y: 40}, {opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.7, ease: 'expo.out'}, 0.1);
  tl.to(o, {v: value, duration: 1.7, ease: 'power3.out'}, 0.2);
  tl.fromTo(q('.ruler'), {opacity: 0}, {opacity: 1, duration: 0.5, ease: 'power1.out'}, 0.15);
  tl.fromTo(q('.ticks'), {xPercent: 0}, {xPercent: -38, duration: 1.75, ease: 'power3.out'}, 0.2);
  if (q('.unit')) tl.fromTo(q('.unit'), {opacity: 0, x: -16}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0.7);
  if (q('.cs-lead')) tl.fromTo(q('.cs-lead'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 1.2);
  return cx.fromGsap(tl);
}

CS.register("gsap/counter", __mount, typeof css === "string" ? css : "", {"kind":"gsap/counter","title":"Counter","use":"number","family":"ruler-count","lead":"type","site":null,"dur":1.9,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/draw-mark */
(function(){
// GSAP DrawSVG: one sentence; a hand-drawn ring (or underline) is drawn around one key word, which turns gold.
const css = `
.b-gsap-draw-mark .sent { font-size: calc(var(--title) * 1.12); font-weight: var(--thin); letter-spacing: -0.028em; line-height: 1.16; color: var(--ink); max-width: 13.5em; text-wrap: balance; }
.b-gsap-draw-mark .cs-w { margin-right: 0; }
.b-gsap-draw-mark .key { position: relative; display: inline-block; white-space: nowrap; margin: 0 0.1em; }
.b-gsap-draw-mark .key svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
.b-gsap-draw-mark .key path { opacity: 0; fill: none; stroke: var(--gold); stroke-linecap: round; stroke-linejoin: round; }
.cs-frame[data-shape="tall"] .b-gsap-draw-mark .sent { font-size: calc(var(--title) * 1.05); }
`;
const __mount = function mount(el, p, cx) {
  cx.plugin('DrawSVGPlugin');
  const g = cx.gsap, text = String(p.text || ''), key = String(p.mark || '').trim();
  const at = key ? text.toLowerCase().indexOf(key.toLowerCase()) : -1;
  const sent = at < 0 ? cx.spans(text, 'cs-w')
    : cx.spans(text.slice(0, at), 'cs-w') + `<span class="key"><span class="kw">${cx.esc(text.slice(at, at + key.length))}</span><svg aria-hidden="true"><path d="M0 0"/></svg></span>` + cx.spans(text.slice(at + key.length), 'cs-w');
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <p class="sent">${sent}</p>
    ${p.by ? `<div class="cs-label">${cx.esc(p.by)}</div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), keyEl = q('.key'), under = p.style === 'underline';
  function shape() {
    if (!keyEl) return;
    const w = keyEl.offsetWidth, h = keyEl.offsetHeight, svg = keyEl.querySelector('svg'), path = svg.querySelector('path');
    svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const sw = Math.max(2, h * 0.04); path.style.strokeWidth = sw + 'px';
    let d = '';
    if (under) {
      const y = h * 0.98;
      d = `M${-w * 0.02} ${y} C${w * 0.3} ${y - h * 0.07}, ${w * 0.7} ${y + h * 0.05}, ${w * 1.03} ${y - h * 0.03} C${w * 0.75} ${y + h * 0.1}, ${w * 0.45} ${y + h * 0.1}, ${w * 0.16} ${y + h * 0.14}`;
    } else {
      // a ring drawn by hand: a little more than one turn, the end passes the start
      const cxp = w / 2, cyp = h * 0.53, rx = w / 2 + h * 0.17, ry = h * 0.55, n = 64, a0 = -2.5, turn = Math.PI * 2 * 1.07;
      for (let i = 0; i <= n; i++) {
        const k = i / n, a = a0 + turn * k, grow = 1 + 0.05 * k, wob = 1 + 0.025 * Math.sin(a * 3 + 0.6);
        d += (i ? 'L' : 'M') + (cxp + rx * grow * wob * Math.cos(a)).toFixed(1) + ' ' + (cyp + ry * grow * (2 - wob) * Math.sin(a)).toFixed(1);
      }
    }
    path.setAttribute('d', d);
  }
  let tl = null, cur = 0;
  function make() {
    if (tl) tl.kill();
    shape();
    tl = g.timeline({paused: true});
    if (q('.cs-kicker')) tl.fromTo(q('.cs-kicker'), {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0);
    const parts = el.querySelectorAll('.sent > .cs-w, .sent > .key');
    tl.fromTo(parts, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.75, ease: 'expo.out', stagger: 0.055}, 0.12);
    const t1 = 0.12 + 0.055 * parts.length + 0.45;
    if (keyEl) {
      tl.set(keyEl.querySelector('path'), {opacity: 1}, t1);
      tl.fromTo(keyEl.querySelector('path'), {drawSVG: '0%'}, {drawSVG: '100%', duration: 0.85, ease: 'power2.inOut'}, t1);
      tl.fromTo(keyEl.querySelector('.kw'), {color: 'inherit'}, {color: getComputedStyle(el).getPropertyValue('--gold2').trim() || '#F2B45A', duration: 0.5, ease: 'power1.out'}, t1 + 0.2);
    }
    if (q('.cs-label')) tl.fromTo(q('.cs-label'), {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, t1 + 0.7);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); }};
}

CS.register("gsap/draw-mark", __mount, typeof css === "string" ? css : "", {"kind":"gsap/draw-mark","title":"Draw mark","use":"statement","family":"hand-mark","lead":"type","site":null,"dur":2.4,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["DrawSVGPlugin"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/flip-grid */
(function(){
// GSAP Flip: the cards sit in one pile, then fan out into a grid. Flip records the pile, the layout changes, and the move is one seekable timeline.
const css = `
.b-gsap-flip-grid .grid { position: relative; display: grid; grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); gap: calc(var(--gap) * 0.7); }
.b-gsap-flip-grid .card { padding: calc(var(--gap) * 0.9); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.36); background: var(--bg2); border: 1px solid var(--line); border-radius: var(--radius); min-height: calc(var(--title) * 2.2); }
.b-gsap-flip-grid .no { font-size: var(--label); letter-spacing: 0.2em; color: var(--gold2); line-height: 1.2; }
.b-gsap-flip-grid .t { font-size: var(--lead); color: var(--ink); line-height: 1.12; letter-spacing: -0.01em; }
.b-gsap-flip-grid .d { font-size: var(--body); color: var(--dim); line-height: 1.34; }
.b-gsap-flip-grid .grid.pile .card { position: absolute; left: 50%; top: 50%; width: calc((100% - (var(--cols) - 1) * var(--gap) * 0.7) / var(--cols)); transform: translate(-50%, -50%) rotate(var(--r, 0deg)); }
.cs-frame[data-shape="tall"] .b-gsap-flip-grid .card { padding: calc(var(--gap) * 0.8); min-height: 0; gap: calc(var(--gap) * 0.25); }
`;
const __mount = function mount(el, p, cx) {
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

CS.register("gsap/flip-grid", __mount, typeof css === "string" ? css : "", {"kind":"gsap/flip-grid","title":"Flip grid","use":"list","family":"pile-to-grid","lead":"type","site":null,"dur":2.4,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["Flip"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/horizontal-cards */
(function(){
// GSAP: a row of cards wider than the screen slides sideways. On a web page the vertical scroll moves it; on a slide it glides to the last card and stops.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("gsap/horizontal-cards", __mount, typeof css === "string" ? css : "", {"kind":"gsap/horizontal-cards","title":"Horizontal cards","use":"list","family":"side-scroll-cards","lead":"type","site":{"mode":"scrub","len":2},"dur":4.5,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/kinetic-type */
(function(){
// GSAP: three to five words take the whole screen one after another (mask rise, wipe, weight and tracking change, drop),
// then all of them settle into one lockup: lines of different sizes, each as wide as the block, and one word turns gold.
// Type sizes are computed from the frame (cqw / cqh), so every word fills the width on a slide, a web screen and a phone.
const css = `
.b-gsap-kinetic-type .kk { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--top) + var(--pad) * 0.6); }
.b-gsap-kinetic-type .stage { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--top) + var(--pad) * 0.6 + var(--label) * 2.5); bottom: calc(var(--pad) * 0.62); }
.b-gsap-kinetic-type .stage.nok { top: calc(var(--top) + var(--pad) * 0.6); }
.b-gsap-kinetic-type .w { position: absolute; left: 50%; top: 50%; white-space: nowrap; font-size: 10cqw; font-weight: var(--thin); letter-spacing: -0.04em; line-height: 0.86; color: var(--ink); opacity: 0; }
.b-gsap-kinetic-type .m { display: block; padding: 0.16em 0.08em; margin: -0.16em -0.08em; overflow: hidden; }
.b-gsap-kinetic-type .g { display: block; will-change: transform; }
.b-gsap-kinetic-type .cs-rule { position: absolute; }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, words = (p.words || []).slice(0, 5).map(String), n = words.length;
  const gi = p.gold == null ? n - 1 : typeof p.gold === 'number' ? p.gold - 1 : words.indexOf(String(p.gold));
  el.innerHTML = `${p.kicker ? `<div class="kk cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="stage${p.kicker ? '' : ' nok'}">${words.map((w) => `<span class="w"><span class="m"><span class="g">${cx.esc(w)}</span></span></span>`).join('')}<i class="cs-rule" aria-hidden="true"></i></div>`;
  const q = (s) => el.querySelector(s), stage = q('.stage'), ws = [...el.querySelectorAll('.w')], rule = q('.cs-rule');
  const LH = 0.86, GAP = 0.26;
  let tl = null, cur = 0, lock = [];
  function lay() {
    const W = el.clientWidth, H = el.clientHeight, SW = stage.clientWidth, SH = stage.clientHeight; if (!W || !SW || !n) return false;
    // how wide each word is per 1 px of type, then the size at which it fills the stage
    const ratio = ws.map((w) => { w.style.fontSize = '10cqw'; return w.offsetWidth / (parseFloat(getComputedStyle(w).fontSize) || 1); });
    ws.forEach((w, i) => { w.style.fontSize = `min(${((SW / W) * 100 / ratio[i]).toFixed(3)}cqw, ${((SH / H) * 100 / 0.92).toFixed(3)}cqh)`; });
    const solo = ws.map((w) => parseFloat(getComputedStyle(w).fontSize));
    // the lockup: try every way to break the words into lines, keep the one that covers the most of the stage
    let best = null;
    for (let mask = 0; mask < 1 << (n - 1); mask++) {
      const lines = [[0]]; for (let i = 1; i < n; i++) { if ((mask >> (i - 1)) & 1) lines.push([i]); else lines[lines.length - 1].push(i); }
      const rs = lines.map((l) => l.reduce((s, i) => s + ratio[i], 0) + GAP * (l.length - 1)), inv = rs.reduce((s, r) => s + 1 / r, 0);
      const wl = Math.min(SW, SH / (LH * inv)), area = wl * wl * LH * inv;
      if (!best || area > best.area * 1.001) best = {lines, rs, wl, area, h: wl * LH * inv};
    }
    const x0 = (SW - best.wl) / 2; let y = (SH - best.h) / 2;
    best.lines.forEach((l, k) => {
      const fs = best.wl / best.rs[k]; let x = x0;
      l.forEach((i) => { const wpx = ratio[i] * fs; lock[i] = {x: x + wpx / 2 - SW / 2, y: y + (fs * LH) / 2 - SH / 2, scale: fs / solo[i], line: k}; x += wpx + GAP * fs; });
      y += fs * LH;
    });
    rule.style.left = x0 + 'px'; rule.style.top = Math.min(SH + (el.clientHeight - stage.offsetTop - SH) * 0.5, y + SH * 0.035) + 'px';
    return true;
  }
  function make() {
    if (tl) tl.kill();
    g.set([...ws, ...el.querySelectorAll('.m, .g, .kk, .cs-rule')], {clearProps: 'transform,opacity,clipPath,color,letterSpacing,fontWeight,x,y,scale,xPercent,yPercent'});
    lay();
    const thin = parseInt(getComputedStyle(ws[0] || el).fontWeight, 10) || 200, gold = getComputedStyle(el).getPropertyValue('--gold2').trim() || '#F2B45A';
    g.set(ws, {xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, opacity: 0});
    tl = g.timeline({paused: true});
    if (q('.kk')) tl.fromTo(q('.kk'), {opacity: 0, x: -18}, {opacity: 1, x: 0, duration: 0.5, ease: 'power3.out'}, 0);
    const slot = cx.clamp(2.3 / n, 0.5, 0.7), di = Math.min(0.46, slot * 0.74), S0 = 0.05, TL = S0 + slot * n;
    ws.forEach((w, k) => {
      const m = w.querySelector('.m'), gl = w.querySelector('.g'), S = S0 + slot * k, O = S + slot - 0.03, last = k === n - 1, kind = k % 4;
      tl.set(w, {opacity: 1}, S);
      // in
      if (kind === 0) { tl.fromTo(gl, {yPercent: 140}, {yPercent: 0, duration: di, ease: 'expo.out'}, S); tl.fromTo(gl, {letterSpacing: '0.1em'}, {letterSpacing: '-0.04em', duration: slot, ease: 'power2.out'}, S); }
      else if (kind === 1) { tl.fromTo(m, {clipPath: 'inset(0% 100% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: di, ease: 'power3.inOut'}, S); tl.fromTo(gl, {xPercent: -5}, {xPercent: 0, duration: slot, ease: 'power2.out'}, S); }
      else if (kind === 2) { tl.fromTo(gl, {opacity: 0}, {opacity: 1, duration: 0.14, ease: 'none'}, S); tl.fromTo(gl, {scale: 1.16, fontWeight: 700}, {scale: 1, fontWeight: thin, duration: di + 0.1, ease: 'expo.out'}, S); }
      else tl.fromTo(gl, {yPercent: -140}, {yPercent: 0, duration: di, ease: 'expo.out'}, S);
      if (last) { tl.to(w, {x: lock[k].x, y: lock[k].y, scale: lock[k].scale, duration: 0.42, ease: 'expo.inOut'}, TL - 0.06); return; }
      // out, then wait at its place in the lockup and rise there
      if (kind === 0) tl.to(gl, {yPercent: -140, duration: 0.2, ease: 'power2.in'}, O);
      else if (kind === 1) tl.to(m, {clipPath: 'inset(0% 0% 0% 100%)', duration: 0.2, ease: 'power2.in'}, O);
      else if (kind === 2) tl.to(gl, {opacity: 0, scale: 0.94, duration: 0.18, ease: 'power1.in'}, O);
      else tl.to(gl, {yPercent: 140, duration: 0.2, ease: 'power2.in'}, O);
      tl.set(w, {opacity: 0}, O + 0.21);
      const R = TL + 0.15 + 0.05 * lock[k].line;
      tl.set(w, {x: lock[k].x, y: lock[k].y, scale: lock[k].scale}, TL);
      tl.set(m, {clipPath: 'inset(0% 0% 0% 0%)'}, TL);
      tl.set(w, {opacity: 1}, R);
      tl.fromTo(gl, {yPercent: 140, opacity: 1, scale: 1, xPercent: 0}, {yPercent: 0, opacity: 1, scale: 1, xPercent: 0, duration: 0.42, ease: 'expo.out', immediateRender: false}, R);
    });
    if (gi >= 0 && ws[gi]) tl.to(ws[gi].querySelector('.g'), {color: gold, duration: 0.3, ease: 'power1.out'}, TL + 0.3);
    tl.fromTo(rule, {scaleX: 0}, {scaleX: 1, duration: 0.5, ease: 'power3.out'}, TL + 0.12);
    tl.to({}, {duration: 0.01}, TL + 0.61);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); }};
}

CS.register("gsap/kinetic-type", __mount, typeof css === "string" ? css : "", {"kind":"gsap/kinetic-type","title":"Kinetic type, full screen","use":"statement","family":"kinetic-lockup","lead":"type","site":null,"dur":3,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/lesson-map */
(function(){
// GSAP DrawSVG + MotionPath: a wide road with a gold centre line is drawn across the whole screen, and four to seven stops
// (a picture card + lesson, title, tool) light up one after another as the line arrives. One stop is "now" and is gold.
// On a slide two stops come per click; on a web page the screen stays pinned and the scroll draws the road. On a phone the road runs down the side.
const css = `
.b-gsap-lesson-map .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.4 + var(--top)) calc(var(--pad) * 0.6) calc(var(--pad) * 0.34); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); }
.b-gsap-lesson-map .hd { flex: none; display: flex; align-items: baseline; gap: calc(var(--gap) * 0.7); }
.b-gsap-lesson-map .hd .hr { flex: 1; height: 1px; background: var(--line); align-self: center; transform-origin: 0 50%; display: block; }
.b-gsap-lesson-map .ttl { font-size: calc(var(--lead) * 0.95); font-weight: var(--thin); letter-spacing: -0.02em; color: var(--ink); line-height: 1.1; }
.b-gsap-lesson-map .map { position: relative; flex: 1 1 auto; min-height: 0; }
.b-gsap-lesson-map .map svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.b-gsap-lesson-map svg path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.b-gsap-lesson-map .edge { stroke: color-mix(in srgb, var(--ivory) 34%, var(--bg)); }
.b-gsap-lesson-map .bed { stroke: color-mix(in srgb, var(--ivory) 10%, var(--bg)); }
.b-gsap-lesson-map .lane { stroke: color-mix(in srgb, var(--ivory) 40%, transparent); stroke-linecap: butt; }
.b-gsap-lesson-map .gold { stroke: var(--gold); opacity: 0; }
.b-gsap-lesson-map .dot { fill: var(--bg); stroke: var(--gold2); }
.b-gsap-lesson-map .core { fill: var(--gold2); }
.b-gsap-lesson-map .halo { fill: none; stroke: var(--gold2); }
.b-gsap-lesson-map .runner { fill: var(--ink); opacity: 0; }
.b-gsap-lesson-map .sts { position: absolute; inset: 0; }
.b-gsap-lesson-map .st { position: absolute; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.26); }
.b-gsap-lesson-map .st.up { flex-direction: column-reverse; }
.b-gsap-lesson-map .pic { position: relative; flex: none; height: var(--th, 8em); border-radius: calc(var(--radius) * 0.8); overflow: hidden; background: var(--bg2); border: 1px solid var(--line); }
.b-gsap-lesson-map .pic .in { position: absolute; inset: 0; display: grid; place-items: center; }
.b-gsap-lesson-map .pic img { width: 100%; height: 100%; object-fit: cover; }
.b-gsap-lesson-map .pic .no { height: 62%; aspect-ratio: 1; border-radius: 50%; border: 1px solid var(--gold); display: grid; place-items: center; font-size: calc(var(--lead) * 1.05); font-weight: var(--thin); color: var(--ink); letter-spacing: -0.03em; line-height: 1; }
.b-gsap-lesson-map .pic .ring { position: absolute; inset: 0; border-radius: inherit; border: 1px solid color-mix(in srgb, var(--ivory) 50%, transparent); }
.b-gsap-lesson-map .st.now .pic .ring { border: calc(var(--label) * 0.13) solid var(--gold2); }
.b-gsap-lesson-map .lb { display: flex; flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.1); min-width: 0; padding: 0 0.1em; }
.b-gsap-lesson-map .wh { font-size: var(--label); font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold2); line-height: 1.3; white-space: nowrap; }
.b-gsap-lesson-map .st.now .wh { background: var(--gold2); color: var(--bg); font-weight: 500; padding: 0.1em 0.6em 0.1em 0.8em; border-radius: 999px; margin-bottom: 0.15em; }
.b-gsap-lesson-map .t { font-size: calc(var(--lead) * 0.62); color: var(--ink); line-height: 1.13; letter-spacing: -0.012em; text-wrap: balance; }
.b-gsap-lesson-map .tool { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: var(--label); color: var(--dim); line-height: 1.3; }
.cs-frame[data-stage="site"][data-shape="wide"] .b-gsap-lesson-map .t { font-size: calc(var(--lead) * 0.72); }
.cs-frame[data-stage="site"][data-shape="wide"] .b-gsap-lesson-map .tool { font-size: var(--label); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .wrap { padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.5); gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .hd { flex-direction: column; align-items: flex-start; gap: 0.35em; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .hd .hr { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .ttl { font-size: calc(var(--lead) * 1.3); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .st, .cs-frame[data-shape="tall"] .b-gsap-lesson-map .st.up { display: grid; grid-template-columns: 37% 1fr; column-gap: calc(var(--gap) * 0.7); align-items: center; translate: 0 -50%; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .pic { height: auto; aspect-ratio: 16 / 10; border-radius: calc(var(--radius) * 0.6); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .pic .no { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .t { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .wh, .cs-frame[data-shape="tall"] .b-gsap-lesson-map .tool { font-size: calc(var(--label) * 0.92); }
`;
const __mount = function mount(el, p, cx) {
  cx.plugin('DrawSVGPlugin', 'MotionPathPlugin');
  const g = cx.gsap, tall = cx.shape === 'tall';
  const stops = (p.stops || []).slice(0, 7).map((s) => (typeof s === 'string' ? {title: s} : s)), n = stops.length;
  const now = p.now == null ? -1 : (p.now | 0) - 1, click = p.click !== false;
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}<i class="hr" aria-hidden="true"></i>${p.title ? `<h2 class="ttl">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="map">
      <svg aria-hidden="true"><path class="edge"/><path class="bed"/><path class="lane"/><path class="gold"/>${stops.map(() => '<g class="nd"><circle class="halo"/><circle class="dot"/><circle class="core"/></g>').join('')}<circle class="runner"/></svg>
      <ol class="sts">${stops.map((s, i) => `<li class="st ${i % 2 ? 'dn' : 'up'}${i === now ? ' now' : ''}">
        <div class="pic"><div class="in">${s.src ? `<img src="${cx.esc(s.src)}" alt="${cx.esc(s.alt || s.title || 'Picture of this stop')}">` : `<span class="no cs-num">${String(i + 1).padStart(2, '0')}</span>`}</div><i class="ring" aria-hidden="true"></i></div>
        <div class="lb">${s.when ? `<span class="wh">${cx.esc(s.when)}</span>` : ''}<span class="t">${cx.esc(s.title || '')}</span>${s.tool ? `<span class="tool">${cx.esc(s.tool)}</span>` : ''}</div>
      </li>`).join('')}</ol>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const map = q('.map'), sts = qa('.st'), edge = q('.edge'), bed = q('.bed'), lane = q('.lane'), gold = q('.gold'), runner = q('.runner'), nds = qa('.nd');
  let tl = null, draw = null, run = null, cur = 0, frac = [];
  // the map is laid out in real pixels of the frame: cards above and below a road band (wide), or a list beside the road (tall)
  function lay() {
    const W = map.clientWidth, H = map.clientHeight; if (!W || !H || !n) return false;
    const pts = [], ox = map.offsetLeft, oy = map.offsetTop;
    let rw, d;
    const set = (pt) => { gold.setAttribute('d', d); frac.push(gold.getTotalLength()); pts.push(pt); };
    frac = [];
    if (!tall) {
      const k = 1.7, P = n > 1 ? W / (n - 1 + k) : W, w = n > 1 ? P * k : W * 0.5, gap = parseFloat(getComputedStyle(sts[0]).rowGap) || 0;
      sts.forEach((st, i) => { st.style.width = w + 'px'; st.style.left = (n > 1 ? i * P : W * 0.25) + 'px'; st.style.top = st.style.bottom = 'auto'; });
      const lbH = (odd) => Math.max(0, ...sts.filter((_, i) => (i % 2 === 1) === odd).map((st) => st.querySelector('.lb').offsetHeight));
      const up = lbH(false), dn = lbH(true);
      rw = cx.clamp(H * 0.052, 14, 56);
      const band = rw * 3.3;
      const th = Math.max(40, Math.min(w * 9 / 16, (H - band - up - dn - 2 * gap) / 2));
      const top = Math.max(0, (H - (2 * th + band + up + dn + 2 * gap)) / 2) + up + gap + th, cy = top + band / 2, amp = band / 2 - rw * 0.72;
      map.style.setProperty('--th', th + 'px');
      sts.forEach((st, i) => { if (i % 2) st.style.top = top + band + 'px'; else st.style.bottom = H - top + 'px'; });
      const X = (i) => (n > 1 ? i * P : W * 0.25) + w / 2, Y = (i) => cy + (i % 2 ? amp : -amp);
      const seg = (ax, ay, bx, by) => ` C${(ax + bx) / 2} ${ay} ${(ax + bx) / 2} ${by} ${bx} ${by}`;
      let px = -ox - rw * 2, py = cy + amp * 0.9;
      d = `M${px} ${py}`;
      for (let i = 0; i < n; i++) { d += seg(px, py, X(i), Y(i)); px = X(i); py = Y(i); set({x: px, y: py}); }
      d += seg(px, py, W + ox + rw * 2, cy + (n % 2 ? amp : -amp) * 0.9);
    } else {
      const rc = W * 0.17, row = H / n; rw = cx.clamp(W * 0.062, 12, 30);
      sts.forEach((st, i) => { st.style.left = rc + rw * 0.9 + 'px'; st.style.width = W - rc - rw * 0.9 + 'px'; st.style.top = row * (i + 0.5) + 'px'; st.style.bottom = 'auto'; });
      const X = (i) => rc * (i % 2 ? 0.78 : 0.2), Y = (i) => row * (i + 0.5);
      const seg = (ax, ay, bx, by) => ` C${ax} ${(ay + by) / 2} ${bx} ${(ay + by) / 2} ${bx} ${by}`;
      let px = rc * 0.78, py = -row * 0.12;
      d = `M${px} ${py}`;
      for (let i = 0; i < n; i++) { d += seg(px, py, X(i), Y(i)); px = X(i); py = Y(i); set({x: px, y: py}); }
      d += seg(px, py, rc * (n % 2 ? 0.78 : 0.2), H + (el.clientHeight - oy - H) + rw * 2);
    }
    [edge, bed, lane, gold].forEach((e) => e.setAttribute('d', d));
    const total = gold.getTotalLength() || 1; frac = frac.map((f) => f / total);
    edge.setAttribute('stroke-width', rw + Math.max(2, rw * 0.09)); bed.setAttribute('stroke-width', rw);
    lane.setAttribute('stroke-width', Math.max(1.5, rw * 0.055)); lane.setAttribute('stroke-dasharray', `${rw * 0.42} ${rw * 0.5}`);
    gold.setAttribute('stroke-width', Math.max(3, rw * 0.15)); runner.setAttribute('r', Math.max(4, rw * 0.2));
    nds.forEach((nd, i) => {
      const [halo, dot, core] = nd.children, r = rw * 0.3;
      [halo, dot, core].forEach((c) => { c.setAttribute('cx', pts[i].x); c.setAttribute('cy', pts[i].y); });
      dot.setAttribute('r', r); dot.setAttribute('stroke-width', Math.max(1.5, rw * 0.06)); core.setAttribute('r', r * (i === now ? 1 : 0.56));
      halo.setAttribute('r', r * 1.75); halo.setAttribute('stroke-width', Math.max(1.5, rw * 0.06));
    });
    return true;
  }
  function make() {
    if (tl) { tl.kill(); draw.kill(); run.kill(); }
    const anim = [edge, bed, lane, gold, runner, ...qa('.hd > *, .pic, .pic .in, .pic .ring, .lb > *, .dot, .core, .halo')];
    g.set(anim, {clearProps: 'all'});
    lay();
    tl = g.timeline({paused: true});
    const head = qa('.hd > *:not(.hr)');
    if (head.length) tl.fromTo(head, {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08}, 0);
    if (q('.hr')) tl.fromTo(q('.hr'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'power3.inOut'}, 0.1);
    // the empty map first: road bed, lane marks, card outlines, stop dots
    tl.fromTo([edge, bed], {opacity: 0}, {opacity: 1, duration: 0.05}, 0.1);
    tl.fromTo([edge, bed], {drawSVG: '0%'}, {drawSVG: '100%', duration: 0.85, ease: 'power2.inOut'}, 0.1);
    tl.fromTo(lane, {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out'}, 0.7);
    tl.fromTo(qa('.pic'), {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06}, 0.2);
    tl.fromTo(qa('.dot'), {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.06}, 0.4);
    g.set(qa('.core, .halo'), {opacity: 0, scale: 0, transformOrigin: '50% 50%'});
    g.set(qa('.pic .ring'), {opacity: 0});
    // the gold line and the runner are two paused tweens; the timeline moves their progress stop by stop
    draw = g.fromTo(gold, {drawSVG: '0%'}, {drawSVG: '100%', duration: 1, ease: 'none', paused: true});
    run = g.to(runner, {motionPath: {path: gold, align: gold, alignOrigin: [0.5, 0.5]}, duration: 1, ease: 'none', paused: true});
    let T = 0.8, f0 = 0, step = 0;
    tl.fromTo([gold, runner], {opacity: 0}, {opacity: 1, duration: 0.15}, T - 0.05);
    for (let a = 0; a < n; a += 2) {
      const grp = [a, a + 1].filter((j) => j < n), f1 = frac[grp[grp.length - 1]] || 1, d = 0.45 * grp.length + (a === 0 ? 0.2 : 0);
      tl.to([draw, run], {progress: f1, duration: d, ease: 'none'}, T);
      grp.forEach((j) => {
        const at = T + d * ((frac[j] - f0) / Math.max(1e-6, f1 - f0)), st = sts[j], up = !tall && j % 2 === 0;
        tl.fromTo(st.querySelector('.in'), {clipPath: tall ? 'inset(0% 100% 0% 0%)' : up ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', scale: 1.12}, {clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.7, ease: 'power3.out'}, at - 0.08);
        tl.to(st.querySelector('.ring'), {opacity: 1, duration: 0.4, ease: 'power1.out'}, at);
        tl.fromTo(st.querySelectorAll('.lb > *'), {opacity: 0, x: tall ? 16 : 0, y: tall ? 0 : up ? -14 : 14}, {opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07}, at + 0.08);
        tl.to(nds[j].querySelector('.core'), {opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.4)'}, at - 0.02);
        if (j === now) tl.to(nds[j].querySelector('.halo'), {opacity: 0.85, scale: 1, duration: 0.6, ease: 'power3.out'}, at + 0.05);
      });
      T += d + 0.7; f0 = f1;
      if (a + 2 < n) { if (click && step < 3) tl.addLabel('step' + ++step, T - 0.05); }
      else { tl.to([draw, run], {progress: 1, duration: 0.6, ease: 'power1.in'}, T - 0.65); tl.to(runner, {opacity: 0, duration: 0.2}, T - 0.2); }
    }
    tl.to({}, {duration: 0.01}, T - 0.01);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  const steps = Object.keys(tl.labels).map((k) => tl.labels[k]).sort((a, b) => a - b);
  return {lib: 'gsap', dur: tl.duration(), steps, seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); draw.kill(); run.kill(); }};
}

CS.register("gsap/lesson-map", __mount, typeof css === "string" ? css : "", {"kind":"gsap/lesson-map","title":"Lesson map","use":"timeline","family":"road-map-cards","lead":"picture","site":{"mode":"scrub","len":3},"dur":5.8,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["DrawSVGPlugin","MotionPathPlugin"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/line-chart */
(function(){
// GSAP DrawSVG: a thick gold line is drawn from the left over thin grid lines, a dot lands on every value as the line arrives,
// and the very large number beside the title follows the line: it shows the value the line has reached, and ends on the last one.
let uid = 0;
const css = `
.b-gsap-line-chart .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.74 + var(--top)) calc(var(--pad) * 0.7) calc(var(--pad) * 0.4); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); }
.b-gsap-line-chart .top { flex: none; display: flex; justify-content: space-between; align-items: flex-end; gap: var(--gap); }
.b-gsap-line-chart .hd { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); min-width: 0; padding-bottom: calc(var(--gap) * 0.3); }
.b-gsap-line-chart .hd .cs-title { font-size: calc(var(--title) * 0.62); max-width: 13em; }
.b-gsap-line-chart .big { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: calc(var(--gap) * 0.28); }
.b-gsap-line-chart .row { display: flex; align-items: baseline; gap: 0.07em; font-size: calc(var(--hero) * 1.22); line-height: 0.8; }
.b-gsap-line-chart .v { font-weight: var(--thin); letter-spacing: -0.05em; color: var(--ink); }
.b-gsap-line-chart .u { font-size: calc(var(--title) * 0.6); font-weight: var(--thin); letter-spacing: -0.02em; color: var(--gold2); line-height: 1; }
.b-gsap-line-chart .at { color: var(--ivory); white-space: nowrap; }
.b-gsap-line-chart .big .cs-rule { width: 100%; transform-origin: 100% 50%; }
.b-gsap-line-chart .plot { position: relative; flex: 1 1 auto; min-height: 0; }
.b-gsap-line-chart .plot svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; }
.b-gsap-line-chart .grid line { stroke: var(--line); stroke-width: 1px; }
.b-gsap-line-chart .grid line.base { stroke: color-mix(in srgb, var(--ivory) 46%, transparent); }
.b-gsap-line-chart .ln { fill: none; stroke: var(--gold); stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
.b-gsap-line-chart .lead { stroke: var(--gold2); stroke-dasharray: 3 7; stroke-linecap: round; }
.b-gsap-line-chart .pt { fill: var(--bg); stroke: var(--gold2); }
.b-gsap-line-chart .pt.last { fill: var(--gold2); }
.b-gsap-line-chart .halo { fill: none; stroke: var(--gold2); }
.b-gsap-line-chart .yl span, .b-gsap-line-chart .xl span { position: absolute; white-space: nowrap; font-size: var(--label); line-height: 1.2; color: var(--dim); }
.b-gsap-line-chart .yl span { translate: -100% -50%; }
.b-gsap-line-chart .xl span { translate: -50% 0; letter-spacing: 0.14em; text-transform: uppercase; }
.b-gsap-line-chart .xl span.last { color: var(--gold2); }
.b-gsap-line-chart .many .xl span { font-size: calc(var(--label) * 0.8); letter-spacing: 0.06em; }
.b-gsap-line-chart .note { flex: none; font-size: calc(var(--body) * 0.72); color: var(--dim); line-height: 1.3; }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .wrap { padding: calc(var(--pad) * 0.9 + var(--top)) var(--pad) calc(var(--pad) * 0.8); gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .top { flex-direction: column; align-items: stretch; gap: calc(var(--gap) * 1.2); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .hd .cs-title { font-size: calc(var(--title) * 0.86); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .big { align-items: flex-start; }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .row { font-size: calc(var(--hero) * 1.9); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .u { font-size: calc(var(--title) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .big .cs-rule { transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .note { font-size: calc(var(--body) * 0.95); }
.cs-frame[data-shape="tall"] .b-gsap-line-chart .xl span { writing-mode: vertical-rl; rotate: 180deg; translate: -50% 0; letter-spacing: 0.1em; }
`;
// a smooth line that never overshoots a value (monotone cubic)
function curve(P) {
  const n = P.length; if (n < 3) return P.map((q, i) => (i ? 'L' : 'M') + q.x + ' ' + q.y).join(' ');
  const dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = P[i + 1].x - P[i].x; m[i] = (P[i + 1].y - P[i].y) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${P[0].x} ${P[0].y}`;
  for (let i = 0; i < n - 1; i++) d += ` C${P[i].x + dx[i] / 3} ${P[i].y + (t[i] * dx[i]) / 3} ${P[i + 1].x - dx[i] / 3} ${P[i + 1].y - (t[i + 1] * dx[i]) / 3} ${P[i + 1].x} ${P[i + 1].y}`;
  return d;
}
const __mount = function mount(el, p, cx) {
  cx.plugin('DrawSVGPlugin');
  const g = cx.gsap, tall = cx.shape === 'tall', id = 'b-lc-' + ++uid;
  const pts = (p.points || []).slice(0, 8).map((q) => ({label: String(q.label == null ? '' : q.label), value: Number(q.value) || 0})), n = pts.length;
  const dec = Math.max(0, p.decimals | 0), fmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  // 3-4 grid lines on round numbers
  const top = Math.max(1e-9, ...pts.map((q) => q.value)), raw = top / 3, pow = Math.pow(10, Math.floor(Math.log10(raw))), unit = [1, 2, 2.5, 5, 10].find((u) => u * pow >= raw) * pow;
  const max = Math.ceil(top / unit - 1e-9) * unit, ticks = []; for (let v = 0; v <= max + 1e-9; v += unit) ticks.push(v);
  const tdec = Math.max(dec, unit < 1 ? Math.ceil(-Math.log10(unit)) : 0), tfmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: tdec, maximumFractionDigits: tdec});
  el.innerHTML = `<div class="wrap">
    <div class="top">
      <div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>
      <div class="big"><div class="row"><span class="v cs-num">${fmt(pts[0] ? pts[0].value : 0)}</span>${p.unit ? `<span class="u">${cx.esc(p.unit)}</span>` : ''}</div><div class="at cs-label">${cx.esc(pts[0] ? pts[0].label : '')}</div><i class="cs-rule" aria-hidden="true"></i></div>
    </div>
    <div class="plot${n > 6 ? ' many' : ''}">
      <svg aria-hidden="true"><defs><linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="0" x2="0"><stop offset="0" style="stop-color:var(--gold);stop-opacity:0.34"/><stop offset="1" style="stop-color:var(--gold);stop-opacity:0"/></linearGradient><clipPath id="${id}-c"><rect x="0" y="-50" width="0" height="10"/></clipPath></defs>
        <g class="grid">${ticks.map((v, i) => `<line${i ? '' : ' class="base"'}/>`).join('')}</g>
        <path class="area" fill="url(#${id}-g)" clip-path="url(#${id}-c)"/><line class="lead"/><path class="ln"/>
        <circle class="halo"/>${pts.map((q, i) => `<circle class="pt${i === n - 1 ? ' last' : ''}"/>`).join('')}</svg>
      <div class="yl cs-num" aria-hidden="true">${ticks.map((v) => `<span>${tfmt(v)}</span>`).join('')}</div>
      <div class="xl">${pts.map((q, i) => `<span${i === n - 1 ? ' class="last"' : ''}>${cx.esc(q.label)}</span>`).join('')}</div>
    </div>
    ${p.note ? `<p class="note">${cx.esc(p.note)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const plot = q('.plot'), ln = q('.ln'), area = q('.area'), lead = q('.lead'), halo = q('.halo'), dots = qa('.pt'), grid = qa('.grid line'), yl = qa('.yl span'), xl = qa('.xl span'), clip = q('clipPath rect'), grad = q('linearGradient'), vEl = q('.v'), atEl = q('.at');
  const T0 = 0.75, D = 1.5, ease = g.parseEase('sine.inOut');
  let tl = null, cur = 0, total = 1, lens = [], X0 = 0, lw = 4, shown = -1;
  function lay() {
    const W = plot.clientWidth, H = plot.clientHeight; if (!W || !H || !n) return;
    const fs = parseFloat(getComputedStyle(xl[0]).fontSize) || 16;
    lw = cx.clamp(Math.min(W * 0.0045, H * 0.014), 3, 9); const r = lw * 1.5;
    const xw = (e) => (tall ? e.offsetHeight : e.offsetWidth), ylW = Math.max(0, ...yl.map((e) => e.offsetWidth));
    const L = tall ? ylW + fs * 0.9 : Math.max(ylW + fs * 0.9, xl[0].offsetWidth / 2), R = tall ? r * 2.4 : Math.max(xl[n - 1].offsetWidth / 2, r * 2.4);
    const B = (tall ? Math.max(...xl.map(xw)) : xl[0].offsetHeight) + fs * 0.9, T = r * 2.6, y0 = H - B;
    const X = (i) => L + (n > 1 ? ((W - L - R) * i) / (n - 1) : (W - L - R) / 2), Y = (v) => T + (y0 - T) * (1 - v / max);
    const P = pts.map((pt, i) => ({x: X(i), y: Y(pt.value)}));
    const d = p.smooth === false ? P.map((a, i) => (i ? 'L' : 'M') + a.x + ' ' + a.y).join(' ') : curve(P);
    ln.setAttribute('d', d); ln.setAttribute('stroke-width', lw);
    area.setAttribute('d', `${d} L${P[n - 1].x} ${y0} L${P[0].x} ${y0} Z`);
    grad.setAttribute('y1', T); grad.setAttribute('y2', y0);
    clip.setAttribute('x', P[0].x - lw); clip.setAttribute('y', 0); clip.setAttribute('height', H); X0 = P[0].x - lw;
    grid.forEach((e, i) => { const y = Y(ticks[i]); e.setAttribute('x1', L - fs * 0.4); e.setAttribute('x2', W); e.setAttribute('y1', y); e.setAttribute('y2', y); yl[i].style.left = L - fs * 0.8 + 'px'; yl[i].style.top = y + 'px'; });
    xl.forEach((e, i) => { e.style.left = P[i].x + 'px'; e.style.top = y0 + fs * 0.7 + 'px'; });
    dots.forEach((c, i) => { c.setAttribute('cx', P[i].x); c.setAttribute('cy', P[i].y); c.setAttribute('r', i === n - 1 ? r * 1.25 : r); c.setAttribute('stroke-width', Math.max(1.5, lw * 0.45)); });
    halo.setAttribute('cx', P[n - 1].x); halo.setAttribute('cy', P[n - 1].y); halo.setAttribute('r', r * 2.6); halo.setAttribute('stroke-width', Math.max(1.5, lw * 0.35));
    lead.setAttribute('x1', P[n - 1].x); lead.setAttribute('x2', P[n - 1].x); lead.setAttribute('y1', P[n - 1].y - r * 3.2); lead.setAttribute('y2', -fs * 0.4); lead.setAttribute('stroke-width', Math.max(1.5, lw * 0.3));
    // how far along the line each value sits (the dots and the big number follow the drawing)
    total = ln.getTotalLength() || 1;
    lens = P.map((a) => { let lo = 0, hi = total; for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (ln.getPointAtLength(mid).x < a.x) lo = mid; else hi = mid; } return hi; });
    lens[0] = 0; lens[n - 1] = total;
  }
  function sync(t) {
    const pr = ease(cx.clamp((t - T0) / D, 0, 1)), len = total * pr;
    clip.setAttribute('width', Math.max(0, ln.getPointAtLength(len).x - X0 + (pr >= 1 ? lw * 2 : 0)));
    let k = 0; for (let i = 0; i < n; i++) if (lens[i] <= len + 0.5) k = i;
    if (k !== shown) { shown = k; vEl.textContent = fmt(pts[k].value); atEl.textContent = pts[k].label; }
  }
  function make() {
    if (tl) tl.kill();
    g.set([ln, lead, halo, ...dots, ...grid, ...yl, ...xl, ...qa('.hd > *, .big > *, .note')], {clearProps: 'opacity,transform,scale,x,y,strokeDasharray,strokeDashoffset'});
    lay();
    tl = g.timeline({paused: true});
    const head = qa('.hd > *');
    if (head.length) tl.fromTo(head, {opacity: 0, y: 22}, {opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.1}, 0);
    tl.fromTo(grid, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.8, ease: 'power3.inOut', stagger: 0.06}, 0.1);
    tl.fromTo(yl, {opacity: 0}, {opacity: 1, duration: 0.4, stagger: 0.06}, 0.25);
    tl.fromTo(xl, {opacity: 0}, {opacity: 1, duration: 0.4, stagger: 0.05}, 0.35);
    tl.fromTo(qa('.big .row, .big .at'), {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08}, 0.4);
    tl.fromTo(ln, {opacity: 0}, {opacity: 1, duration: 0.05}, T0 - 0.05);
    tl.fromTo(ln, {drawSVG: '0%'}, {drawSVG: '100%', duration: D, ease: 'sine.inOut'}, T0);
    dots.forEach((c, i) => {
      const at = T0 + (D * Math.acos(1 - 2 * cx.clamp(lens[i] / total, 0, 1))) / Math.PI;
      tl.fromTo(c, {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.6)'}, Math.max(0.3, at - 0.06));
    });
    tl.fromTo(halo, {opacity: 0, scale: 0.3, transformOrigin: '50% 50%'}, {opacity: 0.9, scale: 1, duration: 0.6, ease: 'power3.out'}, T0 + D);
    tl.fromTo(lead, {opacity: 0}, {opacity: 1, duration: 0.05}, T0 + D);
    tl.fromTo(lead, {scaleY: 0, transformOrigin: '50% 100%'}, {scaleY: 1, duration: 0.55, ease: 'power3.out'}, T0 + D + 0.05);
    tl.fromTo(q('.big .cs-rule'), {scaleX: 0}, {scaleX: 1, duration: 0.6, ease: 'power3.out'}, T0 + D + 0.2);
    if (q('.note')) tl.fromTo(q('.note'), {opacity: 0}, {opacity: 1, duration: 0.5}, T0 + D);
    shown = -1; tl.time(Math.min(cur, tl.duration()), false); sync(cur);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); sync(t); }, fit() { make(); }, dispose() { tl.kill(); }};
}

CS.register("gsap/line-chart", __mount, typeof css === "string" ? css : "", {"kind":"gsap/line-chart","title":"Line chart","use":"chart","family":"line-draw-chart","lead":"picture","site":null,"dur":3.1,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["DrawSVGPlugin"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/marquee-band */
(function(){
// GSAP: two tilted bands of large words run in opposite directions behind a quiet panel with one line of text.
const css = `
.b-gsap-marquee-band .bands { position: absolute; inset: 0; overflow: hidden; }
.b-gsap-marquee-band .band { position: absolute; left: -15%; width: 130%; transform: rotate(-5deg); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 0.16em 0; font-size: calc(var(--hero) * 0.78); overflow: hidden; }
.b-gsap-marquee-band .b1 { top: 13%; }
.b-gsap-marquee-band .b2 { bottom: 11%; }
.b-gsap-marquee-band .in { display: flex; align-items: center; width: max-content; white-space: nowrap; font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1; color: color-mix(in srgb, var(--ivory) 26%, transparent); }
.b-gsap-marquee-band .in i { display: block; flex: none; width: 0.5em; height: 2px; margin: 0 0.34em; background: var(--gold); }
.b-gsap-marquee-band .mid { position: absolute; inset: 0; display: grid; place-items: center; padding: var(--pad); }
.b-gsap-marquee-band .panel { display: flex; flex-direction: column; align-items: center; text-align: center; gap: calc(var(--gap) * 0.6); padding: calc(var(--gap) * 1.3) calc(var(--gap) * 1.9); background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius); max-width: 78%; }
.cs-frame[data-shape="tall"] .b-gsap-marquee-band .band { font-size: calc(var(--hero) * 1.05); left: -30%; width: 160%; }
.cs-frame[data-shape="tall"] .b-gsap-marquee-band .b1 { top: 14%; }
.cs-frame[data-shape="tall"] .b-gsap-marquee-band .b2 { bottom: 9%; }
.cs-frame[data-shape="tall"] .b-gsap-marquee-band .panel { max-width: 100%; padding: calc(var(--gap) * 1.4) calc(var(--gap) * 1.1); }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, words = (p.words && p.words.length ? p.words : String(p.title || '').split(/\s+/)).slice(0, 6).map(String);
  const run = (off) => Array.from({length: 4}, () => words.map((_, i) => `<span>${cx.esc(words[(i + off) % words.length])}</span><i></i>`).join('')).join('');
  el.innerHTML = `
    <div class="bands" aria-hidden="true" data-deco><div class="band b1"><div class="in">${run(0)}</div></div><div class="band b2"><div class="in">${run(Math.ceil(words.length / 2))}</div></div></div>
    <div class="mid"><div class="panel">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-title">${cx.esc(p.title)}</h2>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    </div></div>`;
  const q = (s) => el.querySelector(s), tl = g.timeline({paused: true}), D = 4;
  tl.fromTo(el.querySelectorAll('.band'), {opacity: 0}, {opacity: 1, duration: 0.7, ease: 'power1.out', stagger: 0.15}, 0);
  tl.fromTo(q('.b1 .in'), {xPercent: -2}, {xPercent: -24, duration: D, ease: 'none'}, 0);
  tl.fromTo(q('.b2 .in'), {xPercent: -30}, {xPercent: -8, duration: D, ease: 'none'}, 0);
  tl.fromTo(q('.panel'), {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out'}, 0.3);
  tl.fromTo(q('.panel').children, {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12}, 0.55);
  return cx.fromGsap(tl);
}

CS.register("gsap/marquee-band", __mount, typeof css === "string" ? css : "", {"kind":"gsap/marquee-band","title":"Marquee bands","use":"background","family":"tilted-marquee","lead":"type","site":{"mode":"scrub","len":1.5},"dur":4,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/morph-shapes */
(function(){
// GSAP MorphSVG: one thin outline changes shape at every step (play button, slide, browser window, cube, circle) and the label beside it changes with it.
const css = `
.b-gsap-morph-shapes .wrap { display: grid; grid-template-columns: 0.85fr 1.15fr; align-items: center; gap: calc(var(--gap) * 2); }
.b-gsap-morph-shapes svg { display: block; width: 100%; max-height: 62cqh; aspect-ratio: 1; overflow: visible; }
.b-gsap-morph-shapes svg path, .b-gsap-morph-shapes svg circle { fill: none; vector-effect: non-scaling-stroke; stroke-linejoin: round; stroke-linecap: round; }
.b-gsap-morph-shapes .out { stroke: var(--gold); stroke-width: 2.5px; }
.b-gsap-morph-shapes .det path { stroke: var(--ivory); stroke-width: 1.5px; }
.b-gsap-morph-shapes .det circle { fill: var(--ivory); stroke: none; }
.b-gsap-morph-shapes .txs { display: grid; }
.b-gsap-morph-shapes .tx { grid-area: 1 / 1; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.55); justify-content: center; }
.b-gsap-morph-shapes .ct { font-size: var(--label); letter-spacing: 0.26em; color: var(--gold2); }
.b-gsap-morph-shapes .ct b { font-weight: 400; color: var(--dim); }
.b-gsap-morph-shapes .cs-title { font-size: calc(var(--title) * 1.3); }
.b-gsap-morph-shapes .cs-lead { max-width: 17em; }
.b-gsap-morph-shapes .dots { display: flex; gap: 0.7em; margin-top: calc(var(--gap) * 0.6); font-size: var(--label); }
.b-gsap-morph-shapes .dots i { display: block; width: 2.4em; height: 2px; background: var(--line); }
.cs-frame[data-shape="tall"] .b-gsap-morph-shapes .wrap { grid-template-columns: 1fr; gap: var(--gap); }
.cs-frame[data-shape="tall"] .b-gsap-morph-shapes svg { max-height: 30cqh; width: auto; height: 30cqh; }
`;
const SHAPES = {
  play: {d: 'M62 42 L158 100 L62 158 Z', det: ''},
  slide: {d: 'M22 50 H178 V150 H22 Z', det: '<path d="M44 80 H112 M44 102 H142 M44 124 H96"/>'},
  browser: {d: 'M22 38 H178 V162 H22 Z', det: '<path d="M22 66 H178 M46 96 H118 M46 118 H154 M46 140 H100"/><circle cx="38" cy="52" r="3"/><circle cx="50" cy="52" r="3"/><circle cx="62" cy="52" r="3"/>'},
  cube: {d: 'M100 26 L166 63 V137 L100 174 L34 137 V63 Z', det: '<path d="M34 63 L100 100 L166 63 M100 100 V174"/>'},
  circle: {d: 'M100 28 C139.8 28 172 60.2 172 100 C172 139.8 139.8 172 100 172 C60.2 172 28 139.8 28 100 C28 60.2 60.2 28 100 28 Z', det: '<path d="M100 28 C76 52 76 148 100 172 M100 28 C124 52 124 148 100 172 M28 100 H172"/>'},
};
const __mount = function mount(el, p, cx) {
  cx.plugin('MorphSVGPlugin');
  const g = cx.gsap, stages = (p.stages || []).slice(0, 5).map((s) => ({...s, sh: SHAPES[s.shape] || SHAPES.circle})), n = stages.length;
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="wrap">
      <svg viewBox="0 0 200 200" aria-hidden="true"><path class="out" d="${stages[0].sh.d}"/>${stages.map((s) => `<g class="det">${s.sh.det}</g>`).join('')}</svg>
      <div>
        <div class="txs">${stages.map((s, i) => `<div class="tx"><div class="ct cs-num">${String(i + 1).padStart(2, '0')} <b>/ ${String(n).padStart(2, '0')}</b></div><h3 class="cs-title">${cx.esc(s.label)}</h3>${s.text ? `<p class="cs-lead">${cx.esc(s.text)}</p>` : ''}</div>`).join('')}</div>
        <div class="dots" aria-hidden="true">${stages.map(() => '<i></i>').join('')}</div>
      </div>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), out = q('.out'), dets = el.querySelectorAll('.det'), txs = el.querySelectorAll('.tx'), dots = el.querySelectorAll('.dots i');
  const gold = getComputedStyle(el).getPropertyValue('--gold2').trim() || '#F2B45A';
  const tl = g.timeline({paused: true});
  g.set(txs, {opacity: 0}); g.set(dets, {opacity: 0});
  if (q('.cs-kicker')) tl.fromTo(q('.cs-kicker'), {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0);
  tl.fromTo(q('svg'), {opacity: 0, scale: 0.86, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out'}, 0.1);
  tl.fromTo(txs[0], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 0.35);
  tl.to(dets[0], {opacity: 1, duration: 0.5, ease: 'power1.out'}, 0.6);
  tl.fromTo(q('.dots'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.5);
  tl.to(dots[0], {backgroundColor: gold, duration: 0.4}, 0.6);
  const first = 1.5, each = 1.7;
  for (let i = 1; i < n; i++) {
    const T = first + each * (i - 1);
    tl.addLabel('step' + i, T);
    tl.to(dets[i - 1], {opacity: 0, duration: 0.25, ease: 'power1.in'}, T);
    tl.to(txs[i - 1], {opacity: 0, y: -22, duration: 0.35, ease: 'power2.in'}, T);
    tl.to(out, {morphSVG: {shape: stages[i].sh.d}, duration: 0.9, ease: 'expo.inOut'}, T + 0.05);
    tl.fromTo(txs[i], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.65, ease: 'power3.out'}, T + 0.45);
    tl.to(dets[i], {opacity: 1, duration: 0.45, ease: 'power1.out'}, T + 0.75);
    tl.to(dots[i], {backgroundColor: gold, duration: 0.4}, T + 0.4);
  }
  tl.to({}, {duration: 0.01}, first + each * (n - 1) - 0.25);
  return cx.fromGsap(tl);
}

CS.register("gsap/morph-shapes", __mount, typeof css === "string" ? css : "", {"kind":"gsap/morph-shapes","title":"Morph shapes","use":"steps","family":"shape-morph","lead":"picture","site":null,"dur":6.4,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["MorphSVGPlugin"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/parallax-words */
(function(){
// GSAP: three rows of very large outlined words drift at different speeds behind one clear sentence.
const css = `
.b-gsap-parallax-words .rows { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: calc(var(--top) + 3.5cqh) 0 3.5cqh; overflow: hidden; }
.b-gsap-parallax-words .row { width: max-content; white-space: nowrap; font-size: calc(var(--hero) * 1.5); line-height: 1; font-weight: var(--light); letter-spacing: -0.02em; color: transparent; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1.5px var(--line); }
.b-gsap-parallax-words .row.g { -webkit-text-stroke-color: color-mix(in srgb, var(--gold) 60%, transparent); }
.b-gsap-parallax-words .row span { margin-right: 0.32em; }
.b-gsap-parallax-words .mid { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: var(--pad); }
.b-gsap-parallax-words .panel { display: flex; flex-direction: column; align-items: center; gap: calc(var(--gap) * 0.7); padding: 2.2em 3.2em; background: radial-gradient(closest-side, var(--bg) 58%, transparent 100%); }
.b-gsap-parallax-words .cs-title { font-size: calc(var(--title) * 1.18); max-width: 12em; }
.cs-frame[data-shape="tall"] .b-gsap-parallax-words .row { font-size: calc(var(--hero) * 1.7); }
.cs-frame[data-shape="tall"] .b-gsap-parallax-words .mid { padding: 0; }
.cs-frame[data-shape="tall"] .b-gsap-parallax-words .panel { width: 100%; padding: 3em var(--pad); background: linear-gradient(180deg, transparent 0%, var(--bg) 22%, var(--bg) 78%, transparent 100%); }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, words = (p.words && p.words.length ? p.words : ['Video', 'Slides', 'Web']).slice(0, 3);
  while (words.length < 3) words.push(words[words.length - 1]);
  const row = (w, cls) => `<div class="row ${cls}">${Array.from({length: 9}, () => `<span>${cx.esc(w)}</span>`).join('')}</div>`;
  el.innerHTML = `
    <div class="rows" aria-hidden="true" data-deco>${row(words[0], '')}${row(words[1], 'g')}${row(words[2], '')}</div>
    <div class="mid"><div class="panel">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <p class="cs-title">${cx.spans(p.text, 'cs-w')}</p>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    </div></div>`;
  const rows = el.querySelectorAll('.row'), tl = g.timeline({paused: true}), D = 4;
  tl.fromTo(rows, {opacity: 0}, {opacity: 1, duration: 0.8, ease: 'power1.out', stagger: 0.12}, 0);
  tl.fromTo(rows[0], {xPercent: -4}, {xPercent: -30, duration: D, ease: 'none'}, 0);
  tl.fromTo(rows[1], {xPercent: -38}, {xPercent: -10, duration: D, ease: 'none'}, 0);
  tl.fromTo(rows[2], {xPercent: -12}, {xPercent: -46, duration: D, ease: 'none'}, 0);
  if (el.querySelector('.cs-kicker')) tl.fromTo(el.querySelector('.cs-kicker'), {opacity: 0, letterSpacing: '0.6em'}, {opacity: 1, letterSpacing: '0.34em', duration: 0.8, ease: 'power3.out'}, 0.25);
  tl.fromTo(el.querySelectorAll('.cs-w'), {opacity: 0, yPercent: 70, filter: 'blur(12px)'}, {opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out', stagger: 0.07}, 0.4);
  if (el.querySelector('.cs-lead')) tl.fromTo(el.querySelector('.cs-lead'), {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 1.3);
  return cx.fromGsap(tl);
}

CS.register("gsap/parallax-words", __mount, typeof css === "string" ? css : "", {"kind":"gsap/parallax-words","title":"Parallax words","use":"statement","family":"outline-parallax","lead":"type","site":{"mode":"scrub","len":1.5},"dur":4,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/path-journey */
(function(){
// GSAP MotionPath + DrawSVG: a curved road is drawn, a dot travels along it, and each stop lights up with its label as the dot arrives.
const css = `
.b-gsap-path-journey .jr { position: relative; }
.b-gsap-path-journey .jr svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
.b-gsap-path-journey .ghost { fill: none; stroke: var(--line); stroke-width: 2px; stroke-dasharray: 2 9; stroke-linecap: round; }
.b-gsap-path-journey .road { fill: none; stroke: var(--gold); stroke-width: 3.5px; stroke-linecap: round; opacity: 0; }
.b-gsap-path-journey .stopdot { fill: var(--bg); stroke: var(--gold); stroke-width: 2px; }
.b-gsap-path-journey .runner { fill: var(--ink); }
.b-gsap-path-journey .stops { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); column-gap: calc(var(--gap) * 0.8); padding-top: calc(var(--title) * 2.1); }
.b-gsap-path-journey .st { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.3); }
.b-gsap-path-journey .wh { font-size: var(--label); letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold2); }
.b-gsap-path-journey .t { font-size: calc(var(--lead) * 1.08); color: var(--ink); line-height: 1.14; letter-spacing: -0.01em; }
.b-gsap-path-journey .d { font-size: var(--body); color: var(--dim); line-height: 1.34; }
.cs-frame[data-shape="tall"] .b-gsap-path-journey .stops { grid-auto-flow: row; grid-auto-columns: auto; row-gap: calc(var(--gap) * 1.05); padding-top: 0; padding-left: calc(var(--title) * 1.9); }
`;
const __mount = function mount(el, p, cx) {
  cx.plugin('MotionPathPlugin', 'DrawSVGPlugin');
  const g = cx.gsap, stops = (p.stops || []).slice(0, 6), n = stops.length, tall = cx.shape === 'tall';
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="jr">
      <svg aria-hidden="true"><path class="ghost"/><path class="road"/>${stops.map(() => '<circle class="stopdot" r="7"/>').join('')}<circle class="runner" r="9"/></svg>
      <ol class="stops">${stops.map((s) => `<li class="st">${s.when ? `<span class="wh">${cx.esc(s.when)}</span>` : ''}<span class="t">${cx.esc(s.title || s)}</span>${s.text ? `<span class="d">${cx.esc(s.text)}</span>` : ''}</li>`).join('')}</ol>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), jr = q('.jr'), svg = q('svg'), road = q('.road'), ghost = q('.ghost'), sts = [...el.querySelectorAll('.st')], dots = [...el.querySelectorAll('.stopdot')], runner = q('.runner');
  let tl = null, cur = 0;
  function make() {
    if (tl) tl.kill();
    g.set([road, runner, ghost, ...dots, ...sts, ...el.querySelectorAll('.cs-kicker, .cs-title')], {clearProps: 'all'});
    const W = jr.offsetWidth, H = jr.offsetHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const band = tall ? parseFloat(getComputedStyle(q('.stops')).paddingLeft) : parseFloat(getComputedStyle(q('.stops')).paddingTop);
    const pts = sts.map((st, i) => tall
      ? {x: band * (i % 2 ? 0.62 : 0.22), y: st.offsetTop + Math.min(st.offsetHeight / 2, band * 0.35)}
      : {x: st.offsetLeft + 10, y: band * (i % 2 ? 0.22 : 0.7)});
    const seg = (a, b) => tall ? `C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}` : `C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;
    let d = `M${pts[0].x} ${pts[0].y}`; const frac = [0];
    for (let i = 1; i < n; i++) { d += ' ' + seg(pts[i - 1], pts[i]); road.setAttribute('d', d); frac.push(road.getTotalLength()); }
    const total = frac[n - 1] || 1; for (let i = 0; i < n; i++) frac[i] /= total;
    ghost.setAttribute('d', d);
    const r = Math.max(4.5, Math.min(10, parseFloat(getComputedStyle(q('.t')).fontSize) * 0.17));
    dots.forEach((c, i) => { c.setAttribute('cx', pts[i].x); c.setAttribute('cy', pts[i].y); c.setAttribute('r', r); });
    runner.setAttribute('r', r * 1.3);
    const gold = getComputedStyle(el).getPropertyValue('--gold').trim() || '#D6892A';
    tl = g.timeline({paused: true});
    const head = el.querySelectorAll('.cs-kicker, .cs-title');
    if (head.length) tl.fromTo(head, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
    tl.fromTo(ghost, {opacity: 0}, {opacity: 1, duration: 0.6, ease: 'power1.out'}, 0.2);
    tl.fromTo(dots, {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.06}, 0.3);
    const t0 = 0.75, D = 0.75 * (n - 1) + 0.2;
    tl.set(road, {opacity: 1}, t0);
    tl.fromTo(road, {drawSVG: '0%'}, {drawSVG: '100%', duration: D, ease: 'none'}, t0);
    tl.fromTo(runner, {opacity: 0}, {opacity: 1, duration: 0.2}, t0 - 0.15);
    tl.to(runner, {motionPath: {path: road, align: road, alignOrigin: [0.5, 0.5]}, duration: D, ease: 'none'}, t0);
    sts.forEach((st, i) => {
      const at = t0 + D * frac[i];
      tl.fromTo(st, {opacity: 0, y: tall ? 0 : 18, x: tall ? 18 : 0}, {opacity: 1, y: 0, x: 0, duration: 0.6, ease: 'power3.out'}, Math.max(0.4, at - 0.12));
      tl.to(dots[i], {fill: gold, duration: 0.3, ease: 'power1.out'}, at);
    });
    tl.to(runner, {scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'power2.in'}, t0 + D + 0.1);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); }};
}

CS.register("gsap/path-journey", __mount, typeof css === "string" ? css : "", {"kind":"gsap/path-journey","title":"Path journey","use":"timeline","family":"road-stops","lead":"picture","site":null,"dur":4.4,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["MotionPathPlugin","DrawSVGPlugin"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/pin-showcase */
(function(){
// GSAP: a large media stage that stays in place while the pictures change. Every step wipes the next picture or clip in
// with a different mask, the one before sinks back, and the number, the title and the line beside it change with it.
// On a slide every click is one step; on a web page the screen stays pinned and the scroll moves through the pictures.
// A video item plays only while it is the one on show. Nothing is drawn on the pictures.
const css = `
.b-gsap-pin-showcase .stage { position: absolute; top: 0; bottom: 0; right: 0; width: 69%; overflow: hidden; background: #000; }
.b-gsap-pin-showcase .layer { position: absolute; inset: 0; overflow: hidden; will-change: clip-path, transform, opacity; }
.b-gsap-pin-showcase .layer > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; will-change: transform; }
.b-gsap-pin-showcase .side { position: absolute; top: var(--top); bottom: 0; left: 0; width: 31%; padding: calc(var(--pad) * 0.62) calc(var(--gap) * 0.9) calc(var(--pad) * 0.62) calc(var(--pad) * 0.56); display: flex; flex-direction: column; justify-content: space-between; gap: var(--gap); }
.b-gsap-pin-showcase .hd { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-gsap-pin-showcase .cs-kicker { letter-spacing: 0.3em; }
.b-gsap-pin-showcase .hd .t { font-size: calc(var(--body) * 0.9); color: var(--dim); line-height: 1.3; }
.b-gsap-pin-showcase .mid { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.6); }
.b-gsap-pin-showcase .numrow { display: flex; align-items: flex-end; gap: 0.5em; }
.b-gsap-pin-showcase .nums { display: grid; overflow: hidden; font-size: calc(var(--hero) * 1.2); line-height: 0.84; padding: 0.02em 0 0.04em; }
.b-gsap-pin-showcase .nb { grid-area: 1 / 1; font-weight: var(--thin); letter-spacing: -0.05em; color: var(--ink); }
.b-gsap-pin-showcase .of { font-size: calc(var(--label) * 1.1); letter-spacing: 0.2em; color: var(--gold2); padding-bottom: 0.7em; white-space: nowrap; }
.b-gsap-pin-showcase .bar { display: block; height: 1px; width: 100%; background: var(--gold); transform-origin: 0 50%; }
.b-gsap-pin-showcase .txs { display: grid; }
.b-gsap-pin-showcase .tx { grid-area: 1 / 1; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); align-self: start; }
.b-gsap-pin-showcase .tx .lb { font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold2); }
.b-gsap-pin-showcase .tx h3 { font-size: calc(var(--title) * 0.54); font-weight: var(--light); letter-spacing: -0.02em; line-height: 1.08; color: var(--ink); text-wrap: balance; }
.b-gsap-pin-showcase .tx p { font-size: calc(var(--body) * 0.86); line-height: 1.36; color: var(--dim); text-wrap: pretty; }
.b-gsap-pin-showcase .prog { display: flex; gap: calc(var(--gap) * 0.24); align-items: center; }
.b-gsap-pin-showcase .seg { flex: 1; height: 2px; background: var(--line); position: relative; overflow: hidden; }
.b-gsap-pin-showcase .seg i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.cs-frame[data-stage="deck"] .b-gsap-pin-showcase .cs-kicker, .cs-frame[data-stage="deck"] .b-gsap-pin-showcase .tx .lb { font-size: calc(var(--label) * 0.86); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .stage { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 72cqw; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .side { top: calc(72cqw + var(--top)); width: auto; right: 0; padding: calc(var(--pad) * 0.9) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .hd { order: -2; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .hd .t { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .prog { order: -1; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .nums { font-size: calc(var(--hero) * 1.3); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .tx h3 { font-size: calc(var(--title) * 0.8); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .tx p { font-size: var(--body); }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, items = (p.items || []).slice(0, 5), n = items.length, tall = cx.shape === 'tall';
  const isVid = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  const pos = (it) => (Array.isArray(it.face) ? `${Math.round((it.face[0] + it.face[2] / 2) * 100)}% ${Math.round(cx.clamp((it.face[1] + it.face[3] / 2) * 100 - 8, 0, 100))}%` : '50% 50%');
  const tag = (it) => (isVid(it.src)
    ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(it.alt || it.title || 'Video')}" style="object-position:${pos(it)}"></video>`
    : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || it.title || 'Picture')}" style="object-position:${pos(it)}">`);
  const two = (i) => String(i).padStart(2, '0');
  el.innerHTML = `
    <div class="stage">${items.map((it) => `<div class="layer" data-face-ok>${tag(it)}</div>`).join('')}</div>
    <div class="side">
      ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<p class="t">${cx.esc(p.title)}</p>` : ''}</div>` : '<span></span>'}
      <div class="mid">
        <div class="numrow"><div class="nums cs-num">${items.map((_, i) => `<span class="nb">${two(i + 1)}</span>`).join('')}</div><span class="of cs-num">/ ${two(n)}</span></div>
        <i class="bar" aria-hidden="true"></i>
        <div class="txs">${items.map((it) => `<div class="tx">${it.label ? `<div class="lb">${cx.esc(it.label)}</div>` : ''}<h3>${cx.esc(it.title || '')}</h3>${it.text ? `<p>${cx.esc(it.text)}</p>` : ''}</div>`).join('')}</div>
      </div>
      <div class="prog" aria-hidden="true">${items.map(() => '<span class="seg"><i></i></span>').join('')}</div>
    </div>`;
  const all = (s) => Array.from(el.querySelectorAll(s)), layers = all('.layer'), media = layers.map((l) => l.firstElementChild), nbs = all('.nb'), txs = all('.tx'), segs = all('.seg i');
  items.forEach((it, i) => { if (Array.isArray(it.face)) cx.face(media[i], it.face); if (Array.isArray(it.body)) cx.face(media[i], it.body, 'body'); });
  // one mask per step, never the same twice in a row: from the right, from below, a slanted edge, an opening circle
  const wipes = [
    ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'],
    ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
    ['polygon(130% 0%, 130% 0%, 100% 100%, 100% 100%)', 'polygon(-30% 0%, 130% 0%, 100% 100%, -60% 100%)'],
    ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'],
  ];
  const first = 1.6, each = 1.5, total = first + each * (n - 1);
  const starts = items.map((_, i) => (i ? first + each * (i - 1) : 0));
  const grow = (i) => (Array.isArray(items[i].face) ? 1 : 1.12);      // a person is never shown larger than the picture
  const tl = g.timeline({paused: true});
  g.set(layers.slice(1), {visibility: 'hidden'}); g.set(nbs, {opacity: 0}); g.set(txs, {opacity: 0});
  if (el.querySelector('.hd')) tl.fromTo(el.querySelector('.hd'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, 0.1);
  tl.fromTo(layers[0], {clipPath: 'inset(0% 100% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut'}, 0);
  tl.fromTo(media[0], {scale: grow(0)}, {scale: 1, duration: 1.6, ease: 'power3.out'}, 0);
  tl.fromTo(nbs[0], {opacity: 0, yPercent: 60}, {opacity: 1, yPercent: 0, duration: 0.8, ease: 'expo.out'}, 0.35);
  tl.fromTo(el.querySelector('.of'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.5);
  tl.fromTo(el.querySelector('.bar'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.out'}, 0.45);
  tl.fromTo(txs[0], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 0.55);
  tl.fromTo(el.querySelector('.prog'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.3);
  tl.to(segs[0], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, 0.5);
  for (let i = 1; i < n; i++) {
    const T = starts[i], w = wipes[(i - 1) % wipes.length];
    tl.addLabel('step' + i, T);
    tl.set(layers[i], {visibility: 'visible'}, T);
    tl.fromTo(layers[i], {clipPath: w[0]}, {clipPath: w[1], duration: 1.0, ease: 'expo.inOut'}, T);
    tl.fromTo(media[i], {scale: grow(i)}, {scale: 1, duration: 1.3, ease: 'power3.out'}, T + 0.1);
    tl.to(layers[i - 1], {scale: 0.9, opacity: 0.3, duration: 0.95, ease: 'power2.inOut'}, T);
    tl.set(layers[i - 1], {visibility: 'hidden'}, T + 1.02);
    tl.to(nbs[i - 1], {opacity: 0, yPercent: -60, duration: 0.4, ease: 'power2.in'}, T);
    tl.to(txs[i - 1], {opacity: 0, y: -22, duration: 0.35, ease: 'power2.in'}, T);
    tl.fromTo(nbs[i], {opacity: 0, yPercent: 60}, {opacity: 1, yPercent: 0, duration: 0.7, ease: 'expo.out'}, T + 0.32);
    tl.fromTo(txs[i], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, T + 0.42);
    tl.to(segs[i], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, T + 0.3);
  }
  tl.to({}, {duration: 0.01}, total - 0.01);
  // video items: only the one on show runs; when recording, the exact frame
  const vids = media.map((m) => (m.tagName === 'VIDEO' ? m : null));
  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || /[?&]reduced/.test(location.search);
  let on = true, cur = 0;
  const run = () => vids.forEach((v, i) => { if (!v) return; if (on && !calm && i === cur) { if (v.paused) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } } else if (!v.paused) v.pause(); });
  const film = cx.fromFn(total, (t, exact) => {
    let k = 0; for (let i = 1; i < n; i++) if (t >= starts[i] + 0.05) k = i;
    cur = k;
    const v = vids[k];
    if (exact) {
      vids.forEach((x) => { if (x && !x.paused) x.pause(); });
      if (!v || v.error) return;
      const d = v.duration || 0; let tt = Math.max(0, t - starts[k]); if (d) tt = tt % d;
      if (Math.abs(v.currentTime - tt) < 0.001 && v.readyState >= 2) return;
      return new Promise((res) => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); v.removeEventListener('error', fin); res(); }; v.addEventListener('seeked', fin); v.addEventListener('error', fin); v.currentTime = tt; });
    }
    if (t > 0) run();
  });
  const clip = cx.all(cx.fromGsap(tl), film);
  const waits = vids.filter((v) => v && v.readyState < 2).map((v) => new Promise((res) => { const ok = () => { v.removeEventListener('loadeddata', ok); v.removeEventListener('error', ok); res(); }; v.addEventListener('loadeddata', ok); v.addEventListener('error', ok); }));
  return Object.assign(clip, {ready: waits.length ? Promise.all(waits) : null, visible: (v) => { on = v; run(); }, dispose: () => { vids.forEach((v) => v && v.pause()); tl.kill(); }});
}

CS.register("gsap/pin-showcase", __mount, typeof css === "string" ? css : "", {"kind":"gsap/pin-showcase","title":"Pinned showcase","use":"media","family":"pinned-showcase","lead":"picture","site":{"mode":"scrub","len":3},"dur":6.1,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/pin-steps */
(function(){
// GSAP: a very large step number on one side, the words on the other; both are swapped step by step and a progress line fills.
// On a slide every click is one step; on a web page the screen stays pinned and the scroll moves through the steps.
const css = `
.b-gsap-pin-steps .body { display: grid; grid-template-columns: 0.72fr 1.28fr; align-items: center; gap: calc(var(--gap) * 1.6); }
.b-gsap-pin-steps .nums { display: grid; overflow: hidden; font-size: calc(var(--hero) * 2.5); line-height: 0.86; padding: 0.04em 0; }
.b-gsap-pin-steps .nb { grid-area: 1 / 1; font-weight: var(--thin); letter-spacing: -0.06em; color: var(--ink); }
.b-gsap-pin-steps .txs { display: grid; }
.b-gsap-pin-steps .tx { grid-area: 1 / 1; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.6); }
.b-gsap-pin-steps .cs-lead { max-width: 19em; }
.b-gsap-pin-steps .prog { display: flex; gap: calc(var(--gap) * 0.4); align-items: center; }
.b-gsap-pin-steps .seg { flex: 1; height: 2px; background: var(--line); position: relative; overflow: hidden; }
.b-gsap-pin-steps .seg i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.b-gsap-pin-steps .of { font-size: var(--label); letter-spacing: 0.22em; color: var(--dim); white-space: nowrap; }
.cs-frame[data-shape="tall"] .b-gsap-pin-steps .body { grid-template-columns: 1fr; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-gsap-pin-steps .nums { font-size: calc(var(--hero) * 2.6); }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, steps = (p.steps || []).slice(0, 6), n = steps.length;
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<p class="cs-lead" style="margin-top:0.5em">${cx.esc(p.title)}</p>` : ''}</div>` : ''}
    <div class="body">
      <div class="nums cs-num">${steps.map((_, i) => `<span class="nb">${String(i + 1).padStart(2, '0')}</span>`).join('')}</div>
      <div class="txs">${steps.map((s) => `<div class="tx"><h3 class="cs-title">${cx.esc(s.title || s)}</h3>${s.text ? `<p class="cs-lead">${cx.esc(s.text)}</p>` : ''}</div>`).join('')}</div>
    </div>
    <div class="prog" aria-hidden="true">${steps.map(() => '<span class="seg"><i></i></span>').join('')}<span class="of cs-num">${String(n).padStart(2, '0')} steps</span></div>
  </div>`;
  const nbs = el.querySelectorAll('.nb'), txs = el.querySelectorAll('.tx'), segs = el.querySelectorAll('.seg i');
  const tl = g.timeline({paused: true});
  g.set(nbs, {opacity: 0}); g.set(txs, {opacity: 0});
  if (el.querySelector('.hd')) tl.fromTo(el.querySelector('.hd'), {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, 0);
  tl.fromTo(el.querySelector('.prog'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.1);
  tl.fromTo(nbs[0], {opacity: 0, yPercent: 45}, {opacity: 1, yPercent: 0, duration: 0.8, ease: 'expo.out'}, 0.15);
  tl.fromTo(txs[0], {opacity: 0, x: 40}, {opacity: 1, x: 0, duration: 0.7, ease: 'power3.out'}, 0.3);
  tl.to(segs[0], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, 0.3);
  const first = 1.5, each = 1.5;
  for (let i = 1; i < n; i++) {
    const T = first + each * (i - 1);
    tl.addLabel('step' + i, T);
    tl.to(nbs[i - 1], {opacity: 0, yPercent: -45, duration: 0.45, ease: 'power2.in'}, T);
    tl.to(txs[i - 1], {opacity: 0, x: -40, duration: 0.4, ease: 'power2.in'}, T);
    tl.fromTo(nbs[i], {opacity: 0, yPercent: 45}, {opacity: 1, yPercent: 0, duration: 0.75, ease: 'expo.out'}, T + 0.3);
    tl.fromTo(txs[i], {opacity: 0, x: 40}, {opacity: 1, x: 0, duration: 0.65, ease: 'power3.out'}, T + 0.4);
    tl.to(segs[i], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, T + 0.3);
  }
  tl.to({}, {duration: 0.01}, first + each * (n - 1) - 0.2);
  return cx.fromGsap(tl);
}

CS.register("gsap/pin-steps", __mount, typeof css === "string" ? css : "", {"kind":"gsap/pin-steps","title":"Pinned steps","use":"steps","family":"big-number-steps","lead":"type","site":{"mode":"scrub","len":2},"dur":4.3,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/scramble-tags */
(function(){
// GSAP ScrambleText: a heading, then short tags that switch on one by one as rounded chips, each decoding from random letters.
const css = `
.b-gsap-scramble-tags .chips { display: flex; flex-wrap: wrap; gap: calc(var(--gap) * 0.6); }
.b-gsap-scramble-tags .chip { display: inline-flex; align-items: center; gap: 0.7em; padding: 0.46em 1.05em 0.46em 0.85em; border: 1px solid var(--line); border-radius: 999px; background: var(--card); font-size: var(--lead); color: var(--ink); line-height: 1.1; white-space: nowrap; }
.b-gsap-scramble-tags .ix { font-size: var(--label); letter-spacing: 0.18em; color: var(--gold2); }
.b-gsap-scramble-tags .tx { position: relative; display: inline-block; }
.b-gsap-scramble-tags .gh { visibility: hidden; }
.b-gsap-scramble-tags .sc { position: absolute; left: 0; top: 0; white-space: nowrap; }
.b-gsap-scramble-tags .cs-lead { max-width: 26em; }
.cs-frame[data-shape="tall"] .b-gsap-scramble-tags .chips { flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.7); }
`;
const __mount = function mount(el, p, cx) {
  cx.plugin('ScrambleTextPlugin');
  const tags = (p.tags || []).slice(0, 5).map(String);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <ul class="chips">${tags.map((t, i) => `<li class="chip"><span class="ix cs-num">${String(i + 1).padStart(2, '0')}</span><span class="tx"><span class="gh" aria-hidden="true" data-deco>${cx.esc(t)}</span><span class="sc"></span></span></li>`).join('')}</ul>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
  </div>`;
  const g = cx.gsap, tl = g.timeline({paused: true});
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) tl.fromTo(head, {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
  const t0 = head.length ? 0.55 : 0.1, each = 0.36;
  el.querySelectorAll('.chip').forEach((chip, i) => {
    const at = t0 + each * i;
    tl.fromTo(chip, {opacity: 0, scale: 0.92, borderColor: 'rgba(214,137,42,0.9)'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out'}, at);
    tl.to(chip, {borderColor: 'rgba(235,226,210,0.18)', duration: 0.6, ease: 'power1.out'}, at + 0.55);
    tl.to(chip.querySelector('.sc'), {duration: 0.6, ease: 'none', scrambleText: {text: tags[i], chars: 'upperCase', speed: 0.55, revealDelay: 0.12}}, at + 0.05);
  });
  if (el.querySelector('.cs-lead')) tl.fromTo(el.querySelector('.cs-lead'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, t0 + each * tags.length + 0.2);
  return cx.fromGsap(tl);
}

CS.register("gsap/scramble-tags", __mount, typeof css === "string" ? css : "", {"kind":"gsap/scramble-tags","title":"Scramble tags","use":"list","family":"scramble-chips","lead":"type","site":null,"dur":2.9,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["ScrambleTextPlugin"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/split-title */
(function(){
// GSAP SplitText: the headline rises letter by letter out of a blur, a gold rule draws, the line under it fades up.
const css = `
.b-gsap-split-title .cs-hero { overflow: visible; }
.b-gsap-split-title .ch { display: inline-block; will-change: transform, opacity, filter; }
.b-gsap-split-title .cs-rule { width: calc(var(--hero) * 1.1); }
.b-gsap-split-title .cs-lead { max-width: 24em; }
`;
const __mount = function mount(el, p, cx) {
  const [SplitText] = cx.plugin('SplitText');
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <h2 class="cs-hero">${cx.esc(p.title)}</h2>
    <i class="cs-rule"></i>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
  </div>`;
  const g = cx.gsap, q = (s) => el.querySelector(s);
  const split = new SplitText(q('.cs-hero'), {type: 'words,chars', charsClass: 'ch', wordsClass: 'cs-w'});
  const tl = g.timeline({paused: true});
  if (q('.cs-kicker')) tl.fromTo(q('.cs-kicker'), {opacity: 0, x: -24}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0);
  tl.fromTo(split.chars, {opacity: 0, yPercent: 60, filter: 'blur(14px)'}, {opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', stagger: {each: 0.028}}, 0.15);
  tl.fromTo(q('.cs-rule'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0.7);
  if (q('.cs-lead')) tl.fromTo(q('.cs-lead'), {opacity: 0, y: 22}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 1.0);
  return cx.fromGsap(tl);
}

CS.register("gsap/split-title", __mount, typeof css === "string" ? css : "", {"kind":"gsap/split-title","title":"Split title","use":"title","family":"split-rise","lead":"type","site":null,"dur":1.9,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["SplitText"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/video-in-type */
(function(){
// GSAP: one or two very large words fill the width of the frame and their letters are windows: a clip runs inside the letter shapes.
// The letters come out of a blur one after another (GSAP stagger from the centre) and a line of text settles under them.
// How: the clip lies under a layer in the background colour whose letters are white, blended with "darken" (the white lets the clip through).
// For result clips and graphics. Do not use a clip that shows a person's face: the letters would cut it up.
const css = `
.b-gsap-video-in-type .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.62 + var(--top)) calc(var(--pad) * 0.36) calc(var(--pad) * 0.62); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.5); }
.b-gsap-video-in-type .top, .b-gsap-video-in-type .low { display: flex; align-items: baseline; justify-content: space-between; gap: var(--gap); padding: 0 calc(var(--pad) * 0.64); }
.b-gsap-video-in-type .win { position: relative; isolation: isolate; }
.b-gsap-video-in-type .vid { position: absolute; inset: 0; overflow: hidden; background: var(--gold); }
.b-gsap-video-in-type .vid > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-gsap-video-in-type .mask { position: relative; margin: -1px; padding: 3cqh 1.6cqw 3cqh; display: flex; flex-direction: column; align-items: center; background: var(--bg); mix-blend-mode: darken; }
.look-paper .b-gsap-video-in-type .mask { mix-blend-mode: lighten; }
.b-gsap-video-in-type .word { display: block; white-space: nowrap; color: #fff; font-family: "Avenir Next Condensed", "Helvetica Neue Condensed", "DIN Condensed", Bahnschrift, "Arial Narrow", Impact, var(--sans); font-stretch: condensed;
  font-weight: 800; font-size: calc(var(--hero) * var(--fit, 1)); line-height: 0.9; letter-spacing: -0.012em; padding-top: 0.03em; text-transform: uppercase; }
.look-paper .b-gsap-video-in-type .word { color: #000; }
.b-gsap-video-in-type .cs-c { will-change: transform, opacity, filter; }
.b-gsap-video-in-type .rule { display: block; height: 2px; background: var(--gold); transform-origin: 0 50%; margin: 0 calc(var(--pad) * 0.64) calc(var(--gap) * 0.4); }
.b-gsap-video-in-type .low .cs-lead { color: var(--ink); font-size: calc(var(--lead) * 1.1); font-weight: var(--thin); }
.b-gsap-video-in-type .low .cs-label { text-align: right; }
.cs-frame[data-shape="tall"] .b-gsap-video-in-type .wrap { padding-left: calc(var(--pad) * 0.3); padding-right: calc(var(--pad) * 0.3); gap: calc(var(--gap) * 0.7); }
.cs-frame[data-shape="tall"] .b-gsap-video-in-type .top, .cs-frame[data-shape="tall"] .b-gsap-video-in-type .low { padding: 0 calc(var(--pad) * 0.7); flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.6); }
.cs-frame[data-shape="tall"] .b-gsap-video-in-type .rule { margin: 0 calc(var(--pad) * 0.7) calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-gsap-video-in-type .low .cs-label { text-align: left; }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  let lines = [].concat(p.word || p.words || '').map((w) => String(w)).filter(Boolean).slice(0, 2);
  const full = lines.join(' ');
  // on a phone one long word is set in two rows, so the letters stay large enough to see the clip
  if (cx.shape === 'tall' && lines.length === 1) { const ch = Array.from(lines[0]); if (ch.length >= 5) { const h = Math.ceil(ch.length / 2); lines = [ch.slice(0, h).join(''), ch.slice(h).join('')]; } }
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Clip inside the letters')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Picture inside the letters')}">`;
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.tag ? `<div class="top">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : '<span></span>'}${p.tag ? `<div class="cs-label">${cx.esc(p.tag)}</div>` : ''}</div>` : ''}
    <div class="win"><div class="vid">${media}</div><h2 class="mask" aria-label="${cx.esc(full)}">${lines.map((w) => `<span class="word">${cx.spans(w, 'cs-c', 'chars')}</span>`).join('')}</h2></div>
    <i class="rule" aria-hidden="true"></i>
    ${p.sub || p.note ? `<div class="low">${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : '<span></span>'}${p.note ? `<span class="cs-label">${cx.esc(p.note)}</span>` : ''}</div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), all = (s) => [...el.querySelectorAll(s)], m = q('.vid > *'), words = all('.word'), wrap = q('.wrap'), win = q('.win');
  // every word is set as wide as the frame; the type size follows from that (and is held back if the words would get too tall)
  const fit = () => {
    const cs = getComputedStyle(wrap), ms = getComputedStyle(q('.mask')), room = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(ms.paddingLeft) - parseFloat(ms.paddingRight);
    if (!(room > 0)) return;
    words.forEach((w) => w.style.setProperty('--fit', 1));
    const fits = words.map((w) => room / Math.max(1, w.scrollWidth));
    words.forEach((w, i) => w.style.setProperty('--fit', fits[i].toFixed(4)));
    const tall = win.offsetHeight, most = wrap.clientHeight * (cx.shape === 'tall' ? 0.6 : 0.64);
    if (tall > most) words.forEach((w, i) => w.style.setProperty('--fit', (fits[i] * most / tall).toFixed(4)));
  };
  fit();
  const tl = g.timeline({paused: true});
  const cs = all('.cs-c');
  tl.fromTo(cs, {opacity: 0, filter: 'blur(0.045em)', scale: 1.16, yPercent: 6}, {opacity: 1, filter: 'blur(0em)', scale: 1, yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: {each: 0.07, from: 'center'}}, 0.1);
  tl.fromTo(m, {scale: 1.1}, {scale: 1, duration: 2.6, ease: 'power2.out'}, 0);
  if (q('.top')) tl.fromTo(all('.top > *'), {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0.25);
  tl.fromTo(q('.rule'), {scaleX: 0}, {scaleX: 1, duration: 1.0, ease: 'expo.out'}, 1.0);
  if (q('.low')) tl.fromTo(all('.low > *'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12}, 1.25);
  const clip = Object.assign(cx.fromGsap(tl), {fit});
  if (!isVideo) return clip;
  return Object.assign(cx.all(clip, cx.fromVideo(m)), {fit});
}

CS.register("gsap/video-in-type", __mount, typeof css === "string" ? css : "", {"kind":"gsap/video-in-type","title":"Video in type","use":"title","family":"type-window","lead":"picture","site":null,"dur":2.6,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* hyperframes/player */
(function(){
// Your own HyperFrames block: one HTML file with CSS and a paused GSAP timeline in window.__timelines.
// Give "src": the build puts the file into the page (a page opened by double click cannot fetch it). The stage only moves its timeline.
// Without src the kit's own block plays, which is a good file to copy and change.
const TALL = `[data-composition-id="note-card"] { width: 760px; height: 760px; padding: 50px 46px; }
[data-composition-id="note-card"] .hf-title { font-size: 104px; white-space: normal; } [data-composition-id="note-card"] .hf-sub { font-size: 42px; } [data-composition-id="note-card"] .hf-kicker { font-size: 30px; letter-spacing: 0.28em; }`;
const __mount = function mount(el, p, cx) {
  const own = typeof p.data === 'string' && p.data, tall = cx.shape === 'tall';
  const text = own ? (p.text && typeof p.text === 'object' ? p.text : {}) : {'.hf-title': p.title || 'HTML and a timeline', '.hf-sub': p.caption || '', '.hf-kicker': p.kicker || 'HyperFrames block'};
  const html = own || (tall ? cx.meta.data['block.html'].replace('</style>', TALL + '</style>') : cx.meta.data['block.html']);
  return cx.fromHyperframes(el, html, {canvas: own ? p.canvas || [1920, 1080] : tall ? [760, 760] : [1600, 560], dur: Number(p.dur) || (own ? 3 : 2.2),
    scale: p.scale || (tall ? 0.9 : 0.8), text, title: p.title || 'HyperFrames block'});
}

CS.register("hyperframes/player", __mount, typeof css === "string" ? css : "", {"kind":"hyperframes/player","title":"HyperFrames player","use":"media","family":"hf-player","lead":"type","site":null,"dur":2.2,"source":{"type":"hyperframes","package":"gsap","version":"3.15.0","uses":[],"note":"blocks from heygen-com/hyperframes (Apache-2.0) and your own .html files; GSAP plugins a block needs must be listed in the story (see README)"},"license":"MIT (block) + GSAP standard license","data":{"block.html":"<!-- connect-ai-slides-web: a HyperFrames-format block (HTML + CSS + paused GSAP timeline). MIT. Use it as a starting point for your own. -->\n<template id=\"note-card-template\">\n  <div data-composition-id=\"note-card\" data-width=\"1600\" data-height=\"560\" data-duration=\"3\">\n    <div class=\"tag\"><span class=\"dot\"></span><span class=\"hf-kicker\">HYPERFRAMES BLOCK</span></div>\n    <div class=\"hf-title\">HTML and a timeline</div>\n    <div class=\"bar\"><i></i><i></i><i></i></div>\n    <div class=\"hf-sub\">This block is one HTML file with a paused GSAP timeline.</div>\n    <style>\n      [data-composition-id=\"note-card\"] { position: relative; width: 1600px; height: 560px; overflow: hidden; box-sizing: border-box; padding: 50px 60px; display: flex; flex-direction: column; justify-content: center; gap: 30px; font-family: \"Inter\", -apple-system, \"Helvetica Neue\", \"Segoe UI\", Arial, sans-serif;\n        border: 1px solid rgba(235,226,210,0.2); border-radius: 34px; background: rgba(255,255,255,0.04); }\n      [data-composition-id=\"note-card\"] .tag { display: flex; align-items: center; gap: 18px; }\n      [data-composition-id=\"note-card\"] .dot { width: 14px; height: 14px; border-radius: 50%; background: #F2B45A; }\n      [data-composition-id=\"note-card\"] .hf-kicker { font-size: 28px; letter-spacing: 0.34em; text-transform: uppercase; color: #F2B45A; }\n      [data-composition-id=\"note-card\"] .hf-title { font-size: 124px; font-weight: 200; letter-spacing: -0.03em; line-height: 1.04; color: #F6F3EC; white-space: nowrap; }\n      [data-composition-id=\"note-card\"] .bar { display: flex; gap: 14px; }\n      [data-composition-id=\"note-card\"] .bar i { display: block; height: 3px; flex: 1; background: #D6892A; transform-origin: 0 50%; }\n      [data-composition-id=\"note-card\"] .bar i:nth-child(2) { background: rgba(235,226,210,0.5); }\n      [data-composition-id=\"note-card\"] .bar i:nth-child(3) { background: rgba(235,226,210,0.22); }\n      [data-composition-id=\"note-card\"] .hf-sub { font-size: 40px; font-weight: 300; line-height: 1.3; color: rgba(235,226,210,0.8); }\n    </style>\n    <script src=\"https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js\"><\/script>\n    <script>\n      (function () {\n        var root = '[data-composition-id=\"note-card\"]';\n        var tl = gsap.timeline({ paused: true });\n        tl.fromTo(root, { clipPath: 'inset(0% 100% 0% 0% round 34px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', duration: 1.0, ease: 'expo.inOut' }, 0);\n        tl.fromTo(root + ' .tag', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 0.55);\n        tl.fromTo(root + ' .hf-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.7);\n        tl.fromTo(root + ' .bar i', { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out', stagger: 0.12 }, 1.0);\n        tl.fromTo(root + ' .hf-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.35);\n        window.__timelines = window.__timelines || {};\n        window.__timelines['note-card'] = tl;\n      })();\n    <\/script>\n  </div>\n</template>\n"}});
})();

/* hyperframes/ring-count */
(function(){
// A HyperFrames block (HTML + CSS + a paused GSAP timeline), played as it is inside an iframe:
// a gold ring closes around a number that counts up to yours (GSAP DrawSVG + snap), the unit and one line slide in.
// On a phone the same file gets a few extra CSS lines so the words go under the ring.
const TALL = `[data-composition-id="ring-count"] { width: 560px; height: 800px; }
[data-composition-id="ring-count"] .ring { left: 80px; } [data-composition-id="ring-count"] .num { left: 80px; }
[data-composition-id="ring-count"] .side { left: 30px; right: 30px; top: 440px; bottom: 0; justify-content: flex-start; align-items: center; text-align: center; }
[data-composition-id="ring-count"] .unit { font-size: 50px; text-indent: 0.26em; } [data-composition-id="ring-count"] .label { font-size: 40px; }
[data-composition-id="ring-count"] .rule { transform-origin: 50% 50%; }`;
const __mount = function mount(el, p, cx) {
  const tall = cx.shape === 'tall';
  const html = tall ? cx.meta.data['block.html'].replace('</style>', TALL + '</style>') : cx.meta.data['block.html'];
  return cx.fromHyperframes(el, html, {canvas: tall ? [560, 800] : [1000, 420], dur: 1.9, scale: tall ? 0.9 : 0.78,
    text: {'.num': String(Math.round(Number(p.value) || 0)), '.unit': p.unit || '', '.label': p.label || ''}, title: (p.value || '') + ' ' + (p.unit || '')});
}

CS.register("hyperframes/ring-count", __mount, typeof css === "string" ? css : "", {"kind":"hyperframes/ring-count","title":"Ring counter (HyperFrames block)","use":"number","family":"hf-ring","lead":"type","site":null,"dur":1.9,"source":{"type":"hyperframes","package":"gsap","version":"3.15.0","uses":["DrawSVGPlugin"],"note":"our own block in the HyperFrames format; blocks from heygen-com/hyperframes (Apache-2.0) run the same way"},"license":"MIT (block) + GSAP standard license","data":{"block.html":"<!-- connect-ai-slides-web: a HyperFrames-format block (HTML + CSS + paused GSAP timeline). MIT. -->\n<template id=\"ring-count-template\">\n  <div data-composition-id=\"ring-count\" data-width=\"1000\" data-height=\"420\" data-duration=\"2\">\n    <svg class=\"ring\" viewBox=\"0 0 400 400\"><circle class=\"track\" cx=\"200\" cy=\"200\" r=\"170\" /><circle class=\"arc\" cx=\"200\" cy=\"200\" r=\"170\" /></svg>\n    <div class=\"num\" data-to=\"12\">0</div>\n    <div class=\"side\"><div class=\"unit\">steps</div><div class=\"rule\"></div><div class=\"label\"></div></div>\n    <style>\n      [data-composition-id=\"ring-count\"] { position: relative; width: 1000px; height: 420px; overflow: hidden; font-family: \"Inter\", -apple-system, \"Helvetica Neue\", \"Segoe UI\", Arial, sans-serif; }\n      [data-composition-id=\"ring-count\"] .ring { position: absolute; left: 10px; top: 10px; width: 400px; height: 400px; transform: rotate(-90deg); }\n      [data-composition-id=\"ring-count\"] .track { fill: none; stroke: rgba(235,226,210,0.18); stroke-width: 4; }\n      [data-composition-id=\"ring-count\"] .arc { fill: none; stroke: #D6892A; stroke-width: 8; stroke-linecap: round; }\n      [data-composition-id=\"ring-count\"] .num { position: absolute; left: 10px; top: 122px; width: 400px; text-align: center; font-size: 150px; font-weight: 200; color: #F6F3EC; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; line-height: 1; }\n      [data-composition-id=\"ring-count\"] .side { position: absolute; left: 470px; top: 0; bottom: 0; right: 10px; display: flex; flex-direction: column; justify-content: center; gap: 22px; }\n      [data-composition-id=\"ring-count\"] .unit { font-size: 46px; letter-spacing: 0.26em; text-transform: uppercase; color: #F2B45A; font-weight: 400; white-space: nowrap; }\n      [data-composition-id=\"ring-count\"] .rule { height: 2px; width: 120px; background: #D6892A; transform-origin: 0 50%; }\n      [data-composition-id=\"ring-count\"] .label { font-size: 34px; font-weight: 300; line-height: 1.3; color: rgba(235,226,210,0.78); }\n      [data-composition-id=\"ring-count\"] .label:empty { display: none; }\n    </style>\n    <script src=\"https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js\"><\/script>\n    <script src=\"https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/DrawSVGPlugin.min.js\"><\/script>\n    <script>\n      (function () {\n        gsap.registerPlugin(DrawSVGPlugin);\n        var root = '[data-composition-id=\"ring-count\"] ';\n        var num = document.querySelector(root + '.num');\n        var to = parseFloat(String(num.textContent).replace(/[^\\d.]/g, '')) || parseFloat(num.getAttribute('data-to')) || 12;\n        var tl = gsap.timeline({ paused: true });\n        tl.fromTo(root + '.arc', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: 'power2.inOut' }, 0.1);\n        tl.fromTo(num, { textContent: 0 }, { textContent: to, snap: { textContent: 1 }, duration: 1.6, ease: 'power2.inOut' }, 0.1);\n        tl.fromTo(root + '.unit', { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 0.7);\n        tl.fromTo(root + '.rule', { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, 0.95);\n        tl.fromTo(root + '.label', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.1);\n        window.__timelines = window.__timelines || {};\n        window.__timelines['ring-count'] = tl;\n      })();\n    <\/script>\n  </div>\n</template>\n"}});
})();

/* hyperframes/scramble-title */
(function(){
// A HyperFrames block (HTML + CSS + a paused GSAP timeline) runs exactly as it is, inside an iframe.
// The stage only moves its timeline. Any block from the HyperFrames registry can be used the same way.
const __mount = function mount(el, p, cx) {
  let html = cx.meta.data['block.html'];
  if (cx.shape === 'tall') html = html.replace('</style>', '[data-composition-id="gold-scramble-title"] { width: 820px; } [data-composition-id="gold-scramble-title"] .wrap { left: 40px; } [data-composition-id="gold-scramble-title"] .rule { width: 740px; } [data-composition-id="gold-scramble-title"] .title { font-size: 116px; }</style>');
  return cx.fromHyperframes(el, html, {canvas: cx.shape === 'tall' ? [820, 360] : [1200, 360], dur: 2.4, scale: cx.shape === 'tall' ? 0.94 : 0.82, text: {'.title': p.text, '.kicker': p.kicker}, title: p.text});
}

CS.register("hyperframes/scramble-title", __mount, typeof css === "string" ? css : "", {"kind":"hyperframes/scramble-title","title":"Scramble title (HyperFrames block)","use":"chapter","family":"hf-scramble","lead":"type","site":null,"dur":2.4,"source":{"type":"hyperframes","package":"gsap","version":"3.15.0","uses":["ScrambleTextPlugin","DrawSVGPlugin"],"note":"our own block in the HyperFrames format; blocks from heygen-com/hyperframes (Apache-2.0) run the same way"},"license":"MIT (block) + GSAP standard license","data":{"block.html":"<!-- connect-ai-slides-web: a HyperFrames-format block (HTML + CSS + paused GSAP timeline). MIT. -->\n<template id=\"gold-scramble-title-template\">\n  <div data-composition-id=\"gold-scramble-title\" data-width=\"1200\" data-height=\"360\" data-duration=\"3\">\n    <div class=\"wrap\">\n      <div class=\"kicker\">CHAPTER</div>\n      <div class=\"title\">Vibe coding</div>\n      <svg class=\"rule\" viewBox=\"0 0 1000 20\" preserveAspectRatio=\"none\"><path d=\"M0 10 L1000 10\" /></svg>\n    </div>\n    <style>\n      [data-composition-id=\"gold-scramble-title\"] { position: relative; width: 1200px; height: 360px; overflow: hidden; font-family: \"Inter\", \"Helvetica Neue\", Arial, sans-serif; }\n      [data-composition-id=\"gold-scramble-title\"] .wrap { position: absolute; left: 60px; top: 70px; }\n      [data-composition-id=\"gold-scramble-title\"] .kicker { font-size: 30px; letter-spacing: 0.32em; color: #F2B45A; font-weight: 400; opacity: 0; }\n      [data-composition-id=\"gold-scramble-title\"] .title { font-size: 128px; font-weight: 200; color: #EBE2D2; letter-spacing: -0.02em; margin-top: 10px; white-space: nowrap; }\n      [data-composition-id=\"gold-scramble-title\"] .rule { width: 1000px; height: 20px; margin-top: 18px; overflow: visible; }\n      [data-composition-id=\"gold-scramble-title\"] .rule path { stroke: #D6892A; stroke-width: 3; fill: none; }\n    </style>\n    <script src=\"https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js\"><\/script>\n    <script src=\"https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrambleTextPlugin.min.js\"><\/script>\n    <script src=\"https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/DrawSVGPlugin.min.js\"><\/script>\n    <script>\n      (function () {\n        gsap.registerPlugin(ScrambleTextPlugin, DrawSVGPlugin);\n        var root = '[data-composition-id=\"gold-scramble-title\"] ';\n        var title = document.querySelector(root + '.title');\n        var text = title.textContent;\n        var tl = gsap.timeline({ paused: true });\n        tl.fromTo(root + '.kicker', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0);\n        tl.fromTo(title, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.1);\n        tl.to(title, { duration: 1.1, scrambleText: { text: text, chars: 'upperAndLowerCase', revealDelay: 0.25, speed: 0.6 }, ease: 'none' }, 0.1);\n        tl.fromTo(root + '.rule path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.0, ease: 'expo.out' }, 0.35);\n        \n        window.__timelines = window.__timelines || {};\n        window.__timelines['gold-scramble-title'] = tl;\n      })();\n    <\/script>\n  </div>\n</template>\n"}});
})();

/* hyperframes/split-words */
(function(){
// A HyperFrames block (HTML + CSS + a paused GSAP timeline), played as it is inside an iframe: each word rises out of its own mask
// (GSAP SplitText), the last word is gold. The canvas grows with the sentence so it fills the width; on a phone the sentence wraps.
const __mount = function mount(el, p, cx) {
  const text = String(p.text || ''), words = text.trim().split(/\s+/).length, tall = cx.shape === 'tall';
  let html = cx.meta.data['block.html'], canvas;
  if (tall) {
    const lines = Math.max(1, Math.ceil((text.length * 68) / 680));
    canvas = [760, (p.kicker ? 70 : 0) + lines * 162 + 60];
    html = html.replace('</style>', '[data-composition-id="split-words"] .line { white-space: normal; } [data-composition-id="split-words"] { padding-left: 20px; }</style>');
  } else canvas = [Math.round(Math.max(900, 110 + Math.max(text.length, String(p.kicker || '').length * 0.36) * 70)), p.kicker ? 340 : 280];
  return cx.fromHyperframes(el, html, {canvas, dur: 0.12 + 0.8 + 0.12 * (words - 1) + 0.1, scale: tall ? 0.94 : 0.84, text: {'.line': text, '.kicker': p.kicker || ''}, title: text});
}

CS.register("hyperframes/split-words", __mount, typeof css === "string" ? css : "", {"kind":"hyperframes/split-words","title":"Words rise (HyperFrames block)","use":"statement","family":"hf-split","lead":"type","site":null,"dur":1.4,"source":{"type":"hyperframes","package":"gsap","version":"3.15.0","uses":["SplitText"],"note":"our own block in the HyperFrames format; blocks from heygen-com/hyperframes (Apache-2.0) run the same way"},"license":"MIT (block) + GSAP standard license","data":{"block.html":"<!-- connect-ai-slides-web: a HyperFrames-format block (HTML + CSS + paused GSAP timeline). MIT. -->\n<template id=\"split-words-template\">\n  <div data-composition-id=\"split-words\" data-width=\"1400\" data-height=\"340\" data-duration=\"2\">\n    <div class=\"kicker\"></div>\n    <div class=\"line\">Make it with words</div>\n    <style>\n      [data-composition-id=\"split-words\"] { position: relative; width: 100vw; height: 100vh; overflow: hidden; display: flex; flex-direction: column; justify-content: center; padding-left: 40px; box-sizing: border-box; font-family: \"Inter\", -apple-system, \"Helvetica Neue\", \"Segoe UI\", Arial, sans-serif; }\n      [data-composition-id=\"split-words\"] .kicker { font-size: 30px; letter-spacing: 0.34em; text-transform: uppercase; color: #F2B45A; font-weight: 400; margin: 0 0 14px 6px; white-space: nowrap; }\n      [data-composition-id=\"split-words\"] .kicker:empty { display: none; }\n      [data-composition-id=\"split-words\"] .line { font-size: 140px; font-weight: 200; color: #F6F3EC; letter-spacing: -0.03em; white-space: nowrap; line-height: 1.15; }\n      [data-composition-id=\"split-words\"] .w { display: inline-block; }\n    </style>\n    <script src=\"https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js\"><\/script>\n    <script src=\"https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js\"><\/script>\n    <script>\n      (function () {\n        gsap.registerPlugin(SplitText);\n        var root = '[data-composition-id=\"split-words\"] ';\n        var split = SplitText.create(root + '.line', { type: 'words', wordsClass: 'w', mask: 'words' });\n        split.words[split.words.length - 1].style.color = '#F2B45A';\n        var tl = gsap.timeline({ paused: true });\n        tl.fromTo(root + '.kicker', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0);\n        tl.from(split.words, { yPercent: 110, rotate: 4, duration: 0.8, ease: 'expo.out', stagger: 0.12 }, 0.12);\n        window.__timelines = window.__timelines || {};\n        window.__timelines['split-words'] = tl;\n      })();\n    <\/script>\n  </div>\n</template>\n"}});
})();

/* kit/device-laptop */
(function(){
// A long web page inside a laptop drawn in CSS (no brand): the lid opens, then the page scrolls from top to bottom inside the screen.
// On a web page the block stays pinned and your own scroll moves the page in the laptop. A video simply plays. For screens, not for portraits.
const css = `
.b-kit-device-laptop .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.4 + var(--top)) var(--pad) calc(var(--pad) * 0.4); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--gap) * 0.7); }
.b-kit-device-laptop .lap { --lw: min(70cqw, calc((100cqh - var(--top) - var(--pad) * 0.8 - var(--body) * 3.7) * 1.6)); flex: none; width: var(--lw); perspective: calc(var(--lw) * 2.4); perspective-origin: 50% 100%; }
.b-kit-device-laptop .lid { position: relative; aspect-ratio: 16 / 10; padding: calc(var(--lw) * 0.014) calc(var(--lw) * 0.011) calc(var(--lw) * 0.016); border-radius: calc(var(--lw) * 0.02) calc(var(--lw) * 0.02) 0 0;
  background: linear-gradient(180deg, #23211f 0%, #131211 100%); border: 1px solid rgba(255, 255, 255, 0.36); border-bottom: 0; box-shadow: 0 calc(var(--lw) * 0.03) calc(var(--lw) * 0.08) rgba(0, 0, 0, 0.5); transform-origin: 50% 100%; display: flex; flex-direction: column; will-change: transform; }
.b-kit-device-laptop .cam { position: absolute; left: 50%; top: calc(var(--lw) * 0.005); width: calc(var(--lw) * 0.005); height: calc(var(--lw) * 0.005); margin-left: calc(var(--lw) * -0.0025); border-radius: 50%; background: #2e2c29; }
.b-kit-device-laptop .bar { flex: none; display: flex; align-items: center; gap: 0.5em; height: 2em; padding: 0 0.9em; font-size: calc(var(--label) * 0.8); background: var(--bg2); border-bottom: 1px solid var(--line); border-radius: calc(var(--lw) * 0.006) calc(var(--lw) * 0.006) 0 0; }
.b-kit-device-laptop .bar i { display: block; width: 0.56em; height: 0.56em; border-radius: 50%; border: 1px solid var(--dim); }
.b-kit-device-laptop .bar b { flex: 0 1 46%; height: 1.05em; margin: 0 auto; border-radius: 99px; border: 1px solid var(--line); }
.b-kit-device-laptop .view { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; background: #000; }
.b-kit-device-laptop .view img { position: absolute; left: 0; top: 0; width: 100%; height: auto; will-change: transform; }
.b-kit-device-laptop .view video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0%; }
.b-kit-device-laptop .thumb { position: absolute; right: calc(var(--lw) * 0.004); top: 0; width: max(3px, calc(var(--lw) * 0.0035)); height: 20%; border-radius: 99px; background: var(--gold2); opacity: 0.9; transform-origin: 50% 0; }
.b-kit-device-laptop .base { position: relative; width: 113%; margin-left: -6.5%; height: calc(var(--lw) * 0.017); border-radius: calc(var(--lw) * 0.003) calc(var(--lw) * 0.003) calc(var(--lw) * 0.02) calc(var(--lw) * 0.02) / calc(var(--lw) * 0.003) calc(var(--lw) * 0.003) calc(var(--lw) * 0.014) calc(var(--lw) * 0.014);
  background: linear-gradient(180deg, #4a4743 0%, #2b2927 30%, #161514 100%); border: 1px solid rgba(255, 255, 255, 0.16); border-top-color: rgba(255, 255, 255, 0.34); }
.b-kit-device-laptop .base::before { content: ""; position: absolute; left: 50%; top: 0; width: 13%; height: 38%; margin-left: -6.5%; border-radius: 0 0 99px 99px; background: #0f0e0d; }
.b-kit-device-laptop .cap { flex: none; display: flex; align-items: baseline; justify-content: center; gap: calc(var(--gap) * 0.8); max-width: 100%; }
.b-kit-device-laptop .cap .cs-kicker { flex: none; }
.b-kit-device-laptop .cap .tx { font-size: var(--body); color: var(--ivory); line-height: 1.35; }
.cs-frame[data-shape="tall"] .b-kit-device-laptop .wrap { padding-left: calc(var(--pad) * 0.8); padding-right: calc(var(--pad) * 0.8); gap: calc(var(--gap) * 1.2); }
.cs-frame[data-shape="tall"] .b-kit-device-laptop .lap { --lw: calc(100cqw - var(--pad) * 1.6); }
.cs-frame[data-shape="tall"] .b-kit-device-laptop .lid { aspect-ratio: 4 / 5; padding: calc(var(--lw) * 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.36); border-radius: calc(var(--lw) * 0.045); }
.cs-frame[data-shape="tall"] .b-kit-device-laptop.film .lid { aspect-ratio: 16 / 11.6; }
.cs-frame[data-shape="tall"] .b-kit-device-laptop .bar { font-size: var(--label); border-radius: calc(var(--lw) * 0.028) calc(var(--lw) * 0.028) 0 0; }
.cs-frame[data-shape="tall"] .b-kit-device-laptop .view { border-radius: 0 0 calc(var(--lw) * 0.028) calc(var(--lw) * 0.028); }
.cs-frame[data-shape="tall"] .b-kit-device-laptop .base, .cs-frame[data-shape="tall"] .b-kit-device-laptop .cam { display: none; }
.cs-frame[data-shape="tall"] .b-kit-device-laptop .cap { flex-direction: column; align-items: flex-start; align-self: stretch; gap: calc(var(--gap) * 0.5); padding: 0 calc(var(--pad) * 0.2); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || ''), tall = cx.shape === 'tall';
  if (isVideo) el.classList.add('film');
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.caption || 'Screen recording')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.caption || 'A long web page')}"><i class="thumb" aria-hidden="true"></i>`;
  el.innerHTML = `<div class="wrap">
    <div class="lap">
      <div class="lid"><i class="cam" aria-hidden="true"></i><div class="bar" aria-hidden="true"><i></i><i></i><i></i><b></b></div><div class="view">${media}</div></div>
      <div class="base" aria-hidden="true"></div>
    </div>
    ${p.caption || p.kicker ? `<div class="cap">${p.kicker ? `<span class="cs-kicker">${cx.esc(p.kicker)}</span>` : ''}${p.caption ? `<span class="tx">${cx.esc(p.caption)}</span>` : ''}</div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), m = q('.view > img, .view > video'), view = q('.view'), thumb = q('.thumb');
  // the lid opens (a phone gets a browser window instead: it rises)
  if (tall) cx.wa(q('.lid'), [{opacity: 0, transform: 'translateY(40px) scale(0.96)'}, {opacity: 1, transform: 'none'}], {duration: 1.0});
  else {
    cx.wa(q('.lid'), [{transform: 'rotateX(-88deg)', filter: 'brightness(0.25)'}, {transform: 'rotateX(0deg)', filter: 'brightness(1)'}], {duration: 1.2, delay: 0.15, ease: 'cubic-bezier(.3,.9,.25,1)'});
    cx.wa(q('.base'), [{opacity: 0, transform: 'translateY(30px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7});
  }
  cx.wa(el.querySelectorAll('.cap > *'), [{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.7, stagger: 0.12});
  const intro = cx.fromWaapi(el);
  if (isVideo) return cx.all(intro, cx.fromVideo(m));
  // the page goes down inside the screen: by the clock on a slide, by your scroll on a web page
  const from = 1.25, dur = Math.max(3, Number(p.seconds) || 6), ease = cx.stage === 'deck' ? 'inOut' : 'lin';
  const roll = cx.fromFn(dur, (t) => {
    const ih = m.offsetHeight, vh = view.offsetHeight, k = cx.prog(t, from, dur - from - 0.25, ease), travel = Math.max(0, ih - vh);
    m.style.transform = 'translate3d(0,' + (-travel * k).toFixed(2) + 'px,0)';
    if (thumb) { const part = ih > 0 ? cx.clamp(vh / ih, 0.08, 1) : 1; thumb.style.height = (part * 100).toFixed(2) + '%'; thumb.style.transform = 'translateY(' + ((k * (1 - part)) / part * 100).toFixed(2) + '%)'; thumb.style.opacity = travel > 2 ? cx.prog(t, from - 0.3, 0.4, 'out') * 0.9 : 0; }
  });
  const ready = m.complete ? null : new Promise((res) => { const ok = () => { m.removeEventListener('load', ok); m.removeEventListener('error', ok); res(); }; m.addEventListener('load', ok); m.addEventListener('error', ok); });
  return Object.assign(cx.all(intro, roll), {ready});
}

CS.register("kit/device-laptop", __mount, typeof css === "string" ? css : "", {"kind":"kit/device-laptop","title":"Long page in a laptop","use":"media","family":"laptop-scroll","lead":"picture","site":{"mode":"scrub","len":2},"dur":6,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/device-phone */
(function(){
// Your website on a phone: a phone drawn in CSS (no brand, no logo) rises from below, turns from a tilt to upright, and its screen lights up with your picture or video.
// The words stand beside it. The phone is 84 % of the slide height. For screens and results, not for portraits.
const css = `
.b-kit-device-phone { --ph: 84cqh; --pw: calc(var(--ph) * 0.462); }
.b-kit-device-phone .ring { position: absolute; left: 71%; top: 50%; width: 92cqh; height: 92cqh; margin: -46cqh 0 0 -46cqh; pointer-events: none; }
.b-kit-device-phone .ring circle { fill: none; stroke: var(--gold); stroke-width: 0.16; }
.b-kit-device-phone .ring .r2 { stroke: var(--line); }
.b-kit-device-phone.flip .ring { left: 29%; }
.b-kit-device-phone .stage { position: absolute; top: var(--top); bottom: 0; left: 42%; right: 0; display: grid; place-items: center; perspective: 240cqh; }
.b-kit-device-phone.flip .stage { left: 0; right: 42%; }
.b-kit-device-phone .phone { position: relative; height: min(var(--ph), calc(100% - var(--pad) * 0.5)); aspect-ratio: 0.462; border-radius: calc(var(--pw) * 0.155); padding: calc(var(--pw) * 0.03);
  background: linear-gradient(145deg, #2c2a27 0%, #121110 38%, #1d1b19 100%); border: 1px solid rgba(255, 255, 255, 0.22); box-shadow: 0 calc(var(--pw) * 0.12) calc(var(--pw) * 0.3) rgba(0, 0, 0, 0.55); transform-style: preserve-3d; will-change: transform; }
.look-paper .b-kit-device-phone .phone { box-shadow: 0 calc(var(--pw) * 0.1) calc(var(--pw) * 0.26) rgba(60, 40, 10, 0.28); }
.b-kit-device-phone .phone::before, .b-kit-device-phone .phone::after { content: ""; position: absolute; width: calc(var(--pw) * 0.012); background: #2a2826; border-radius: 2px; }
.b-kit-device-phone .phone::before { left: calc(var(--pw) * -0.014); top: 22%; height: 7%; box-shadow: 0 calc(var(--ph) * 0.1) 0 #2a2826; }
.b-kit-device-phone .phone::after { right: calc(var(--pw) * -0.014); top: 27%; height: 11%; }
.b-kit-device-phone .glass { position: relative; width: 100%; height: 100%; border-radius: calc(var(--pw) * 0.128); overflow: hidden; background: #000; }
.b-kit-device-phone .glass > .m { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0%; }
.b-kit-device-phone .isle { position: absolute; left: 50%; top: calc(var(--pw) * 0.045); width: 29%; height: calc(var(--pw) * 0.082); margin-left: -14.5%; border-radius: 99px; background: #000; }
.b-kit-device-phone .copy { position: absolute; top: var(--top); bottom: 0; left: 0; width: 46%; padding: var(--pad); padding-right: 0; display: flex; flex-direction: column; justify-content: center; gap: var(--gap); }
.b-kit-device-phone.flip .copy { left: auto; right: 0; padding-right: var(--pad); padding-left: 0; }
.b-kit-device-phone .cs-title { font-size: calc(var(--title) * 0.94); }
.b-kit-device-phone .mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.12em; margin: 0 0.22em -0.12em 0; }
.b-kit-device-phone .mask > span { display: inline-block; }
.b-kit-device-phone .cs-lead { max-width: 17em; }
.b-kit-device-phone .note { display: flex; align-items: center; gap: 0.9em; }
.b-kit-device-phone .note i { display: block; flex: none; width: 2.6em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.cs-frame[data-stage="site"][data-shape="wide"] .b-kit-device-phone { --ph: 80cqh; }
.cs-frame[data-shape="tall"] .b-kit-device-phone { --ph: 56cqh; }
.cs-frame[data-shape="tall"] .b-kit-device-phone .copy { top: var(--top); bottom: auto; left: 0; right: 0; width: auto; padding: calc(var(--pad) * 0.9) var(--pad) 0; justify-content: flex-start; gap: calc(var(--gap) * 0.7); }
.cs-frame[data-shape="tall"] .b-kit-device-phone .stage { left: 0; right: 0; top: auto; bottom: calc(var(--pad) * 0.9); height: var(--ph); }
.cs-frame[data-shape="tall"] .b-kit-device-phone .phone { height: var(--ph); }
.cs-frame[data-shape="tall"] .b-kit-device-phone .ring { left: 50%; top: auto; bottom: calc(var(--pad) * 0.9 + var(--ph) * 0.5 - 34cqh); width: 68cqh; height: 68cqh; margin: 0 0 0 -34cqh; }
.cs-frame[data-shape="tall"] .b-kit-device-phone .cs-title { font-size: calc(var(--title) * 0.9); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  if (p.side === 'right') el.classList.add('flip');
  const tilt = cx.clamp(Number(p.tilt) || 0, -12, 12), flip = p.side === 'right' ? -1 : 1;
  const media = isVideo
    ? `<video class="m" src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Screen recording on a phone')}"></video>`
    : `<img class="m" src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Website on a phone')}">`;
  el.innerHTML = `
    <svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="r2" cx="50" cy="50" r="49.5"/><circle class="r1" cx="50" cy="50" r="42" pathLength="100" stroke-dasharray="100" transform="rotate(-90 50 50)"/></svg>
    <div class="stage"><div class="phone"><div class="glass">${media}<i class="isle" aria-hidden="true"></i></div></div></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${String(p.title).split(/\s+/).map((w) => `<span class="mask"><span>${cx.esc(w)}</span></span>`).join('')}</h2>` : ''}
      ${p.text ? `<p class="cs-lead">${cx.esc(p.text)}</p>` : ''}
      ${p.note ? `<div class="note"><i></i><span class="cs-label">${cx.esc(p.note)}</span></div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.m');
  const rest = `rotateZ(${tilt}deg)`;
  // the phone comes up from under the frame, leaning back and turned away, and settles
  cx.wa(q('.phone'), [
    {opacity: 0, transform: `translateY(62%) rotateX(34deg) rotateY(${-38 * flip}deg) rotateZ(${10 * flip}deg) scale(0.9)`, offset: 0},
    {opacity: 1, offset: 0.22},
    {opacity: 1, transform: `translateY(0%) rotateX(0deg) rotateY(0deg) ${rest} scale(1)`, offset: 1},
  ], {duration: 1.7, ease: 'cubic-bezier(.16,1,.3,1)'});
  cx.wa(m, [{opacity: 0, transform: 'translateY(5%)'}, {opacity: 1, transform: 'none'}], {duration: 0.9, delay: 0.75});
  cx.wa(q('.ring .r2'), [{opacity: 0}, {opacity: 1}], {duration: 1.2, delay: 0.2, ease: 'ease-out'});
  cx.wa(q('.ring .r1'), [{strokeDashoffset: 100}, {strokeDashoffset: 38}], {duration: 1.8, delay: 0.3});
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0, letterSpacing: '0.6em'}, {opacity: 1, letterSpacing: '0.34em'}], {duration: 0.9, delay: 0.5});
  const ws = el.querySelectorAll('.mask > span');
  cx.wa(ws, [{transform: 'translateY(112%)'}, {transform: 'none'}], {duration: 0.9, delay: 0.65, stagger: 0.08});
  const t1 = 0.65 + 0.08 * ws.length + 0.35;
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.8, delay: t1});
  if (q('.note')) { cx.wa(q('.note i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.8, delay: t1 + 0.2}); cx.wa(q('.note span'), [{opacity: 0}, {opacity: 1}], {duration: 0.7, delay: t1 + 0.35, ease: 'ease-out'}); }
  const clip = cx.fromWaapi(el);
  return isVideo ? cx.all(clip, cx.fromVideo(m)) : clip;
}

CS.register("kit/device-phone", __mount, typeof css === "string" ? css : "", {"kind":"kit/device-phone","title":"Site on a phone","use":"media","family":"phone-mockup","lead":"picture","site":null,"dur":2.5,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/embed-scene */
(function(){
// Your own one-file HTML scene (three.js, canvas, WebGL), put in as it is: it runs live in a sandboxed iframe that fills most of the frame.
// A gold seam is drawn, the scene rises out of it, the label and the title come in under it. Nothing is drawn on the scene.
// When the deck is recorded, checked, printed, or the viewer asked for less motion, "clip" (an mp4 of the same scene, exact frames) or "poster" stands in.
const css = `
.b-kit-embed-scene .scene { position: absolute; left: 0; right: 0; top: 0; height: 78%; overflow: hidden; background: #000; }
.b-kit-embed-scene .scene > * { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; }
.b-kit-embed-scene .scene > img, .b-kit-embed-scene .scene > video { object-fit: cover; }
.b-kit-embed-scene .scene > iframe { pointer-events: none; background: transparent; }
.b-kit-embed-scene.live .scene > iframe { pointer-events: auto; }
.b-kit-embed-scene .seam { position: absolute; left: 0; right: 0; top: 78%; height: 2px; margin-top: -1px; background: var(--gold); transform-origin: 0 50%; }
.b-kit-embed-scene .band { position: absolute; left: var(--pad); right: var(--pad); top: 78%; bottom: 0; display: grid; grid-template-columns: 1.3fr 1fr; align-items: center; column-gap: calc(var(--gap) * 2); }
.b-kit-embed-scene .l { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.36); min-width: 0; }
.b-kit-embed-scene .cs-title { font-size: calc(var(--title) * 0.58); }
.b-kit-embed-scene .r { display: flex; flex-direction: column; align-items: flex-end; gap: calc(var(--gap) * 0.3); text-align: right; min-width: 0; }
.b-kit-embed-scene .r .cs-text { color: var(--ivory); max-width: 22em; }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .scene { top: var(--top); height: 56%; }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .seam { top: calc(56% + var(--top)); }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .band { top: calc(56% + var(--top)); grid-template-columns: 1fr; align-content: start; row-gap: var(--gap); padding-top: calc(var(--gap) * 1.5); }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .cs-title { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .r { align-items: flex-start; text-align: left; }
`;
const __mount = function mount(el, p, cx) {
  const G = window.CS || {}, print = /print-pdf/.test(location.search);
  // live: the scene itself. Recorded, checked, printed or reduced motion: a file that can be shown at an exact time
  let mode = 'frame';
  if (G.capturing && p.clip) mode = 'clip';
  else if ((G.capturing || G.reduced || print) && p.poster) mode = 'poster';
  else if ((G.reduced || print) && p.clip) mode = 'clip';
  const alt = cx.esc(p.alt || p.title || 'Interactive scene');
  if (p.interactive && mode === 'frame') el.classList.add('live');
  const media = mode === 'clip' ? `<video src="${cx.esc(p.clip)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${alt}"></video>`
    : mode === 'poster' ? `<img src="${cx.esc(p.poster)}" alt="${alt}">`
    : `${p.poster ? `<img src="${cx.esc(p.poster)}" alt="" aria-hidden="true">` : ''}<iframe title="${alt}" sandbox="allow-scripts" scrolling="no" allow="fullscreen" ${p.interactive ? '' : 'tabindex="-1"'}></iframe>`;
  el.innerHTML = `
    <div class="scene">${media}</div>
    <i class="seam" aria-hidden="true"></i>
    <div class="band">
      <div class="l">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>
      ${p.caption || p.hint ? `<div class="r">${p.caption ? `<p class="cs-text">${cx.esc(p.caption)}</p>` : ''}${p.hint ? `<span class="cs-label">${cx.esc(p.hint)}</span>` : ''}</div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), f = q('iframe'), v = q('video'), under = f && q('.scene > img');
  cx.wa(q('.seam'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9});
  cx.wa(q('.scene'), [{clipPath: 'inset(100% 0 0 0)'}, {clipPath: 'inset(0% 0 0 0)'}], {duration: 1.2, delay: 0.3, ease: 'cubic-bezier(.7,0,.2,1)'});
  cx.wa(el.querySelectorAll('.l > *'), [{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.9, stagger: 0.1});
  cx.wa(el.querySelectorAll('.r > *'), [{opacity: 0, transform: 'translateX(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 1.15, stagger: 0.1});
  const text = cx.fromWaapi(el), clip = v ? cx.all(text, cx.fromVideo(v)) : text;
  if (!f) return clip;
  // the scene only runs while its slide or screen is in view: it is loaded on arrival and emptied on leaving
  let on = false;
  const set = (want) => { if (want === on) return; on = want; if (want) f.src = p.src; else { f.removeAttribute('src'); f.src = 'about:blank'; if (under) under.style.visibility = ''; } };
  if (under) f.addEventListener('load', () => { if (on) under.style.visibility = 'hidden'; });
  if (G.capturing || print) set(true);
  return Object.assign(clip, {visible: (show) => set(!!show), dispose: () => set(false)});
}

CS.register("kit/embed-scene", __mount, typeof css === "string" ? css : "", {"kind":"kit/embed-scene","title":"Live scene","use":"media","family":"live-scene","lead":"picture","site":null,"dur":1.95,"source":{"type":"kit","package":"none (iframe + Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/end-card */
(function(){
// The last screen: one large line, one to three links as buttons (they work on the slide too), the brand line under them.
const css = `
.b-kit-end-card .cs-hero { font-size: calc(var(--hero) * 0.8); max-width: 12em; }
.b-kit-end-card .cs-w { margin: 0 0.11em; }
.b-kit-end-card .cs-lead { max-width: 24em; }
.b-kit-end-card .btns { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--gap) * 0.6); margin-top: calc(var(--gap) * 0.3); }
.b-kit-end-card .cs-btn { min-height: 48px; }
.b-kit-end-card .brand { display: flex; align-items: center; gap: 1.2em; margin-top: calc(var(--gap) * 0.5); }
.b-kit-end-card .brand i { display: block; width: calc(var(--label) * 3); height: 1px; background: var(--gold); }
.b-kit-end-card .brand i:first-child { transform-origin: 100% 50%; }
.b-kit-end-card .brand i:last-child { transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-end-card .cs-hero { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-kit-end-card .btns { flex-direction: column; align-self: stretch; }
.cs-frame[data-shape="tall"] .b-kit-end-card .cs-btn { width: 100%; }
`;
const __mount = function mount(el, p, cx) {
  const links = (p.links || []).slice(0, 3);
  const safe = (h) => (/^\s*(javascript|data|vbscript):/i.test(String(h || '')) ? '#' : String(h || '#'));
  el.innerHTML = `<div class="cs-pad cs-center">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <h2 class="cs-hero">${cx.spans(p.title, 'cs-w')}</h2>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    ${links.length ? `<div class="btns">${links.map((l, i) => `<a class="cs-btn${i ? ' cs-ghost' : ''}" href="${cx.esc(safe(l.href))}"${/^https?:/i.test(l.href || '') ? ' target="_blank" rel="noopener"' : ''}>${cx.esc(l.label)}</a>`).join('')}</div>` : ''}
    ${p.brand ? `<div class="brand"><i aria-hidden="true"></i><span class="cs-label">${cx.esc(p.brand)}</span><i aria-hidden="true"></i></div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), ws = el.querySelectorAll('.cs-w'), t1 = 0.2 + 0.07 * ws.length;
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0}, {opacity: 1}], {duration: 0.6, ease: 'ease-out'});
  cx.wa(ws, [{opacity: 0, transform: 'translateY(0.5em)'}, {opacity: 1, transform: 'none'}], {duration: 0.8, delay: 0.2, stagger: 0.07});
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.25});
  cx.wa(el.querySelectorAll('.cs-btn'), [{opacity: 0, transform: 'translateY(22px) scale(0.96)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.5, stagger: 0.12});
  if (q('.brand')) {
    cx.wa(el.querySelectorAll('.brand i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: t1 + 0.95});
    cx.wa(q('.brand span'), [{opacity: 0, letterSpacing: '0.5em'}, {opacity: 1, letterSpacing: '0.22em'}], {duration: 0.9, delay: t1 + 0.95});
  }
  return cx.fromWaapi(el);
}

CS.register("kit/end-card", __mount, typeof css === "string" ? css : "", {"kind":"kit/end-card","title":"End card","use":"cta","family":"end-links","lead":"type","site":null,"dur":2.6,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/end-film */
(function(){
// The last screen as a film frame: a result clip or picture fills the frame behind a dark veil, the closing line and the
// link buttons sit on top (real links, they work on the slide too). For results and graphics, not for footage of a person:
// the veil covers the whole picture.
const css = `
.b-kit-end-film { background: #000; }
.b-kit-end-film .media { position: absolute; inset: 0; overflow: hidden; }
.b-kit-end-film .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-end-film .veil { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(90% 80% at 50% 52%, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.82) 46%, rgba(8, 7, 5, 0.68) 100%); }
.b-kit-end-film .cs-hero { font-size: calc(var(--hero) * 0.8); max-width: 12em; }
.b-kit-end-film .cs-w { margin: 0 0.11em; }
.b-kit-end-film .cs-lead { max-width: 24em; color: var(--ink); }
.b-kit-end-film .btns { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--gap) * 0.6); margin-top: calc(var(--gap) * 0.3); }
.b-kit-end-film .cs-btn { min-height: 48px; }
.b-kit-end-film .cs-btn.cs-ghost { background: rgba(8, 7, 5, 0.5); border-color: rgba(235, 226, 210, 0.5); }
.b-kit-end-film .brand { display: flex; align-items: center; gap: 1.2em; margin-top: calc(var(--gap) * 0.5); }
.b-kit-end-film .brand .cs-label { color: var(--ink); }
.b-kit-end-film .brand i { display: block; width: calc(var(--label) * 3); height: 1px; background: var(--gold); }
.b-kit-end-film .brand i:first-child { transform-origin: 100% 50%; }
.b-kit-end-film .brand i:last-child { transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-end-film .cs-hero { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-kit-end-film .btns { flex-direction: column; align-self: stretch; }
.cs-frame[data-shape="tall"] .b-kit-end-film .cs-btn { width: 100%; }
`;
const __mount = function mount(el, p, cx) {
  const links = (p.links || []).slice(0, 3);
  const safe = (h) => (/^\s*(javascript|data|vbscript):/i.test(String(h || '')) ? '#' : String(h || '#'));
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const media = !p.src ? '' : isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Background clip')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || '')}">`;
  el.innerHTML = `
    <div class="media">${media}</div>
    <div class="veil"></div>
    <div class="cs-pad cs-center">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-hero">${cx.spans(p.title, 'cs-w')}</h2>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
      ${links.length ? `<div class="btns">${links.map((l, i) => `<a class="cs-btn${i ? ' cs-ghost' : ''}" href="${cx.esc(safe(l.href))}"${/^https?:/i.test(l.href || '') ? ' target="_blank" rel="noopener"' : ''}>${cx.esc(l.label)}</a>`).join('')}</div>` : ''}
      ${p.brand ? `<div class="brand"><i aria-hidden="true"></i><span class="cs-label">${cx.esc(p.brand)}</span><i aria-hidden="true"></i></div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), ws = el.querySelectorAll('.cs-w'), t1 = 0.5 + 0.07 * ws.length, m = q('.media > *');
  cx.wa(q('.media'), [{opacity: 0, transform: 'scale(1.06)'}, {opacity: 1, transform: 'scale(1)'}], {duration: 1.6, ease: 'cubic-bezier(.2,.7,.2,1)'});
  cx.wa(q('.veil'), [{opacity: 0.4}, {opacity: 1}], {duration: 1.2, delay: 0.2, ease: 'ease-out'});
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0, letterSpacing: '0.6em'}, {opacity: 1, letterSpacing: '0.34em'}], {duration: 0.8, delay: 0.3, ease: 'ease-out'});
  cx.wa(ws, [{opacity: 0, filter: 'blur(14px)', transform: 'translateY(0.3em)'}, {opacity: 1, filter: 'blur(0px)', transform: 'none'}], {duration: 0.8, delay: 0.5, stagger: 0.07});
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.25});
  cx.wa(el.querySelectorAll('.cs-btn'), [{opacity: 0, transform: 'translateY(22px) scale(0.96)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.5, stagger: 0.12});
  if (q('.brand')) {
    cx.wa(el.querySelectorAll('.brand i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: t1 + 0.9});
    cx.wa(q('.brand span'), [{opacity: 0, letterSpacing: '0.5em'}, {opacity: 1, letterSpacing: '0.22em'}], {duration: 0.9, delay: t1 + 0.9});
  }
  const text = cx.fromWaapi(el);
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/end-film", __mount, typeof css === "string" ? css : "", {"kind":"kit/end-film","title":"End card on film","use":"cta","family":"end-film","lead":"picture","site":null,"dur":2.9,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/film-hero */
(function(){
// A film still that fills the whole frame and a large thin title on the empty side of it.
// Give the face box (and the body box if you have it): the block finds the wider free side, stacks the words there
// from the top (the name goes to the foot of the column) and darkens only that strip, fading out before the person. Nothing is drawn on the person. Without a face box the words sit in a band at the bottom.
const css = `
.b-kit-film-hero { background: #000; }
.b-kit-film-hero .media { position: absolute; inset: 0; overflow: hidden; background: #000; }
.b-kit-film-hero .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-film-hero .scrim { position: absolute; top: 0; bottom: 0; left: 0; width: var(--free, 30%); pointer-events: none;
  background: linear-gradient(90deg, rgba(8, 7, 5, 0.86) 0%, rgba(8, 7, 5, 0.8) 28%, rgba(8, 7, 5, 0.66) 46%, rgba(8, 7, 5, 0.46) 61%, rgba(8, 7, 5, 0.26) 73%, rgba(8, 7, 5, 0.11) 82%, rgba(8, 7, 5, 0.03) 89%, rgba(8, 7, 5, 0) 94%); }
.b-kit-film-hero.right .scrim { left: auto; right: 0; transform: scaleX(-1); }
.b-kit-film-hero .copy { position: absolute; top: var(--top); bottom: 0; left: 0; width: var(--free, 30%); padding: calc(var(--pad) * 0.62) calc(var(--gap) * 0.5) calc(var(--pad) * 0.62) calc(var(--pad) * 0.5);
  display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.72); }
.b-kit-film-hero.right .copy { left: auto; right: 0; padding-left: calc(var(--gap) * 0.5); padding-right: calc(var(--pad) * 0.5); }
.b-kit-film-hero.at-top .copy { justify-content: flex-start; }
.b-kit-film-hero.at-top .who { margin-top: auto; }
.b-kit-film-hero.at-bottom .copy { justify-content: flex-end; }
.b-kit-film-hero .kick { display: flex; align-items: center; gap: calc(var(--label) * 0.6); }
.b-kit-film-hero .kick i { flex: none; display: block; width: calc(var(--label) * 1.5); height: 1px; background: var(--gold2); transform-origin: 0 50%; }
.b-kit-film-hero .cs-kicker { letter-spacing: 0.3em; }
.cs-frame[data-stage="deck"] .b-kit-film-hero .cs-kicker, .cs-frame[data-stage="deck"] .b-kit-film-hero .who { font-size: calc(var(--label) * 0.82); }
.b-kit-film-hero .ttl { font-size: calc(var(--hero) * var(--fk, 0.44)); font-weight: var(--thin); letter-spacing: -0.035em; line-height: 0.98; color: var(--ink); text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-kit-film-hero .rule { display: block; width: 100%; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-kit-film-hero .sub { font-size: var(--body); font-weight: var(--light); line-height: 1.36; color: var(--ivory); text-wrap: pretty; text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-kit-film-hero .who { letter-spacing: 0.3em; color: var(--ivory); }

/* no face box: the words go in a band at the bottom of the picture */
.b-kit-film-hero.band .scrim { top: auto; left: 0; right: 0; width: auto; height: 58%; transform: none;
  background: linear-gradient(0deg, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.8) 42%, rgba(8, 7, 5, 0.4) 76%, rgba(8, 7, 5, 0) 100%); }
.b-kit-film-hero.band .copy { top: auto; left: 0; right: 0; width: auto; padding: calc(var(--pad) * 0.62) var(--pad); justify-content: flex-end; }
.b-kit-film-hero.band .ttl { font-size: calc(var(--hero) * 0.58); text-wrap: balance; }
.b-kit-film-hero.band .rule { width: calc(var(--title) * 1.4); }

/* phone: the picture on top (framed on the face), the words under it on black */
.cs-frame[data-shape="tall"] .b-kit-film-hero { background: var(--bg); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .media { top: var(--top); bottom: auto; height: calc(59% - var(--top)); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .scrim { display: none; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .copy { top: 59%; bottom: 0; left: 0; right: 0; width: auto; padding: var(--pad); justify-content: center; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .ttl { font-size: calc(var(--title) * 1.16); line-height: 1.02; text-shadow: none; text-wrap: balance; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .sub { text-shadow: none; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .rule { width: calc(var(--title) * 1.4); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const face = Array.isArray(p.face) ? p.face : null, body = Array.isArray(p.body) ? p.body : null, tall = cx.shape === 'tall';
  // the room a person takes: the body box, or (face only) shoulders guessed from the face
  const person = body || (face ? [face[0] - face[2] * 0.6, face[1], face[2] * 2.2, 1 - face[1]] : null);
  if (!person) el.classList.add('band');
  if (person && !tall && p.align !== 'middle') el.classList.add(p.align === 'bottom' ? 'at-bottom' : 'at-top');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}">`;
  el.innerHTML = `
    <div class="media">${tag}</div>
    <i class="scrim" aria-hidden="true"></i>
    <div class="copy">
      ${p.kicker ? `<div class="kick"><i aria-hidden="true"></i><span class="cs-kicker">${cx.esc(p.kicker)}</span></div>` : ''}
      <h1 class="ttl">${cx.spans(p.title, 'cs-w')}</h1>
      <i class="rule" aria-hidden="true"></i>
      ${p.sub ? `<p class="sub">${cx.esc(p.sub)}</p>` : ''}
      ${p.name ? `<div class="who cs-label">${cx.esc(p.name)}</div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *'), box = q('.media'), ttl = q('.ttl'), copy = q('.copy'), words = el.querySelectorAll('.cs-w');
  const place = () => {
    const bw = box.offsetWidth, bh = box.offsetHeight; if (!bw || !bh) return;
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
    if (tall || !person) { el.style.removeProperty('--free'); el.style.removeProperty('--fk'); return; }
    // free room left and right of the person, in frame px
    const x0 = (bw - w) * px, L = Math.max(0, x0 + person[0] * w), R = Math.max(0, bw - (x0 + (person[0] + person[2]) * w));
    const right = p.side ? p.side === 'right' : R > L + 2;
    el.classList.toggle('right', right);
    const free = Math.max(Math.floor(right ? R : L) - 2, bw * 0.16);
    el.style.setProperty('--free', free + 'px');
    // the largest thin type whose longest word fits the column and whose stack fits the height
    const st = getComputedStyle(copy), colW = free - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight), maxH = (el.offsetHeight - parseFloat(st.paddingTop) - parseFloat(st.paddingBottom)) * 0.56;
    let fk = 0.72; const n = words.length, maxLines = Math.max(Math.ceil(n / 2), Math.min(n, 3));
    for (let i = 0; i < 16; i++) {
      el.style.setProperty('--fk', fk.toFixed(3));
      let widest = 0; words.forEach((wd) => { widest = Math.max(widest, wd.offsetWidth); });
      const lines = Math.round(ttl.offsetHeight / (parseFloat(getComputedStyle(ttl).lineHeight) || 1));
      if ((widest <= colW && lines <= maxLines && ttl.offsetHeight <= maxH) || fk <= 0.24) break;
      fk *= 0.94;
    }
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (body) cx.face(m, body, 'body');
  // the film opens like a gate, then the words arrive one by one
  cx.wa(box, [{opacity: 0, clipPath: 'inset(11% 0 11% 0)'}, {opacity: 1, clipPath: 'inset(0% 0 0% 0)'}], {duration: 1.5, ease: 'cubic-bezier(.3,0,.1,1)'});
  cx.wa(q('.scrim'), [{opacity: 0}, {opacity: 1}], {duration: 1.1, delay: 0.25, ease: 'ease-out'});
  if (q('.kick')) { cx.wa(q('.kick i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.7, delay: 0.45}); cx.wa(q('.cs-kicker'), [{opacity: 0, letterSpacing: '0.5em'}, {opacity: 1, letterSpacing: '0.3em'}], {duration: 0.9, delay: 0.5}); }
  const each = Math.min(0.11, 0.8 / Math.max(1, words.length));
  cx.wa(words, [{opacity: 0, filter: 'blur(18px)', transform: 'translateY(0.28em)'}, {opacity: 1, filter: 'blur(0px)', transform: 'none'}], {duration: 0.85, delay: 0.65, stagger: each});
  const t1 = 0.65 + each * words.length + 0.25;
  cx.wa(q('.rule'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: t1 - 0.1});
  if (q('.sub')) cx.wa(q('.sub'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.1});
  if (q('.who')) cx.wa(q('.who'), [{opacity: 0}, {opacity: 1}], {duration: 0.7, delay: t1 + 0.3, ease: 'ease-out'});
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/film-hero", __mount, typeof css === "string" ? css : "", {"kind":"kit/film-hero","title":"Film hero","use":"person","family":"film-hero","lead":"picture","site":null,"dur":2.7,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/flow-diagram */
(function(){
// Web Animations API + one plain function, no library: cards on the left flow into a gold hub in the middle and out to cards on the right.
// Every curved line draws itself and a small gold dot rides its tip once. The dot position is computed from the time, so it can be seeked.
const css = `
.b-kit-flow-diagram .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.5 + var(--top)) calc(var(--pad) * 0.7) calc(var(--pad) * 0.44); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.7); }
.b-kit-flow-diagram .hd { flex: none; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-kit-flow-diagram .hd .cs-title { font-size: calc(var(--title) * 0.56); }
.b-kit-flow-diagram .dia { position: relative; flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 23fr 9.5fr 26fr 9.5fr 32fr; align-items: center; }
.b-kit-flow-diagram .col { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.56); height: 100%; min-width: 0; }
.b-kit-flow-diagram .col.from { grid-column: 1; } .b-kit-flow-diagram .col.to { grid-column: 5; }
.b-kit-flow-diagram .nd { flex: 1 1 0; max-height: 37cqh; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.3); padding: calc(var(--gap) * 0.6) calc(var(--gap) * 0.7); border-radius: var(--radius); background: var(--bg2); border: 1px solid var(--line); }
.b-kit-flow-diagram .nd b { font-weight: var(--light); font-size: calc(var(--lead) * 1.1); color: var(--ink); line-height: 1.08; letter-spacing: -0.015em; text-wrap: balance; }
.b-kit-flow-diagram .nd span { font-size: calc(var(--body) * 0.9); color: var(--dim); line-height: 1.32; text-wrap: pretty; }
.b-kit-flow-diagram .col.to .nd { border-left: calc(var(--label) * 0.16) solid var(--gold); }
.b-kit-flow-diagram .hub { grid-column: 3; flex: none; height: min(100%, 54cqh); max-height: none; background: var(--gold2); border-color: var(--gold2); gap: calc(var(--gap) * 0.45); }
.b-kit-flow-diagram .hub b { color: var(--bg); font-weight: 400; font-size: calc(var(--lead) * 1.2); }
.b-kit-flow-diagram .hub span { color: var(--bg); opacity: 0.88; font-size: calc(var(--body) * 0.95); }
.b-kit-flow-diagram .hub i { display: block; height: 2px; width: 3em; background: var(--bg); opacity: 0.7; }
.b-kit-flow-diagram svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.b-kit-flow-diagram .ln { fill: none; stroke: var(--gold); stroke-dasharray: 1 1; }
.b-kit-flow-diagram .sk { fill: var(--bg); stroke: var(--gold2); }
.b-kit-flow-diagram .tip { fill: var(--ink); stroke: var(--gold2); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .wrap { padding: calc(var(--pad) * 0.8 + var(--top)) var(--pad) calc(var(--pad) * 0.7); gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .hd .cs-title { font-size: calc(var(--title) * 0.8); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .dia { display: flex; flex-direction: column; align-items: stretch; justify-content: center; gap: calc(var(--gap) * 1.5); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .col { height: auto; flex: none; gap: calc(var(--gap) * 0.7); padding-left: 13%; }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .nd { flex: none; max-height: none; padding: calc(var(--gap) * 1.05) calc(var(--gap) * 1.1); gap: calc(var(--gap) * 0.3); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .nd b { font-size: calc(var(--lead) * 1.2); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .nd span { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .hub { height: auto; padding-top: calc(var(--gap) * 1.7); padding-bottom: calc(var(--gap) * 1.7); }
.cs-frame[data-shape="tall"] .b-kit-flow-diagram .hub b { font-size: calc(var(--lead) * 1.3); }
`;
const __mount = function mount(el, p, cx) {
  const tall = cx.shape === 'tall';
  const norm = (x) => (typeof x === 'string' ? {title: x} : x || {});
  const from = [].concat(p.from || []).slice(0, 3).map(norm), to = [].concat(p.to || []).slice(0, 4).map(norm), hub = norm(p.hub);
  const card = (n, c) => `<div class="nd ${c}"><b>${cx.esc(n.title || '')}</b>${n.text ? `<span>${cx.esc(n.text)}</span>` : ''}</div>`;
  const nf = from.length, nt = to.length, nl = nf + nt;
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="dia">
      <div class="col from">${from.map((n) => card(n, 'f')).join('')}</div>
      <div class="nd hub"><b>${cx.esc(hub.title || '')}</b>${hub.text ? `<i aria-hidden="true"></i><span>${cx.esc(hub.text)}</span>` : ''}</div>
      <div class="col to">${to.map((n) => card(n, 't')).join('')}</div>
      <svg aria-hidden="true">${'<path class="ln" pathLength="1"/>'.repeat(nl)}${'<circle class="sk"/><circle class="sk"/>'.repeat(nl)}${'<circle class="tip"/>'.repeat(nl)}</svg>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const dia = q('.dia'), hubEl = q('.hub'), fs = qa('.nd.f'), ts = qa('.nd.t'), lns = qa('.ln'), sks = qa('.sk'), tips = qa('.tip');
  const box = (e) => ({x: e.offsetLeft, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight});
  let lens = [];
  // the lines are drawn in real pixels of the diagram, and again when the page is resized
  function draw() {
    const W = dia.clientWidth, H = dia.clientHeight; if (!W || !H) return;
    const lw = cx.clamp(Math.max(W, H) * 0.004, 3, 8), hb = box(hubEl), ends = [];
    const set = (i, d, a, b) => { lns[i].setAttribute('d', d); lns[i].setAttribute('stroke-width', lw); ends[i] = [a, b]; };
    if (!tall) {
      const s = (a, b) => `M${a.x} ${a.y} C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;
      fs.forEach((e, i) => { const f = box(e), a = {x: f.x + f.w, y: f.y + f.h / 2}, b = {x: hb.x, y: hb.y + (hb.h * (i + 1)) / (nf + 1)}; set(i, s(a, b), a, b); });
      ts.forEach((e, j) => { const t = box(e), a = {x: hb.x + hb.w, y: hb.y + (hb.h * (j + 1)) / (nt + 1)}, b = {x: t.x, y: t.y + t.h / 2}; set(nf + j, s(a, b), a, b); });
    } else {
      // a trunk runs down the left side: every card joins it with a round corner
      const first = box(fs[0] || ts[0] || hubEl), tx = hb.x + (first.x - hb.x) * 0.42, rr = (first.x - tx) * 0.9;
      fs.forEach((e, i) => { const f = box(e), a = {x: f.x, y: f.y + f.h / 2}, b = {x: tx, y: hb.y}; set(i, `M${a.x} ${a.y} L${tx + rr} ${a.y} Q${tx} ${a.y} ${tx} ${a.y + rr} L${b.x} ${b.y}`, a, b); });
      ts.forEach((e, j) => { const t = box(e), a = {x: tx, y: hb.y + hb.h}, b = {x: t.x, y: t.y + t.h / 2}; set(nf + j, `M${a.x} ${a.y} L${tx} ${b.y - rr} Q${tx} ${b.y} ${tx + rr} ${b.y} L${b.x} ${b.y}`, a, b); });
    }
    lens = lns.map((l) => l.getTotalLength());
    ends.forEach((pair, i) => pair.forEach((pt, k) => { const c = sks[i * 2 + k]; c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('r', lw * 1.5); c.setAttribute('stroke-width', Math.max(1.5, lw * 0.45)); }));
    tips.forEach((c) => { c.setAttribute('r', lw * 1.7); c.setAttribute('stroke-width', lw * 0.8); });
  }
  draw();
  const slide = tall ? 'translateY(22px)' : 'translateX(-36px)', into = tall ? 'translateY(22px)' : 'translateX(36px)';
  const L1 = 0.5, L2 = 1.25, LD = 0.5, G1 = 0.08, G2 = 0.12, DUR = L2 + G2 * Math.max(0, nt - 1) + 0.35 + 0.65;
  const head = qa('.hd > *');
  if (head.length) cx.wa(head, [{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], {duration: 0.65, stagger: 0.09});
  cx.wa(fs, [{opacity: 0, transform: slide}, {opacity: 1, transform: 'none'}], {duration: 0.65, delay: 0.15, stagger: 0.1});
  cx.wa(hubEl, [{opacity: 0, transform: 'scale(0.88)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: nf ? L1 + 0.35 : 0.3, ease: 'cubic-bezier(.2,1.3,.4,1)'});
  cx.wa(ts, [{opacity: 0, transform: into}, {opacity: 1, transform: 'none'}], {duration: 0.65, delay: L2 + 0.35, stagger: G2});
  const starts = lns.map((l, i) => (i < nf ? L1 + G1 * i : L2 + G2 * (i - nf)));
  lns.forEach((l, i) => {
    cx.wa(l, [{strokeDashoffset: 1, opacity: 0}, {strokeDashoffset: 0.96, opacity: 1, offset: 0.04}, {strokeDashoffset: 0, opacity: 1}], {duration: LD, delay: starts[i], ease: 'linear'});
    cx.wa(sks[i * 2], [{opacity: 0}, {opacity: 1}], {duration: 0.15, delay: starts[i], ease: 'linear'});
    cx.wa(sks[i * 2 + 1], [{opacity: 0}, {opacity: 1}], {duration: 0.2, delay: starts[i] + LD - 0.05, ease: 'linear'});
  });
  const anims = cx.fromWaapi(el, {dur: DUR});
  // the gold dot on the tip of each line: where it is depends only on t
  const dots = cx.fromFn(DUR, (t) => {
    tips.forEach((c, i) => {
      const pr = (t - starts[i]) / LD;
      if (pr <= 0 || pr >= 1 || !lens[i]) { c.style.opacity = 0; return; }
      const pt = lns[i].getPointAtLength(lens[i] * pr);
      c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.style.opacity = 1;
    });
  });
  dots.fit = draw;
  return cx.all(anims, dots);
}

CS.register("kit/flow-diagram", __mount, typeof css === "string" ? css : "", {"kind":"kit/flow-diagram","title":"Flow diagram","use":"diagram","family":"flow-through-hub","lead":"picture","site":null,"dur":2.5,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/hero-video */
(function(){
// A person on screen (video or photo) and the opening line beside them. The text never touches the face:
// give the face box and the block puts the words on the other side.
const css = `
.b-kit-hero-video .media { position: absolute; top: 0; bottom: 0; right: 0; width: 60%; overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 26%); mask-image: linear-gradient(90deg, transparent 0%, #000 26%); }
.b-kit-hero-video.flip .media { right: auto; left: 0; -webkit-mask-image: linear-gradient(270deg, transparent 0%, #000 26%); mask-image: linear-gradient(270deg, transparent 0%, #000 26%); }
.b-kit-hero-video .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-hero-video .copy { position: absolute; top: var(--top); bottom: 0; left: 0; width: 47%; padding: var(--pad); padding-right: 0; display: flex; flex-direction: column; justify-content: center; gap: var(--gap); }
.b-kit-hero-video.flip .copy { left: auto; right: 0; padding-right: var(--pad); padding-left: 0; }
.b-kit-hero-video .cs-hero { font-size: calc(var(--hero) * 0.62); line-height: 1.02; }
.b-kit-hero-video .cs-w { margin-right: 0.22em; }
.b-kit-hero-video .cs-lead { max-width: 19em; }
.b-kit-hero-video .name { display: flex; align-items: center; gap: 0.9em; }
.b-kit-hero-video .name i { width: 2.6em; height: 1px; background: var(--gold); display: block; transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-hero-video .media { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 50%;
  -webkit-mask-image: linear-gradient(180deg, #000 70%, transparent 100%); mask-image: linear-gradient(180deg, #000 70%, transparent 100%); }
.cs-frame[data-shape="tall"] .b-kit-hero-video .copy { top: calc(50% + var(--top)); left: 0; right: 0; width: auto; padding: calc(var(--pad) * 0.6) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-kit-hero-video .cs-hero { font-size: var(--title); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const face = p.face || [0.38, 0.15, 0.24, 0.45];
  if (p.side === 'right') el.classList.add('flip');
  const fx = Math.round((face[0] + face[2] / 2) * 100);
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Video of the speaker')}" style="object-position:${fx}% 30%"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Photo of the speaker')}" style="object-position:${fx}% 30%">`;
  el.innerHTML = `
    <div class="media">${media}</div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h1 class="cs-hero">${cx.spans(p.title, 'cs-w')}</h1>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
      ${p.name ? `<div class="name"><i></i><span class="cs-label">${cx.esc(p.name)}</span></div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *');
  cx.face(m, face);
  cx.wa(q('.media'), [{opacity: 0, clipPath: 'inset(0 0 0 18%)'}, {opacity: 1, clipPath: 'inset(0 0 0 0%)'}], {duration: 1.4});
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0, letterSpacing: '0.6em'}, {opacity: 1, letterSpacing: '0.34em'}], {duration: 0.9, delay: 0.25});
  cx.wa(el.querySelectorAll('.cs-w'), [{opacity: 0, filter: 'blur(16px)', transform: 'translateY(0.25em)'}, {opacity: 1, filter: 'blur(0px)', transform: 'none'}], {duration: 0.8, delay: 0.45, stagger: 0.085});
  const n = el.querySelectorAll('.cs-w').length, t1 = 0.45 + 0.085 * n + 0.3;
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.8, delay: t1});
  if (q('.name')) { cx.wa(q('.name i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.8, delay: t1 + 0.25}); cx.wa(q('.name span'), [{opacity: 0}, {opacity: 1}], {duration: 0.7, delay: t1 + 0.4}); }
  const text = cx.fromWaapi(el);
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/hero-video", __mount, typeof css === "string" ? css : "", {"kind":"kit/hero-video","title":"Hero with a person","use":"person","family":"hero-person","lead":"picture","site":null,"dur":2.2,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/ident */
(function(){
// A brand ident: a wide-tracked wordmark lights up letter by letter, a thin gold rule draws from the centre, one small line settles under it.
const css = `
.b-kit-ident .wrap { position: absolute; inset: 0; padding: var(--top) var(--pad) 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--gap) * 0.95); text-align: center; }
.b-kit-ident .name { font-size: min(calc(var(--title) * 0.62), 3.5cqw); font-weight: var(--light); letter-spacing: 0.42em; text-indent: 0.42em; text-transform: uppercase; color: var(--ink); white-space: nowrap; line-height: 1.1; }
.b-kit-ident .ch { display: inline-block; will-change: opacity, filter; }
.b-kit-ident .rule { display: block; height: 1px; width: min(34cqw, calc(var(--title) * 4)); background: var(--gold); }
.b-kit-ident .line { font-size: var(--label); font-weight: 400; letter-spacing: 0.34em; text-indent: 0.34em; text-transform: uppercase; color: var(--ivory); line-height: 1.5; max-width: 30em; }
.b-kit-ident .small { font-size: var(--label); font-weight: 400; letter-spacing: 0.5em; text-indent: 0.5em; text-transform: uppercase; color: var(--gold2); line-height: 1.3; margin-top: calc(var(--gap) * 0.6); }
.cs-frame[data-shape="tall"] .b-kit-ident .name { font-size: 4.5cqw; letter-spacing: 0.36em; text-indent: 0.36em; }
.cs-frame[data-shape="tall"] .b-kit-ident .rule { width: 46cqw; }
.cs-frame[data-shape="tall"] .b-kit-ident .line { letter-spacing: 0.22em; text-indent: 0.22em; }
`;
const __mount = function mount(el, p, cx) {
  el.innerHTML = `<div class="wrap">
    <h2 class="name" aria-label="${cx.esc(p.name)}">${cx.spans(p.name, 'ch', 'chars')}</h2>
    <i class="rule" aria-hidden="true"></i>
    ${p.line ? `<p class="line">${cx.esc(p.line)}</p>` : ''}
    ${p.small ? `<p class="small">${cx.esc(p.small)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), chars = el.querySelectorAll('.ch'), n = chars.length;
  const each = Math.min(0.06, 0.9 / Math.max(1, n)), t1 = 0.25 + each * n;
  cx.wa(chars, [{opacity: 0, filter: 'blur(8px)'}, {opacity: 1, filter: 'blur(0px)'}], {duration: 0.9, delay: 0.25, stagger: each, ease: 'cubic-bezier(.2,.7,.2,1)'});
  cx.wa(q('.rule'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 1.2, delay: t1 + 0.1, ease: 'cubic-bezier(.65,0,.2,1)'});
  if (q('.line')) cx.wa(q('.line'), [{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'none'}], {duration: 0.9, delay: t1 + 0.55});
  if (q('.small')) cx.wa(q('.small'), [{opacity: 0}, {opacity: 1}], {duration: 0.9, delay: t1 + 0.95, ease: 'ease-out'});
  return cx.fromWaapi(el);
}

CS.register("kit/ident", __mount, typeof css === "string" ? css : "", {"kind":"kit/ident","title":"Ident","use":"ident","family":"ident-wordmark","lead":"type","site":null,"dur":3.1,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/mosaic */
(function(){
// A wall of pictures and clips: one or two large tiles and several small ones fill the whole frame.
// The tiles open one after another, each from its own side, and every picture keeps pushing in very slowly.
// The title lives in a tile of its own, never on a picture. One tile (or more) can be a video. Two columns on a phone.
const css = `
.b-kit-mosaic .wall { position: absolute; inset: 0; padding: calc(var(--gap) * 0.26); display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-template-rows: repeat(6, minmax(0, 1fr)); gap: calc(var(--gap) * 0.26); }
.b-kit-mosaic .tile { position: relative; overflow: hidden; border-radius: calc(var(--radius) * 0.22); background: #000; min-width: 0; min-height: 0; will-change: clip-path; box-shadow: 0 0 0 1px var(--line); }
.b-kit-mosaic .tile > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; will-change: transform; }
.b-kit-mosaic .words { position: relative; min-width: 0; min-height: 0; padding: calc(var(--gap) * 0.5) calc(var(--gap) * 0.9); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.36); }
.b-kit-mosaic .words .line { display: block; width: calc(var(--title) * 0.9); height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-kit-mosaic .words .cs-kicker { letter-spacing: 0.3em; }
.b-kit-mosaic .words h2 { font-size: calc(var(--title) * 0.62); font-weight: var(--thin); letter-spacing: -0.028em; line-height: 1.02; color: var(--ink); text-wrap: balance; }
.b-kit-mosaic .words p { font-size: calc(var(--body) * 0.8); line-height: 1.34; color: var(--dim); text-wrap: pretty; }
.cs-frame[data-stage="deck"] .b-kit-mosaic .words .cs-kicker { font-size: calc(var(--label) * 0.82); }
.cs-frame[data-stage="site"] .b-kit-mosaic .words p { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-kit-mosaic .wall { top: var(--top); grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(8, minmax(0, 1fr)); padding: calc(var(--gap) * 0.5); gap: calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-kit-mosaic .words { padding: 0 calc(var(--pad) * 0.6); gap: calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-kit-mosaic .words h2 { font-size: calc(var(--title) * 0.86); }
`;
// tiles on a 12 x 6 grid as [column, row, columns, rows]; the last entry is the tile for the words
const WIDE = {
  3: [[1, 1, 8, 6], [9, 1, 4, 2], [9, 5, 4, 2], [9, 3, 4, 2]],
  4: [[1, 1, 5, 6], [6, 1, 3, 6], [9, 1, 4, 2], [9, 5, 4, 2], [9, 3, 4, 2]],
  5: [[1, 1, 5, 4], [1, 5, 5, 2], [6, 1, 3, 6], [9, 1, 4, 2], [9, 5, 4, 2], [9, 3, 4, 2]],
  6: [[1, 1, 5, 4], [1, 5, 5, 2], [6, 1, 3, 3], [9, 1, 4, 2], [6, 4, 3, 3], [9, 5, 4, 2], [9, 3, 4, 2]],
  7: [[1, 1, 5, 4], [1, 5, 5, 2], [6, 1, 3, 3], [9, 1, 4, 2], [6, 4, 3, 3], [9, 5, 2, 2], [11, 5, 2, 2], [9, 3, 4, 2]],
  8: [[1, 1, 5, 4], [1, 5, 2, 2], [6, 1, 3, 3], [9, 1, 4, 2], [6, 4, 3, 3], [9, 5, 2, 2], [11, 5, 2, 2], [3, 5, 3, 2], [9, 3, 4, 2]],
};
// the phone wall: 2 columns x 8 rows, the first picture and the words are full width
const TALL = {
  3: [[1, 1, 2, 2], [1, 5, 1, 4], [2, 5, 1, 4], [1, 3, 2, 2]],
  4: [[1, 1, 2, 2], [1, 5, 1, 4], [2, 5, 1, 2], [2, 7, 1, 2], [1, 3, 2, 2]],
  5: [[1, 1, 2, 2], [1, 5, 1, 3], [2, 5, 1, 2], [2, 7, 1, 2], [1, 8, 1, 1], [1, 3, 2, 2]],
  6: [[1, 1, 2, 2], [1, 5, 1, 2], [2, 5, 1, 1], [2, 6, 1, 1], [1, 7, 1, 2], [2, 7, 1, 2], [1, 3, 2, 2]],
  7: [[1, 1, 2, 2], [1, 5, 1, 2], [2, 5, 1, 1], [2, 6, 1, 1], [1, 7, 1, 1], [2, 7, 1, 2], [1, 8, 1, 1], [1, 3, 2, 2]],
  8: [[1, 1, 2, 2], [1, 5, 1, 2], [2, 5, 1, 1], [2, 6, 1, 1], [1, 7, 1, 1], [2, 7, 1, 1], [2, 8, 1, 1], [1, 8, 1, 1], [1, 3, 2, 2]],
};
const __mount = function mount(el, p, cx) {
  const items = (p.items || []).map((it) => (typeof it === 'string' ? {src: it} : it)).slice(0, 8), n = cx.clamp(items.length, 3, 8), tall = cx.shape === 'tall';
  const lay = (tall ? TALL : WIDE)[n], area = (a) => `grid-area:${a[1]} / ${a[0]} / span ${a[3]} / span ${a[2]}`;
  const isVid = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  const pos = (it) => (Array.isArray(it.face) ? `${Math.round((it.face[0] + it.face[2] / 2) * 100)}% ${Math.round(cx.clamp((it.face[1] + it.face[3] / 2) * 100 - 6, 0, 100))}%` : '50% 50%');
  const tag = (it) => (isVid(it.src)
    ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(it.alt || 'Video')}" style="object-position:${pos(it)}"></video>`
    : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || 'Picture')}" style="object-position:${pos(it)}">`);
  el.innerHTML = `<div class="wall">
    ${items.slice(0, n).map((it, i) => `<div class="tile" style="${area(lay[i])}">${tag(it)}</div>`).join('')}
    <div class="words" style="${area(lay[n])}">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2>${cx.esc(p.title)}</h2>` : ''}
      <i class="line" aria-hidden="true"></i>
      ${p.text ? `<p>${cx.esc(p.text)}</p>` : ''}
    </div>
  </div>`;
  const tiles = Array.from(el.querySelectorAll('.tile')), media = tiles.map((t) => t.firstElementChild);
  const from = ['inset(0% 100% 0% 0%)', 'inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 100%)', 'inset(0% 0% 100% 0%)'];
  const each = 0.12, t0 = 0.1, open = 0.95, total = t0 + each * (n - 1) + open + 0.75;
  tiles.forEach((t, i) => {
    const d = t0 + each * i, person = Array.isArray(items[i].face);
    if (person) { cx.face(media[i], items[i].face); if (Array.isArray(items[i].body)) cx.face(media[i], items[i].body, 'body'); }
    cx.wa(t, [{clipPath: from[i % 4]}, {clipPath: 'inset(0% 0% 0% 0%)'}], {duration: open, delay: d, ease: 'cubic-bezier(.7,0,.15,1)'});
    // settles as the tile opens, then keeps pushing in by 2 % until the end (a person is never shown larger than the picture)
    if (!person) cx.wa(media[i], [{transform: 'scale(1.09)', easing: 'cubic-bezier(.16,1,.3,1)'}, {transform: 'scale(1)', offset: 0.45, easing: 'linear'}, {transform: 'scale(1.02)'}], {duration: total - d, delay: d, ease: 'linear'});
  });
  const tw = t0 + each * Math.min(n, 4);
  const w = el.querySelectorAll('.words > :not(.line)');
  cx.wa(w, [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: tw, stagger: 0.12});
  cx.wa(el.querySelector('.line'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.8, delay: tw + 0.2});
  const clip = cx.fromWaapi(el, {dur: total});
  const vids = media.filter((m) => m.tagName === 'VIDEO').map((v) => cx.fromVideo(v));
  return vids.length ? cx.all.apply(null, [clip].concat(vids)) : clip;
}

CS.register("kit/mosaic", __mount, typeof css === "string" ? css : "", {"kind":"kit/mosaic","title":"Mosaic wall","use":"media","family":"mosaic-wall","lead":"picture","site":null,"dur":2.5,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/nametag */
(function(){
// The person is the picture: video or photo fills one side, a quiet name plate sits low on the other side.
// Give the face box: the picture is framed on the face and the plate stays away from it.
const css = `
.b-kit-nametag .media { position: absolute; top: 0; bottom: 0; right: 0; width: 66%; overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 20%); mask-image: linear-gradient(90deg, transparent 0%, #000 20%); }
.b-kit-nametag.flip .media { right: auto; left: 0; -webkit-mask-image: linear-gradient(270deg, transparent 0%, #000 20%); mask-image: linear-gradient(270deg, transparent 0%, #000 20%); }
.b-kit-nametag .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-nametag .plate { position: absolute; left: var(--pad); bottom: calc(var(--pad) * 0.9); width: 31%; display: grid; grid-template-columns: auto 1fr; column-gap: calc(var(--gap) * 0.7); }
.b-kit-nametag.flip .plate { left: auto; right: var(--pad); }
.b-kit-nametag .bar { width: 2px; background: var(--gold); transform-origin: 50% 100%; }
.b-kit-nametag .txt { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); padding: 0.2em 0; min-width: 0; }
.b-kit-nametag .name { font-size: calc(var(--hero) * 0.56); font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1; color: var(--ink); text-wrap: balance; }
.b-kit-nametag .mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.1em; margin-right: 0.22em; }
.b-kit-nametag .mask > span { display: inline-block; }
.b-kit-nametag .role { color: var(--gold2); }
.b-kit-nametag .note { font-size: var(--body); color: var(--dim); line-height: 1.35; }
.cs-frame[data-shape="tall"] .b-kit-nametag .media { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 60%;
  -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent 100%); mask-image: linear-gradient(180deg, #000 72%, transparent 100%); }
.cs-frame[data-shape="tall"] .b-kit-nametag .plate { left: var(--pad); right: var(--pad); width: auto; bottom: auto; top: calc(60% + var(--top) + var(--gap) * 0.4); }
.cs-frame[data-shape="tall"] .b-kit-nametag .name { font-size: calc(var(--hero) * 0.92); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const face = p.face || null;
  if (p.side === 'right') el.classList.add('flip');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.name)}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.name)}">`;
  el.innerHTML = `
    <div class="media">${tag}</div>
    <div class="plate">
      <i class="bar" aria-hidden="true"></i>
      <div class="txt">
        ${p.role ? `<div class="cs-label role">${cx.esc(p.role)}</div>` : ''}
        <h2 class="name">${String(p.name).split(/\s+/).map((w) => `<span class="mask"><span>${cx.esc(w)}</span></span>`).join('')}</h2>
        ${p.note ? `<p class="note">${cx.esc(p.note)}</p>` : ''}
      </div>
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *'), box = q('.media');
  // frame the picture on the face: its centre goes to the centre of the panel (40 % from the top)
  const place = () => {
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, bw = box.offsetWidth, bh = box.offsetHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.4) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  cx.wa(box, [{opacity: 0}, {opacity: 1}], {duration: 1.3, ease: 'ease-out'});
  cx.wa(q('.bar'), [{transform: 'scaleY(0)'}, {transform: 'scaleY(1)'}], {duration: 0.9, delay: 0.6});
  if (q('.role')) cx.wa(q('.role'), [{opacity: 0, transform: 'translateX(-12px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.8});
  cx.wa(el.querySelectorAll('.mask > span'), [{transform: 'translateY(110%)'}, {transform: 'none'}], {duration: 0.9, delay: 0.95, stagger: 0.1});
  if (q('.note')) cx.wa(q('.note'), [{opacity: 0}, {opacity: 1}], {duration: 0.8, delay: 1.5, ease: 'ease-out'});
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/nametag", __mount, typeof css === "string" ? css : "", {"kind":"kit/nametag","title":"Name tag","use":"person","family":"name-plate","lead":"picture","site":null,"dur":2.3,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/photo-frame */
(function(){
// A screen recording or a result picture, shown large in a rounded glass window with a thin window bar. The picture grows 2 % very slowly; a caption sits under it.
const css = `
.b-kit-photo-frame .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.4 + var(--top)) calc(var(--pad) * 0.75) calc(var(--pad) * 0.4); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.65); }
.b-kit-photo-frame .win { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.b-kit-photo-frame .bar { flex: none; display: flex; align-items: center; gap: 0.55em; height: 2.1em; padding: 0 1.1em; font-size: var(--label); background: var(--bg2); border-bottom: 1px solid var(--line); }
.b-kit-photo-frame .bar i { display: block; width: 0.6em; height: 0.6em; border-radius: 50%; border: 1px solid var(--dim); }
.b-kit-photo-frame .bar b { flex: 1; height: 1px; margin-left: 0.9em; background: var(--line); }
.b-kit-photo-frame .view { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; background: #000; }
.b-kit-photo-frame .view > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0%; transform-origin: 50% 30%; }
.b-kit-photo-frame .cap { flex: none; display: flex; align-items: baseline; gap: calc(var(--gap) * 0.8); }
.b-kit-photo-frame .cap .cs-kicker { flex: none; }
.b-kit-photo-frame .cap .tx { font-size: var(--body); color: var(--ivory); line-height: 1.35; }
.cs-frame[data-shape="tall"] .b-kit-photo-frame .wrap { padding-left: var(--pad); padding-right: var(--pad); gap: calc(var(--gap) * 1.1); }
.cs-frame[data-shape="tall"] .b-kit-photo-frame .win { flex: none; aspect-ratio: 16 / 10.4; }
.cs-frame[data-shape="tall"] .b-kit-photo-frame .cap { flex-direction: column; gap: calc(var(--gap) * 0.5); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.caption || 'Screen recording')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.caption || 'Picture of the result')}">`;
  el.innerHTML = `<div class="wrap">
    <div class="win cs-shot">
      <div class="bar" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
      <div class="view">${tag}</div>
    </div>
    ${p.caption || p.kicker ? `<div class="cap">${p.kicker ? `<span class="cs-kicker">${cx.esc(p.kicker)}</span>` : ''}${p.caption ? `<span class="tx">${cx.esc(p.caption)}</span>` : ''}</div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), m = q('.view > *'), dur = 2.8;
  cx.wa(q('.win'), [{opacity: 0, transform: 'translateY(48px) scale(0.965)'}, {opacity: 1, transform: 'none'}], {duration: 1.1});
  cx.wa(m, [{transform: 'scale(1)'}, {transform: 'scale(1.02)'}], {duration: dur, ease: 'linear'});
  cx.wa(el.querySelectorAll('.cap > *'), [{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.75, stagger: 0.12});
  const text = cx.fromWaapi(el);
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/photo-frame", __mount, typeof css === "string" ? css : "", {"kind":"kit/photo-frame","title":"Result in a window","use":"media","family":"glass-window","lead":"picture","site":null,"dur":2.8,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/quote-film */
(function(){
// What he really said, next to the clip where he says it. The clip of the person fills one side (60 %), framed on the face;
// on the other side the words of that moment arrive phrase by phrase, thin and large, with one word in gold and a small source line.
// Nothing is drawn on the person: give the face box (and the body box) and the words stay in their own column.
const css = `
.b-kit-quote-film .media { position: absolute; top: 0; bottom: 0; left: 0; width: 60%; overflow: hidden; background: #000; }
.b-kit-quote-film.flip .media { left: auto; right: 0; }
.b-kit-quote-film .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-quote-film .edge { position: absolute; top: 0; bottom: 0; left: 60%; width: 2px; background: var(--gold); transform-origin: 50% 0; }
.b-kit-quote-film.flip .edge { left: 40%; margin-left: -2px; }
.b-kit-quote-film .copy { position: absolute; top: var(--top); bottom: 0; right: 0; width: 40%; padding: var(--pad) calc(var(--pad) * 0.8) var(--pad) calc(var(--pad) * 0.66); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.7); }
.b-kit-quote-film.flip .copy { right: auto; left: 0; padding: var(--pad) calc(var(--pad) * 0.66) var(--pad) calc(var(--pad) * 0.8); }
.b-kit-quote-film .qm { font-family: var(--serif); font-size: calc(var(--lead) * 1.9); line-height: 0.6; height: 0.42em; color: var(--gold2); }
.b-kit-quote-film .lines { display: flex; flex-direction: column; gap: 0.14em; font-size: calc(var(--title) * 0.66); font-weight: var(--thin); letter-spacing: -0.022em; line-height: 1.12; color: var(--ink); }
.b-kit-quote-film .lines.many { font-size: calc(var(--title) * 0.54); }
.b-kit-quote-film .ln { display: block; word-break: keep-all; overflow-wrap: break-word; text-wrap: balance; will-change: clip-path, transform, opacity; }
.b-kit-quote-film .src { display: flex; align-items: center; gap: 0.9em; margin-top: calc(var(--gap) * 0.3); }
.b-kit-quote-film .src i { display: block; flex: none; width: 2.6em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .media { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 46%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .edge { left: 0; right: 0; width: auto; margin: 0; top: calc(46% + var(--top)); bottom: auto; height: 2px; transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .copy { top: calc(46% + var(--top)); left: 0; right: 0; width: auto; padding: calc(var(--pad) * 1.1) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-kit-quote-film .lines { font-size: calc(var(--title) * 0.92); }
.cs-frame[data-shape="tall"] .b-kit-quote-film .lines.many { font-size: calc(var(--title) * 0.76); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || ''), face = p.face || null, tall = cx.shape === 'tall';
  if (p.side === 'left') el.classList.add('flip');
  const lines = [].concat(p.lines || []).map(String).filter(Boolean).slice(0, 4), gold = [].concat(p.gold || []).map(String).filter(Boolean);
  // the gold words: every place where one of them stands in a line
  const paint = (s) => {
    if (!gold.length) return cx.esc(s);
    const re = new RegExp('(' + gold.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
    return s.split(re).map((part, i) => (i % 2 ? `<span class="cs-gold">${cx.esc(part)}</span>` : cx.esc(part))).join('');
  };
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Video of the speaker')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Photo of the speaker')}">`;
  el.innerHTML = `
    <div class="media">${tag}</div>
    <i class="edge" aria-hidden="true"></i>
    <div class="copy">
      <div class="qm" aria-hidden="true">&ldquo;</div>
      <blockquote class="lines${lines.length > 2 ? ' many' : ''}">${lines.map((l) => `<span class="ln">${paint(l)}</span>`).join('')}</blockquote>
      ${p.source ? `<div class="src"><i></i><span class="cs-label">${cx.esc(p.source)}</span></div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *'), box = q('.media');
  // frame the picture on the face: its centre goes to the middle of the panel, a little above half height
  const place = () => {
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, bw = box.offsetWidth, bh = box.offsetHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (p.body) cx.face(m, p.body, 'body');
  const open = tall ? ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] : p.side === 'left' ? ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'] : ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'];
  cx.wa(box, [{clipPath: open[0]}, {clipPath: open[1]}], {duration: 1.2, ease: 'cubic-bezier(.7,0,.2,1)'});
  cx.wa(q('.edge'), [{transform: tall ? 'scaleX(0)' : 'scaleY(0)'}, {transform: 'none'}], {duration: 0.9, delay: 0.5});
  cx.wa(q('.qm'), [{opacity: 0, transform: 'translateY(0.2em)'}, {opacity: 1, transform: 'none'}], {duration: 0.6, delay: 0.4, ease: 'ease-out'});
  // the phrases arrive one after another, each written in from the left, like speech
  const lns = el.querySelectorAll('.ln'), gap = lns.length > 1 ? Math.min(0.45, 1.2 / (lns.length - 1)) : 0;
  cx.wa(lns, [{opacity: 0, clipPath: 'inset(-0.3em 100% -0.3em 0)', transform: 'translateX(-0.25em)'}, {opacity: 1, clipPath: 'inset(-0.3em 68% -0.3em 0)', transform: 'translateX(-0.17em)', offset: 0.28}, {opacity: 1, clipPath: 'inset(-0.3em -2% -0.3em 0)', transform: 'none'}], {duration: 0.95, delay: 0.55, stagger: gap, ease: 'cubic-bezier(.3,.1,.2,1)'});
  const t1 = 0.55 + gap * (lns.length - 1) + 0.35;
  if (q('.src')) { cx.wa(q('.src i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.7, delay: t1}); cx.wa(q('.src span'), [{opacity: 0}, {opacity: 1}], {duration: 0.5, delay: t1 + 0.05, ease: 'ease-out'}); }
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  return isVideo ? Object.assign(cx.all(text, cx.fromVideo(m)), {fit: place}) : text;
}

CS.register("kit/quote-film", __mount, typeof css === "string" ? css : "", {"kind":"kit/quote-film","title":"Quote with its clip","use":"quote","family":"quote-clip","lead":"picture","site":null,"dur":2.05,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/split-film */
(function(){
// Two pictures or clips side by side, edge to edge: a thin gold line is drawn down the middle and the two halves open away from it.
// Each half has its own label under the picture; a small title sits above. For "the same thing in two places" and for comparisons.
// Nothing is drawn on the pictures. On a phone the halves are stacked.
const css = `
.b-kit-split-film .wrap { position: absolute; inset: 0; padding-top: var(--top); display: grid; grid-template-rows: auto minmax(0, 1fr); }
.b-kit-split-film .hd { display: flex; align-items: baseline; justify-content: space-between; gap: var(--gap); padding: calc(var(--pad) * 0.36) calc(var(--pad) * 0.56) calc(var(--pad) * 0.3); }
.b-kit-split-film .cs-kicker { letter-spacing: 0.3em; }
.b-kit-split-film .hd h2 { font-size: calc(var(--lead) * 1.05); font-weight: var(--thin); letter-spacing: -0.015em; line-height: 1.1; color: var(--ink); text-align: right; text-wrap: balance; }
.b-kit-split-film .pair { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); min-height: 0; }
.b-kit-split-film .half { display: grid; grid-template-rows: minmax(0, 1fr) auto; min-width: 0; min-height: 0; }
.b-kit-split-film .m { position: relative; overflow: hidden; background: #000; will-change: clip-path; }
.b-kit-split-film .m > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; will-change: transform; }
.b-kit-split-film .mid { display: block; width: 2px; background: var(--gold); transform-origin: 50% 0; }
.b-kit-split-film .cap { padding: calc(var(--pad) * 0.3) calc(var(--pad) * 0.56) calc(var(--pad) * 0.4); display: grid; grid-template-columns: auto 1fr; align-items: baseline; column-gap: calc(var(--gap) * 0.6); row-gap: calc(var(--gap) * 0.16); }
.b-kit-split-film .cap .n { font-size: var(--label); letter-spacing: 0.2em; color: var(--gold2); }
.b-kit-split-film .cap .l { font-size: calc(var(--lead) * 1.1); font-weight: var(--thin); letter-spacing: -0.015em; line-height: 1.1; color: var(--ink); }
.b-kit-split-film .cap .d { grid-column: 2; font-size: calc(var(--body) * 0.8); line-height: 1.34; color: var(--dim); }
.cs-frame[data-stage="deck"] .b-kit-split-film .cs-kicker { font-size: calc(var(--label) * 0.86); }
.cs-frame[data-stage="site"] .b-kit-split-film .cap .d { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-kit-split-film .hd { flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.4); padding: calc(var(--pad) * 0.7) var(--pad) calc(var(--pad) * 0.7); }
.cs-frame[data-shape="tall"] .b-kit-split-film .hd h2 { text-align: left; font-size: calc(var(--lead) * 1.3); }
.cs-frame[data-shape="tall"] .b-kit-split-film .pair { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr); }
.cs-frame[data-shape="tall"] .b-kit-split-film .mid { width: 100%; height: 2px; transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-split-film .cap { padding: calc(var(--pad) * 0.5) var(--pad) calc(var(--pad) * 0.7); }
`;
const __mount = function mount(el, p, cx) {
  const tall = cx.shape === 'tall', sides = [p.left || {}, p.right || {}];
  const isVid = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  const pos = (it) => (Array.isArray(it.face) ? `${Math.round((it.face[0] + it.face[2] / 2) * 100)}% ${Math.round(cx.clamp((it.face[1] + it.face[3] / 2) * 100 - 6, 0, 100))}%` : '50% 50%');
  const tag = (it) => (isVid(it.src)
    ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(it.alt || it.label || 'Video')}" style="object-position:${pos(it)}"></video>`
    : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || it.label || 'Picture')}" style="object-position:${pos(it)}">`);
  const half = (it, i) => `<div class="half"><div class="m">${tag(it)}</div><div class="cap"><span class="n cs-num">0${i + 1}</span><span class="l">${cx.esc(it.label || '')}</span>${it.text ? `<span class="d">${cx.esc(it.text)}</span>` : ''}</div></div>`;
  el.innerHTML = `<div class="wrap">
    <div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : '<span></span>'}${p.title ? `<h2>${cx.esc(p.title)}</h2>` : ''}</div>
    <div class="pair">${half(sides[0], 0)}<i class="mid" aria-hidden="true"></i>${half(sides[1], 1)}</div>
  </div>`;
  const q = (s) => el.querySelector(s), ms = Array.from(el.querySelectorAll('.m')), media = ms.map((m) => m.firstElementChild), caps = Array.from(el.querySelectorAll('.cap'));
  sides.forEach((it, i) => { if (Array.isArray(it.face)) cx.face(media[i], it.face); if (Array.isArray(it.body)) cx.face(media[i], it.body, 'body'); });
  cx.wa(el.querySelectorAll('.hd > *'), [{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.1, stagger: 0.12});
  // the line first, then both halves open away from it
  cx.wa(q('.mid'), [{transform: tall ? 'scaleX(0)' : 'scaleY(0)'}, {transform: 'none'}], {duration: 1.0, delay: 0.15, ease: 'cubic-bezier(.6,0,.2,1)'});
  const from = tall ? ['inset(100% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'] : ['inset(0% 0% 0% 100%)', 'inset(0% 100% 0% 0%)'];
  ms.forEach((m, i) => {
    cx.wa(m, [{clipPath: from[i]}, {clipPath: 'inset(0% 0% 0% 0%)'}], {duration: 1.15, delay: 0.5 + i * 0.12, ease: 'cubic-bezier(.7,0,.15,1)'});
    if (!Array.isArray(sides[i].face)) cx.wa(media[i], [{transform: 'scale(1.1)'}, {transform: 'scale(1)'}], {duration: 1.6, delay: 0.5 + i * 0.12});
  });
  caps.forEach((c, i) => cx.wa(c.children, [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 1.2 + i * 0.18, stagger: 0.08}));
  const clip = cx.fromWaapi(el);
  const vids = media.filter((m) => m.tagName === 'VIDEO').map((v) => cx.fromVideo(v));
  return vids.length ? cx.all.apply(null, [clip].concat(vids)) : clip;
}

CS.register("kit/split-film", __mount, typeof css === "string" ? css : "", {"kind":"kit/split-film","title":"Split film","use":"compare","family":"split-film","lead":"picture","site":null,"dur":2.2,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/split-person */
(function(){
// A graphic panel and a camera column: the points light up one by one on the left, the speaker stays on screen in a tall column on the right.
const css = `
.b-kit-split-person .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.6); display: grid; grid-template-columns: 1fr 38%; column-gap: calc(var(--gap) * 1.7); }
.b-kit-split-person.flip .wrap { grid-template-columns: 38% 1fr; }
.b-kit-split-person.flip .cam { order: -1; }
.b-kit-split-person .panel { display: flex; flex-direction: column; justify-content: center; gap: var(--gap); min-width: 0; }
.b-kit-split-person .cs-title { font-size: var(--title); }
.b-kit-split-person .pts { display: flex; flex-direction: column; }
.b-kit-split-person .pt { position: relative; display: grid; grid-template-columns: 2.6em 1fr; align-items: baseline; padding: calc(var(--gap) * 0.55) 0; font-size: calc(var(--lead) * 1.12); }
.b-kit-split-person .pt::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--line); }
.b-kit-split-person .pt .n { font-size: var(--label); letter-spacing: 0.2em; color: var(--gold2); }
.b-kit-split-person .pt .t { color: var(--ink); line-height: 1.2; font-weight: var(--light); }
.b-kit-split-person .pt .mark { position: absolute; left: 0; bottom: 0; height: 1px; width: 100%; background: var(--gold); transform-origin: 0 50%; z-index: 1; }
.b-kit-split-person .cam { position: relative; border-radius: var(--radius); overflow: hidden; background: #000; border: 1px solid var(--line); min-height: 0; }
.b-kit-split-person .cam > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.cs-frame[data-shape="tall"] .b-kit-split-person .wrap { grid-template-columns: 1fr !important; grid-template-rows: 36cqh 1fr; row-gap: calc(var(--gap) * 1.3); padding-top: calc(var(--pad) * 0.5 + var(--top)); }
.cs-frame[data-shape="tall"] .b-kit-split-person .cam { order: -1; }
.cs-frame[data-shape="tall"] .b-kit-split-person .panel { justify-content: flex-start; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-kit-split-person .pt { padding: calc(var(--gap) * 0.6) 0; }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const face = p.face || null, pts = (p.points || []).slice(0, 4);
  if (p.side === 'left') el.classList.add('flip');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Video of the speaker')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Photo of the speaker')}">`;
  el.innerHTML = `<div class="wrap">
    <div class="panel">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      <ol class="pts">${pts.map((t, i) => `<li class="pt"><span class="n cs-num">${String(i + 1).padStart(2, '0')}</span><span class="t">${cx.esc(t.title || t)}</span><i class="mark" aria-hidden="true"></i></li>`).join('')}</ol>
    </div>
    <div class="cam">${tag}</div>
  </div>`;
  const q = (s) => el.querySelector(s), m = q('.cam > *'), box = q('.cam');
  const place = () => {
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, bw = box.clientWidth, bh = box.clientHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  cx.wa(box, [{opacity: 0, clipPath: 'inset(100% 0 0 0 round 1px)'}, {opacity: 1, clipPath: 'inset(0% 0 0 0 round 1px)'}], {duration: 1.1});
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) cx.wa(head, [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.2, stagger: 0.1});
  const t0 = 0.8, each = 0.65, steps = [];
  el.querySelectorAll('.pt').forEach((li, i) => {
    const at = t0 + each * i;
    cx.wa(li.querySelectorAll('.n, .t'), [{opacity: 0, transform: 'translateX(-18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.6, delay: at, stagger: 0.07});
    cx.wa(li.querySelector('.mark'), [{transform: 'scaleX(0)', opacity: 1}, {transform: 'scaleX(1)', opacity: 1, offset: 0.7}, {transform: 'scaleX(1)', opacity: 0}], {duration: 1.0, delay: at + 0.05, ease: 'cubic-bezier(.3,.7,.2,1)'});
    if (i > 0) steps.push(at - 0.03);
  });
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  if (p.click !== false) text.steps = steps;
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/split-person", __mount, typeof css === "string" ? css : "", {"kind":"kit/split-person","title":"Points and camera column","use":"person","family":"split-camera","lead":"picture","site":null,"dur":3.1,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* lottie/check-list */
(function(){
// Lottie (lottie-web): a short list; a gold check draws in front of each line, one after another.
const css = `
.b-lottie-check-list ul { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.7); }
.b-lottie-check-list li { display: flex; align-items: center; gap: calc(var(--gap) * 0.7); font-size: var(--lead); color: var(--ink); line-height: 1.2; }
.b-lottie-check-list .ck { flex: none; width: calc(var(--lead) * 1.9); height: calc(var(--lead) * 1.9); }
.b-lottie-check-list .tx { opacity: 0; }
`;
const __mount = function mount(el, p, cx) {
  const items = (p.items || []).slice(0, 5);
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <ul>${items.map((t) => `<li><span class="ck" aria-hidden="true"></span><span class="tx">${cx.esc(t)}</span></li>`).join('')}</ul>
  </div>`;
  const clips = [], gap = 0.55, t0 = 0.5;
  el.querySelectorAll('li').forEach((li, i) => {
    const anim = cx.lottie.loadAnimation({container: li.querySelector('.ck'), renderer: 'svg', loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(cx.meta.data['anim.json']))});
    clips.push(cx.fromLottie(anim, {at: t0 + gap * i, speed: 1.6}));
    cx.wa(li.querySelector('.tx'), [{opacity: 0, transform: 'translateX(-14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.6, delay: t0 + gap * i + 0.12});
  });
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) cx.wa(head, [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, stagger: 0.1});
  const clip = cx.all(cx.fromWaapi(el), ...clips);
  if (p.click !== false) clip.steps = items.slice(1).map((_, i) => t0 + gap * (i + 1) - 0.02);
  return clip;
}

CS.register("lottie/check-list", __mount, typeof css === "string" ? css : "", {"kind":"lottie/check-list","title":"Check list","use":"list","family":"lottie-check","lead":"type","site":null,"dur":2.6,"source":{"type":"lottie","package":"lottie-web","version":"5.13.0","note":"anim.json is written by tools/make-lottie.mjs (our own shapes, CC0)"},"license":"MIT","data":{"anim.json":{"v":"5.7.4","fr":30,"ip":0,"op":75,"w":400,"h":400,"nm":"gold-check","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"tick","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"tick","it":[{"ty":"sh","ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-62,4],[-18,46],[70,-46]],"c":false}},"nm":"Path"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":16,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":38,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":12},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":75,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"ring","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":-90},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"ring","it":[{"ty":"el","d":1,"s":{"a":0,"k":[300,300]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":0,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":26,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.8392156862745098,0.5372549019607843,0.16470588235294117,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":75,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"halo","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"halo","it":[{"ty":"el","d":1,"s":{"a":0,"k":[300,300]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"st","c":{"a":0,"k":[0.8392156862745098,0.5372549019607843,0.16470588235294117,1]},"o":{"a":1,"k":[{"t":24,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":30,"s":[60],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":60,"s":[0]}]},"w":{"a":0,"k":2},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":1,"k":[{"t":24,"s":[100,100],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":60,"s":[128,128]}]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":75,"st":0,"bm":0}]}}});
})();

/* lottie/player */
(function(){
// Lottie (lottie-web): any Lottie file, played once beside a title and a caption. Give "src": the build puts the file into the page
// (a page opened by double click cannot fetch it). Without src the kit's own drawing plays.
const css = `
.b-lottie-player .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.6); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 2); }
.b-lottie-player .stage { height: min(64cqh, 44cqw); aspect-ratio: 1; }
.b-lottie-player .stage svg { display: block; }
.b-lottie-player .copy { display: flex; flex-direction: column; gap: var(--gap); min-width: 0; }
.b-lottie-player .cs-lead { max-width: 20em; }
.cs-frame[data-shape="tall"] .b-lottie-player .wrap { grid-template-columns: 1fr; align-content: center; justify-items: center; row-gap: calc(var(--gap) * 1.6); text-align: center; }
.cs-frame[data-shape="tall"] .b-lottie-player .stage { height: auto; width: 72cqw; }
.cs-frame[data-shape="tall"] .b-lottie-player .copy { align-items: center; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-lottie-player .cs-rule { transform-origin: 50% 50%; }
`;
const __mount = function mount(el, p, cx) {
  el.innerHTML = `<div class="wrap">
    <div class="stage" role="img" aria-label="${cx.esc(p.alt || p.title || 'Animation')}"></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      <i class="cs-rule" aria-hidden="true"></i>
      ${p.caption ? `<p class="cs-lead">${cx.esc(p.caption)}</p>` : ''}
    </div>
  </div>`;
  const src = p.data && typeof p.data === 'object' ? p.data : cx.meta.data['anim.json'];
  const anim = cx.lottie.loadAnimation({container: el.querySelector('.stage'), renderer: 'svg', loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(src))});
  const n = anim.totalFrames || 1, fr = anim.frameRate || 30, speed = p.speed || 1, at = 0.15;
  let lot = cx.fromLottie(anim, {at, speed});
  if (p.loop) {
    // a loop is still a function of time: the frame is t modulo the file's length
    const turns = Math.max(1, Math.round(p.loop === true ? 2 : p.loop));
    lot = Object.assign(cx.fromFn(at + (n / fr / speed) * turns, (t) => anim.goToAndStop(((Math.max(0, t - at) * fr * speed) % n + n) % n, true)), {lib: 'lottie', dispose: () => anim.destroy()});
  }
  cx.wa(el.querySelectorAll('.cs-kicker, .cs-title, .cs-lead'), [{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], {duration: 0.8, delay: 0.55, stagger: 0.14});
  cx.wa(el.querySelector('.cs-rule'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: 0.95});
  return cx.all(cx.fromWaapi(el.querySelector('.copy')), lot);
}

CS.register("lottie/player", __mount, typeof css === "string" ? css : "", {"kind":"lottie/player","title":"Lottie player","use":"media","family":"lottie-stage","lead":"picture","site":null,"dur":3.2,"source":{"type":"lottie","package":"lottie-web","version":"5.13.0","note":"the built-in anim.json is written by tools/make-lottie.mjs (our own shapes, CC0)"},"license":"MIT","data":{"anim.json":{"v":"5.7.4","fr":30,"ip":0,"op":90,"w":400,"h":400,"nm":"orbit-settle","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"bead","sr":1,"ks":{"o":{"a":1,"k":[{"t":6,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":16,"s":[100]}]},"r":{"a":1,"k":[{"t":6,"s":[-140],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.2],"y":[0]}},{"t":80,"s":[150]}]},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"bead","it":[{"ty":"el","d":1,"s":{"a":0,"k":[20,20]},"p":{"a":0,"k":[0,-100]},"nm":"Ellipse"},{"ty":"fl","c":{"a":0,"k":[0.9490196078431372,0.7058823529411765,0.35294117647058826,1]},"o":{"a":0,"k":100},"r":1,"nm":"Fill"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"core dot","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":46,"s":[0,0,100],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":66,"s":[100,100,100]}]}},"ao":0,"shapes":[{"ty":"gr","nm":"dot","it":[{"ty":"el","d":1,"s":{"a":0,"k":[14,14]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"fl","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":100},"r":1,"nm":"Fill"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"core ring","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":36,"s":[0,0,100],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":62,"s":[100,100,100]}]}},"ao":0,"shapes":[{"ty":"gr","nm":"ring","it":[{"ty":"el","d":1,"s":{"a":0,"k":[66,66]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"st","c":{"a":0,"k":[0.8392156862745098,0.5372549019607843,0.16470588235294117,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":2.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":4,"ty":4,"nm":"arc gold","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":1,"k":[{"t":4,"s":[-200],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.2],"y":[0]}},{"t":82,"s":[40]}]},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"arc","it":[{"ty":"el","d":1,"s":{"a":0,"k":[290,290]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":6,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":48,"s":[34]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.8392156862745098,0.5372549019607843,0.16470588235294117,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":6},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":5,"ty":4,"nm":"arc ivory","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":1,"k":[{"t":10,"s":[150],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.2],"y":[0]}},{"t":80,"s":[-50]}]},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"arc","it":[{"ty":"el","d":1,"s":{"a":0,"k":[200,200]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":14,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":56,"s":[24]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":80},"w":{"a":0,"k":3},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":6,"ty":4,"nm":"arc far","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":1,"k":[{"t":16,"s":[-60],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.2],"y":[0]}},{"t":86,"s":[120]}]},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"arc","it":[{"ty":"el","d":1,"s":{"a":0,"k":[356,356]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":20,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":62,"s":[13]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9490196078431372,0.7058823529411765,0.35294117647058826,1]},"o":{"a":0,"k":75},"w":{"a":0,"k":2},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":7,"ty":4,"nm":"track outer","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":-90},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"track","it":[{"ty":"el","d":1,"s":{"a":0,"k":[290,290]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":0,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":30,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":20},"w":{"a":0,"k":1.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":8,"ty":4,"nm":"track inner","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":90},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"track","it":[{"ty":"el","d":1,"s":{"a":0,"k":[200,200]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":8,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":38,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":14},"w":{"a":0,"k":1.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":90,"st":0,"bm":0}]}}});
})();

/* lottie/stroke-title */
(function(){
// Lottie (lottie-web): a large line emblem (two open arcs, five ticks, one marker) draws beside a title.
const css = `
.b-lottie-stroke-title .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.6); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 1.5); }
.b-lottie-stroke-title .emblem { width: min(calc(var(--hero) * 2.7), 30cqw); aspect-ratio: 1; margin-left: calc(var(--hero) * -0.25); }
.b-lottie-stroke-title .emblem svg { display: block; }
.b-lottie-stroke-title .copy { display: flex; flex-direction: column; gap: var(--gap); min-width: 0; }
.b-lottie-stroke-title .cs-hero { font-size: calc(var(--hero) * 0.92); }
.b-lottie-stroke-title .cs-w { margin-right: 0.2em; }
.b-lottie-stroke-title .cs-lead { max-width: 22em; }
.cs-frame[data-shape="tall"] .b-lottie-stroke-title .wrap { grid-template-columns: 1fr; align-content: center; row-gap: calc(var(--gap) * 1.2); }
.cs-frame[data-shape="tall"] .b-lottie-stroke-title .emblem { width: 52cqw; margin-left: -5cqw; }
`;
const __mount = function mount(el, p, cx) {
  el.innerHTML = `<div class="wrap">
    <div class="emblem" aria-hidden="true"></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-hero">${cx.spans(p.title, 'cs-w')}</h2>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    </div>
  </div>`;
  const anim = cx.lottie.loadAnimation({container: el.querySelector('.emblem'), renderer: 'svg', loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(cx.meta.data['anim.json']))});
  const q = (s) => el.querySelector(s), ws = el.querySelectorAll('.cs-w'), t1 = 0.45 + 0.08 * ws.length;
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0, transform: 'translateX(-16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.3});
  cx.wa(ws, [{opacity: 0, transform: 'translateY(0.35em) rotate(2deg)'}, {opacity: 1, transform: 'none'}], {duration: 0.8, delay: 0.45, stagger: 0.08});
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.25});
  return cx.all(cx.fromWaapi(q('.copy')), cx.fromLottie(anim, {at: 0.05, speed: 1}));
}

CS.register("lottie/stroke-title", __mount, typeof css === "string" ? css : "", {"kind":"lottie/stroke-title","title":"Stroke title","use":"title","family":"lottie-emblem","lead":"type","site":null,"dur":2.3,"source":{"type":"lottie","package":"lottie-web","version":"5.13.0","note":"anim.json is written by tools/make-lottie.mjs (our own shapes, CC0)"},"license":"MIT","data":{"anim.json":{"v":"5.7.4","fr":30,"ip":0,"op":66,"w":400,"h":400,"nm":"arc-mark","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"marker","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":118},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":30,"s":[0,0,100],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":42,"s":[130,130,100],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":52,"s":[100,100,100]}]}},"ao":0,"shapes":[{"ty":"gr","nm":"marker","it":[{"ty":"el","d":1,"s":{"a":0,"k":[24,24]},"p":{"a":0,"k":[0,-165]},"nm":"Ellipse"},{"ty":"fl","c":{"a":0,"k":[0.9490196078431372,0.7058823529411765,0.35294117647058826,1]},"o":{"a":0,"k":100},"r":1,"nm":"Fill"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":66,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"tick0","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":-64},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"tick","it":[{"ty":"sh","ks":{"a":0,"k":{"i":[[0,0],[0,0]],"o":[[0,0],[0,0]],"v":[[0,-183],[0,-199]],"c":false}},"nm":"Path"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":16,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":26,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":85},"w":{"a":0,"k":2.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":66,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"tick1","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":-42},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"tick","it":[{"ty":"sh","ks":{"a":0,"k":{"i":[[0,0],[0,0]],"o":[[0,0],[0,0]],"v":[[0,-183],[0,-199]],"c":false}},"nm":"Path"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":20,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":30,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":85},"w":{"a":0,"k":2.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":66,"st":0,"bm":0},{"ddd":0,"ind":4,"ty":4,"nm":"tick2","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":-20},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"tick","it":[{"ty":"sh","ks":{"a":0,"k":{"i":[[0,0],[0,0]],"o":[[0,0],[0,0]],"v":[[0,-183],[0,-199]],"c":false}},"nm":"Path"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":24,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":34,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":85},"w":{"a":0,"k":2.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":66,"st":0,"bm":0},{"ddd":0,"ind":5,"ty":4,"nm":"tick3","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":2},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"tick","it":[{"ty":"sh","ks":{"a":0,"k":{"i":[[0,0],[0,0]],"o":[[0,0],[0,0]],"v":[[0,-183],[0,-199]],"c":false}},"nm":"Path"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":28,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":38,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":85},"w":{"a":0,"k":2.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":66,"st":0,"bm":0},{"ddd":0,"ind":6,"ty":4,"nm":"tick4","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":24},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"tick","it":[{"ty":"sh","ks":{"a":0,"k":{"i":[[0,0],[0,0]],"o":[[0,0],[0,0]],"v":[[0,-183],[0,-199]],"c":false}},"nm":"Path"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":32,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":42,"s":[100]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":85},"w":{"a":0,"k":2.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":66,"st":0,"bm":0},{"ddd":0,"ind":7,"ty":4,"nm":"arc big","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":-105},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"arc","it":[{"ty":"el","d":1,"s":{"a":0,"k":[330,330]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":0,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":36,"s":[62]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.8392156862745098,0.5372549019607843,0.16470588235294117,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":4.5},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":66,"st":0,"bm":0},{"ddd":0,"ind":8,"ty":4,"nm":"arc thin","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":96},"p":{"a":0,"k":[200,200,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","nm":"arc","it":[{"ty":"el","d":1,"s":{"a":0,"k":[250,250]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":8,"s":[0],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.16],"y":[0]}},{"t":44,"s":[44]}]},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.9215686274509803,0.8862745098039215,0.8235294117647058,1]},"o":{"a":0,"k":70},"w":{"a":0,"k":2},"lc":2,"lj":2,"ml":4,"nm":"Stroke"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"Transform"}]}],"ip":0,"op":66,"st":0,"bm":0}]}}});
})();

/* motion/blur-words */
(function(){
// Motion (motion.dev): a statement appears word by word out of a blur. One word can be gold.
const css = `
.b-motion-blur-words .cs-title { max-width: 15em; }
.b-motion-blur-words .cs-w { margin-right: 0.24em; }
.b-motion-blur-words .cs-w.on { color: var(--gold2); }
.b-motion-blur-words.short .cs-title { font-size: calc(var(--hero) * 0.86); max-width: 12em; line-height: 1.0; letter-spacing: -0.035em; }
.cs-frame[data-shape="tall"] .b-motion-blur-words.short .cs-title { font-size: calc(var(--title) * 1.25); }
`;
const __mount = function mount(el, p, cx) {
  const {animate, stagger} = cx.motion;
  const gold = String(p.gold || '').toLowerCase().split(/\s+/).filter(Boolean);
  const words = String(p.text).split(/\s+/).map((w) => `<span class="cs-w${gold.includes(w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')) ? ' on' : ''}">${cx.esc(w)}</span>`).join('');
  if (String(p.text).trim().split(/\s+/).length <= 6) el.classList.add('short');   // a short statement can be large
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <p class="cs-title">${words}</p>
    ${p.by ? `<div class="cs-label">${cx.esc(p.by)}</div>` : ''}
  </div>`;
  const list = [];
  const ws = el.querySelectorAll('.cs-w');
  if (el.querySelector('.cs-kicker')) list.push(animate(el.querySelector('.cs-kicker'), {opacity: [0, 1]}, {duration: 0.5, ease: 'easeOut'}));
  list.push(animate(ws, {opacity: [0, 1], filter: ['blur(18px)', 'blur(0px)'], y: [18, 0]}, {duration: 0.7, delay: stagger(0.09, {startDelay: 0.2}), ease: [0.16, 1, 0.3, 1]}));
  const end = 0.2 + 0.09 * ws.length + 0.7;
  if (el.querySelector('.cs-label')) list.push(animate(el.querySelector('.cs-label'), {opacity: [0, 1], y: [10, 0]}, {duration: 0.6, delay: end - 0.4, ease: 'easeOut'}));
  return cx.fromMotion(list, {dur: end + 0.25});
}

CS.register("motion/blur-words", __mount, typeof css === "string" ? css : "", {"kind":"motion/blur-words","title":"Blur words","use":"statement","family":"word-blur","lead":"type","site":null,"dur":1.8,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* motion/compare-bars */
(function(){
// Motion (motion.dev) springs: two to four thick bars grow from one gold axis to their share of the frame width.
// The label sits inside its bar and is uncovered as the bar grows; the large value rides the tip of the bar.
const css = `
.b-motion-compare-bars .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.5 + var(--top)) calc(var(--pad) * 0.7) calc(var(--pad) * 0.46); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.75); }
.b-motion-compare-bars .hd { flex: none; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-motion-compare-bars .hd .cs-title { font-size: calc(var(--title) * 0.6); }
.b-motion-compare-bars .rows { flex: 1 1 auto; min-height: 0; display: flex; align-items: center; }
.b-motion-compare-bars .grp { position: relative; width: 100%; height: 100%; max-height: calc(var(--n) * var(--rh) + (var(--n) - 1) * var(--gap) * 0.5); --rh: 27cqh; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); padding-left: calc(var(--gap) * 0.36); }
.b-motion-compare-bars .axis { position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--gold); transform-origin: 50% 0; display: block; }
.b-motion-compare-bars .row { flex: 1 1 0; min-height: 0; display: flex; align-items: center; column-gap: calc(var(--gap) * 0.6); }
.b-motion-compare-bars .bar { position: relative; flex: none; height: 100%; width: calc(var(--w, 0px) * var(--p, 1)); overflow: hidden; border-radius: 0 calc(var(--radius) * 0.7) calc(var(--radius) * 0.7) 0; background: color-mix(in srgb, var(--ivory) 20%, var(--bg)); color: var(--ink); }
.b-motion-compare-bars .bar.hi { background: var(--gold2); color: var(--bg); }
.b-motion-compare-bars .bar.c2 { background: var(--c2); color: var(--bg); }
.b-motion-compare-bars .bar.c3 { background: var(--c3); color: var(--bg); }
.b-motion-compare-bars .lb { font-size: calc(var(--lead) * 1.05); line-height: 1.1; letter-spacing: -0.012em; white-space: nowrap; }
.b-motion-compare-bars .bar .lb { position: absolute; left: calc(var(--gap) * 0.75); top: 50%; translate: 0 -50%; font-weight: 400; }
.b-motion-compare-bars .row > .lb { color: var(--ivory); }
.b-motion-compare-bars .val { white-space: nowrap; font-size: calc(var(--title) * 1.16); font-weight: var(--thin); letter-spacing: -0.04em; line-height: 0.9; color: var(--ink); }
.b-motion-compare-bars .val small { font-size: var(--label); font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); margin-left: 0.6em; }
.b-motion-compare-bars .note { flex: none; font-size: calc(var(--label) * 0.95); color: var(--dim); line-height: 1.3; }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .wrap { padding: calc(var(--pad) * 0.9 + var(--top)) var(--pad) calc(var(--pad) * 0.8); gap: calc(var(--gap) * 1.2); }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .hd .cs-title { font-size: calc(var(--title) * 0.86); }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .grp { --rh: 14.5cqh; gap: calc(var(--gap) * 0.8); max-height: calc(var(--n) * var(--rh) + (var(--n) - 1) * var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .val small { display: block; margin: 0.5em 0 0; }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .lb { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-motion-compare-bars .val { font-size: calc(var(--title) * 1.1); }
`;
const __mount = function mount(el, p, cx) {
  const {animate} = cx.motion;
  const items = (p.items || []).slice(0, 4).map((it) => ({label: String(it.label == null ? '' : it.label), value: Math.max(0, Number(it.value) || 0), color: it.color}));
  const max = Math.max(1e-9, ...items.map((i) => i.value)), dec = Math.max(0, p.decimals | 0);
  const hi = p.highlight == null ? items.findIndex((i) => i.value === max) : p.highlight - 1;
  const fmt = (v) => v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: p.grouping !== false});
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="rows"><div class="grp" style="--n:${items.length}"><i class="axis" aria-hidden="true"></i>${items.map((it, i) => `<div class="row"><div class="bar${i === hi ? ' hi' : it.color === 2 ? ' c2' : it.color === 3 ? ' c3' : ''}"><span class="lb">${cx.esc(it.label)}</span></div><span class="val cs-num">${fmt(it.value)}${p.unit ? `<small>${cx.esc(p.unit)}</small>` : ''}</span></div>`).join('')}</div></div>
    ${p.note ? `<p class="note">${cx.esc(p.note)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), rowsEl = q('.grp'), rows = [...el.querySelectorAll('.row')], bars = rows.map((r) => r.querySelector('.bar')), lbs = rows.map((r) => r.querySelector('.lb')), vals = rows.map((r) => r.querySelector('.val'));
  // widths in real pixels of the frame; a label that does not fit inside its bar moves to the right of it
  function lay() {
    const cs = getComputedStyle(rowsEl), W = rowsEl.clientWidth - parseFloat(cs.paddingLeft); if (!(W > 0)) return;
    const gap = parseFloat(getComputedStyle(rows[0]).columnGap) || 0, room = Math.max(...vals.map((v) => v.offsetWidth)) + gap;
    items.forEach((it, i) => {
      const lw = lbs[i].offsetWidth, inside = Math.max(4, ((W - room) * it.value) / max), fits = lw + gap * 2.6 <= inside;
      const w = fits ? inside : Math.max(4, ((W - room - lw - gap) * it.value) / max);
      bars[i].style.setProperty('--w', w + 'px');
      if (fits && lbs[i].parentNode !== bars[i]) bars[i].appendChild(lbs[i]);
      if (!fits && lbs[i].parentNode !== rows[i]) rows[i].insertBefore(lbs[i], vals[i]);
    });
  }
  lay();
  const list = [], head = el.querySelectorAll('.hd > *'), E = [0.16, 1, 0.3, 1];
  if (head.length) list.push(animate(head, {opacity: [0, 1], y: [20, 0]}, {duration: 0.65, delay: cx.motion.stagger(0.09), ease: E}));
  list.push(animate(q('.axis'), {scaleY: [0, 1]}, {duration: 0.7, delay: 0.15, ease: [0.65, 0, 0.35, 1]}));
  const t0 = 0.45, each = 0.2;
  items.forEach((it, i) => {
    const at = t0 + each * i;
    list.push(animate(bars[i], {'--p': [0, 1]}, {type: 'spring', bounce: 0.22, visualDuration: 0.85, delay: at}));
    list.push(animate(vals[i], {opacity: [0, 1]}, {duration: 0.35, delay: at + 0.1, ease: 'linear'}));
    list.push(animate(lbs[i], {opacity: [0, 1]}, {duration: 0.4, delay: at + 0.3, ease: 'linear'}));
  });
  if (q('.note')) list.push(animate(q('.note'), {opacity: [0, 1]}, {duration: 0.5, delay: t0 + each * items.length + 0.5}));
  const clip = cx.fromMotion(list, {dur: t0 + each * (items.length - 1) + 1.5});
  clip.fit = lay;
  return clip;
}

CS.register("motion/compare-bars", __mount, typeof css === "string" ? css : "", {"kind":"motion/compare-bars","title":"Compare bars","use":"chart","family":"thick-bars-label-inside","lead":"picture","site":null,"dur":2.4,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* motion/media-card */
(function(){
// Motion (motion.dev): a picture or video in a rounded window springs in, the title and caption follow beside it.
const css = `
.b-motion-media-card .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.72 + var(--top)) var(--pad) calc(var(--pad) * 0.72); display: grid; grid-template-columns: 1.5fr 1fr; align-items: center; column-gap: calc(var(--gap) * 1.6); }
.b-motion-media-card.flip .wrap { grid-template-columns: 1fr 1.5fr; }
.b-motion-media-card.flip .win { order: 2; }
.b-motion-media-card .win { display: flex; flex-direction: column; background: var(--bg2); will-change: transform, opacity; transform-origin: 50% 60%; }
.b-motion-media-card .bar { flex: none; height: calc(var(--label) * 2); display: flex; align-items: center; gap: calc(var(--label) * 0.4); padding: 0 calc(var(--label) * 0.9); border-bottom: 1px solid var(--line); }
.b-motion-media-card .bar i { width: calc(var(--label) * 0.42); height: calc(var(--label) * 0.42); border-radius: 50%; background: var(--line); display: block; }
.b-motion-media-card .bar i:first-child { background: var(--gold); }
.b-motion-media-card .pic { position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: #000; }
.b-motion-media-card .pic > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-motion-media-card .copy { display: flex; flex-direction: column; gap: var(--gap); }
.b-motion-media-card .cs-title { font-size: calc(var(--title) * 0.92); }
.cs-frame[data-shape="tall"] .b-motion-media-card .wrap { grid-template-columns: 1fr !important; align-content: center; row-gap: calc(var(--gap) * 1.5); }
.cs-frame[data-shape="tall"] .b-motion-media-card .win { order: 0 !important; }
.cs-frame[data-shape="tall"] .b-motion-media-card .pic { aspect-ratio: 4 / 3; }
.cs-frame[data-shape="tall"] .b-motion-media-card .cs-title { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-motion-media-card .copy { gap: calc(var(--gap) * 0.8); }
`;
const __mount = function mount(el, p, cx) {
  const {animate, stagger} = cx.motion;
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  if (p.side === 'right') el.classList.add('flip');
  const fx = p.face ? Math.round((p.face[0] + p.face[2] / 2) * 100) : 50, fy = p.face ? Math.round(cx.clamp((p.face[1] + p.face[3] / 2) * 100 - 8, 0, 100)) : 50;
  const media = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}" style="object-position:${fx}% ${fy}%"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}" style="object-position:${fx}% ${fy}%">`;
  el.innerHTML = `<div class="wrap">
    <figure class="win cs-shot"><div class="bar" aria-hidden="true"><i></i><i></i><i></i></div><div class="pic">${media}</div></figure>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      ${p.title ? '<i class="cs-rule"></i>' : ''}
      ${p.caption ? `<p class="cs-lead">${cx.esc(p.caption)}</p>` : ''}
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), m = q('.pic > *');
  if (p.face) cx.face(m, p.face);
  const list = [
    animate(q('.win'), {opacity: [0, 1]}, {duration: 0.35, delay: 0.1, ease: 'easeOut'}),
    animate(q('.win'), {scale: [0.82, 1], y: [80, 0], rotate: [-2.5, 0]}, {type: 'spring', bounce: 0.3, visualDuration: 0.7, delay: 0.1}),
    animate(el.querySelectorAll('.copy > *:not(.cs-rule)'), {opacity: [0, 1], x: [p.side === 'right' ? -28 : 28, 0]}, {duration: 0.7, delay: stagger(0.13, {startDelay: 0.6}), ease: [0.16, 1, 0.3, 1]}),
  ];
  if (q('.cs-rule')) list.push(animate(q('.cs-rule'), {scaleX: [0, 1]}, {duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1]}));
  const text = cx.fromMotion(list, {dur: 1.9});
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("motion/media-card", __mount, typeof css === "string" ? css : "", {"kind":"motion/media-card","title":"Media card","use":"media","family":"window-card","lead":"picture","site":null,"dur":1.9,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* motion/number-ring */
(function(){
// Motion (motion.dev): a thin ring draws up to a share of the circle while the number in the middle counts with it.
const css = `
.b-motion-number-ring .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.72 + var(--top)) var(--pad) calc(var(--pad) * 0.72); display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: calc(var(--gap) * 2); }
.b-motion-number-ring .ring { position: relative; height: min(64cqh, 40cqw); aspect-ratio: 1; }
.b-motion-number-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transform: rotate(-90deg); }
.b-motion-number-ring .track { fill: none; stroke: var(--line); stroke-width: 1; }
.b-motion-number-ring .inner { fill: none; stroke: var(--faint); stroke-width: 0.5; stroke-dasharray: 0.6 3; }
.b-motion-number-ring .arc { fill: none; stroke: var(--gold); stroke-width: 2.4; stroke-linecap: round; }
.b-motion-number-ring .mid { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5em; text-align: center; }
.b-motion-number-ring .val { font-size: calc(var(--hero) * 1.05); font-weight: var(--thin); letter-spacing: -0.05em; line-height: 0.9; color: var(--ink); }
.b-motion-number-ring .unit { font-size: var(--label); letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold2); max-width: 12em; line-height: 1.3; }
.b-motion-number-ring .copy { display: flex; flex-direction: column; gap: var(--gap); }
.b-motion-number-ring .cs-title { max-width: 11em; }
.b-motion-number-ring .cs-text { max-width: 22em; }
.cs-frame[data-shape="tall"] .b-motion-number-ring .wrap { grid-template-columns: 1fr; grid-template-rows: auto auto; justify-items: center; align-content: center; row-gap: calc(var(--gap) * 1.6); }
.cs-frame[data-shape="tall"] .b-motion-number-ring .ring { height: auto; width: min(72cqw, 44cqh); }
.cs-frame[data-shape="tall"] .b-motion-number-ring .copy { align-items: center; text-align: center; gap: calc(var(--gap) * 0.8); }
`;
const __mount = function mount(el, p, cx) {
  const {animate} = cx.motion;
  const v = cx.clamp(Number(p.value) || 0, 0, 100), show = p.show == null ? v : Number(p.show), dec = String(show).includes('.') ? 1 : 0;
  el.innerHTML = `<div class="wrap">
    <div class="ring">
      <svg viewBox="0 0 200 200" aria-hidden="true"><circle class="track" cx="100" cy="100" r="94"/><circle class="inner" cx="100" cy="100" r="84"/><circle class="arc" cx="100" cy="100" r="94" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg>
      <div class="mid"><div class="val cs-num">${dec ? show.toFixed(1) : show}</div>${p.unit ? `<div class="unit">${cx.esc(p.unit)}</div>` : ''}</div>
    </div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.label ? `<h2 class="cs-title">${cx.esc(p.label)}</h2>` : ''}
      ${p.text ? `<p class="cs-text">${cx.esc(p.text)}</p>` : ''}
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), val = q('.val'), t0 = 0.3, d = 1.5;
  const list = [
    animate(q('.ring'), {opacity: [0, 1], scale: [0.9, 1]}, {duration: 0.7, ease: [0.16, 1, 0.3, 1]}),
    animate(q('.arc'), {strokeDashoffset: [1, 1 - v / 100]}, {duration: d, delay: t0, ease: [0.3, 0, 0.1, 1]}),
    animate(el.querySelectorAll('.copy > *'), {opacity: [0, 1], x: [26, 0]}, {duration: 0.7, delay: cx.motion.stagger(0.12, {startDelay: 0.55}), ease: [0.16, 1, 0.3, 1]}),
  ];
  if (q('.unit')) list.push(animate(q('.unit'), {opacity: [0, 1]}, {duration: 0.6, delay: t0 + 0.5}));
  const ease = (x) => { const c = cx.motion.cubicBezier ? cx.motion.cubicBezier(0.3, 0, 0.1, 1) : null; return c ? c(x) : cx.eases.inOut(x); };
  const num = cx.fromFn(t0 + d, (t) => { const n = show * ease(cx.clamp((t - t0) / d, 0, 1)); val.textContent = dec ? n.toFixed(1) : String(Math.round(n)); });
  return cx.all(cx.fromMotion(list, {dur: t0 + d + 0.2}), num);
}

CS.register("motion/number-ring", __mount, typeof css === "string" ? css : "", {"kind":"motion/number-ring","title":"Number ring","use":"number","family":"ring-number","lead":"picture","site":null,"dur":2,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* motion/path-diagram */
(function(){
// Motion (motion.dev): a hub in the middle, nodes on both sides; each line draws out to its node and the node lights up.
const css = `
.b-motion-path-diagram .head { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--pad) * 0.62 + var(--top)); display: flex; flex-direction: column; align-items: center; gap: calc(var(--gap) * 0.4); text-align: center; }
.b-motion-path-diagram .head .cs-title { font-size: calc(var(--title) * 0.62); }
.b-motion-path-diagram .map { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--pad) * 0.62 + var(--top) + var(--title) * 1.5); bottom: calc(var(--pad) * 0.55); }
.b-motion-path-diagram svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-motion-path-diagram svg path { fill: none; stroke: var(--gold); stroke-width: 1.5; opacity: 0.85; }
.b-motion-path-diagram .spine { position: absolute; left: calc(var(--gap) * 0.5); top: 0.6em; bottom: 1.2em; width: 1.5px; background: var(--gold); opacity: 0.85; transform-origin: 50% 0; display: none; }
.b-motion-path-diagram .hub { position: absolute; left: 50%; top: 50%; translate: -50% -50%; width: min(30cqh, 20cqw); aspect-ratio: 1; border-radius: 50%; border: 1.5px solid var(--gold); background: var(--bg); display: grid; place-items: center; text-align: center; padding: 0.6em; font-size: var(--lead); line-height: 1.1; color: var(--ink); box-shadow: 0 0 0 calc(var(--gap) * 0.35) var(--bg), 0 0 0 calc(var(--gap) * 0.35 + 1px) var(--line); }
.b-motion-path-diagram .node { position: absolute; translate: -50% -50%; width: 26%; padding: calc(var(--gap) * 0.5) calc(var(--gap) * 0.7); background: var(--bg2); display: flex; flex-direction: column; gap: 0.2em; }
.b-motion-path-diagram .node.l { left: 13%; text-align: right; align-items: flex-end; }
.b-motion-path-diagram .node.r { left: 87%; }
.b-motion-path-diagram .node b { font-weight: var(--light); font-size: var(--lead); color: var(--ink); line-height: 1.1; }
.b-motion-path-diagram .node span { font-size: calc(var(--body) * 0.9); color: var(--dim); line-height: 1.3; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .head { position: static; align-items: flex-start; text-align: left; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .head .cs-title { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .map { position: relative; inset: auto; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.7); padding-left: calc(var(--gap) * 1.5); }
.cs-frame[data-shape="tall"] .b-motion-path-diagram svg { display: none; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .spine { display: block; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .hub { position: relative; left: auto; top: auto; translate: none; width: auto; aspect-ratio: auto; border-radius: 999px; padding: 0.5em 1.1em; align-self: flex-start; margin-left: calc(var(--gap) * -1.5); box-shadow: none; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .node { position: relative; left: auto !important; top: auto !important; translate: none; width: auto; text-align: left; align-items: flex-start; padding: calc(var(--gap) * 0.55) calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .node b { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .node span { font-size: var(--body); }
`;
const __mount = function mount(el, p, cx) {
  const {animate} = cx.motion, tall = cx.shape === 'tall';
  const nodes = (p.nodes || []).slice(0, 6).map((n) => (typeof n === 'string' ? {title: n} : n));
  const left = nodes.filter((_, i) => i % 2 === 0), right = nodes.filter((_, i) => i % 2 === 1);
  const ys = (k, i) => (k === 1 ? 50 : 12 + (76 / (k - 1)) * i);
  const pos = nodes.map((n, i) => { const side = i % 2 === 0 ? 'l' : 'r', grp = side === 'l' ? left : right, j = Math.floor(i / 2); return {side, y: ys(grp.length, j)}; });
  el.innerHTML = `${tall ? '<div class="cs-pad">' : ''}
    <div class="head">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>
    <div class="map">
      <svg aria-hidden="true">${tall ? '' : nodes.map(() => '<path pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>').join('')}</svg><i class="spine" aria-hidden="true"></i>
      <div class="hub">${cx.esc(p.hub || '')}</div>
      ${nodes.map((n, i) => `<div class="node cs-card ${pos[i].side}" style="top:${pos[i].y}%"><b>${cx.esc(n.title)}</b>${n.text ? `<span>${cx.esc(n.text)}</span>` : ''}</div>`).join('')}
    </div>${tall ? '</div>' : ''}`;
  const list = [], head = el.querySelectorAll('.head > *');
  if (head.length) list.push(animate(head, {opacity: [0, 1], y: [18, 0]}, {duration: 0.6, delay: cx.motion.stagger(0.08), ease: [0.16, 1, 0.3, 1]}));
  list.push(animate(el.querySelector('.hub'), {opacity: [0, 1]}, {duration: 0.3, delay: 0.25}));
  list.push(animate(el.querySelector('.hub'), {scale: [0.5, 1]}, {type: 'spring', bounce: 0.35, visualDuration: 0.55, delay: 0.25}));
  const t0 = 0.7, each = 0.2, ns = el.querySelectorAll('.node'), ps = el.querySelectorAll('svg path'), map = el.querySelector('.map'), svg = el.querySelector('svg');
  // the curves are drawn in real pixels of the map, and redrawn when the page is resized
  const draw = () => { const W = map.clientWidth, H = map.clientHeight; if (!W || tall) return; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    ps.forEach((path, i) => { const q = pos[i], x = (q.side === 'l' ? 0.26 : 0.74) * W, mx = (q.side === 'l' ? 0.38 : 0.62) * W, y = (q.y / 100) * H; path.setAttribute('d', `M${W / 2} ${H / 2} C ${mx} ${H / 2}, ${mx} ${y}, ${x} ${y}`); }); };
  draw();
  if (tall) list.push(animate(el.querySelector('.spine'), {scaleY: [0, 1]}, {duration: each * nodes.length + 0.5, delay: t0, ease: 'easeInOut'}));
  ns.forEach((n, i) => {
    if (!tall) list.push(animate(ps[i], {strokeDashoffset: [1, 0]}, {duration: 0.6, delay: t0 + each * i, ease: [0.4, 0, 0.2, 1]}));
    const dx = tall ? -18 : pos[i].side === 'l' ? 24 : -24;
    list.push(animate(n, {opacity: [0, 1], x: [dx, 0]}, {duration: 0.55, delay: t0 + each * i + (tall ? 0.15 : 0.4), ease: [0.16, 1, 0.3, 1]}));
  });
  const clip = cx.fromMotion(list, {dur: t0 + each * (nodes.length - 1) + 1.15});
  clip.fit = draw;
  return clip;
}

CS.register("motion/path-diagram", __mount, typeof css === "string" ? css : "", {"kind":"motion/path-diagram","title":"Path diagram","use":"diagram","family":"hub-lines","lead":"picture","site":null,"dur":2.8,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* motion/photo-stack */
(function(){
// Motion (motion.dev) springs: photo cards fly in one by one and settle into a fanned stack; the last one lands on top, the largest.
// The stack takes most of the frame, the title and one line stand beside it. Put a photo of a person last (on top) so no card covers it.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("motion/photo-stack", __mount, typeof css === "string" ? css : "", {"kind":"motion/photo-stack","title":"Photo stack","use":"media","family":"photo-stack","lead":"picture","site":null,"dur":2.5,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* motion/quote */
(function(){
// Motion (motion.dev): a large serif quotation rises line by line from behind a mask, then the name settles under it.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("motion/quote", __mount, typeof css === "string" ? css : "", {"kind":"motion/quote","title":"Quote","use":"quote","family":"quote-lines","lead":"type","site":null,"dur":2.1,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* motion/spring-cards */
(function(){
// Motion (motion.dev) springs: three or four cards jump up from below, lean a little and settle upright.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("motion/spring-cards", __mount, typeof css === "string" ? css : "", {"kind":"motion/spring-cards","title":"Spring cards","use":"list","family":"spring-cards","lead":"type","site":null,"dur":2,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* motion/timeline-years */
(function(){
// Motion (motion.dev): a line draws across, year markers spring up on it one after another, each with one line under it.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("motion/timeline-years", __mount, typeof css === "string" ? css : "", {"kind":"motion/timeline-years","title":"Timeline years","use":"timeline","family":"year-line","lead":"type","site":null,"dur":2.6,"source":{"type":"motion","package":"motion","version":"14.14.0"},"license":"MIT","data":{}});
})();

/* remotion/kinetic-words */
(function(){
// A Remotion composition played inside the page by @remotion/player. The stage seeks it frame by frame,
// so the same component you render to video in lessons 2 and 3 also works on a slide and on a website.
const css = `
.b-remotion-kinetic-words .rm { position: absolute; left: 0; right: 0; top: 50%; aspect-ratio: 16 / 9; transform: translateY(-50%); max-height: 100%; }
.b-remotion-kinetic-words .cap { position: absolute; left: 0; right: 0; bottom: calc(var(--pad) * 0.6); text-align: center; }
.cs-frame[data-shape="tall"] .b-remotion-kinetic-words .rm { aspect-ratio: 4 / 5; }
.cs-frame[data-shape="tall"] .b-remotion-kinetic-words .cap { bottom: 12%; }
`;
const __mount = function mount(el, p, cx) {
  el.innerHTML = `<div class="rm"></div>${p.caption ? `<div class="cap cs-label">${cx.esc(p.caption)}</div>` : ''}`;
  const clip = cx.fromRemotion(el.querySelector('.rm'), 'remotion/kinetic-words', {words: (p.words || ['Video', 'Slides', 'Web']).slice(0, 3), gold: p.gold == null ? 2 : p.gold}, cx.shape === 'tall' ? {width: 1080, height: 1350} : null);
  if (!p.caption) return clip;
  cx.wa(el.querySelector('.cap'), [{opacity: 0}, {opacity: 1}], {duration: 0.8, delay: 1.6});
  return cx.all(clip, cx.fromWaapi(el.querySelector('.cap')));
}

CS.register("remotion/kinetic-words", __mount, typeof css === "string" ? css : "", {"kind":"remotion/kinetic-words","title":"Kinetic words (Remotion composition)","use":"statement","family":"remotion-kinetic","lead":"type","site":null,"dur":2.8,"source":{"type":"remotion","package":"@remotion/player","version":"4.0.529"},"license":"MIT (component) + Remotion License","data":{}});
})();

/* remotion/number-roll */
(function(){
// A Remotion composition played inside the page by @remotion/player: every digit rolls up through 0-9 to its place, the unit and one line follow.
const css = `
.b-remotion-number-roll .rm { position: absolute; left: 0; right: 0; top: calc(50% + var(--top) / 2); aspect-ratio: 16 / 9; transform: translateY(-50%); max-height: 100%; }
.cs-frame[data-shape="tall"] .b-remotion-number-roll .rm { aspect-ratio: 4 / 5; }
`;
const __mount = function mount(el, p, cx) {
  el.innerHTML = `<div class="rm"></div>`;
  const tok = (n) => getComputedStyle(el).getPropertyValue(n).trim();
  return cx.fromRemotion(el.querySelector('.rm'), 'remotion/number-roll', {value: p.value, unit: p.unit || '', label: p.label || '', kicker: p.kicker || '', ink: tok('--ink'), accent: tok('--gold2'), gold: tok('--gold'), dim: tok('--dim')},
    cx.shape === 'tall' ? {width: 1080, height: 1350} : null);
}

CS.register("remotion/number-roll", __mount, typeof css === "string" ? css : "", {"kind":"remotion/number-roll","title":"Number roll (Remotion composition)","use":"number","family":"remotion-roll","lead":"type","site":null,"dur":2.5,"source":{"type":"remotion","package":"@remotion/player","version":"4.0.529"},"license":"MIT (component) + Remotion License","data":{}});
})();

/* remotion/player */
(function(){
// Your own Remotion component, played inside the page by @remotion/player and seeked frame by frame by the stage:
// {"kind": "remotion/player", "component": "./My.tsx", "durationInFrames": 120, "fps": 30, "width": 1920, "height": 1080, "props": {...}}.
// Without "component" the kit's own composition plays: a frame ruler that shows its own frame number.
const css = `
.b-remotion-player .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.5 + var(--top)) var(--pad) calc(var(--pad) * 0.5); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: calc(var(--gap) * 0.7); }
.b-remotion-player .rm { position: relative; width: 100%; max-height: 100%; min-height: 0; flex: 0 1 auto; }
.b-remotion-player .cap { display: flex; align-items: baseline; gap: calc(var(--gap) * 0.8); align-self: stretch; }
.b-remotion-player .cap .tx { font-size: var(--body); color: var(--ivory); line-height: 1.35; }
.cs-frame[data-shape="tall"] .b-remotion-player .cap { flex-direction: column; gap: calc(var(--gap) * 0.5); }
`;
const __mount = function mount(el, p, cx) {
  const own = !!p.component, tall = cx.shape === 'tall';
  const size = own ? {width: p.width || 1920, height: p.height || 1080} : tall ? {width: 1080, height: 1120} : {width: 1920, height: 760};
  el.innerHTML = `<div class="wrap">
    <div class="rm" style="aspect-ratio:${size.width} / ${size.height}" role="img" aria-label="${cx.esc(p.alt || p.caption || 'Remotion composition')}"></div>
    ${p.caption || p.kicker ? `<div class="cap">${p.kicker ? `<span class="cs-kicker">${cx.esc(p.kicker)}</span>` : ''}${p.caption ? `<span class="tx">${cx.esc(p.caption)}</span>` : ''}</div>` : ''}
  </div>`;
  const tok = (n) => getComputedStyle(el).getPropertyValue(n).trim();
  const props = own ? p.props || {} : {label: p.label || 'A Remotion composition', ink: tok('--ink'), accent: tok('--gold2'), gold: tok('--gold'), dim: tok('--dim')};
  const clip = cx.fromRemotion(el.querySelector('.rm'), own ? 'user:' + p.component : 'remotion/player', props, own ? null : size);
  const cap = el.querySelector('.cap');
  if (!cap) return clip;
  cx.wa(cap.children, [{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.7, stagger: 0.12});
  return cx.all(clip, cx.fromWaapi(cap));
}

CS.register("remotion/player", __mount, typeof css === "string" ? css : "", {"kind":"remotion/player","title":"Remotion player","use":"media","family":"remotion-player","lead":"type","site":null,"dur":3,"source":{"type":"remotion","package":"@remotion/player","version":"4.0.529"},"license":"MIT (component) + Remotion License","data":{}});
})();
