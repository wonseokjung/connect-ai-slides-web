// wrong on purpose: dark grey text on the dark background
export const css = `.b-test-low-contrast .dim { font-size: var(--body); color: #2b2a28; }`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="cs-pad"><h2 class="cs-title">${cx.esc(p.text || 'Title')}</h2><p class="dim">You can hardly see this sentence.</p></div>`;
  return cx.fromFn(0.5, () => {});
}
