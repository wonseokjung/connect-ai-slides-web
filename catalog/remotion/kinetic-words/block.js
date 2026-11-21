// A Remotion composition played inside the page by @remotion/player. The stage seeks it frame by frame,
// so the same component you render to video in lessons 2 and 3 also works on a slide and on a website.
export const css = `
.b-remotion-kinetic-words .rm { position: absolute; left: 0; right: 0; top: 50%; aspect-ratio: 16 / 9; transform: translateY(-50%); max-height: 100%; }
.b-remotion-kinetic-words .cap { position: absolute; left: 0; right: 0; bottom: calc(var(--pad) * 0.6); text-align: center; }
.cs-frame[data-shape="tall"] .b-remotion-kinetic-words .rm { aspect-ratio: 4 / 5; }
.cs-frame[data-shape="tall"] .b-remotion-kinetic-words .cap { bottom: 12%; }
`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="rm"></div>${p.caption ? `<div class="cap cs-label">${cx.esc(p.caption)}</div>` : ''}`;
  const clip = cx.fromRemotion(el.querySelector('.rm'), 'remotion/kinetic-words', {words: (p.words || ['Video', 'Slides', 'Web']).slice(0, 3), gold: p.gold == null ? 2 : p.gold}, cx.shape === 'tall' ? {width: 1080, height: 1350} : null);
  if (!p.caption) return clip;
  cx.wa(el.querySelector('.cap'), [{opacity: 0}, {opacity: 1}], {duration: 0.8, delay: 1.6});
  return cx.all(clip, cx.fromWaapi(el.querySelector('.cap')));
}
