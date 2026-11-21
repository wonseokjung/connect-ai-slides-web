// A long web page inside a laptop drawn in CSS (no brand): the lid opens, then the page scrolls from top to bottom inside the screen.
// On a web page the block stays pinned and your own scroll moves the page in the laptop. A video simply plays. For screens, not for portraits.
export const css = `
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
export default function mount(el, p, cx) {
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
