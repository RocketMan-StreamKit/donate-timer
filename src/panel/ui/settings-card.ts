import { act } from '../api';
import { h, type Child } from '../dom';
import { t } from '../i18n';
import { getState } from '../store';
import type { Component, PanelState } from '../types';
import { button, card, type CardOptions } from './card';
import type { Field } from './fields';
import { toast } from './toast';

/** Settings card options. */
export type SettingsCardOptions = Omit<CardOptions, 'aside'> & {
  /** Fields keyed by dotted settings path (e.g. `goal.title`). */
  fields: Record<string, Field>;
  /** Path of a boolean field shown as a switch in the card header. */
  toggle?: string;
  /** Body layout (field elements and any extra nodes). */
  layout: Child[];
  /** Extra render hook (previews, live values). */
  render?: (state: PanelState, values: () => Record<string, unknown>) => void;
  /** Called after a successful save. */
  onSaved?: () => void;
};

/**
 * Reads a nested value by dotted path.
 * @param obj Source object.
 * @param path Dotted path.
 * @returns Value.
 * @example getPath({ a: { b: 1 } }, 'a.b'); // 1
 */
const getPath = (obj: Record<string, any>, path: string) =>
  path.split('.').reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), obj);

/**
 * Builds a settings patch: nested groups are merged over current settings so untouched keys stay.
 * @param values Path → value.
 * @param settings Current settings.
 * @returns Patch for the `settings` action.
 * @example buildPatch({ 'goal.title': 'x' }, settings);
 */
const buildPatch = (values: Record<string, unknown>, settings: Record<string, any>) => {
  const patch: Record<string, any> = {};
  for (const [path, value] of Object.entries(values)) {
    const [head, ...rest] = path.split('.');
    if (!rest.length) {
      patch[head] = value;
      continue;
    }
    patch[head] = patch[head] ?? { ...(settings[head] ?? {}) };
    let cur = patch[head];
    rest.slice(0, -1).forEach(key => {
      cur[key] = { ...(cur[key] ?? {}) };
      cur = cur[key];
    });
    cur[rest[rest.length - 1]] = value;
  }
  return patch;
};

/**
 * Card with settings fields, dirty tracking and a save bar.
 * Incoming state never overwrites fields while the user has unsaved edits.
 * @param opts Card options.
 * @returns Component.
 * @example settingsCard({ title: 'Goal', fields: { 'goal.title': textField(...) }, layout: [...] });
 */
export const settingsCard = (opts: SettingsCardOptions): Component => {
  const toggleField = opts.toggle ? opts.fields[opts.toggle] : undefined;
  const { el, body } = card({ ...opts, aside: toggleField ? h('div', { class: 'dt-card-toggle' }, [toggleField.el]) : undefined });
  let dirty = false;
  let saving = false;

  const unsavedText = h('span');
  const saveBtn = button('', () => void save(), { variant: 'primary' });
  const cancelBtn = button('', () => cancel(), { variant: 'ghost' });
  const bar = h('div', { class: 'dt-savebar', attrs: { hidden: true } }, [
    h('span', { class: 'dt-savebar-text' }, [h('i', { class: 'dt-dot', attrs: { 'aria-hidden': 'true' } }), unsavedText]),
    h('div', { class: 'dt-savebar-actions' }, [cancelBtn, saveBtn]),
  ]);
  body.append(...(opts.layout.filter(Boolean) as (Node | string)[]), bar);

  const values = () => Object.fromEntries(Object.entries(opts.fields).map(([path, field]) => [path, field.get()]));
  const refreshAll = () => {
    Object.values(opts.fields).forEach(field => field.refresh());
    unsavedText.textContent = t('unsaved');
    saveBtn.textContent = t('save');
    cancelBtn.textContent = t('cancel');
  };
  const setDirty = (next: boolean) => {
    dirty = next;
    bar.hidden = !next;
    el.classList.toggle('dt-card--dirty', next);
  };
  const fill = (state: PanelState) => {
    for (const [path, field] of Object.entries(opts.fields)) field.set(getPath(state.settings, path));
  };
  const afterInput = () => {
    setDirty(true);
    refreshAll();
    const state = getState();
    if (state) opts.render?.(state, values);
  };
  el.addEventListener('input', afterInput);
  el.addEventListener('change', afterInput);
  el.addEventListener('keydown', event => {
    if (event.key === 'Enter' && dirty && (event.target as HTMLElement).tagName === 'INPUT') {
      event.preventDefault();
      void save();
    }
  });

  const save = async () => {
    const state = getState();
    if (!state || saving) return;
    saving = true;
    saveBtn.disabled = true;
    const ok = await act('settings', { settings: buildPatch(values(), state.settings) });
    saving = false;
    saveBtn.disabled = false;
    if (!ok) return;
    setDirty(false);
    const fresh = getState();
    if (fresh) {
      fill(fresh);
      opts.render?.(fresh, values);
    }
    refreshAll();
    toast(t('saved'));
    opts.onSaved?.();
  };

  const cancel = () => {
    setDirty(false);
    const state = getState();
    if (state) {
      fill(state);
      refreshAll();
      opts.render?.(state, values);
    }
  };

  return {
    el,
    update: state => {
      if (!dirty) fill(state);
      refreshAll();
      opts.render?.(state, values);
    },
  };
};

/**
 * Two-column field grid (collapses to one column on narrow windows).
 * @param children Field elements.
 * @returns Grid element.
 * @example grid(a.el, b.el);
 */
export const grid = (...children: Child[]) => h('div', { class: 'dt-fields' }, children);

/**
 * Titled group inside a card.
 * @param title Group title.
 * @param children Group content.
 * @param hint Optional explanation.
 * @returns Fieldset element.
 * @example group('Sounds', [a.el, b.el]);
 */
export const group = (title: string, children: Child[], hint?: string) =>
  h('fieldset', { class: 'dt-group' }, [h('legend', { text: title }), hint ? h('p', { class: 'dt-hint', text: hint }) : null, ...children]);
