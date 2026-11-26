// pro/compare: a quiet column and a gold column, a hairline between them, a gold arrow crossing over.
export const css = `
.b-pro-compare .pro-body { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: calc(var(--gap) * 1.2); align-items: stretch; align-content: center; }
.b-pro-compare .cc { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); min-width: 0; justify-content: center; }
.b-pro-compare .cl { font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--dim); }
.b-pro-compare .cc.r .cl { color: var(--gold2); }
.b-pro-compare .ct { font-size: calc(var(--title) * 0.6); font-weight: var(--thin); color: var(--dim); line-height: 1.1; letter-spacing: -0.02em; }
.b-pro-compare .cc.r .ct { color: var(--ink); }
.b-pro-compare .cpic { position: relative; height: 30cqh; overflow: hidden; border-radius: calc(var(--radius) * 0.35); }
.b-pro-compare .cpic > img, .b-pro-compare .cpic > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-pro-compare .cc.l .cpic { filter: grayscale(0.85) brightness(0.8); }
.b-pro-compare ul { display: flex; flex-direction: column; }
.b-pro-compare li { position: relative; padding: 0.55em 0 0.55em 1.4em; font-size: var(--body); color: var(--dim); line-height: 1.3; }
.b-pro-compare .cc.r li { color: var(--ivory); }
.b-pro-compare li::before { content: ""; position: absolute; left: 0; top: 1.05em; width: 0.55em; height: 1px; background: var(--dim); }
.b-pro-compare .cc.r li::before { background: var(--gold); }
.b-pro-compare li .rl { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--line); transform-origin: 0 50%; }
.b-pro-compare .cx { color: var(--dim); font-size: var(--lead); line-height: 1.3; }
.b-pro-compare .cc.r .cx { color: var(--ivory); }
.b-pro-compare .cc.bare .cl { font-size: var(--body); letter-spacing: 0.2em; }
.b-pro-compare .cc.bare li { font-size: var(--lead); padding: 0.7em 0 0.7em 1.4em; }
.b-pro-compare .cc.bare li::before { top: 1.3em; }
.b-pro-compare .mid { position: relative; width: 1px; }
.b-pro-compare .mid i { position: absolute; inset: 0; background: var(--line); transform-origin: 50% 0; }
.b-pro-compare .mid b { position: absolute; left: 50%; top: 50%; width: 3.2em; height: 3.2em; margin: -1.6em 0 0 -1.6em; border-radius: 50%; border: 1px solid var(--gold); background: var(--bg); display: grid; place-items: center; font-size: var(--body); }
.b-pro-compare .mid b::after { content: ""; width: 0.6em; height: 0.6em; border-top: 1.5px solid var(--gold2); border-right: 1.5px solid var(--gold2); transform: translateX(-0.15em) rotate(45deg); }
.cs-frame[data-shape="tall"] .b-pro-compare .pro-body { grid-template-columns: 1fr; grid-template-rows: auto auto auto; gap: calc(var(--gap) * 0.8); align-content: center; }
.cs-frame[data-shape="tall"] .b-pro-compare .mid { width: 100%; height: 1px; }
.cs-frame[data-shape="tall"] .b-pro-compare .mid b { transform: rotate(90deg); }
.cs-frame[data-shape="tall"] .b-pro-compare .cpic { height: 18cqh; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  const col = (c, cls) => { c = c || {}; const items = (c.items || []).slice(0, 4); const bare = !c.title && !c.src && !c.text; return `<div class="cc ${cls}${bare ? ' bare' : ''}">${c.label ? `<div class="cl">${cx.esc(c.label)}</div>` : ''}${c.title ? `<h3 class="ct">${cx.esc(c.title)}</h3>` : ''}${c.src ? `<div class="cpic">${P.media(c, 'cm', c.title)}</div>` : ''}${items.length ? `<ul>${items.map((x) => `<li>${cx.esc(typeof x === 'string' ? x : x.title || '')}<i class="rl" aria-hidden="true"></i></li>`).join('')}</ul>` : ''}${c.text ? `<p class="cx">${cx.esc(c.text)}</p>` : ''}</div>`; };
  el.innerHTML = `<i class="pro-glow" style="--gx:85%;--gy:50%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">${col(p.left, 'l')}<div class="mid" aria-hidden="true"><i></i><b></b></div>${col(p.right, 'r')}</div>${P.foot(cx)}</div>`;
  const tl = cx.gsap.timeline({paused: true}), tall = cx.shape === 'tall';
  const t = P.headIn(tl, el);
  const L = el.querySelector('.cc.l'), R = el.querySelector('.cc.r');
  const colIn = (c, at) => { P.rise(tl, c.querySelectorAll('.cl, .ct, .cx'), at, {y: 20}); const pic = c.querySelector('.cpic'); if (pic) tl.fromTo(pic, {clipPath: 'inset(0 0 100% 0)'}, {clipPath: 'inset(0 0 0% 0)', duration: 1.0, ease: 'expo.inOut'}, at + 0.1); c.querySelectorAll('li').forEach((li, i) => { P.rise(tl, li, at + 0.3 + i * 0.1, {y: 12}); tl.fromTo(li.querySelector('.rl'), {scaleX: 0}, {scaleX: 1, duration: 0.7, ease: 'expo.inOut'}, at + 0.3 + i * 0.1); }); };
  colIn(L, t);
  tl.fromTo(el.querySelector('.mid i'), tall ? {scaleX: 0} : {scaleY: 0}, tall ? {scaleX: 1, duration: 0.9, ease: 'expo.inOut'} : {scaleY: 1, duration: 0.9, ease: 'expo.inOut'}, t + 0.5);
  tl.fromTo(el.querySelector('.mid b'), {opacity: 0, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)'}, t + 0.9);
  colIn(R, t + 1.05);
  return P.clip(cx, tl, el);
}
