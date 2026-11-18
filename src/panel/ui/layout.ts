import { h } from '../dom';

/**
 * Masonry-style layout: items are dealt into independent column stacks (item i → column i % n),
 * so a short card is never padded to the height of a tall neighbour. The column count follows the
 * container width; item order and placement stay stable when card heights change.
 * @param items Card elements in reading order.
 * @param minWidth Minimum column width in pixels.
 * @returns Container element.
 * @example pane.append(masonry([a.el, b.el, c.el], 360));
 */
export const masonry = (items: HTMLElement[], minWidth = 360) => {
  const el = h('div', { class: 'dt-masonry' });
  let count = 0;

  const layout = () => {
    const width = el.clientWidth;
    if (!width) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
    const next = Math.max(1, Math.min(items.length, Math.floor((width + gap) / (minWidth + gap))));
    if (next === count) return;
    count = next;
    const columns = Array.from({ length: count }, () => h('div', { class: 'dt-masonry-col' }));
    items.forEach((item, index) => columns[index % count].append(item));
    el.replaceChildren(...columns);
  };

  new ResizeObserver(layout).observe(el);
  // Until the first measurement, show everything in one column so nothing is lost.
  el.append(h('div', { class: 'dt-masonry-col' }, items));
  return el;
};
