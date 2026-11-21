// A HyperFrames block (HTML + CSS + a paused GSAP timeline) runs exactly as it is, inside an iframe.
// The stage only moves its timeline. Any block from the HyperFrames registry can be used the same way.
export default function mount(el, p, cx) {
  let html = cx.meta.data['block.html'];
  if (cx.shape === 'tall') html = html.replace('</style>', '[data-composition-id="gold-scramble-title"] { width: 820px; } [data-composition-id="gold-scramble-title"] .wrap { left: 40px; } [data-composition-id="gold-scramble-title"] .rule { width: 740px; } [data-composition-id="gold-scramble-title"] .title { font-size: 116px; }</style>');
  return cx.fromHyperframes(el, html, {canvas: cx.shape === 'tall' ? [820, 360] : [1200, 360], dur: 2.4, scale: cx.shape === 'tall' ? 0.94 : 0.82, text: {'.title': p.text, '.kicker': p.kicker}, title: p.text});
}
