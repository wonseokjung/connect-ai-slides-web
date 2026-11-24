/* kit/film-hero */
(function(){
// A film still that fills the whole frame and a large thin title on the empty side of it.
// Give the face box (and the body box if you have it): the block finds the wider free side, stacks the words there
// from the top (the name goes to the foot of the column) and darkens only that strip, fading out before the person. Nothing is drawn on the person. Without a face box the words sit in a band at the bottom.
const css = `
.b-kit-film-hero { background: #000; }
.b-kit-film-hero .media { position: absolute; inset: 0; overflow: hidden; background: #000; }
.b-kit-film-hero .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-film-hero .scrim { position: absolute; top: 0; bottom: 0; left: 0; width: var(--free, 30%); pointer-events: none;
  background: linear-gradient(90deg, rgba(8, 7, 5, 0.86) 0%, rgba(8, 7, 5, 0.8) 28%, rgba(8, 7, 5, 0.66) 46%, rgba(8, 7, 5, 0.46) 61%, rgba(8, 7, 5, 0.26) 73%, rgba(8, 7, 5, 0.11) 82%, rgba(8, 7, 5, 0.03) 89%, rgba(8, 7, 5, 0) 94%); }
.b-kit-film-hero.right .scrim { left: auto; right: 0; transform: scaleX(-1); }
.b-kit-film-hero .copy { position: absolute; top: var(--top); bottom: 0; left: 0; width: var(--free, 30%); padding: calc(var(--pad) * 0.62) calc(var(--gap) * 0.5) calc(var(--pad) * 0.62) calc(var(--pad) * 0.5);
  display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.72); }
.b-kit-film-hero.right .copy { left: auto; right: 0; padding-left: calc(var(--gap) * 0.5); padding-right: calc(var(--pad) * 0.5); }
.b-kit-film-hero.at-top .copy { justify-content: flex-start; }
.b-kit-film-hero.at-top .who { margin-top: auto; }
.b-kit-film-hero.at-bottom .copy { justify-content: flex-end; }
.b-kit-film-hero .kick { display: flex; align-items: center; gap: calc(var(--label) * 0.6); }
.b-kit-film-hero .kick i { flex: none; display: block; width: calc(var(--label) * 1.5); height: 1px; background: var(--gold2); transform-origin: 0 50%; }
.b-kit-film-hero .cs-kicker { letter-spacing: 0.3em; }
.cs-frame[data-stage="deck"] .b-kit-film-hero .cs-kicker, .cs-frame[data-stage="deck"] .b-kit-film-hero .who { font-size: calc(var(--label) * 0.82); }
.b-kit-film-hero .ttl { font-size: calc(var(--hero) * var(--fk, 0.44)); font-weight: var(--thin); letter-spacing: -0.035em; line-height: 0.98; color: var(--ink); text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-kit-film-hero .rule { display: block; width: 100%; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-kit-film-hero .sub { font-size: var(--body); font-weight: var(--light); line-height: 1.36; color: var(--ivory); text-wrap: pretty; text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-kit-film-hero .who { letter-spacing: 0.3em; color: var(--ivory); }

/* no face box: the words go in a band at the bottom of the picture */
.b-kit-film-hero.band .scrim { top: auto; left: 0; right: 0; width: auto; height: 58%; transform: none;
  background: linear-gradient(0deg, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.8) 42%, rgba(8, 7, 5, 0.4) 76%, rgba(8, 7, 5, 0) 100%); }
.b-kit-film-hero.band .copy { top: auto; left: 0; right: 0; width: auto; padding: calc(var(--pad) * 0.62) var(--pad); justify-content: flex-end; }
.b-kit-film-hero.band .ttl { font-size: calc(var(--hero) * 0.58); text-wrap: balance; }
.b-kit-film-hero.band .rule { width: calc(var(--title) * 1.4); }

/* phone: the picture on top (framed on the face), the words under it on black */
.cs-frame[data-shape="tall"] .b-kit-film-hero { background: var(--bg); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .media { top: var(--top); bottom: auto; height: calc(59% - var(--top)); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .scrim { display: none; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .copy { top: 59%; bottom: 0; left: 0; right: 0; width: auto; padding: var(--pad); justify-content: center; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .ttl { font-size: calc(var(--title) * 1.16); line-height: 1.02; text-shadow: none; text-wrap: balance; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .sub { text-shadow: none; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .rule { width: calc(var(--title) * 1.4); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const face = Array.isArray(p.face) ? p.face : null, body = Array.isArray(p.body) ? p.body : null, tall = cx.shape === 'tall';
  // the room a person takes: the body box, or (face only) shoulders guessed from the face
  const person = body || (face ? [face[0] - face[2] * 0.6, face[1], face[2] * 2.2, 1 - face[1]] : null);
  if (!person) el.classList.add('band');
  if (person && !tall && p.align !== 'middle') el.classList.add(p.align === 'bottom' ? 'at-bottom' : 'at-top');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}">`;
  el.innerHTML = `
    <div class="media">${tag}</div>
    <i class="scrim" aria-hidden="true"></i>
    <div class="copy">
      ${p.kicker ? `<div class="kick"><i aria-hidden="true"></i><span class="cs-kicker">${cx.esc(p.kicker)}</span></div>` : ''}
      <h1 class="ttl">${cx.spans(p.title, 'cs-w')}</h1>
      <i class="rule" aria-hidden="true"></i>
      ${p.sub ? `<p class="sub">${cx.esc(p.sub)}</p>` : ''}
      ${p.name ? `<div class="who cs-label">${cx.esc(p.name)}</div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *'), box = q('.media'), ttl = q('.ttl'), copy = q('.copy'), words = el.querySelectorAll('.cs-w');
  const place = () => {
    const bw = box.offsetWidth, bh = box.offsetHeight; if (!bw || !bh) return;
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
    if (tall || !person) { el.style.removeProperty('--free'); el.style.removeProperty('--fk'); return; }
    // free room left and right of the person, in frame px
    const x0 = (bw - w) * px, L = Math.max(0, x0 + person[0] * w), R = Math.max(0, bw - (x0 + (person[0] + person[2]) * w));
    const right = p.side ? p.side === 'right' : R > L + 2;
    el.classList.toggle('right', right);
    const free = Math.max(Math.floor(right ? R : L) - 2, bw * 0.16);
    el.style.setProperty('--free', free + 'px');
    // the largest thin type whose longest word fits the column and whose stack fits the height
    const st = getComputedStyle(copy), colW = free - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight), maxH = (el.offsetHeight - parseFloat(st.paddingTop) - parseFloat(st.paddingBottom)) * 0.56;
    let fk = 0.72; const n = words.length, maxLines = Math.max(Math.ceil(n / 2), Math.min(n, 3));
    for (let i = 0; i < 16; i++) {
      el.style.setProperty('--fk', fk.toFixed(3));
      let widest = 0; words.forEach((wd) => { widest = Math.max(widest, wd.offsetWidth); });
      const lines = Math.round(ttl.offsetHeight / (parseFloat(getComputedStyle(ttl).lineHeight) || 1));
      if ((widest <= colW && lines <= maxLines && ttl.offsetHeight <= maxH) || fk <= 0.24) break;
      fk *= 0.94;
    }
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (body) cx.face(m, body, 'body');
  // the film opens like a gate, then the words arrive one by one
  cx.wa(box, [{opacity: 0, clipPath: 'inset(11% 0 11% 0)'}, {opacity: 1, clipPath: 'inset(0% 0 0% 0)'}], {duration: 1.5, ease: 'cubic-bezier(.3,0,.1,1)'});
  cx.wa(q('.scrim'), [{opacity: 0}, {opacity: 1}], {duration: 1.1, delay: 0.25, ease: 'ease-out'});
  if (q('.kick')) { cx.wa(q('.kick i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.7, delay: 0.45}); cx.wa(q('.cs-kicker'), [{opacity: 0, letterSpacing: '0.5em'}, {opacity: 1, letterSpacing: '0.3em'}], {duration: 0.9, delay: 0.5}); }
  const each = Math.min(0.11, 0.8 / Math.max(1, words.length));
  cx.wa(words, [{opacity: 0, filter: 'blur(18px)', transform: 'translateY(0.28em)'}, {opacity: 1, filter: 'blur(0px)', transform: 'none'}], {duration: 0.85, delay: 0.65, stagger: each});
  const t1 = 0.65 + each * words.length + 0.25;
  cx.wa(q('.rule'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: t1 - 0.1});
  if (q('.sub')) cx.wa(q('.sub'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.1});
  if (q('.who')) cx.wa(q('.who'), [{opacity: 0}, {opacity: 1}], {duration: 0.7, delay: t1 + 0.3, ease: 'ease-out'});
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/film-hero", __mount, typeof css === "string" ? css : "", {"kind":"kit/film-hero","title":"Film hero","use":"person","family":"film-hero","lead":"picture","site":null,"dur":2.7,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* css/ken-burns */
(function(){
// Plain CSS @keyframes, no library: a still (or a clip) fills the whole frame and the camera pushes in very slowly (the Ken Burns move).
// A thin caption band at the bottom carries a label and one line; only the band is darkened.
// For a photo of a person give the face box (and the body box if you have it): the caption becomes a corner column on the free
// side of the person, so nothing is on the face or the body, and the picture is never shown above its own size.
const css = `
.b-css-ken-burns { background: #000; }
.b-css-ken-burns .pic { position: absolute; inset: 0; overflow: hidden; background: #000; animation: b-kb-in 1.1s ease-out both; }
.b-css-ken-burns .pic img, .b-css-ken-burns .pic video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: var(--ox, 50%) var(--oy, 50%); will-change: transform;
  animation: b-kb-push var(--kbd, 6s) cubic-bezier(.3, .1, .45, 1) both; }
.b-css-ken-burns .band { position: absolute; left: 0; right: 0; bottom: 0; padding: calc(var(--pad) * 1.15) var(--pad) calc(var(--pad) * 0.5); display: grid; grid-template-columns: auto 1fr; align-items: end; column-gap: calc(var(--gap) * 1.2); row-gap: calc(var(--gap) * 0.4);
  background: linear-gradient(0deg, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.84) 44%, rgba(8, 7, 5, 0.56) 66%, rgba(8, 7, 5, 0.22) 84%, rgba(8, 7, 5, 0) 100%);
  animation: b-kb-in 0.9s ease-out 0.45s both; }
/* a person in the picture: the caption is a column in the bottom corner of the free side, it ends before the person */
.b-css-ken-burns.person .band { right: auto; width: var(--free, 26%); grid-template-columns: minmax(0, 1fr); row-gap: calc(var(--gap) * 0.5); padding: calc(var(--pad) * 1.6) calc(var(--gap) * 0.9) calc(var(--pad) * 0.56) calc(var(--pad) * 0.5);
  background: linear-gradient(90deg, rgba(8, 7, 5, 0.88) 0%, rgba(8, 7, 5, 0.8) 34%, rgba(8, 7, 5, 0.6) 56%, rgba(8, 7, 5, 0.3) 74%, rgba(8, 7, 5, 0.08) 87%, rgba(8, 7, 5, 0) 94%);
  -webkit-mask-image: linear-gradient(0deg, #000 0%, #000 58%, transparent 100%); mask-image: linear-gradient(0deg, #000 0%, #000 58%, transparent 100%); }
.b-css-ken-burns.person.right .band { left: auto; right: 0; padding-left: calc(var(--gap) * 0.9); padding-right: calc(var(--pad) * 0.5);
  background: linear-gradient(270deg, rgba(8, 7, 5, 0.88) 0%, rgba(8, 7, 5, 0.8) 34%, rgba(8, 7, 5, 0.6) 56%, rgba(8, 7, 5, 0.3) 74%, rgba(8, 7, 5, 0.08) 87%, rgba(8, 7, 5, 0) 94%); }
.b-css-ken-burns.person .line { text-align: left; text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-css-ken-burns.person .cs-kicker { white-space: normal; padding-bottom: 0; }
.b-css-ken-burns .rule { grid-column: 1 / -1; display: block; height: 1px; background: var(--gold); transform-origin: 0 50%; animation: b-kb-line 1.1s cubic-bezier(.16, 1, .3, 1) 0.7s both; }
.b-css-ken-burns .cs-kicker { letter-spacing: 0.3em; white-space: nowrap; padding-bottom: 0.5em; animation: b-kb-up 0.8s cubic-bezier(.16, 1, .3, 1) 0.95s both; }
.b-css-ken-burns .line { font-size: calc(var(--lead) * 1.08); font-weight: var(--thin); letter-spacing: -0.015em; line-height: 1.12; color: var(--ink); text-wrap: balance; text-align: right; animation: b-kb-up 0.8s cubic-bezier(.16, 1, .3, 1) 1.1s both; }
/* phone: a wide picture is shown whole (not cropped to a sliver), the caption sits under it on the page colour */
.cs-frame[data-shape="tall"] .b-css-ken-burns { background: var(--bg); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .pic { top: calc(var(--top) + 17cqh); bottom: auto; height: var(--ph, 56.25cqw); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .band { grid-template-columns: 1fr; top: calc(var(--top) + 17cqh + var(--ph, 56.25cqw)); bottom: auto; background: none; padding: var(--pad); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .pic { top: var(--top); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .pic { bottom: auto; height: calc(66% - var(--top)); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .band { top: 66%; bottom: 0; right: 0; width: auto; align-content: center; padding: var(--pad); background: none; -webkit-mask-image: none; mask-image: none; }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .line { text-shadow: none; }
.cs-frame[data-shape="tall"] .b-css-ken-burns .line { text-align: left; font-size: calc(var(--lead) * 1.2); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .cs-kicker { white-space: normal; padding-bottom: 0; }
@keyframes b-kb-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes b-kb-push { from { transform: translate(var(--dx, 0%), var(--dy, 0%)) scale(var(--k0, 1)); } to { transform: translate(0%, 0%) scale(var(--k1, 1.08)); } }
@keyframes b-kb-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes b-kb-up { from { opacity: 0; transform: translateY(0.5em); } to { opacity: 1; transform: none; } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek (cx.fromWaapi does that).
const __mount = function mount(el, p, cx) {
  const face = Array.isArray(p.face) ? p.face : null, body = Array.isArray(p.body) ? p.body : null, tall = cx.shape === 'tall';
  // the room a person takes: the body box, or (face only) shoulders guessed from the face
  const person = body || (face ? [face[0] - face[2] * 0.6, face[1], face[2] * 2.2, 1 - face[1]] : null);
  if (person) el.classList.add('person');
  const focus = Array.isArray(p.focus) ? p.focus : face ? [face[0] + face[2] / 2, face[1] + face[3] / 2] : [0.5, 0.5];
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const secs = cx.clamp(Number(p.seconds) || 6, 3, 20);
  el.style.setProperty('--kbd', secs + 's');
  el.innerHTML = `
    <div class="pic">${isVideo ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.text || 'Clip')}"></video>` : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.text || 'Picture')}">`}</div>
    <div class="band">
      <i class="rule" aria-hidden="true"></i>
      ${p.label ? `<div class="cs-kicker">${cx.esc(p.label)}</div>` : '<span></span>'}
      ${p.text ? `<p class="line">${cx.esc(p.text)}</p>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.pic > *'), box = q('.pic');
  const place = () => {
    if (tall && !person) { const r0 = (m.videoHeight || m.naturalHeight || 9) / (m.videoWidth || m.naturalWidth || 16); el.style.setProperty('--ph', Math.min(r0 * 100, 110).toFixed(2) + 'cqw'); }
    const bw = box.offsetWidth, bh = box.offsetHeight; if (!bw || !bh) return;
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s;
    const px = w - bw > 1 ? cx.clamp((focus[0] * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((focus[1] * h - bh / 2) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
    const x0 = (bw - w) * px, y0 = (bh - h) * py;
    el.style.setProperty('--ox', cx.clamp((x0 + focus[0] * w) / bw * 100, 0, 100).toFixed(2) + '%');
    el.style.setProperty('--oy', cx.clamp((y0 + focus[1] * h) / bh * 100, 0, 100).toFixed(2) + '%');
    // a drawing or a result still may push in by 8 %; a person is never shown above the picture's own size
    const k1 = face ? cx.clamp(1 / s, 1, 1.08) : 1.08, k0 = 1 + (k1 - 1) * 0.3;
    el.style.setProperty('--k1', k1.toFixed(4)); el.style.setProperty('--k0', k0.toFixed(4));
    el.style.setProperty('--dx', ((k0 - 1) * (focus[0] < 0.5 ? 40 : -40)).toFixed(3) + '%'); el.style.setProperty('--dy', ((k0 - 1) * 30).toFixed(3) + '%');
    if (person && !tall) {
      // free room beside the person at the end of the push (the picture grows around the focus point): the caption column gets the wider side
      const fxp = x0 + focus[0] * w, L = Math.max(0, fxp - (fxp - (x0 + person[0] * w)) * k1), R = Math.max(0, bw - (fxp + (x0 + (person[0] + person[2]) * w - fxp) * k1));
      const right = p.side ? p.side === 'right' : R > L + 2;
      el.classList.toggle('right', right);
      el.style.setProperty('--free', Math.max(Math.floor(right ? R : L) - 2, bw * 0.14) + 'px');
    } else el.style.removeProperty('--free');
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (body) cx.face(m, body, 'body');
  const move = cx.fromWaapi(el);
  return Object.assign(isVideo ? cx.all(move, cx.fromVideo(m)) : move, {fit: place});
}

CS.register("css/ken-burns", __mount, typeof css === "string" ? css : "", {"kind":"css/ken-burns","title":"Ken Burns still","use":"media","family":"ken-burns","lead":"picture","site":null,"dur":6,"source":{"type":"css","package":"none (browser CSS + Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/nametag */
(function(){
// The person is the picture: video or photo fills one side, a quiet name plate sits low on the other side.
// Give the face box: the picture is framed on the face and the plate stays away from it.
const css = `
.b-kit-nametag .media { position: absolute; top: 0; bottom: 0; right: 0; width: 66%; overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 20%); mask-image: linear-gradient(90deg, transparent 0%, #000 20%); }
.b-kit-nametag.flip .media { right: auto; left: 0; -webkit-mask-image: linear-gradient(270deg, transparent 0%, #000 20%); mask-image: linear-gradient(270deg, transparent 0%, #000 20%); }
.b-kit-nametag .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-nametag .plate { position: absolute; left: var(--pad); bottom: calc(var(--pad) * 0.9); width: 31%; display: grid; grid-template-columns: auto 1fr; column-gap: calc(var(--gap) * 0.7); }
.b-kit-nametag.flip .plate { left: auto; right: var(--pad); }
.b-kit-nametag .bar { width: 2px; background: var(--gold); transform-origin: 50% 100%; }
.b-kit-nametag .txt { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); padding: 0.2em 0; min-width: 0; }
.b-kit-nametag .name { font-size: calc(var(--hero) * 0.56); font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1; color: var(--ink); text-wrap: balance; }
.b-kit-nametag .mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.1em; margin-right: 0.22em; }
.b-kit-nametag .mask > span { display: inline-block; }
.b-kit-nametag .role { color: var(--gold2); }
.b-kit-nametag .note { font-size: var(--body); color: var(--dim); line-height: 1.35; }
.cs-frame[data-shape="tall"] .b-kit-nametag .media { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 60%;
  -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent 100%); mask-image: linear-gradient(180deg, #000 72%, transparent 100%); }
.cs-frame[data-shape="tall"] .b-kit-nametag .plate { left: var(--pad); right: var(--pad); width: auto; bottom: auto; top: calc(60% + var(--top) + var(--gap) * 0.4); }
.cs-frame[data-shape="tall"] .b-kit-nametag .name { font-size: calc(var(--hero) * 0.92); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const face = p.face || null;
  if (p.side === 'right') el.classList.add('flip');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.name)}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.name)}">`;
  el.innerHTML = `
    <div class="media">${tag}</div>
    <div class="plate">
      <i class="bar" aria-hidden="true"></i>
      <div class="txt">
        ${p.role ? `<div class="cs-label role">${cx.esc(p.role)}</div>` : ''}
        <h2 class="name">${String(p.name).split(/\s+/).map((w) => `<span class="mask"><span>${cx.esc(w)}</span></span>`).join('')}</h2>
        ${p.note ? `<p class="note">${cx.esc(p.note)}</p>` : ''}
      </div>
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *'), box = q('.media');
  // frame the picture on the face: its centre goes to the centre of the panel (40 % from the top)
  const place = () => {
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, bw = box.offsetWidth, bh = box.offsetHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.4) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  cx.wa(box, [{opacity: 0}, {opacity: 1}], {duration: 1.3, ease: 'ease-out'});
  cx.wa(q('.bar'), [{transform: 'scaleY(0)'}, {transform: 'scaleY(1)'}], {duration: 0.9, delay: 0.6});
  if (q('.role')) cx.wa(q('.role'), [{opacity: 0, transform: 'translateX(-12px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.8});
  cx.wa(el.querySelectorAll('.mask > span'), [{transform: 'translateY(110%)'}, {transform: 'none'}], {duration: 0.9, delay: 0.95, stagger: 0.1});
  if (q('.note')) cx.wa(q('.note'), [{opacity: 0}, {opacity: 1}], {duration: 0.8, delay: 1.5, ease: 'ease-out'});
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/nametag", __mount, typeof css === "string" ? css : "", {"kind":"kit/nametag","title":"Name tag","use":"person","family":"name-plate","lead":"picture","site":null,"dur":2.3,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/split-person */
(function(){
// A graphic panel and a camera column: the points light up one by one on the left, the speaker stays on screen in a tall column on the right.
const css = `
.b-kit-split-person .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.6); display: grid; grid-template-columns: 1fr 38%; column-gap: calc(var(--gap) * 1.7); }
.b-kit-split-person.flip .wrap { grid-template-columns: 38% 1fr; }
.b-kit-split-person.flip .cam { order: -1; }
.b-kit-split-person .panel { display: flex; flex-direction: column; justify-content: center; gap: var(--gap); min-width: 0; }
.b-kit-split-person .cs-title { font-size: var(--title); }
.b-kit-split-person .pts { display: flex; flex-direction: column; }
.b-kit-split-person .pt { position: relative; display: grid; grid-template-columns: 2.6em 1fr; align-items: baseline; padding: calc(var(--gap) * 0.55) 0; font-size: calc(var(--lead) * 1.12); }
.b-kit-split-person .pt::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--line); }
.b-kit-split-person .pt .n { font-size: var(--label); letter-spacing: 0.2em; color: var(--gold2); }
.b-kit-split-person .pt .t { color: var(--ink); line-height: 1.2; font-weight: var(--light); }
.b-kit-split-person .pt .mark { position: absolute; left: 0; bottom: 0; height: 1px; width: 100%; background: var(--gold); transform-origin: 0 50%; z-index: 1; }
.b-kit-split-person .cam { position: relative; border-radius: var(--radius); overflow: hidden; background: #000; border: 1px solid var(--line); min-height: 0; }
.b-kit-split-person .cam > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.cs-frame[data-shape="tall"] .b-kit-split-person .wrap { grid-template-columns: 1fr !important; grid-template-rows: 36cqh 1fr; row-gap: calc(var(--gap) * 1.3); padding-top: calc(var(--pad) * 0.5 + var(--top)); }
.cs-frame[data-shape="tall"] .b-kit-split-person .cam { order: -1; }
.cs-frame[data-shape="tall"] .b-kit-split-person .panel { justify-content: flex-start; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-kit-split-person .pt { padding: calc(var(--gap) * 0.6) 0; }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const face = p.face || null, pts = (p.points || []).slice(0, 4);
  if (p.side === 'left') el.classList.add('flip');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Video of the speaker')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Photo of the speaker')}">`;
  el.innerHTML = `<div class="wrap">
    <div class="panel">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      <ol class="pts">${pts.map((t, i) => `<li class="pt"><span class="n cs-num">${String(i + 1).padStart(2, '0')}</span><span class="t">${cx.esc(t.title || t)}</span><i class="mark" aria-hidden="true"></i></li>`).join('')}</ol>
    </div>
    <div class="cam">${tag}</div>
  </div>`;
  const q = (s) => el.querySelector(s), m = q('.cam > *'), box = q('.cam');
  const place = () => {
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, bw = box.clientWidth, bh = box.clientHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  cx.wa(box, [{opacity: 0, clipPath: 'inset(100% 0 0 0 round 1px)'}, {opacity: 1, clipPath: 'inset(0% 0 0 0 round 1px)'}], {duration: 1.1});
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) cx.wa(head, [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.2, stagger: 0.1});
  const t0 = 0.8, each = 0.65, steps = [];
  el.querySelectorAll('.pt').forEach((li, i) => {
    const at = t0 + each * i;
    cx.wa(li.querySelectorAll('.n, .t'), [{opacity: 0, transform: 'translateX(-18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.6, delay: at, stagger: 0.07});
    cx.wa(li.querySelector('.mark'), [{transform: 'scaleX(0)', opacity: 1}, {transform: 'scaleX(1)', opacity: 1, offset: 0.7}, {transform: 'scaleX(1)', opacity: 0}], {duration: 1.0, delay: at + 0.05, ease: 'cubic-bezier(.3,.7,.2,1)'});
    if (i > 0) steps.push(at - 0.03);
  });
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  if (p.click !== false) text.steps = steps;
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/split-person", __mount, typeof css === "string" ? css : "", {"kind":"kit/split-person","title":"Points and camera column","use":"person","family":"split-camera","lead":"picture","site":null,"dur":3.1,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/quote-film */
(function(){
// What he really said, next to the clip where he says it. The clip of the person fills one side (60 %), framed on the face;
// on the other side the words of that moment arrive phrase by phrase, thin and large, with one word in gold and a small source line.
// Nothing is drawn on the person: give the face box (and the body box) and the words stay in their own column.
const css = `
.b-kit-quote-film .media { position: absolute; top: 0; bottom: 0; left: 0; width: 60%; overflow: hidden; background: #000; }
.b-kit-quote-film.flip .media { left: auto; right: 0; }
.b-kit-quote-film .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-quote-film .edge { position: absolute; top: 0; bottom: 0; left: 60%; width: 2px; background: var(--gold); transform-origin: 50% 0; }
.b-kit-quote-film.flip .edge { left: 40%; margin-left: -2px; }
.b-kit-quote-film .copy { position: absolute; top: var(--top); bottom: 0; right: 0; width: 40%; padding: var(--pad) calc(var(--pad) * 0.8) var(--pad) calc(var(--pad) * 0.66); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.7); }
.b-kit-quote-film.flip .copy { right: auto; left: 0; padding: var(--pad) calc(var(--pad) * 0.66) var(--pad) calc(var(--pad) * 0.8); }
.b-kit-quote-film .qm { font-family: var(--serif); font-size: calc(var(--lead) * 1.9); line-height: 0.6; height: 0.42em; color: var(--gold2); }
.b-kit-quote-film .lines { display: flex; flex-direction: column; gap: 0.14em; font-size: calc(var(--title) * 0.66); font-weight: var(--thin); letter-spacing: -0.022em; line-height: 1.12; color: var(--ink); }
.b-kit-quote-film .lines.many { font-size: calc(var(--title) * 0.54); }
.b-kit-quote-film .ln { display: block; word-break: keep-all; overflow-wrap: break-word; text-wrap: balance; will-change: clip-path, transform, opacity; }
.b-kit-quote-film .src { display: flex; align-items: center; gap: 0.9em; margin-top: calc(var(--gap) * 0.3); }
.b-kit-quote-film .src i { display: block; flex: none; width: 2.6em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .media { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 46%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .edge { left: 0; right: 0; width: auto; margin: 0; top: calc(46% + var(--top)); bottom: auto; height: 2px; transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .copy { top: calc(46% + var(--top)); left: 0; right: 0; width: auto; padding: calc(var(--pad) * 1.1) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-kit-quote-film .lines { font-size: calc(var(--title) * 0.92); }
.cs-frame[data-shape="tall"] .b-kit-quote-film .lines.many { font-size: calc(var(--title) * 0.76); }
`;
const __mount = function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || ''), face = p.face || null, tall = cx.shape === 'tall';
  if (p.side === 'left') el.classList.add('flip');
  const lines = [].concat(p.lines || []).map(String).filter(Boolean).slice(0, 4), gold = [].concat(p.gold || []).map(String).filter(Boolean);
  // the gold words: every place where one of them stands in a line
  const paint = (s) => {
    if (!gold.length) return cx.esc(s);
    const re = new RegExp('(' + gold.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
    return s.split(re).map((part, i) => (i % 2 ? `<span class="cs-gold">${cx.esc(part)}</span>` : cx.esc(part))).join('');
  };
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Video of the speaker')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Photo of the speaker')}">`;
  el.innerHTML = `
    <div class="media">${tag}</div>
    <i class="edge" aria-hidden="true"></i>
    <div class="copy">
      <div class="qm" aria-hidden="true">&ldquo;</div>
      <blockquote class="lines${lines.length > 2 ? ' many' : ''}">${lines.map((l) => `<span class="ln">${paint(l)}</span>`).join('')}</blockquote>
      ${p.source ? `<div class="src"><i></i><span class="cs-label">${cx.esc(p.source)}</span></div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *'), box = q('.media');
  // frame the picture on the face: its centre goes to the middle of the panel, a little above half height
  const place = () => {
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, bw = box.offsetWidth, bh = box.offsetHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (p.body) cx.face(m, p.body, 'body');
  const open = tall ? ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] : p.side === 'left' ? ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'] : ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'];
  cx.wa(box, [{clipPath: open[0]}, {clipPath: open[1]}], {duration: 1.2, ease: 'cubic-bezier(.7,0,.2,1)'});
  cx.wa(q('.edge'), [{transform: tall ? 'scaleX(0)' : 'scaleY(0)'}, {transform: 'none'}], {duration: 0.9, delay: 0.5});
  cx.wa(q('.qm'), [{opacity: 0, transform: 'translateY(0.2em)'}, {opacity: 1, transform: 'none'}], {duration: 0.6, delay: 0.4, ease: 'ease-out'});
  // the phrases arrive one after another, each written in from the left, like speech
  const lns = el.querySelectorAll('.ln'), gap = lns.length > 1 ? Math.min(0.45, 1.2 / (lns.length - 1)) : 0;
  cx.wa(lns, [{opacity: 0, clipPath: 'inset(-0.3em 100% -0.3em 0)', transform: 'translateX(-0.25em)'}, {opacity: 1, clipPath: 'inset(-0.3em 68% -0.3em 0)', transform: 'translateX(-0.17em)', offset: 0.28}, {opacity: 1, clipPath: 'inset(-0.3em -2% -0.3em 0)', transform: 'none'}], {duration: 0.95, delay: 0.55, stagger: gap, ease: 'cubic-bezier(.3,.1,.2,1)'});
  const t1 = 0.55 + gap * (lns.length - 1) + 0.35;
  if (q('.src')) { cx.wa(q('.src i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.7, delay: t1}); cx.wa(q('.src span'), [{opacity: 0}, {opacity: 1}], {duration: 0.5, delay: t1 + 0.05, ease: 'ease-out'}); }
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  return isVideo ? Object.assign(cx.all(text, cx.fromVideo(m)), {fit: place}) : text;
}

CS.register("kit/quote-film", __mount, typeof css === "string" ? css : "", {"kind":"kit/quote-film","title":"Quote with its clip","use":"quote","family":"quote-clip","lead":"picture","site":null,"dur":2.05,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* gsap/kinetic-type */
(function(){
// GSAP: three to five words take the whole screen one after another (mask rise, wipe, weight and tracking change, drop),
// then all of them settle into one lockup: lines of different sizes, each as wide as the block, and one word turns gold.
// Type sizes are computed from the frame (cqw / cqh), so every word fills the width on a slide, a web screen and a phone.
const css = `
.b-gsap-kinetic-type .kk { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--top) + var(--pad) * 0.6); }
.b-gsap-kinetic-type .stage { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--top) + var(--pad) * 0.6 + var(--label) * 2.5); bottom: calc(var(--pad) * 0.62); }
.b-gsap-kinetic-type .stage.nok { top: calc(var(--top) + var(--pad) * 0.6); }
.b-gsap-kinetic-type .w { position: absolute; left: 50%; top: 50%; white-space: nowrap; font-size: 10cqw; font-weight: var(--thin); letter-spacing: -0.04em; line-height: 0.86; color: var(--ink); opacity: 0; }
.b-gsap-kinetic-type .m { display: block; padding: 0.16em 0.08em; margin: -0.16em -0.08em; overflow: hidden; }
.b-gsap-kinetic-type .g { display: block; will-change: transform; }
.b-gsap-kinetic-type .cs-rule { position: absolute; }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, words = (p.words || []).slice(0, 5).map(String), n = words.length;
  const gi = p.gold == null ? n - 1 : typeof p.gold === 'number' ? p.gold - 1 : words.indexOf(String(p.gold));
  el.innerHTML = `${p.kicker ? `<div class="kk cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <div class="stage${p.kicker ? '' : ' nok'}">${words.map((w) => `<span class="w"><span class="m"><span class="g">${cx.esc(w)}</span></span></span>`).join('')}<i class="cs-rule" aria-hidden="true"></i></div>`;
  const q = (s) => el.querySelector(s), stage = q('.stage'), ws = [...el.querySelectorAll('.w')], rule = q('.cs-rule');
  const LH = 0.86, GAP = 0.26;
  let tl = null, cur = 0, lock = [];
  function lay() {
    const W = el.clientWidth, H = el.clientHeight, SW = stage.clientWidth, SH = stage.clientHeight; if (!W || !SW || !n) return false;
    // how wide each word is per 1 px of type, then the size at which it fills the stage
    const ratio = ws.map((w) => { w.style.fontSize = '10cqw'; return w.offsetWidth / (parseFloat(getComputedStyle(w).fontSize) || 1); });
    ws.forEach((w, i) => { w.style.fontSize = `min(${((SW / W) * 100 / ratio[i]).toFixed(3)}cqw, ${((SH / H) * 100 / 0.92).toFixed(3)}cqh)`; });
    const solo = ws.map((w) => parseFloat(getComputedStyle(w).fontSize));
    // the lockup: try every way to break the words into lines, keep the one that covers the most of the stage
    let best = null;
    for (let mask = 0; mask < 1 << (n - 1); mask++) {
      const lines = [[0]]; for (let i = 1; i < n; i++) { if ((mask >> (i - 1)) & 1) lines.push([i]); else lines[lines.length - 1].push(i); }
      const rs = lines.map((l) => l.reduce((s, i) => s + ratio[i], 0) + GAP * (l.length - 1)), inv = rs.reduce((s, r) => s + 1 / r, 0);
      const wl = Math.min(SW, SH / (LH * inv)), area = wl * wl * LH * inv;
      if (!best || area > best.area * 1.001) best = {lines, rs, wl, area, h: wl * LH * inv};
    }
    const x0 = (SW - best.wl) / 2; let y = (SH - best.h) / 2;
    best.lines.forEach((l, k) => {
      const fs = best.wl / best.rs[k]; let x = x0;
      l.forEach((i) => { const wpx = ratio[i] * fs; lock[i] = {x: x + wpx / 2 - SW / 2, y: y + (fs * LH) / 2 - SH / 2, scale: fs / solo[i], line: k}; x += wpx + GAP * fs; });
      y += fs * LH;
    });
    rule.style.left = x0 + 'px'; rule.style.top = Math.min(SH + (el.clientHeight - stage.offsetTop - SH) * 0.5, y + SH * 0.035) + 'px';
    return true;
  }
  function make() {
    if (tl) tl.kill();
    g.set([...ws, ...el.querySelectorAll('.m, .g, .kk, .cs-rule')], {clearProps: 'transform,opacity,clipPath,color,letterSpacing,fontWeight,x,y,scale,xPercent,yPercent'});
    lay();
    const thin = parseInt(getComputedStyle(ws[0] || el).fontWeight, 10) || 200, gold = getComputedStyle(el).getPropertyValue('--gold2').trim() || '#F2B45A';
    g.set(ws, {xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, opacity: 0});
    tl = g.timeline({paused: true});
    if (q('.kk')) tl.fromTo(q('.kk'), {opacity: 0, x: -18}, {opacity: 1, x: 0, duration: 0.5, ease: 'power3.out'}, 0);
    const slot = cx.clamp(2.3 / n, 0.5, 0.7), di = Math.min(0.46, slot * 0.74), S0 = 0.05, TL = S0 + slot * n;
    ws.forEach((w, k) => {
      const m = w.querySelector('.m'), gl = w.querySelector('.g'), S = S0 + slot * k, O = S + slot - 0.03, last = k === n - 1, kind = k % 4;
      tl.set(w, {opacity: 1}, S);
      // in
      if (kind === 0) { tl.fromTo(gl, {yPercent: 140}, {yPercent: 0, duration: di, ease: 'expo.out'}, S); tl.fromTo(gl, {letterSpacing: '0.1em'}, {letterSpacing: '-0.04em', duration: slot, ease: 'power2.out'}, S); }
      else if (kind === 1) { tl.fromTo(m, {clipPath: 'inset(0% 100% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: di, ease: 'power3.inOut'}, S); tl.fromTo(gl, {xPercent: -5}, {xPercent: 0, duration: slot, ease: 'power2.out'}, S); }
      else if (kind === 2) { tl.fromTo(gl, {opacity: 0}, {opacity: 1, duration: 0.14, ease: 'none'}, S); tl.fromTo(gl, {scale: 1.16, fontWeight: 700}, {scale: 1, fontWeight: thin, duration: di + 0.1, ease: 'expo.out'}, S); }
      else tl.fromTo(gl, {yPercent: -140}, {yPercent: 0, duration: di, ease: 'expo.out'}, S);
      if (last) { tl.to(w, {x: lock[k].x, y: lock[k].y, scale: lock[k].scale, duration: 0.42, ease: 'expo.inOut'}, TL - 0.06); return; }
      // out, then wait at its place in the lockup and rise there
      if (kind === 0) tl.to(gl, {yPercent: -140, duration: 0.2, ease: 'power2.in'}, O);
      else if (kind === 1) tl.to(m, {clipPath: 'inset(0% 0% 0% 100%)', duration: 0.2, ease: 'power2.in'}, O);
      else if (kind === 2) tl.to(gl, {opacity: 0, scale: 0.94, duration: 0.18, ease: 'power1.in'}, O);
      else tl.to(gl, {yPercent: 140, duration: 0.2, ease: 'power2.in'}, O);
      tl.set(w, {opacity: 0}, O + 0.21);
      const R = TL + 0.15 + 0.05 * lock[k].line;
      tl.set(w, {x: lock[k].x, y: lock[k].y, scale: lock[k].scale}, TL);
      tl.set(m, {clipPath: 'inset(0% 0% 0% 0%)'}, TL);
      tl.set(w, {opacity: 1}, R);
      tl.fromTo(gl, {yPercent: 140, opacity: 1, scale: 1, xPercent: 0}, {yPercent: 0, opacity: 1, scale: 1, xPercent: 0, duration: 0.42, ease: 'expo.out', immediateRender: false}, R);
    });
    if (gi >= 0 && ws[gi]) tl.to(ws[gi].querySelector('.g'), {color: gold, duration: 0.3, ease: 'power1.out'}, TL + 0.3);
    tl.fromTo(rule, {scaleX: 0}, {scaleX: 1, duration: 0.5, ease: 'power3.out'}, TL + 0.12);
    tl.to({}, {duration: 0.01}, TL + 0.61);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); }};
}

CS.register("gsap/kinetic-type", __mount, typeof css === "string" ? css : "", {"kind":"gsap/kinetic-type","title":"Kinetic type, full screen","use":"statement","family":"kinetic-lockup","lead":"type","site":null,"dur":3,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* gsap/lesson-map */
(function(){
// GSAP DrawSVG + MotionPath: a wide road with a gold centre line is drawn across the whole screen, and four to seven stops
// (a picture card + lesson, title, tool) light up one after another as the line arrives. One stop is "now" and is gold.
// On a slide two stops come per click; on a web page the screen stays pinned and the scroll draws the road. On a phone the road runs down the side.
const css = `
.b-gsap-lesson-map .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.4 + var(--top)) calc(var(--pad) * 0.6) calc(var(--pad) * 0.34); display: flex; flex-direction: column; gap: calc(var(--gap) * 0.5); }
.b-gsap-lesson-map .hd { flex: none; display: flex; align-items: baseline; gap: calc(var(--gap) * 0.7); }
.b-gsap-lesson-map .hd .hr { flex: 1; height: 1px; background: var(--line); align-self: center; transform-origin: 0 50%; display: block; }
.b-gsap-lesson-map .ttl { font-size: calc(var(--lead) * 0.95); font-weight: var(--thin); letter-spacing: -0.02em; color: var(--ink); line-height: 1.1; }
.b-gsap-lesson-map .map { position: relative; flex: 1 1 auto; min-height: 0; }
.b-gsap-lesson-map .map svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.b-gsap-lesson-map svg path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.b-gsap-lesson-map .edge { stroke: color-mix(in srgb, var(--ivory) 34%, var(--bg)); }
.b-gsap-lesson-map .bed { stroke: color-mix(in srgb, var(--ivory) 10%, var(--bg)); }
.b-gsap-lesson-map .lane { stroke: color-mix(in srgb, var(--ivory) 40%, transparent); stroke-linecap: butt; }
.b-gsap-lesson-map .gold { stroke: var(--gold); opacity: 0; }
.b-gsap-lesson-map .dot { fill: var(--bg); stroke: var(--gold2); }
.b-gsap-lesson-map .core { fill: var(--gold2); }
.b-gsap-lesson-map .halo { fill: none; stroke: var(--gold2); }
.b-gsap-lesson-map .runner { fill: var(--ink); opacity: 0; }
.b-gsap-lesson-map .sts { position: absolute; inset: 0; }
.b-gsap-lesson-map .st { position: absolute; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.26); }
.b-gsap-lesson-map .st.up { flex-direction: column-reverse; }
.b-gsap-lesson-map .pic { position: relative; flex: none; height: var(--th, 8em); border-radius: calc(var(--radius) * 0.8); overflow: hidden; background: var(--bg2); border: 1px solid var(--line); }
.b-gsap-lesson-map .pic .in { position: absolute; inset: 0; display: grid; place-items: center; }
.b-gsap-lesson-map .pic img { width: 100%; height: 100%; object-fit: cover; }
.b-gsap-lesson-map .pic .no { height: 62%; aspect-ratio: 1; border-radius: 50%; border: 1px solid var(--gold); display: grid; place-items: center; font-size: calc(var(--lead) * 1.05); font-weight: var(--thin); color: var(--ink); letter-spacing: -0.03em; line-height: 1; }
.b-gsap-lesson-map .pic .ring { position: absolute; inset: 0; border-radius: inherit; border: 1px solid color-mix(in srgb, var(--ivory) 50%, transparent); }
.b-gsap-lesson-map .st.now .pic .ring { border: calc(var(--label) * 0.13) solid var(--gold2); }
.b-gsap-lesson-map .lb { display: flex; flex-direction: column; align-items: flex-start; gap: calc(var(--gap) * 0.1); min-width: 0; padding: 0 0.1em; }
.b-gsap-lesson-map .wh { font-size: var(--label); font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold2); line-height: 1.3; white-space: nowrap; }
.b-gsap-lesson-map .st.now .wh { background: var(--gold2); color: var(--bg); font-weight: 500; padding: 0.1em 0.6em 0.1em 0.8em; border-radius: 999px; margin-bottom: 0.15em; }
.b-gsap-lesson-map .t { font-size: calc(var(--lead) * 0.62); color: var(--ink); line-height: 1.13; letter-spacing: -0.012em; text-wrap: balance; }
.b-gsap-lesson-map .tool { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: var(--label); color: var(--dim); line-height: 1.3; }
.cs-frame[data-stage="deck"] .b-gsap-lesson-map .ttl { font-size: calc(var(--lead) * 1.15); }
.cs-frame[data-stage="deck"] .b-gsap-lesson-map .wh { font-size: calc(var(--label) * 1.15); }
.cs-frame[data-stage="deck"] .b-gsap-lesson-map .t { font-size: calc(var(--lead) * 0.84); }
.cs-frame[data-stage="site"][data-shape="wide"] .b-gsap-lesson-map .t { font-size: calc(var(--lead) * 0.72); }
.cs-frame[data-stage="site"][data-shape="wide"] .b-gsap-lesson-map .tool { font-size: var(--label); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .wrap { padding: calc(var(--pad) * 0.6 + var(--top)) var(--pad) calc(var(--pad) * 0.5); gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .hd { flex-direction: column; align-items: flex-start; gap: 0.35em; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .hd .hr { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .ttl { font-size: calc(var(--lead) * 1.3); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .st, .cs-frame[data-shape="tall"] .b-gsap-lesson-map .st.up { display: grid; grid-template-columns: 37% 1fr; column-gap: calc(var(--gap) * 0.7); align-items: center; translate: 0 -50%; }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .pic { height: auto; aspect-ratio: 16 / 10; border-radius: calc(var(--radius) * 0.6); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .pic .no { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .t { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-gsap-lesson-map .wh, .cs-frame[data-shape="tall"] .b-gsap-lesson-map .tool { font-size: calc(var(--label) * 0.92); }
`;
const __mount = function mount(el, p, cx) {
  cx.plugin('DrawSVGPlugin', 'MotionPathPlugin');
  const g = cx.gsap, tall = cx.shape === 'tall';
  const stops = (p.stops || []).slice(0, 7).map((s) => (typeof s === 'string' ? {title: s} : s)), n = stops.length;
  const now = p.now == null ? -1 : (p.now | 0) - 1, click = p.click !== false;
  el.innerHTML = `<div class="wrap">
    ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}<i class="hr" aria-hidden="true"></i>${p.title ? `<h2 class="ttl">${cx.esc(p.title)}</h2>` : ''}</div>` : ''}
    <div class="map">
      <svg aria-hidden="true"><path class="edge"/><path class="bed"/><path class="lane"/><path class="gold"/>${stops.map(() => '<g class="nd"><circle class="halo"/><circle class="dot"/><circle class="core"/></g>').join('')}<circle class="runner"/></svg>
      <ol class="sts">${stops.map((s, i) => `<li class="st ${i % 2 ? 'dn' : 'up'}${i === now ? ' now' : ''}">
        <div class="pic"><div class="in">${s.src ? `<img src="${cx.esc(s.src)}" alt="${cx.esc(s.alt || s.title || 'Picture of this stop')}">` : `<span class="no cs-num">${String(i + 1).padStart(2, '0')}</span>`}</div><i class="ring" aria-hidden="true"></i></div>
        <div class="lb">${s.when ? `<span class="wh">${cx.esc(s.when)}</span>` : ''}<span class="t">${cx.esc(s.title || '')}</span>${s.tool ? `<span class="tool">${cx.esc(s.tool)}</span>` : ''}</div>
      </li>`).join('')}</ol>
    </div>
  </div>`;
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  const map = q('.map'), sts = qa('.st'), edge = q('.edge'), bed = q('.bed'), lane = q('.lane'), gold = q('.gold'), runner = q('.runner'), nds = qa('.nd');
  let tl = null, draw = null, run = null, cur = 0, frac = [];
  // the map is laid out in real pixels of the frame: cards above and below a road band (wide), or a list beside the road (tall)
  function lay() {
    const W = map.clientWidth, H = map.clientHeight; if (!W || !H || !n) return false;
    const pts = [], ox = map.offsetLeft, oy = map.offsetTop;
    let rw, d;
    const set = (pt) => { gold.setAttribute('d', d); frac.push(gold.getTotalLength()); pts.push(pt); };
    frac = [];
    if (!tall) {
      const k = 1.7, P = n > 1 ? W / (n - 1 + k) : W, w = n > 1 ? P * k : W * 0.5, gap = parseFloat(getComputedStyle(sts[0]).rowGap) || 0;
      sts.forEach((st, i) => { st.style.width = w + 'px'; st.style.left = (n > 1 ? i * P : W * 0.25) + 'px'; st.style.top = st.style.bottom = 'auto'; });
      const lbH = (odd) => Math.max(0, ...sts.filter((_, i) => (i % 2 === 1) === odd).map((st) => st.querySelector('.lb').offsetHeight));
      const up = lbH(false), dn = lbH(true);
      rw = cx.clamp(H * 0.052, 14, 56);
      const band = rw * 3.3;
      const th = Math.max(40, Math.min(w * 9 / 16, (H - band - up - dn - 2 * gap) / 2));
      const top = Math.max(0, (H - (2 * th + band + up + dn + 2 * gap)) / 2) + up + gap + th, cy = top + band / 2, amp = band / 2 - rw * 0.72;
      map.style.setProperty('--th', th + 'px');
      sts.forEach((st, i) => { if (i % 2) st.style.top = top + band + 'px'; else st.style.bottom = H - top + 'px'; });
      const X = (i) => (n > 1 ? i * P : W * 0.25) + w / 2, Y = (i) => cy + (i % 2 ? amp : -amp);
      const seg = (ax, ay, bx, by) => ` C${(ax + bx) / 2} ${ay} ${(ax + bx) / 2} ${by} ${bx} ${by}`;
      let px = -ox - rw * 2, py = cy + amp * 0.9;
      d = `M${px} ${py}`;
      for (let i = 0; i < n; i++) { d += seg(px, py, X(i), Y(i)); px = X(i); py = Y(i); set({x: px, y: py}); }
      d += seg(px, py, W + ox + rw * 2, cy + (n % 2 ? amp : -amp) * 0.9);
    } else {
      const rc = W * 0.17, row = H / n; rw = cx.clamp(W * 0.062, 12, 30);
      sts.forEach((st, i) => { st.style.left = rc + rw * 0.9 + 'px'; st.style.width = W - rc - rw * 0.9 + 'px'; st.style.top = row * (i + 0.5) + 'px'; st.style.bottom = 'auto'; });
      const X = (i) => rc * (i % 2 ? 0.78 : 0.2), Y = (i) => row * (i + 0.5);
      const seg = (ax, ay, bx, by) => ` C${ax} ${(ay + by) / 2} ${bx} ${(ay + by) / 2} ${bx} ${by}`;
      let px = rc * 0.78, py = -row * 0.12;
      d = `M${px} ${py}`;
      for (let i = 0; i < n; i++) { d += seg(px, py, X(i), Y(i)); px = X(i); py = Y(i); set({x: px, y: py}); }
      d += seg(px, py, rc * (n % 2 ? 0.78 : 0.2), H + (el.clientHeight - oy - H) + rw * 2);
    }
    [edge, bed, lane, gold].forEach((e) => e.setAttribute('d', d));
    const total = gold.getTotalLength() || 1; frac = frac.map((f) => f / total);
    edge.setAttribute('stroke-width', rw + Math.max(2, rw * 0.09)); bed.setAttribute('stroke-width', rw);
    lane.setAttribute('stroke-width', Math.max(1.5, rw * 0.055)); lane.setAttribute('stroke-dasharray', `${rw * 0.42} ${rw * 0.5}`);
    gold.setAttribute('stroke-width', Math.max(3, rw * 0.15)); runner.setAttribute('r', Math.max(4, rw * 0.2));
    nds.forEach((nd, i) => {
      const [halo, dot, core] = nd.children, r = rw * 0.3;
      [halo, dot, core].forEach((c) => { c.setAttribute('cx', pts[i].x); c.setAttribute('cy', pts[i].y); });
      dot.setAttribute('r', r); dot.setAttribute('stroke-width', Math.max(1.5, rw * 0.06)); core.setAttribute('r', r * (i === now ? 1 : 0.56));
      halo.setAttribute('r', r * 1.75); halo.setAttribute('stroke-width', Math.max(1.5, rw * 0.06));
    });
    return true;
  }
  function make() {
    if (tl) { tl.kill(); draw.kill(); run.kill(); }
    const anim = [edge, bed, lane, gold, runner, ...qa('.hd > *, .pic, .pic .in, .pic .ring, .lb > *, .dot, .core, .halo')];
    g.set(anim, {clearProps: 'all'});
    lay();
    tl = g.timeline({paused: true});
    const head = qa('.hd > *:not(.hr)');
    if (head.length) tl.fromTo(head, {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08}, 0);
    if (q('.hr')) tl.fromTo(q('.hr'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'power3.inOut'}, 0.1);
    // the empty map first: road bed, lane marks, card outlines, stop dots
    tl.fromTo([edge, bed], {opacity: 0}, {opacity: 1, duration: 0.05}, 0.1);
    tl.fromTo([edge, bed], {drawSVG: '0%'}, {drawSVG: '100%', duration: 0.85, ease: 'power2.inOut'}, 0.1);
    tl.fromTo(lane, {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power1.out'}, 0.7);
    tl.fromTo(qa('.pic'), {opacity: 0, scale: 0.94}, {opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06}, 0.2);
    tl.fromTo(qa('.dot'), {opacity: 0, scale: 0, transformOrigin: '50% 50%'}, {opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.06}, 0.4);
    g.set(qa('.core, .halo'), {opacity: 0, scale: 0, transformOrigin: '50% 50%'});
    g.set(qa('.pic .ring'), {opacity: 0});
    // the gold line and the runner are two paused tweens; the timeline moves their progress stop by stop
    draw = g.fromTo(gold, {drawSVG: '0%'}, {drawSVG: '100%', duration: 1, ease: 'none', paused: true});
    run = g.to(runner, {motionPath: {path: gold, align: gold, alignOrigin: [0.5, 0.5]}, duration: 1, ease: 'none', paused: true});
    let T = 0.8, f0 = 0, step = 0;
    tl.fromTo([gold, runner], {opacity: 0}, {opacity: 1, duration: 0.15}, T - 0.05);
    for (let a = 0; a < n; a += 2) {
      const grp = [a, a + 1].filter((j) => j < n), f1 = frac[grp[grp.length - 1]] || 1, d = 0.45 * grp.length + (a === 0 ? 0.2 : 0);
      tl.to([draw, run], {progress: f1, duration: d, ease: 'none'}, T);
      grp.forEach((j) => {
        const at = T + d * ((frac[j] - f0) / Math.max(1e-6, f1 - f0)), st = sts[j], up = !tall && j % 2 === 0;
        tl.fromTo(st.querySelector('.in'), {clipPath: tall ? 'inset(0% 100% 0% 0%)' : up ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', scale: 1.12}, {clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.7, ease: 'power3.out'}, at - 0.08);
        tl.to(st.querySelector('.ring'), {opacity: 1, duration: 0.4, ease: 'power1.out'}, at);
        tl.fromTo(st.querySelectorAll('.lb > *'), {opacity: 0, x: tall ? 16 : 0, y: tall ? 0 : up ? -14 : 14}, {opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07}, at + 0.08);
        tl.to(nds[j].querySelector('.core'), {opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.4)'}, at - 0.02);
        if (j === now) tl.to(nds[j].querySelector('.halo'), {opacity: 0.85, scale: 1, duration: 0.6, ease: 'power3.out'}, at + 0.05);
      });
      T += d + 0.7; f0 = f1;
      if (a + 2 < n) { if (click && step < 3) tl.addLabel('step' + ++step, T - 0.05); }
      else { tl.to([draw, run], {progress: 1, duration: 0.6, ease: 'power1.in'}, T - 0.65); tl.to(runner, {opacity: 0, duration: 0.2}, T - 0.2); }
    }
    tl.to({}, {duration: 0.01}, T - 0.01);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  const steps = Object.keys(tl.labels).map((k) => tl.labels[k]).sort((a, b) => a - b);
  return {lib: 'gsap', dur: tl.duration(), steps, seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); draw.kill(); run.kill(); }};
}

CS.register("gsap/lesson-map", __mount, typeof css === "string" ? css : "", {"kind":"gsap/lesson-map","title":"Lesson map","use":"timeline","family":"road-map-cards","lead":"picture","site":{"mode":"scrub","len":3},"dur":5.8,"source":{"type":"gsap","package":"gsap","version":"3.15.0","uses":["DrawSVGPlugin","MotionPathPlugin"]},"license":"GSAP standard license","data":{}});
})();

/* gsap/pin-showcase */
(function(){
// GSAP: a large media stage that stays in place while the pictures change. Every step wipes the next picture or clip in
// with a different mask, the one before sinks back, and the number, the title and the line beside it change with it.
// On a slide every click is one step; on a web page the screen stays pinned and the scroll moves through the pictures.
// A video item plays only while it is the one on show. Nothing is drawn on the pictures.
const css = `
.b-gsap-pin-showcase .stage { position: absolute; top: 0; bottom: 0; right: 0; width: 69%; overflow: hidden; background: #000; }
.b-gsap-pin-showcase .layer { position: absolute; inset: 0; overflow: hidden; will-change: clip-path, transform, opacity; }
.b-gsap-pin-showcase .layer > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; will-change: transform; }
.b-gsap-pin-showcase .side { position: absolute; top: var(--top); bottom: 0; left: 0; width: 31%; padding: calc(var(--pad) * 0.62) calc(var(--gap) * 0.9) calc(var(--pad) * 0.62) calc(var(--pad) * 0.56); display: flex; flex-direction: column; justify-content: space-between; gap: var(--gap); }
.b-gsap-pin-showcase .hd { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); }
.b-gsap-pin-showcase .cs-kicker { letter-spacing: 0.3em; }
.b-gsap-pin-showcase .hd .t { font-size: calc(var(--body) * 0.9); color: var(--dim); line-height: 1.3; }
.b-gsap-pin-showcase .mid { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.6); }
.b-gsap-pin-showcase .numrow { display: flex; align-items: flex-end; gap: 0.5em; }
.b-gsap-pin-showcase .nums { display: grid; overflow: hidden; font-size: calc(var(--hero) * 1.2); line-height: 0.84; padding: 0.02em 0 0.04em; }
.b-gsap-pin-showcase .nb { grid-area: 1 / 1; font-weight: var(--thin); letter-spacing: -0.05em; color: var(--ink); }
.b-gsap-pin-showcase .of { font-size: calc(var(--label) * 1.1); letter-spacing: 0.2em; color: var(--gold2); padding-bottom: 0.7em; white-space: nowrap; }
.b-gsap-pin-showcase .bar { display: block; height: 1px; width: 100%; background: var(--gold); transform-origin: 0 50%; }
.b-gsap-pin-showcase .txs { display: grid; }
.b-gsap-pin-showcase .tx { grid-area: 1 / 1; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); align-self: start; }
.b-gsap-pin-showcase .tx .lb { font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold2); }
.b-gsap-pin-showcase .tx h3 { font-size: calc(var(--title) * 0.54); font-weight: var(--light); letter-spacing: -0.02em; line-height: 1.08; color: var(--ink); text-wrap: balance; }
.b-gsap-pin-showcase .tx p { font-size: calc(var(--body) * 0.86); line-height: 1.36; color: var(--dim); text-wrap: pretty; }
.b-gsap-pin-showcase .prog { display: flex; gap: calc(var(--gap) * 0.24); align-items: center; }
.b-gsap-pin-showcase .seg { flex: 1; height: 2px; background: var(--line); position: relative; overflow: hidden; }
.b-gsap-pin-showcase .seg i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.cs-frame[data-stage="deck"] .b-gsap-pin-showcase .cs-kicker, .cs-frame[data-stage="deck"] .b-gsap-pin-showcase .tx .lb { font-size: calc(var(--label) * 0.86); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .stage { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 72cqw; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .side { top: calc(72cqw + var(--top)); width: auto; right: 0; padding: calc(var(--pad) * 0.9) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .hd { order: -2; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .hd .t { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .prog { order: -1; }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .nums { font-size: calc(var(--hero) * 1.3); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .tx h3 { font-size: calc(var(--title) * 0.8); }
.cs-frame[data-shape="tall"] .b-gsap-pin-showcase .tx p { font-size: var(--body); }
`;
const __mount = function mount(el, p, cx) {
  const g = cx.gsap, items = (p.items || []).slice(0, 5), n = items.length, tall = cx.shape === 'tall';
  const isVid = (s) => /\.(mp4|webm|mov)$/i.test(s || '');
  const pos = (it) => (Array.isArray(it.face) ? `${Math.round((it.face[0] + it.face[2] / 2) * 100)}% ${Math.round(cx.clamp((it.face[1] + it.face[3] / 2) * 100 - 8, 0, 100))}%` : '50% 50%');
  const tag = (it) => (isVid(it.src)
    ? `<video src="${cx.esc(it.src)}" ${it.poster ? `poster="${cx.esc(it.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(it.alt || it.title || 'Video')}" style="object-position:${pos(it)}"></video>`
    : `<img src="${cx.esc(it.src)}" alt="${cx.esc(it.alt || it.title || 'Picture')}" style="object-position:${pos(it)}">`);
  const two = (i) => String(i).padStart(2, '0');
  el.innerHTML = `
    <div class="stage">${items.map((it) => `<div class="layer" data-face-ok>${tag(it)}</div>`).join('')}</div>
    <div class="side">
      ${p.kicker || p.title ? `<div class="hd">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<p class="t">${cx.esc(p.title)}</p>` : ''}</div>` : '<span></span>'}
      <div class="mid">
        <div class="numrow"><div class="nums cs-num">${items.map((_, i) => `<span class="nb">${two(i + 1)}</span>`).join('')}</div><span class="of cs-num">/ ${two(n)}</span></div>
        <i class="bar" aria-hidden="true"></i>
        <div class="txs">${items.map((it) => `<div class="tx">${it.label ? `<div class="lb">${cx.esc(it.label)}</div>` : ''}<h3>${cx.esc(it.title || '')}</h3>${it.text ? `<p>${cx.esc(it.text)}</p>` : ''}</div>`).join('')}</div>
      </div>
      <div class="prog" aria-hidden="true">${items.map(() => '<span class="seg"><i></i></span>').join('')}</div>
    </div>`;
  const all = (s) => Array.from(el.querySelectorAll(s)), layers = all('.layer'), media = layers.map((l) => l.firstElementChild), nbs = all('.nb'), txs = all('.tx'), segs = all('.seg i');
  items.forEach((it, i) => { if (Array.isArray(it.face)) cx.face(media[i], it.face); if (Array.isArray(it.body)) cx.face(media[i], it.body, 'body'); });
  // one mask per step, never the same twice in a row: from the right, from below, a slanted edge, an opening circle
  const wipes = [
    ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'],
    ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
    ['polygon(130% 0%, 130% 0%, 100% 100%, 100% 100%)', 'polygon(-30% 0%, 130% 0%, 100% 100%, -60% 100%)'],
    ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'],
  ];
  const first = 1.6, each = 1.5, total = first + each * (n - 1);
  const starts = items.map((_, i) => (i ? first + each * (i - 1) : 0));
  const grow = (i) => (Array.isArray(items[i].face) ? 1 : 1.12);      // a person is never shown larger than the picture
  const tl = g.timeline({paused: true});
  g.set(layers.slice(1), {visibility: 'hidden'}); g.set(nbs, {opacity: 0}); g.set(txs, {opacity: 0});
  if (el.querySelector('.hd')) tl.fromTo(el.querySelector('.hd'), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, 0.1);
  tl.fromTo(layers[0], {clipPath: 'inset(0% 100% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut'}, 0);
  tl.fromTo(media[0], {scale: grow(0)}, {scale: 1, duration: 1.6, ease: 'power3.out'}, 0);
  tl.fromTo(nbs[0], {opacity: 0, yPercent: 60}, {opacity: 1, yPercent: 0, duration: 0.8, ease: 'expo.out'}, 0.35);
  tl.fromTo(el.querySelector('.of'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.5);
  tl.fromTo(el.querySelector('.bar'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.out'}, 0.45);
  tl.fromTo(txs[0], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'}, 0.55);
  tl.fromTo(el.querySelector('.prog'), {opacity: 0}, {opacity: 1, duration: 0.5}, 0.3);
  tl.to(segs[0], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, 0.5);
  for (let i = 1; i < n; i++) {
    const T = starts[i], w = wipes[(i - 1) % wipes.length];
    tl.addLabel('step' + i, T);
    tl.set(layers[i], {visibility: 'visible'}, T);
    tl.fromTo(layers[i], {clipPath: w[0]}, {clipPath: w[1], duration: 1.0, ease: 'expo.inOut'}, T);
    tl.fromTo(media[i], {scale: grow(i)}, {scale: 1, duration: 1.3, ease: 'power3.out'}, T + 0.1);
    tl.to(layers[i - 1], {scale: 0.9, opacity: 0.3, duration: 0.95, ease: 'power2.inOut'}, T);
    tl.set(layers[i - 1], {visibility: 'hidden'}, T + 1.02);
    tl.to(nbs[i - 1], {opacity: 0, yPercent: -60, duration: 0.4, ease: 'power2.in'}, T);
    tl.to(txs[i - 1], {opacity: 0, y: -22, duration: 0.35, ease: 'power2.in'}, T);
    tl.fromTo(nbs[i], {opacity: 0, yPercent: 60}, {opacity: 1, yPercent: 0, duration: 0.7, ease: 'expo.out'}, T + 0.32);
    tl.fromTo(txs[i], {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, T + 0.42);
    tl.to(segs[i], {scaleX: 1, duration: 0.9, ease: 'power2.out'}, T + 0.3);
  }
  tl.to({}, {duration: 0.01}, total - 0.01);
  // video items: only the one on show runs; when recording, the exact frame
  const vids = media.map((m) => (m.tagName === 'VIDEO' ? m : null));
  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || /[?&]reduced/.test(location.search);
  let on = true, cur = 0;
  const run = () => vids.forEach((v, i) => { if (!v) return; if (on && !calm && i === cur) { if (v.paused) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } } else if (!v.paused) v.pause(); });
  const film = cx.fromFn(total, (t, exact) => {
    let k = 0; for (let i = 1; i < n; i++) if (t >= starts[i] + 0.05) k = i;
    cur = k;
    const v = vids[k];
    if (exact) {
      vids.forEach((x) => { if (x && !x.paused) x.pause(); });
      if (!v || v.error) return;
      const d = v.duration || 0; let tt = Math.max(0, t - starts[k]); if (d) tt = tt % d;
      if (Math.abs(v.currentTime - tt) < 0.001 && v.readyState >= 2) return;
      return new Promise((res) => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); v.removeEventListener('error', fin); res(); }; v.addEventListener('seeked', fin); v.addEventListener('error', fin); v.currentTime = tt; });
    }
    if (t > 0) run();
  });
  const clip = cx.all(cx.fromGsap(tl), film);
  const waits = vids.filter((v) => v && v.readyState < 2).map((v) => new Promise((res) => { const ok = () => { v.removeEventListener('loadeddata', ok); v.removeEventListener('error', ok); res(); }; v.addEventListener('loadeddata', ok); v.addEventListener('error', ok); }));
  return Object.assign(clip, {ready: waits.length ? Promise.all(waits) : null, visible: (v) => { on = v; run(); }, dispose: () => { vids.forEach((v) => v && v.pause()); tl.kill(); }});
}

CS.register("gsap/pin-showcase", __mount, typeof css === "string" ? css : "", {"kind":"gsap/pin-showcase","title":"Pinned showcase","use":"media","family":"pinned-showcase","lead":"picture","site":{"mode":"scrub","len":3},"dur":6.1,"source":{"type":"gsap","package":"gsap","version":"3.15.0"},"license":"GSAP standard license","data":{}});
})();

/* kit/device-laptop */
(function(){
// A long web page inside a laptop drawn in CSS (no brand): the lid opens, then the page scrolls from top to bottom inside the screen.
// On a web page the block stays pinned and your own scroll moves the page in the laptop. A video simply plays. For screens, not for portraits.
const css = `
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
const __mount = function mount(el, p, cx) {
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

CS.register("kit/device-laptop", __mount, typeof css === "string" ? css : "", {"kind":"kit/device-laptop","title":"Long page in a laptop","use":"media","family":"laptop-scroll","lead":"picture","site":{"mode":"scrub","len":2},"dur":6,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();

/* kit/end-film */
(function(){
// The last screen as a film frame: a result clip or picture fills the frame behind a dark veil, the closing line and the
// link buttons sit on top (real links, they work on the slide too). For results and graphics, not for footage of a person:
// the veil covers the whole picture.
const css = `
.b-kit-end-film { background: #000; }
.b-kit-end-film .media { position: absolute; inset: 0; overflow: hidden; }
.b-kit-end-film .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-end-film .veil { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(90% 80% at 50% 52%, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.82) 46%, rgba(8, 7, 5, 0.68) 100%); }
.b-kit-end-film .cs-hero { font-size: calc(var(--hero) * 0.8); max-width: 12em; }
.b-kit-end-film .cs-w { margin: 0 0.11em; }
.b-kit-end-film .cs-lead { max-width: 24em; color: var(--ink); }
.b-kit-end-film .btns { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--gap) * 0.6); margin-top: calc(var(--gap) * 0.3); }
.b-kit-end-film .cs-btn { min-height: 48px; }
.b-kit-end-film .cs-btn.cs-ghost { background: rgba(8, 7, 5, 0.5); border-color: rgba(235, 226, 210, 0.5); }
.b-kit-end-film .brand { display: flex; align-items: center; gap: 1.2em; margin-top: calc(var(--gap) * 0.5); }
.b-kit-end-film .brand .cs-label { color: var(--ink); }
.b-kit-end-film .brand i { display: block; width: calc(var(--label) * 3); height: 1px; background: var(--gold); }
.b-kit-end-film .brand i:first-child { transform-origin: 100% 50%; }
.b-kit-end-film .brand i:last-child { transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-end-film .cs-hero { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-kit-end-film .btns { flex-direction: column; align-self: stretch; }
.cs-frame[data-shape="tall"] .b-kit-end-film .cs-btn { width: 100%; }
`;
const __mount = function mount(el, p, cx) {
  const links = (p.links || []).slice(0, 3);
  const safe = (h) => (/^\s*(javascript|data|vbscript):/i.test(String(h || '')) ? '#' : String(h || '#'));
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const media = !p.src ? '' : isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Background clip')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || '')}">`;
  el.innerHTML = `
    <div class="media">${media}</div>
    <div class="veil"></div>
    <div class="cs-pad cs-center">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-hero">${cx.spans(p.title, 'cs-w')}</h2>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
      ${links.length ? `<div class="btns">${links.map((l, i) => `<a class="cs-btn${i ? ' cs-ghost' : ''}" href="${cx.esc(safe(l.href))}"${/^https?:/i.test(l.href || '') ? ' target="_blank" rel="noopener"' : ''}>${cx.esc(l.label)}</a>`).join('')}</div>` : ''}
      ${p.brand ? `<div class="brand"><i aria-hidden="true"></i><span class="cs-label">${cx.esc(p.brand)}</span><i aria-hidden="true"></i></div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), ws = el.querySelectorAll('.cs-w'), t1 = 0.5 + 0.07 * ws.length, m = q('.media > *');
  cx.wa(q('.media'), [{opacity: 0, transform: 'scale(1.06)'}, {opacity: 1, transform: 'scale(1)'}], {duration: 1.6, ease: 'cubic-bezier(.2,.7,.2,1)'});
  cx.wa(q('.veil'), [{opacity: 0.4}, {opacity: 1}], {duration: 1.2, delay: 0.2, ease: 'ease-out'});
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0, letterSpacing: '0.6em'}, {opacity: 1, letterSpacing: '0.34em'}], {duration: 0.8, delay: 0.3, ease: 'ease-out'});
  cx.wa(ws, [{opacity: 0, filter: 'blur(14px)', transform: 'translateY(0.3em)'}, {opacity: 1, filter: 'blur(0px)', transform: 'none'}], {duration: 0.8, delay: 0.5, stagger: 0.07});
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.25});
  cx.wa(el.querySelectorAll('.cs-btn'), [{opacity: 0, transform: 'translateY(22px) scale(0.96)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.5, stagger: 0.12});
  if (q('.brand')) {
    cx.wa(el.querySelectorAll('.brand i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: t1 + 0.9});
    cx.wa(q('.brand span'), [{opacity: 0, letterSpacing: '0.5em'}, {opacity: 1, letterSpacing: '0.22em'}], {duration: 0.9, delay: t1 + 0.9});
  }
  const text = cx.fromWaapi(el);
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}

CS.register("kit/end-film", __mount, typeof css === "string" ? css : "", {"kind":"kit/end-film","title":"End card on film","use":"cta","family":"end-film","lead":"picture","site":null,"dur":2.9,"source":{"type":"kit","package":"none (Web Animations API)"},"license":"MIT","data":{}});
})();
