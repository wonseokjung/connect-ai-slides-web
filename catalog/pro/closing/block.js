// pro/closing: a large thin last line, the cover's gold circle draws again, and buttons to the user's pages.
export const css = `
.b-pro-closing .pc-art { position: absolute; z-index: 0; left: 50%; top: 50%; width: 92cqh; height: 92cqh; transform: translate(-50%, -50%); pointer-events: none; }
.b-pro-closing .pc-art circle { fill: none; stroke: var(--gold); stroke-width: 0.12; opacity: 0.5; }
.b-pro-closing .pc-art circle + circle { opacity: 0.2; }
.b-pro-closing .pro-body { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: calc(var(--gap) * 0.7); }
.b-pro-closing .ck { font-size: var(--label); letter-spacing: 0.34em; text-transform: uppercase; color: var(--gold2); }
.b-pro-closing .ct { font-size: var(--hero); font-weight: var(--thin); letter-spacing: -0.04em; line-height: 1.0; color: var(--ink); text-wrap: balance; }
.b-pro-closing .cs2 { font-size: var(--lead); color: var(--ivory); }
.b-pro-closing .cb { display: flex; gap: 0.8em; flex-wrap: wrap; justify-content: center; margin-top: calc(var(--gap) * 0.4); }
.b-pro-closing .cc { font-size: var(--label); letter-spacing: 0.16em; color: var(--dim); margin-top: calc(var(--gap) * 0.3); }
.cs-frame[data-shape="tall"] .b-pro-closing .pc-art { width: 110cqw; height: 110cqw; }
.cs-frame[data-shape="tall"] .b-pro-closing .ct { font-size: calc(var(--hero) * 0.9); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, links = (p.links || []).slice(0, 3);
  el.innerHTML = `<svg class="pc-art" viewBox="0 0 100 100" aria-hidden="true" data-deco><circle cx="50" cy="50" r="49" pathLength="1"/><circle cx="50" cy="50" r="40" pathLength="1"/></svg><i class="pro-glow" style="--gx:50%;--gy:50%"></i><div class="pro-wrap"><div class="pro-body">
    ${p.kicker ? `<div class="ck">${cx.esc(p.kicker)}</div>` : ''}<h2 class="ct">${P.words(p.title, p.gold)}</h2>${p.sub ? `<p class="cs2">${cx.esc(p.sub)}</p>` : ''}
    ${links.length ? `<div class="cb">${links.map((l, i) => `<a class="cs-btn${i ? ' cs-ghost' : ''}" href="${cx.esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ''}>${cx.esc(l.label)}</a>`).join('')}</div>` : ''}
    ${p.contact ? `<div class="cc">${cx.esc(p.contact)}</div>` : ''}
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  tl.fromTo(el.querySelectorAll('.pc-art circle'), {strokeDasharray: 1, strokeDashoffset: 1}, {strokeDashoffset: 0, duration: 2.0, ease: 'expo.inOut', stagger: 0.2}, 0);
  P.rise(tl, q('.ck'), 0.2, {y: 10});
  P.wordsIn(tl, q('.ct'), 0.3);
  P.rise(tl, q('.cs2'), 0.85, {y: 16});
  P.rise(tl, el.querySelectorAll('.cb a'), 1.05, {y: 14, stagger: 0.08});
  P.rise(tl, q('.cc'), 1.25, {y: 8});
  if (q('.pro-foot')) tl.fromTo(q('.pro-foot'), {opacity: 0}, {opacity: 1, duration: 0.8}, 1.0);
  return P.clip(cx, tl, el);
}
