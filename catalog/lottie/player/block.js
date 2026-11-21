// Lottie (lottie-web): any Lottie file, played once beside a title and a caption. Give "src": the build puts the file into the page
// (a page opened by double click cannot fetch it). Without src the kit's own drawing plays.
export const css = `
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
export default function mount(el, p, cx) {
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
