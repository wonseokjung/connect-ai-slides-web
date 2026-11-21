// a correct user block: tokens only, seekable
export const css = `.b-test-good .cs-title { max-width: 14em; }`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="cs-pad"><h2 class="cs-title">${cx.esc(p.text || 'Title')}</h2></div>`;
  cx.wa(el.querySelector('.cs-title'), [{opacity: 0}, {opacity: 1}], {duration: 0.6});
  return cx.fromWaapi(el);
}
