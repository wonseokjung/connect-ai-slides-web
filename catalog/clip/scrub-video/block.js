// A video clip you move with the scroll: on a web page the scroll winds it forward and back, on a slide it simply plays.
// A time code and a thin progress line follow the picture. Give the face box and the words stay beside the person.
export const css = `
.b-clip-scrub-video .media { position: absolute; top: 0; bottom: 0; right: 0; width: 68%; overflow: hidden; background: #000; }
.b-clip-scrub-video.flip .media { right: auto; left: 0; }
.b-clip-scrub-video .media video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-clip-scrub-video .copy { position: absolute; top: var(--top); bottom: 0; left: 0; width: 32%; padding: var(--pad) calc(var(--gap) * 1.2) var(--pad) var(--pad); display: flex; flex-direction: column; justify-content: center; gap: var(--gap); }
.b-clip-scrub-video.flip .copy { left: auto; right: 0; padding: var(--pad) var(--pad) var(--pad) calc(var(--gap) * 1.2); }
.b-clip-scrub-video .cs-title { font-size: calc(var(--title) * 0.82); }
.b-clip-scrub-video .meter { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); margin-top: calc(var(--gap) * 0.4); }
.b-clip-scrub-video .tc { display: flex; align-items: baseline; gap: 0.5em; font-size: var(--lead); font-weight: var(--thin); color: var(--ink); line-height: 1; }
.b-clip-scrub-video .tc small { font-size: var(--label); letter-spacing: 0.14em; color: var(--dim); }
.b-clip-scrub-video .rail { position: relative; height: 2px; background: var(--line); }
.b-clip-scrub-video .rail i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; transform: scaleX(0); }
.cs-frame[data-shape="tall"] .b-clip-scrub-video .media { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 54%; }
.cs-frame[data-shape="tall"] .b-clip-scrub-video .copy { top: calc(54% + var(--top)); left: 0; right: 0; width: auto; padding: calc(var(--pad) * 0.9) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-clip-scrub-video .cs-title { font-size: var(--title); }
`;
export default function mount(el, p, cx) {
  const face = p.face || null;
  if (p.side === 'right') el.classList.add('flip');
  let dur = Number(p.seconds) > 0 ? Number(p.seconds) : 6, known = Number(p.seconds) > 0;
  el.innerHTML = `
    <div class="media"><video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video clip')}"></video></div>
    <div class="copy">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
      ${p.text ? `<p class="cs-text">${cx.esc(p.text)}</p>` : ''}
      <div class="meter" aria-hidden="true"><div class="tc cs-num"><span class="now">0.0</span><small>/ <span class="len">${dur.toFixed(1)}</span> s</small></div><div class="rail"><i></i></div></div>
    </div>`;
  const q = (s) => el.querySelector(s), v = q('video'), box = q('.media'), now = q('.now'), len = q('.len'), bar = q('.rail i');
  v.muted = true; v.loop = false;
  const place = () => {
    const mw = v.videoWidth || 16, mh = v.videoHeight || 9, bw = box.offsetWidth, bh = box.offsetHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    v.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place();
  v.addEventListener('loadedmetadata', () => { place(); if (!known && v.duration) len.textContent = Math.min(dur, v.duration).toFixed(1); });
  if (face) cx.face(v, face);
  cx.wa(el.querySelectorAll('.cs-kicker, .cs-title, .cs-text, .meter'), [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.1, stagger: 0.1});
  const text = cx.fromWaapi(q('.copy'));
  const live = cx.stage === 'deck';
  const film = cx.fromFn(dur, (t, exact) => {
    const end = v.duration ? Math.min(dur, v.duration - 0.04) : dur, tt = cx.clamp(t, 0, end);
    now.textContent = tt.toFixed(1); bar.style.transform = 'scaleX(' + (end > 0 ? tt / end : 0) + ')';
    if (exact) {
      if (Math.abs(v.currentTime - tt) < 0.001 && v.readyState >= 2) return;
      if (v.error) return;
      return new Promise((res) => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); v.removeEventListener('error', fin); res(); }; v.addEventListener('seeked', fin); v.addEventListener('error', fin); v.currentTime = tt; });
    }
    if (live) {
      // on a slide the clock runs forward: let the video play and only correct it when it drifts
      if (tt >= end - 0.02 || tt <= 0) { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - tt) > 0.04) v.currentTime = tt; return; }
      if (Math.abs(v.currentTime - tt) > 0.3) v.currentTime = tt;
      if (v.paused) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
      return;
    }
    if (!v.paused) v.pause();
    if (Math.abs(v.currentTime - tt) > 0.04 && !v.seeking) v.currentTime = tt;      // the scroll winds the film
  });
  const clip = cx.all(text, film);
  // recording waits for the first frame of the file before it asks for exact frames
  const ready = v.readyState >= 2 ? null : new Promise((res) => { const ok = () => { v.removeEventListener('loadeddata', ok); v.removeEventListener('error', ok); res(); }; v.addEventListener('loadeddata', ok); v.addEventListener('error', ok); });
  return Object.assign(clip, {ready, fit: place, visible: (on) => { if (!on && !v.paused) v.pause(); }, dispose: () => v.pause()});
}
