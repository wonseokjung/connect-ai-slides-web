// anime.js v4 svg.createDrawable: the slices of a thick ring are drawn one after another from 12 o'clock (stroke-dasharray),
// the total in the middle counts with the sweep, and the legend lines come in as their slices start.
export const css = `
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
export default function mount(el, p, cx) {
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
