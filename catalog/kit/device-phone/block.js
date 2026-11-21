// Your website on a phone: a phone drawn in CSS (no brand, no logo) rises from below, turns from a tilt to upright, and its screen lights up with your picture or video.
// The words stand beside it. The phone is 84 % of the slide height. For screens and results, not for portraits.
export const css = `
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
export default function mount(el, p, cx) {
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
