// pro/cover: the title rises word by word, the gold hairline and a thin circle draw themselves; a picture takes the right half.
export const css = `
.b-pro-cover .pc-art { position: absolute; z-index: 0; right: -14%; top: 50%; width: 78cqh; height: 78cqh; transform: translateY(-50%); pointer-events: none; }
.b-pro-cover .pc-art circle { fill: none; stroke: var(--gold); stroke-width: 1; vector-effect: non-scaling-stroke; opacity: 0.55; }
.b-pro-cover .pc-art circle + circle { opacity: 0.22; }
.b-pro-cover .pro-body { display: flex; flex-direction: column; justify-content: flex-end; gap: calc(var(--gap) * 0.7); padding-bottom: calc(var(--gap) * 0.6); }
.b-pro-cover .pc-k { display: flex; align-items: center; gap: 0.9em; font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold2); }
.b-pro-cover .pc-k i { display: block; width: 2.2em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-pro-cover .pc-t { font-size: var(--hero); font-weight: var(--thin); letter-spacing: -0.04em; line-height: 0.98; color: var(--ink); max-width: 88%; text-wrap: balance; }
.b-pro-cover .pc-t.long { font-size: calc(var(--hero) * 0.72); }
.b-pro-cover .pc-s { font-size: var(--lead); color: var(--ivory); font-weight: var(--light); max-width: 70%; line-height: 1.3; }
.b-pro-cover .pc-by { display: flex; align-items: center; gap: 1.1em; font-size: calc(var(--label) * 0.95); letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); margin-top: calc(var(--gap) * 0.5); }
.b-pro-cover .pc-by i { display: block; width: 4em; height: 1px; background: var(--line); transform-origin: 0 50%; }
.b-pro-cover.has-pic .pc-pic { position: absolute; z-index: 0; top: 0; right: 0; bottom: 0; width: 54%; overflow: hidden; }
.b-pro-cover.has-pic .pc-pic > img, .b-pro-cover.has-pic .pc-pic > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-pro-cover.has-pic .pc-fade { position: absolute; z-index: 1; top: 0; bottom: 0; right: 54%; width: 18%; transform: translateX(100%); background: linear-gradient(90deg, var(--bg), transparent); pointer-events: none; }
.b-pro-cover.has-pic .pro-body, .b-pro-cover.has-pic .pro-foot { max-width: 40%; }
:is(.look-white, .look-ivory, .look-paper) .b-pro-cover.has-pic .pc-fade { display: none; }
.b-pro-cover.has-pic .pc-t { max-width: 100%; font-size: calc(var(--hero) * 0.66); }
.b-pro-cover.has-pic .pc-t.long { font-size: calc(var(--hero) * 0.5); }
.b-pro-cover.has-pic .pc-s { max-width: 100%; }
.cs-frame[data-shape="tall"] .b-pro-cover .pc-art { width: 90cqw; height: 90cqw; right: -30%; top: 30%; }
.cs-frame[data-shape="tall"] .b-pro-cover .pc-t { max-width: 100%; font-size: calc(var(--hero) * 0.9); }
.cs-frame[data-shape="tall"] .b-pro-cover .pc-s { max-width: 100%; }
.cs-frame[data-shape="tall"] .b-pro-cover.has-pic .pc-pic { width: 100%; bottom: 52%; }
.cs-frame[data-shape="tall"] .b-pro-cover.has-pic .pc-fade { right: 0; left: 0; top: auto; bottom: 52%; width: auto; height: 14%; transform: translateY(100%); background: linear-gradient(0deg, var(--bg), transparent); }
.cs-frame[data-shape="tall"] .b-pro-cover.has-pic .pro-body { max-width: 100%; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, pic = !!p.src;
  el.classList.toggle('has-pic', pic);
  const long = String(p.title || '').length > (/[가-힣]/.test(p.title || '') ? 12 : 22);
  el.innerHTML = `${pic ? `<div class="pc-pic">${P.media(p, 'pc-m', p.title)}</div>${p.face || p.body ? '' : '<i class="pc-fade" aria-hidden="true"></i>'}` : `<svg class="pc-art" viewBox="0 0 100 100" aria-hidden="true" data-deco><circle cx="50" cy="50" r="49" pathLength="1"/><circle cx="50" cy="50" r="38" pathLength="1"/></svg><i class="pro-glow" style="--gx:78%;--gy:30%"></i>`}
  <div class="pro-wrap"><div class="pro-body">
    ${p.kicker ? `<div class="pc-k"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}
    <h1 class="pc-t${long ? ' long' : ''}">${P.words(p.title, p.gold)}</h1>
    ${p.sub ? `<p class="pc-s">${cx.esc(p.sub)}</p>` : ''}
    ${p.by ? `<div class="pc-by"><i></i><span>${cx.esc(p.by)}</span></div>` : ''}
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  if (pic) {
    const m = q('.pc-m'); if (p.face) cx.face(m, p.face); if (p.body) cx.face(m, p.body, 'body');
    tl.fromTo(q('.pc-pic'), {clipPath: 'inset(0 0 0 100%)'}, {clipPath: 'inset(0 0 0 0%)', duration: 1.4, ease: 'expo.inOut'}, 0);
    tl.fromTo(m, {scale: 1.12}, {scale: 1, duration: 2.4, ease: 'power2.out'}, 0);
  } else {
    const cs = el.querySelectorAll('.pc-art circle');
    tl.fromTo(cs, {strokeDasharray: 1, strokeDashoffset: 1}, {strokeDashoffset: 0, duration: 2.0, ease: 'expo.inOut', stagger: 0.25}, 0);
  }
  if (q('.pc-k i')) tl.fromTo(q('.pc-k i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0.2);
  if (q('.pc-k span')) tl.fromTo(q('.pc-k span'), {opacity: 0, x: -14}, {opacity: 1, x: 0, duration: 0.8, ease: 'expo.out'}, 0.3);
  P.wordsIn(tl, q('.pc-t'), 0.35);
  P.rise(tl, q('.pc-s'), 0.95);
  if (q('.pc-by')) { tl.fromTo(q('.pc-by i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 1.15); P.rise(tl, q('.pc-by span'), 1.25, {y: 12}); }
  if (q('.pro-foot')) tl.fromTo(q('.pro-foot'), {opacity: 0}, {opacity: 1, duration: 0.8}, 1.2);
  return P.clip(cx, tl, el);
}
