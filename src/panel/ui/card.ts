import { h, type Child } from '../dom';

/** Card options. */
export type CardOptions = {
  /** Heading text. */
  title: string;
  /** One-line explanation under the heading. */
  description?: string;
  /** Emoji/icon shown before the title. */
  icon?: string;
  /** Element placed on the right side of the header (e.g. a switch). */
  aside?: HTMLElement;
  /** Extra class names. */
  class?: string;
};

/**
 * Creates a section card with a header and a body.
 * @param opts Card options.
 * @param body Body children.
 * @returns `{ el, body }`.
 * @example const { el } = card({ title: 'Rate', icon: '💱' }, [form]);
 */
export const card = (opts: CardOptions, body: Child[] = []) => {
  const bodyEl = h('div', { class: 'dt-card-body' }, body);
  const el = h('section', { class: ['dt-card', opts.class] }, [
    h('header', { class: 'dt-card-head' }, [
      h('div', { class: 'dt-card-titles' }, [
        h('h2', {}, [opts.icon ? h('span', { class: 'dt-card-icon', text: opts.icon, attrs: { 'aria-hidden': 'true' } }) : null, opts.title]),
        opts.description ? h('p', { class: 'dt-card-desc', text: opts.description }) : null,
      ]),
      opts.aside ?? null,
    ]),
    bodyEl,
  ]);
  return { el, body: bodyEl };
};

/** Button options. */
export type ButtonOptions = {
  /** Visual variant. */
  variant?: 'primary' | 'danger' | 'ghost' | 'plain';
  /** Small size. */
  small?: boolean;
  /** Tooltip. */
  title?: string;
  /** Extra classes. */
  class?: string;
};

/**
 * Creates a button.
 * @param text Label.
 * @param onClick Click handler.
 * @param opts Visual options.
 * @returns Button element.
 * @example button('Save', save, { variant: 'primary' });
 */
export const button = (text: string, onClick: () => void, opts: ButtonOptions = {}) =>
  h('button', {
    class: [
      'dt-btn',
      opts.variant && opts.variant !== 'plain' ? `dt-btn--${opts.variant}` : null,
      opts.small ? 'dt-btn--sm' : null,
      opts.class,
    ],
    text,
    attrs: { type: 'button', title: opts.title },
    on: { click: onClick },
  });

/**
 * Segmented control (tabs inside a card).
 * @param items `[id, label]` pairs.
 * @param onChange Called with the selected id.
 * @param initial Selected id.
 * @returns `{ el, select }`.
 * @example segmented([['a', 'A'], ['b', 'B']], id => show(id));
 */
export const segmented = (items: [string, string][], onChange: (id: string) => void, initial = items[0][0]) => {
  const buttons = new Map<string, HTMLButtonElement>();
  const select = (id: string) => {
    buttons.forEach((btn, key) => {
      btn.classList.toggle('dt-seg--active', key === id);
      btn.setAttribute('aria-selected', String(key === id));
    });
    onChange(id);
  };
  const el = h(
    'div',
    { class: 'dt-seg', attrs: { role: 'tablist' } },
    items.map(([id, label]) => {
      const btn = h('button', { class: 'dt-seg-btn', text: label, attrs: { type: 'button', role: 'tab' }, on: { click: () => select(id) } });
      buttons.set(id, btn);
      return btn;
    })
  );
  select(initial);
  return { el, select };
};
