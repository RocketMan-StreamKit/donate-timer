import { h, setText } from '../dom';
import { toLocalInput } from '../format';
import { t } from '../i18n';

/** Text that may depend on the current form values (re-evaluated on refresh). */
export type Dyn = string | (() => string);

/**
 * Resolves dynamic text.
 * @param value Static or computed text.
 * @returns Text.
 * @example dyn(() => 'x'); // 'x'
 */
const dyn = (value: Dyn | undefined) => (typeof value === 'function' ? value() : value ?? '');

/** A form field bound to a settings path. */
export type Field = {
  /** Root element. */
  el: HTMLElement;
  /** Current value. */
  get(): unknown;
  /** Sets the value without marking the form dirty. */
  set(value: unknown): void;
  /** Re-evaluates dynamic labels and hints. */
  refresh(): void;
};

/** Common field options. */
export type FieldBase = {
  /** Label. */
  label: Dyn;
  /** Hint under the input. */
  hint?: Dyn;
  /** Spans the whole row inside a grid. */
  wide?: boolean;
};

/**
 * Notifies the enclosing form that a custom control changed.
 * @param el Control element.
 * @example emitInput(swatch);
 */
const emitInput = (el: HTMLElement) => el.dispatchEvent(new Event('input', { bubbles: true }));

/**
 * Wraps a control with a label and a hint.
 * @param base Label and hint.
 * @param control Input element(s).
 * @returns Wrapper and a refresh function.
 * @example wrap({ label: 'Rate' }, input);
 */
const wrap = (base: FieldBase, control: HTMLElement) => {
  const labelEl = h('span', { class: 'dt-label' });
  const hintEl = h('small', { class: 'dt-hint' });
  const el = h('label', { class: ['dt-field', base.wide ? 'dt-field--wide' : null] }, [labelEl, control, hintEl]);
  const refresh = () => {
    setText(labelEl, dyn(base.label));
    const hint = dyn(base.hint);
    setText(hintEl, hint);
    hintEl.hidden = !hint;
  };
  refresh();
  return { el, refresh };
};

/**
 * Number input with an optional unit suffix.
 * @param opts Options.
 * @returns Field.
 * @example numberField({ label: 'Rate', min: 0, suffix: '₽' });
 */
export const numberField = (opts: FieldBase & { min?: number; max?: number; step?: number | 'any'; suffix?: Dyn; placeholder?: string }): Field => {
  const input = h('input', {
    attrs: { type: 'number', min: opts.min, max: opts.max, step: opts.step ?? 'any', placeholder: opts.placeholder, inputmode: 'decimal' },
  });
  const suffix = h('span', { class: 'dt-suffix' });
  const control = h('div', { class: 'dt-input-group' }, [input, suffix]);
  const base = wrap(opts, control);
  const refresh = () => {
    base.refresh();
    const text = dyn(opts.suffix);
    setText(suffix, text);
    suffix.hidden = !text;
  };
  refresh();
  return {
    el: base.el,
    get: () => (input.value === '' ? NaN : Number(input.value)),
    set: value => {
      input.value = value === undefined || value === null ? '' : String(value);
    },
    refresh,
  };
};

/**
 * Text input.
 * @param opts Options.
 * @returns Field.
 * @example textField({ label: 'Title', maxLength: 200 });
 */
export const textField = (opts: FieldBase & { placeholder?: Dyn; maxLength?: number; type?: 'text' | 'url'; numeric?: boolean }): Field => {
  const input = h('input', {
    attrs: { type: opts.type ?? 'text', maxlength: opts.maxLength ?? 200, inputmode: opts.numeric ? 'numeric' : undefined },
  });
  const base = wrap(opts, input);
  const refresh = () => {
    base.refresh();
    input.placeholder = dyn(opts.placeholder);
  };
  refresh();
  return {
    el: base.el,
    get: () => input.value,
    set: value => {
      input.value = value === undefined || value === null ? '' : String(value);
    },
    refresh,
  };
};

/**
 * On/off switch with a label on the right.
 * @param opts Options.
 * @returns Field.
 * @example toggleField({ label: 'Enabled' });
 */
