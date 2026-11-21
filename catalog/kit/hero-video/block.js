// A person on screen (video or photo) and the opening line beside them. The text never touches the face:
// give the face box and the block puts the words on the other side.
export const css = `
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
export default function mount(el, p, cx) {
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
