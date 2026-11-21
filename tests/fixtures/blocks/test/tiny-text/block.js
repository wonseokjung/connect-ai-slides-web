// wrong on purpose: a fixed 10 px font
export const css = `.b-test-tiny-text .small { font-size: 10px; color: var(--ink); }`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="cs-pad"><h2 class="cs-title">${cx.esc(p.text || 'Title')}</h2><p class="small">This line is far too small to read from the back of a room.</p></div>`;
  return cx.fromFn(0.5, () => {});
}
