// pro/gallery: an editorial grid of the user's photos, each wiped in from its own edge, with short captions.
export const css = `
.b-pro-gallery .pro-body { display: grid; gap: calc(var(--gap) * 0.5); min-height: 0; }
.b-pro-gallery .pro-body.n2 { grid-template-columns: 1.35fr 1fr; grid-template-rows: 1fr; }
.b-pro-gallery .pro-body.n3 { grid-template-columns: 1.4fr 1fr; grid-template-rows: 1fr 1fr; }
.b-pro-gallery .pro-body.n4 { grid-template-columns: 1.4fr 1fr 1fr; grid-template-rows: 1fr 1fr; }
.b-pro-gallery .pro-body.n3 .gi:first-child, .b-pro-gallery .pro-body.n4 .gi:first-child { grid-row: 1 / 3; }
.b-pro-gallery .pro-body.n4 .gi:nth-child(4) { grid-column: 2 / 4; }
.b-pro-gallery .gi { position: relative; overflow: hidden; border-radius: calc(var(--radius) * 0.35); min-height: 0; background: var(--bg2); }
.b-pro-gallery .gi > img, .b-pro-gallery .gi > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-pro-gallery .gc { position: absolute; left: 0; right: 0; bottom: 0; padding: 2.2em 0.9em 0.8em; font-size: var(--body); color: #F6F3EC; background: linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.55) 55%, transparent); line-height: 1.2; }
.cs-frame[data-shape="tall"] .b-pro-gallery .pro-body { grid-template-columns: 1fr 1fr !important; grid-template-rows: 1.3fr 1fr !important; }
.cs-frame[data-shape="tall"] .b-pro-gallery .pro-body .gi:first-child { grid-row: auto; grid-column: 1 / 3; }
.cs-frame[data-shape="tall"] .b-pro-gallery .pro-body.n4 .gi:nth-child(4) { grid-column: auto; }
.cs-frame[data-shape="tall"] .b-pro-gallery .pro-body.n4 { grid-template-rows: 1.3fr 1fr 1fr !important; }
.cs-frame[data-shape="tall"] .b-pro-gallery .pro-body.n4 .gi:nth-child(4) { grid-column: 1 / 3; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, items = (p.items || []).slice(0, 4);
  el.innerHTML = `<div class="pro-wrap">${P.head(p)}<div class="pro-body n${Math.max(2, items.length)}">${items.map((it) => `<figure class="gi">${P.media(it, 'gm', it.caption)}${it.caption ? `<figcaption class="gc">${cx.esc(it.caption)}</figcaption>` : ''}</figure>`).join('')}</div>${P.foot(cx)}</div>`;
  el.querySelectorAll('.gm').forEach((m, i) => { const it = items[i]; if (it && it.face) cx.face(m, it.face); });
  const tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el);
  const dirs = ['inset(0 100% 0 0)', 'inset(100% 0 0 0)', 'inset(0 0 100% 0)', 'inset(0 0 0 100%)'];
  el.querySelectorAll('.gi').forEach((g, i) => {
    const at = t + i * 0.16;
    tl.fromTo(g, {clipPath: dirs[i % 4]}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut'}, at);
    tl.fromTo(g.querySelector('.gm'), {scale: 1.18}, {scale: 1, duration: 1.9, ease: 'power2.out'}, at);
    const c = g.querySelector('.gc'); if (c) tl.fromTo(c, {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.6, ease: 'expo.out'}, at + 0.8);
  });
  return P.clip(cx, tl, el);
}
