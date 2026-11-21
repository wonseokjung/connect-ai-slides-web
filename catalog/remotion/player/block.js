// Your own Remotion component, played inside the page by @remotion/player and seeked frame by frame by the stage:
// {"kind": "remotion/player", "component": "./My.tsx", "durationInFrames": 120, "fps": 30, "width": 1920, "height": 1080, "props": {...}}.
// Without "component" the kit's own composition plays: a frame ruler that shows its own frame number.
export const css = `
.b-remotion-player .wrap { position: absolute; inset: 0; padding: calc(var(--pad) * 0.5 + var(--top)) var(--pad) calc(var(--pad) * 0.5); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: calc(var(--gap) * 0.7); }
.b-remotion-player .rm { position: relative; width: 100%; max-height: 100%; min-height: 0; flex: 0 1 auto; }
.b-remotion-player .cap { display: flex; align-items: baseline; gap: calc(var(--gap) * 0.8); align-self: stretch; }
.b-remotion-player .cap .tx { font-size: var(--body); color: var(--ivory); line-height: 1.35; }
.cs-frame[data-shape="tall"] .b-remotion-player .cap { flex-direction: column; gap: calc(var(--gap) * 0.5); }
`;
export default function mount(el, p, cx) {
  const own = !!p.component, tall = cx.shape === 'tall';
  const size = own ? {width: p.width || 1920, height: p.height || 1080} : tall ? {width: 1080, height: 1120} : {width: 1920, height: 760};
  el.innerHTML = `<div class="wrap">
    <div class="rm" style="aspect-ratio:${size.width} / ${size.height}" role="img" aria-label="${cx.esc(p.alt || p.caption || 'Remotion composition')}"></div>
    ${p.caption || p.kicker ? `<div class="cap">${p.kicker ? `<span class="cs-kicker">${cx.esc(p.kicker)}</span>` : ''}${p.caption ? `<span class="tx">${cx.esc(p.caption)}</span>` : ''}</div>` : ''}
  </div>`;
  const tok = (n) => getComputedStyle(el).getPropertyValue(n).trim();
  const props = own ? p.props || {} : {label: p.label || 'A Remotion composition', ink: tok('--ink'), accent: tok('--gold2'), gold: tok('--gold'), dim: tok('--dim')};
  const clip = cx.fromRemotion(el.querySelector('.rm'), own ? 'user:' + p.component : 'remotion/player', props, own ? null : size);
  const cap = el.querySelector('.cap');
  if (!cap) return clip;
  cx.wa(cap.children, [{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: 0.7, stagger: 0.12});
  return cx.all(clip, cx.fromWaapi(cap));
}
