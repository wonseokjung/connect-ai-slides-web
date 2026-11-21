// The person is the picture: video or photo fills one side, a quiet name plate sits low on the other side.
// Give the face box: the picture is framed on the face and the plate stays away from it.
export const css = `
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
export default function mount(el, p, cx) {
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
