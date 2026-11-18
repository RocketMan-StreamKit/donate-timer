import { h } from '../dom';
import { humanDuration, money, secondsFor, symbol } from '../format';
import { t } from '../i18n';
import type { Component, PanelState } from '../types';
import { choiceField, hmsField, numberField, selectField, swatchField, textField, toggleField } from '../ui/fields';
import { grid, settingsCard } from '../ui/settings-card';
import { markStep } from './onboarding';

/** Fixed currency choices besides `app`. */
const CURRENCIES = ['RUB', 'UAH', 'USD', 'EUR', 'KZT', 'BYN', 'PLN', 'GBP', 'TRY'];

/** Accent swatches (colors match `widgets/marathon_accent_transition.js`). */
const ACCENTS: [string, string][] = [
  ['orange', '#f6b34a'],
  ['purple', '#c084fc'],
  ['green', '#4ade80'],
  ['blue', '#38bdf8'],
  ['red', '#ff3232'],
  ['pink', '#ff5f87'],
  ['yellow', '#ffe600'],
  ['lime', '#cdff5f'],
  ['navy', '#5f65ff'],
  ['gray', '#a8a8a8'],
  ['random', 'conic-gradient(#f6b34a, #c084fc, #38bdf8, #4ade80, #ff5f87, #f6b34a)'],
];

/**
 * Donation rate card with a live "donation → time" preview.
 * @returns Component.
 * @example pane.append(rateCard().el);
 */
const rateCard = (): Component => {
  let state: PanelState | null = null;
  const cur = () => (state ? symbol(currencyOf()) : '');
  const mode = choiceField({
    label: t('rateMode'),
    choices: [
      { value: 'amount_per_sec', title: t('modeAmountPerSec'), hint: () => t('modeAmountPerSecHint', { c: cur() }) },
      { value: 'sec_per_amount', title: () => t('modeSecPerAmount', { c: cur() }), hint: () => t('modeSecPerAmountHint', { c: cur() }) },
    ],
  });
  const rate = numberField({
    label: () => (mode.get() === 'sec_per_amount' ? t('rateValueSec', { c: cur() }) : t('rateValueAmount', { c: cur() })),
    min: 0,
    suffix: () => (mode.get() === 'sec_per_amount' ? t('ss') : cur()),
  });
  const currency = selectField({
    label: t('currency'),
    hint: t('currencyHint'),
    options: () => [['app', t('currencyApp', { c: state?.currency ?? '' })], ...CURRENCIES.map(c => [c, `${c} · ${symbol(c)}`] as [string, string])],
  });
  /** Currency currently picked in the form (falls back to the worker value). */
  const currencyOf = () => {
    const picked = String(currency.get() || 'app');
    return picked === 'app' ? state?.currency ?? 'RUB' : picked;
  };

  const examples = h('ul', { class: 'dt-examples' });
  const preview = h('div', { class: 'dt-preview-box' }, [h('span', { class: 'dt-label', text: t('ratePreview') }), examples]);

  return settingsCard({
    title: t('rateTitle'),
    description: t('rateDesc'),
    icon: '💱',
    fields: { rateMode: mode, rate, currency },
    layout: [mode.el, grid(rate.el, currency.el), preview],
    onSaved: () => markStep('rate'),
    render: (s, values) => {
      state = s;
      const v = values();
      const r = Number(v.rate);
      const code = currencyOf();
      const amounts = [100, 500, 1000];
      examples.replaceChildren(
        ...amounts.map(a =>
          h('li', {}, [
            h('span', { text: money(a, code) }),
            h('span', { class: 'dt-arrow', text: '→', attrs: { 'aria-hidden': 'true' } }),
            h('b', { text: r > 0 ? `+${humanDuration(secondsFor(a, r, String(v.rateMode)))}` : '—' }),
          ])
        )
      );
    },
  });
};

/**
 * Timer behaviour card: starting time and the "time is up" pause.
 * @returns Component.
 * @example pane.append(timerCard().el);
 */
const timerCard = (): Component => {
  const initial = hmsField({ label: t('initialTime'), hint: t('initialTimeHint') });
  const blink = numberField({ label: t('blinkSeconds'), hint: t('blinkHint'), min: 0, max: 600, step: 1, suffix: t('ss') });
  return settingsCard({
    title: t('timerTitle'),
    description: t('timerDesc'),
    icon: '⏱',
    fields: { initialSeconds: initial, blinkSeconds: blink },
    layout: [initial.el, blink.el],
    onSaved: () => markStep('time'),
  });
};

/**
 * Widget look card: title, accent palette, alert plate colors.
 * @returns Component.
 * @example pane.append(lookCard().el);
 */
const lookCard = (): Component => {
  let state: PanelState | null = null;
  const cur = () => (state ? symbol(state.currency) : '');
  const title = textField({ label: t('widgetTitle'), hint: t('widgetTitleHint'), placeholder: 'МАРАФОН 24/7' });
  const accent = swatchField({
    label: t('accent'),
    items: ACCENTS.map(([value, color]) => [value, color, value === 'random' ? t('accentRandom') : t(`color_${value}`)]),
  });
  const colors = toggleField({ label: t('colorsEnabled'), hint: t('colorsHint') });
  const level = (key: string, label: string) => {
    const field = numberField({ label, min: 0, suffix: cur });
    field.el.classList.add('dt-plate', `dt-plate--${key}`);
    return field;
  };
  const blue = level('blue', t('colorBlue'));
  const purple = level('purple', t('colorPurple'));
  const green = level('green', t('colorGreen'));
  const red = level('red', t('colorRed'));
  const levels = grid(blue.el, purple.el, green.el, red.el);

  return settingsCard({
    title: t('lookTitle'),
    description: t('lookDesc'),
    icon: '🎨',
    fields: {
      title,
      'marathon.accent': accent,
      'colorLevels.enabled': colors,
      'colorLevels.blue': blue,
      'colorLevels.purple': purple,
      'colorLevels.green': green,
      'colorLevels.red': red,
    },
    layout: [title.el, accent.el, colors.el, levels],
    render: (s, values) => {
      state = s;
      levels.classList.toggle('dt-disabled', !values()['colorLevels.enabled']);
    },
  });
};

/**
 * "Timer and rate" tab content.
 * @returns Components.
 * @example setupTab().map(c => c.el);
 */
export const setupTab = (): Component[] => [rateCard(), timerCard(), lookCard()];

