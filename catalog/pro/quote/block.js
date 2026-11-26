// pro/quote: a thin gold quotation mark draws itself, the words rise, the name sits on a hairline.
export const css = `
.b-pro-quote .pro-body { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.9); max-width: 84%; }
.b-pro-quote.has-pic .pro-body { max-width: 56%; }
.b-pro-quote .qm { width: calc(var(--title) * 1.5); height: calc(var(--title) * 1.0); overflow: visible; }
.b-pro-quote .qm path { fill: none; stroke: var(--gold2); stroke-width: 1.6; vector-effect: non-scaling-stroke; }
.b-pro-quote .qt { font-size: calc(var(--title) * 0.9); font-weight: var(--thin); letter-spacing: -0.02em; line-height: 1.22; color: var(--ink); text-wrap: balance; }
.b-pro-quote .qt.long { font-size: calc(var(--title) * 0.6); line-height: 1.28; }
.b-pro-quote .qb { display: flex; align-items: center; gap: 1em; }
.b-pro-quote .qb i { display: block; width: 3em; height: 1px; background: var(--gold); transform-origin: 0 50%; font-size: var(--lead); }
.b-pro-quote .qn { font-size: var(--lead); color: var(--ink); }
.b-pro-quote .qr { font-size: var(--body); letter-spacing: 0.12em; color: var(--dim); }
.b-pro-quote .qp { position: absolute; z-index: 0; top: 0; right: 0; bottom: 0; width: 38%; overflow: hidden; }
.b-pro-quote .qp > img, .b-pro-quote .qp > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-pro-quote .qp::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, var(--bg), transparent 30%); }
.cs-frame[data-shape="tall"] .b-pro-quote .pro-body, .cs-frame[data-shape="tall"] .b-pro-quote.has-pic .pro-body { max-width: 100%; }
.cs-frame[data-shape="tall"] .b-pro-quote .qp { width: 100%; bottom: 55%; }
.cs-frame[data-shape="tall"] .b-pro-quote .qp::after { background: linear-gradient(0deg, var(--bg), transparent 40%); }
.cs-frame[data-shape="tall"] .b-pro-quote.has-pic .pro-body { justify-content: flex-end; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, pic = !!p.src, long = String(p.text || '').length > (/[가-힣]/.test(p.text || '') ? 40 : 80);
  el.classList.toggle('has-pic', pic);
  el.innerHTML = `${pic ? `<div class="qp">${P.media(p, 'qpm', p.by)}</div>` : '<i class="pro-glow" style="--gx:10%;--gy:20%"></i>'}<div class="pro-wrap">${P.head({kicker: p.kicker})}<div class="pro-body">
    <svg class="qm" viewBox="0 0 60 40" aria-hidden="true"><path d="M22 4 C10 8 4 16 4 26 C4 32 8 36 13 36 C18 36 21 32 21 28 C21 23 17 20 12 20 C11 20 10 20 9 21 C10 14 15 9 22 6" pathLength="1"/><path d="M52 4 C40 8 34 16 34 26 C34 32 38 36 43 36 C48 36 51 32 51 28 C51 23 47 20 42 20 C41 20 40 20 39 21 C40 14 45 9 52 6" pathLength="1"/></svg>
    <blockquote class="qt${long ? ' long' : ''}">${P.words(p.text, p.gold)}</blockquote>
    ${p.by || p.role ? `<div class="qb"><i aria-hidden="true"></i>${p.by ? `<span class="qn">${cx.esc(p.by)}</span>` : ''}${p.role ? `<span class="qr">${cx.esc(p.role)}</span>` : ''}</div>` : ''}
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  if (pic) { const m = q('.qpm'); if (p.face) cx.face(m, p.face); if (p.body) cx.face(m, p.body, 'body'); tl.fromTo(q('.qp'), {opacity: 0}, {opacity: 1, duration: 1.0}, 0); tl.fromTo(m, {scale: 1.1}, {scale: 1, duration: 2.3, ease: 'power2.out'}, 0); }
  const t = P.headIn(tl, el);
  tl.fromTo(el.querySelectorAll('.qm path'), {strokeDasharray: 1, strokeDashoffset: 1}, {strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut', stagger: 0.15}, t);
  P.wordsIn(tl, q('.qt'), t + 0.35);
  if (q('.qb')) { tl.fromTo(q('.qb i'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.out'}, t + 1.2); P.rise(tl, el.querySelectorAll('.qn, .qr'), t + 1.3, {y: 10}); }
  return P.clip(cx, tl, el);
}
