// Your own one-file HTML scene (three.js, canvas, WebGL), put in as it is: it runs live in a sandboxed iframe that fills most of the frame.
// A gold seam is drawn, the scene rises out of it, the label and the title come in under it. Nothing is drawn on the scene.
// When the deck is recorded, checked, printed, or the viewer asked for less motion, "clip" (an mp4 of the same scene, exact frames) or "poster" stands in.
export const css = `
.b-kit-embed-scene .scene { position: absolute; left: 0; right: 0; top: 0; height: 78%; overflow: hidden; background: #000; }
.b-kit-embed-scene .scene > * { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; }
.b-kit-embed-scene .scene > img, .b-kit-embed-scene .scene > video { object-fit: cover; }
.b-kit-embed-scene .scene > iframe { pointer-events: none; background: transparent; }
.b-kit-embed-scene.live .scene > iframe { pointer-events: auto; }
.b-kit-embed-scene .seam { position: absolute; left: 0; right: 0; top: 78%; height: 2px; margin-top: -1px; background: var(--gold); transform-origin: 0 50%; }
.b-kit-embed-scene .band { position: absolute; left: var(--pad); right: var(--pad); top: 78%; bottom: 0; display: grid; grid-template-columns: 1.3fr 1fr; align-items: center; column-gap: calc(var(--gap) * 2); }
.b-kit-embed-scene .l { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.36); min-width: 0; }
.b-kit-embed-scene .cs-title { font-size: calc(var(--title) * 0.58); }
.b-kit-embed-scene .r { display: flex; flex-direction: column; align-items: flex-end; gap: calc(var(--gap) * 0.3); text-align: right; min-width: 0; }
.b-kit-embed-scene .r .cs-text { color: var(--ivory); max-width: 22em; }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .scene { top: var(--top); height: 56%; }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .seam { top: calc(56% + var(--top)); }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .band { top: calc(56% + var(--top)); grid-template-columns: 1fr; align-content: start; row-gap: var(--gap); padding-top: calc(var(--gap) * 1.5); }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .cs-title { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-kit-embed-scene .r { align-items: flex-start; text-align: left; }
`;
export default function mount(el, p, cx) {
  const G = window.CS || {}, print = /print-pdf/.test(location.search);
  // live: the scene itself. Recorded, checked, printed or reduced motion: a file that can be shown at an exact time
  let mode = 'frame';
  if (G.capturing && p.clip) mode = 'clip';
  else if ((G.capturing || G.reduced || print) && p.poster) mode = 'poster';
  else if ((G.reduced || print) && p.clip) mode = 'clip';
  const alt = cx.esc(p.alt || p.title || 'Interactive scene');
  if (p.interactive && mode === 'frame') el.classList.add('live');
  const media = mode === 'clip' ? `<video src="${cx.esc(p.clip)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${alt}"></video>`
    : mode === 'poster' ? `<img src="${cx.esc(p.poster)}" alt="${alt}">`
    : `${p.poster ? `<img src="${cx.esc(p.poster)}" alt="" aria-hidden="true">` : ''}<iframe title="${alt}" sandbox="allow-scripts" scrolling="no" allow="fullscreen" ${p.interactive ? '' : 'tabindex="-1"'}></iframe>`;
  el.innerHTML = `
    <div class="scene">${media}</div>
    <i class="seam" aria-hidden="true"></i>
    <div class="band">
      <div class="l">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>
      ${p.caption || p.hint ? `<div class="r">${p.caption ? `<p class="cs-text">${cx.esc(p.caption)}</p>` : ''}${p.hint ? `<span class="cs-label">${cx.esc(p.hint)}</span>` : ''}</div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), f = q('iframe'), v = q('video'), under = f && q('.scene > img');
  cx.wa(q('.seam'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9});
  cx.wa(q('.scene'), [{clipPath: 'inset(100% 0 0 0)'}, {clipPath: 'inset(0% 0 0 0)'}], {duration: 1.2, delay: 0.3, ease: 'cubic-bezier(.7,0,.2,1)'});
  cx.wa(el.querySelectorAll('.l > *'), [{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.9, stagger: 0.1});
  cx.wa(el.querySelectorAll('.r > *'), [{opacity: 0, transform: 'translateX(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 1.15, stagger: 0.1});
  const text = cx.fromWaapi(el), clip = v ? cx.all(text, cx.fromVideo(v)) : text;
  if (!f) return clip;
  // the scene only runs while its slide or screen is in view: it is loaded on arrival and emptied on leaving
  let on = false;
  const set = (want) => { if (want === on) return; on = want; if (want) f.src = p.src; else { f.removeAttribute('src'); f.src = 'about:blank'; if (under) under.style.visibility = ''; } };
  if (under) f.addEventListener('load', () => { if (on) under.style.visibility = 'hidden'; });
  if (G.capturing || print) set(true);
  return Object.assign(clip, {visible: (show) => set(!!show), dispose: () => set(false)});
}
