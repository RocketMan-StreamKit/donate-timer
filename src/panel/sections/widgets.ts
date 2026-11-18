import { act } from '../api';
import { h } from '../dom';
import { t } from '../i18n';
import type { Component } from '../types';
import { button, card } from '../ui/card';
import { toast } from '../ui/toast';
import { markStep } from './onboarding';

/** Widget icons (ids match the worker `WIDGETS` list). */
const ICONS: Record<string, string> = {
  timer_new: '⏱',
  timer_marathon_block: '🗂',
  marathon_gold_small_v2: '🏆',
  top5_marathon_inline: '📣',
  top5_marathon_block: '🥇',
  donation_goal: '🎯',
  bonus_rate: '⚡',
  clock_datetime_inline: '🕒',
  webcam_frame: '🖼',
};

/**
 * Copies text to the clipboard with a fallback for restricted contexts.
 * @param text Text to copy.
 * @param input Input used for the fallback selection.
 * @returns Promise resolved after copying.
 * @example await copyText(url, input);
 */
const copyText = async (text: string, input: HTMLInputElement) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    input.select();
    document.execCommand('copy');
  }
};

/**
 * OBS widget gallery: one tile per widget with copy/open actions.
 * @returns Component.
 * @example widgetsTab().el;
 */
export const widgetsTab = (): Component => {
  const list = h('div', { class: 'dt-widget-grid' });
  const { el } = card({ title: t('widgetsTitle'), description: t('widgetsDesc'), icon: '📺' }, [list]);
  let built = '';
  return {
    el,
    update: s => {
      const signature = Object.values(s.widgets).join('|');
      if (signature === built) return;
      built = signature;
      list.replaceChildren(
        ...Object.entries(s.widgets).map(([id, url]) => {
          const input = h('input', { attrs: { type: 'text', readonly: true, value: url, 'aria-label': t(`w_${id}`) } });
          input.addEventListener('focus', () => input.select());
          return h('article', { class: 'dt-widget' }, [
            h('div', { class: 'dt-widget-head' }, [
              h('span', { class: 'dt-widget-icon', text: ICONS[id] ?? '🧩', attrs: { 'aria-hidden': 'true' } }),
              h('div', {}, [h('h3', { text: t(`w_${id}`) }), h('p', { text: t(`wd_${id}`) })]),
            ]),
            input,
            h('div', { class: 'dt-actions' }, [
              button(`⧉  ${t('copy')}`, async () => {
                await copyText(url, input);
                markStep('widgets');
                toast(t('copied'));
              }, { variant: 'primary', small: true, class: 'dt-grow' }),
              button('↗', () => void act('openUrl', { url }), { variant: 'ghost', small: true, title: t('open'), class: 'dt-btn--icon' }),
            ]),
          ]);
        })
      );
    },
  };
};
