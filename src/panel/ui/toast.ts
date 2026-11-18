import { h } from '../dom';

/** Toast stack container (created lazily). */
let stack: HTMLElement | null = null;

/**
 * Shows a short notification in the bottom corner.
 * @param text Message.
 * @param kind Visual style.
 * @example toast('Saved');
 */
export const toast = (text: string, kind: 'ok' | 'error' = 'ok') => {
  if (!stack) {
    stack = h('div', { class: 'dt-toasts', attrs: { 'aria-live': 'polite' } });
    document.body.append(stack);
  }
  const item = h('div', { class: ['dt-toast', `dt-toast--${kind}`], text });
  stack.append(item);
  window.setTimeout(() => item.classList.add('dt-toast--out'), 2600);
  window.setTimeout(() => item.remove(), 3000);
};
