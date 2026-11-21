// A graphic panel and a camera column: the points light up one by one on the left, the speaker stays on screen in a tall column on the right.
export const css = `
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
export default function mount(el, p, cx) {
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