export const toggleField = (opts: FieldBase): Field => {
  const input = h('input', { attrs: { type: 'checkbox', role: 'switch' } });
  const labelEl = h('span', { class: 'dt-switch-label' });
  const hintEl = h('small', { class: 'dt-hint' });
  const el = h('label', { class: ['dt-switch', opts.wide !== false ? 'dt-field--wide' : null] }, [
    input,
    h('span', { class: 'dt-switch-track', attrs: { 'aria-hidden': 'true' } }),
    h('span', { class: 'dt-switch-text' }, [labelEl, hintEl]),
  ]);
  const refresh = () => {
    setText(labelEl, dyn(opts.label));
    const hint = dyn(opts.hint);
    setText(hintEl, hint);
    hintEl.hidden = !hint;
  };
  refresh();
  return {
    el,
    get: () => input.checked,
    set: value => {
      input.checked = !!value;
    },
    refresh,
  };
};

/**
 * Select box.
 * @param opts Options with a choice list provider.
 * @returns Field.
 * @example selectField({ label: 'Currency', options: () => [['RUB', 'RUB']] });
 */
export const selectField = (opts: FieldBase & { options: () => [string, string][] }): Field => {
  const select = h('select');
  const base = wrap(opts, select);
  const refresh = () => {
    base.refresh();
    const items = opts.options();
    const value = select.value;
    if (select.options.length !== items.length || items.some(([v], i) => select.options[i].value !== v)) {
      select.replaceChildren(...items.map(([v, label]) => h('option', { text: label, attrs: { value: v } })));
      select.value = value;
    } else {
      items.forEach(([, label], i) => setText(select.options[i], label));
    }
  };
  refresh();
  return {
    el: base.el,
    get: () => select.value,
    set: value => {
      select.value = String(value ?? '');
    },
    refresh,
  };
};

/**
 * Local date-time input with "Now" and optional "Clear" buttons (value: epoch ms, 0 = empty).
 * @param opts Options.
 * @returns Field.
 * @example datetimeField({ label: 'Started', clearable: true });
 */
export const datetimeField = (opts: FieldBase & { clearable?: boolean }): Field => {
  const input = h('input', { attrs: { type: 'datetime-local', step: 1 } });
  const nowBtn = h('button', {
    class: 'dt-btn dt-btn--sm',
    attrs: { type: 'button' },
    on: {
      click: () => {
        input.value = toLocalInput(Date.now());
        emitInput(input);
      },
    },
  });
  const clearBtn = opts.clearable
    ? h('button', {
        class: 'dt-btn dt-btn--sm dt-btn--ghost',
        attrs: { type: 'button' },
        on: {
          click: () => {
            input.value = '';
            emitInput(input);
          },
        },
      })
    : null;
  const control = h('div', { class: 'dt-inline' }, [input, nowBtn, clearBtn]);
  const base = wrap(opts, control);
  const refresh = () => {
    base.refresh();
    setText(nowBtn, t('now'));
    if (clearBtn) setText(clearBtn, t('clear'));
  };
  refresh();
  return {
    el: base.el,
    get: () => (input.value ? new Date(input.value).getTime() : 0),
    set: value => {
      input.value = toLocalInput(Number(value) || 0);
    },
    refresh,
  };
};

/**
 * Hours / minutes / seconds input (value: seconds).
 * @param opts Options.
 * @returns Field plus `input` elements for focus checks.
 * @example hmsField({ label: 'Starting time' });
 */
export const hmsField = (opts: FieldBase): Omit<Field, 'get'> & { root: HTMLElement; get(): number } => {
  const part = (max?: number) => h('input', { attrs: { type: 'number', min: 0, max, inputmode: 'numeric', placeholder: '0' } });
  const hours = part();
  const minutes = part(59);
  const seconds = part(59);
  const units = [h('span', { class: 'dt-unit' }), h('span', { class: 'dt-unit' }), h('span', { class: 'dt-unit' })];
  const root = h('div', { class: 'dt-hms' }, [
    h('span', { class: 'dt-hms-part' }, [hours, units[0]]),
    h('span', { class: 'dt-hms-part' }, [minutes, units[1]]),
    h('span', { class: 'dt-hms-part' }, [seconds, units[2]]),
  ]);
  const base = wrap(opts, root);
  const refresh = () => {
    base.refresh();
    setText(units[0], t('hh'));
    setText(units[1], t('mm'));
    setText(units[2], t('ss'));
  };
  refresh();
  const num = (input: HTMLInputElement) => Math.max(0, Number(input.value) || 0);
  return {
    el: base.el,
    root,
    get: () => num(hours) * 3600 + num(minutes) * 60 + num(seconds),
    set: value => {
      const total = Math.max(0, Math.floor(Number(value) || 0));
      hours.value = String(Math.floor(total / 3600));
      minutes.value = String(Math.floor((total % 3600) / 60));
      seconds.value = String(total % 60);
    },
    refresh,
  };
};

