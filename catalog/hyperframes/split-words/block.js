// A HyperFrames block (HTML + CSS + a paused GSAP timeline), played as it is inside an iframe: each word rises out of its own mask
// (GSAP SplitText), the last word is gold. The canvas grows with the sentence so it fills the width; on a phone the sentence wraps.
export default function mount(el, p, cx) {
  const text = String(p.text || ''), words = text.trim().split(/\s+/).length, tall = cx.shape === 'tall';
  let html = cx.meta.data['block.html'], canvas;
  if (tall) {
    const lines = Math.max(1, Math.ceil((text.length * 68) / 680));
    canvas = [760, (p.kicker ? 70 : 0) + lines * 162 + 60];
    html = html.replace('</style>', '[data-composition-id="split-words"] .line { white-space: normal; } [data-composition-id="split-words"] { padding-left: 20px; }</style>');
  } else canvas = [Math.round(Math.max(900, 110 + Math.max(text.length, String(p.kicker || '').length * 0.36) * 70)), p.kicker ? 340 : 280];
  return cx.fromHyperframes(el, html, {canvas, dur: 0.12 + 0.8 + 0.12 * (words - 1) + 0.1, scale: tall ? 0.94 : 0.84, text: {'.line': text, '.kicker': p.kicker || ''}, title: text});
}
