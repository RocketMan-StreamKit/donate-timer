import { act } from '../api';
import { h } from '../dom';
import { t } from '../i18n';
import type { Component } from '../types';
import { button, card, segmented } from '../ui/card';
import { hmsField, textField } from '../ui/fields';
import { toast } from '../ui/toast';
import { markStep } from './onboarding';

/** Quick adjustments from the desktop app, seconds (minus row, then plus row). */
const QUICK_MINUS = [-3600, -2700, -1800, -900, -300, -60];
const QUICK_PLUS = [60, 300, 900, 1800, 2700, 3600];

/**
 * Short label for a quick button.
 * @param seconds Signed seconds.
 * @returns Label like `+15 мин`.
 * @example quickLabel(-3600); // '−1 ч'
 */
const quickLabel = (seconds: number) => {
  const abs = Math.abs(seconds);
  const text = abs >= 3600 ? `${abs / 3600} ${t('hh')}` : `${abs / 60} ${t('mm')}`;
  return `${seconds < 0 ? '−' : '+'}${text}`;
};

/**
 * Hint paragraph.
 * @param text Text.
 * @returns Element.
 * @example hint('Silent change');
 */
const hint = (text: string) => h('p', { class: 'dt-pane-hint', text });

/**
 * Manual time control with five modes in a segmented switcher.
 * @returns Component.
 * @example pane.append(manual().el);
 */
export const manual = (): Component => {
  // Quick
  const quick = h('div', { class: 'dt-subpane' }, [
    hint(t('quickHint')),
    h('div', { class: 'dt-quick' }, [
      ...QUICK_MINUS.map(s => button(quickLabel(s), () => void act('addTime', { seconds: s }), { class: 'dt-quick-minus' })),
      ...QUICK_PLUS.map(s => button(quickLabel(s), () => void act('addTime', { seconds: s }), { class: 'dt-quick-plus' })),
    ]),
  ]);

  // Any time
  const customTime = hmsField({ label: t('segCustom') });
  const custom = h('div', { class: 'dt-subpane' }, [
    hint(t('customHint')),
    customTime.el,
    h('div', { class: 'dt-actions' }, [
      button(`− ${t('subtract')}`, () => void act('addTime', { seconds: -customTime.get() }), { class: 'dt-quick-minus' }),
      button(`+ ${t('add')}`, () => void act('addTime', { seconds: customTime.get() }), { variant: 'primary' }),
    ]),
  ]);

  // For nickname
  const namedNick = textField({ label: t('nickname'), maxLength: 100 });
  const namedTime = hmsField({ label: t('segCustom') });
  const named = h('div', { class: 'dt-subpane' }, [
    hint(t('namedHint')),
    h('div', { class: 'dt-fields' }, [namedNick.el, namedTime.el]),
    h('div', { class: 'dt-actions' }, [
      button(`+ ${t('add')}`, async () => {
        if (await act('addTimeWithName', { seconds: namedTime.get(), username: namedNick.get() })) {
          namedNick.set('');
          namedTime.set(0);
          toast(t('timeApplied'));
        }
      }, { variant: 'primary' }),
    ]),
  ]);

  // Set exactly
  let exactDirty = false;
  const exactTime = hmsField({ label: t('segExact') });
  exactTime.root.addEventListener('input', () => {
    exactDirty = true;
  });
  const exact = h('div', { class: 'dt-subpane' }, [
    hint(t('exactHint')),
    exactTime.el,
    h('div', { class: 'dt-actions' }, [
      button(t('apply'), async () => {
        if (await act('setRemaining', { seconds: exactTime.get() })) {
          exactDirty = false;
          markStep('time');
          toast(t('timeApplied'));
        }
      }, { variant: 'primary' }),
    ]),
  ]);

  const panes: Record<string, HTMLElement> = { quick, custom, named, exact };
  const seg = segmented(
    [
      ['quick', t('segQuick')],
      ['custom', t('segCustom')],
      ['named', t('segNamed')],
      ['exact', t('segExact')],
    ],
    id => {
      Object.entries(panes).forEach(([key, pane]) => {
        pane.hidden = key !== id;
      });
    }
  );

  const { el } = card({ title: t('manualTitle'), description: t('manualDesc'), icon: '🎚' }, [seg.el, ...Object.values(panes)]);

  return {
    el,
    update: s => {
      if (!exactDirty && !exactTime.root.contains(document.activeElement)) exactTime.set(s.timer.remaining);
    },
  };
};