/** Option of {@link choiceField}. */
export type Choice = { value: string; title: Dyn; hint?: Dyn };

/**
 * Large radio cards with a title and an explanation each.
 * @param opts Options.
 * @returns Field.
 * @example choiceField({ label: 'Mode', choices: [{ value: 'a', title: 'A', hint: 'Explain' }] });
 */
export const choiceField = (opts: FieldBase & { choices: Choice[] }): Field => {
  let value = opts.choices[0]?.value ?? '';
  const items = opts.choices.map(choice => {
    const titleEl = h('b');
    const hintEl = h('small');
    const btn = h('button', {
      class: 'dt-choice',
      attrs: { type: 'button', role: 'radio' },
      on: {
        click: () => {
          value = choice.value;
          paint();
          emitInput(btn);
        },
      },
    }, [h('span', { class: 'dt-choice-dot', attrs: { 'aria-hidden': 'true' } }), h('span', { class: 'dt-choice-text' }, [titleEl, hintEl])]);
    return { choice, btn, titleEl, hintEl };
  });
  const group = h('div', { class: 'dt-choices', attrs: { role: 'radiogroup' } }, items.map(i => i.btn));
  const labelEl = h('span', { class: 'dt-label' });
  const el = h('div', { class: ['dt-field', 'dt-field--wide'] }, [labelEl, group]);
  const paint = () => {
    items.forEach(({ choice, btn }) => {
      const on = choice.value === value;
      btn.classList.toggle('dt-choice--active', on);
      btn.setAttribute('aria-checked', String(on));
    });
  };
  const refresh = () => {
    setText(labelEl, dyn(opts.label));
    items.forEach(({ choice, titleEl, hintEl }) => {
      setText(titleEl, dyn(choice.title));
      setText(hintEl, dyn(choice.hint));
    });
  };
  refresh();
  paint();
  return {
    el,
    get: () => value,
    set: next => {
      value = String(next ?? value);
      paint();
    },
    refresh,
  };
};

/**
 * Color swatches (single choice).
 * @param opts Options with `[value, css color or gradient, label]` items.
 * @returns Field.
 * @example swatchField({ label: 'Accent', items: [['orange', '#f6b34a', 'orange']] });
 */
export const swatchField = (opts: FieldBase & { items: [string, string, Dyn][] }): Field => {
  let value = opts.items[0]?.[0] ?? '';
  const captionEl = h('small', { class: 'dt-hint' });
  const buttons = opts.items.map(([v, color, label]) => {
    const btn = h('button', {
      class: 'dt-swatch',
      attrs: { type: 'button', role: 'radio' },
      on: {
        click: () => {
          value = v;
          paint();
          emitInput(btn);
        },
      },
    });
    btn.style.background = color;
    return { v, btn, label };
  });
  const labelEl = h('span', { class: 'dt-label' });
  const el = h('div', { class: ['dt-field', 'dt-field--wide'] }, [
    labelEl,
    h('div', { class: 'dt-swatches', attrs: { role: 'radiogroup' } }, buttons.map(b => b.btn)),
    captionEl,
  ]);
  const paint = () => {
    buttons.forEach(({ v, btn, label }) => {
      const on = v === value;
      btn.classList.toggle('dt-swatch--active', on);
      btn.setAttribute('aria-checked', String(on));
      btn.title = dyn(label);
      if (on) setText(captionEl, dyn(label));
    });
  };
  const refresh = () => {
    setText(labelEl, dyn(opts.label));
    paint();
  };
  refresh();
  return {
    el,
    get: () => value,
    set: next => {
      value = String(next ?? value);
      paint();
    },
    refresh,
  };
};
