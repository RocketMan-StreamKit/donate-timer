import { act } from '../api';
import { h } from '../dom';
import { t } from '../i18n';
import type { Component } from '../types';
import { button, card } from '../ui/card';
import { numberField, textareaField } from '../ui/fields';
import { grid, group, settingsCard } from '../ui/settings-card';
import { toast } from '../ui/toast';
import { markStep } from './onboarding';

/** Widget icons (ids match the worker `WIDGETS` / `GTA_WIDGETS` lists). */
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
  gta_timer: '🌴',
  gta_top_rotate: '🔁',
  gta_top_list: '📋',
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
 * One widget tile: icon, name, description, optional size hint, link with copy/open actions.
 * @param id Widget id (i18n keys `w_{id}`, `wd_{id}`, optional `ws_{id}`).
 * @param url Widget URL.
 * @returns Tile element.
 * @example widgetTile('timer_new', url);
 */
const widgetTile = (id: string, url: string) => {
  const input = h('input', { attrs: { type: 'text', readonly: true, value: url, 'aria-label': t(`w_${id}`) } });
  input.addEventListener('focus', () => input.select());
  const size = t(`ws_${id}`);
  return h('article', { class: 'dt-widget' }, [
    h('div', { class: 'dt-widget-head' }, [
      h('span', { class: 'dt-widget-icon', text: ICONS[id] ?? '🧩', attrs: { 'aria-hidden': 'true' } }),
      h('div', {}, [
        h('h3', { text: t(`w_${id}`) }),
        h('p', { text: t(`wd_${id}`) }),
        size !== `ws_${id}` ? h('span', { class: 'dt-widget-size', text: size }) : null,
      ]),
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
};

/**
 * Renders tiles into a grid only when the URL set changes.
 * @param list Grid element.
 * @returns Update function.
 * @example const paint = tileGrid(list); paint(state.widgets);
 */
const tileGrid = (list: HTMLElement) => {
  let built = '';
  return (urls: Record<string, string>) => {
    const signature = Object.values(urls).join('|');
    if (signature === built) return;
    built = signature;
    list.replaceChildren(...Object.entries(urls).map(([id, url]) => widgetTile(id, url)));
  };
};

/**
 * Classic widgets ported from the desktop app.
 * @returns Component.
 * @example classicWidgets().el;
 */
const classicWidgets = (): Component => {
  const list = h('div', { class: 'dt-widget-grid' });
  const paint = tileGrid(list);
  const { el } = card({ title: t('widgetsTitle'), description: t('widgetsDesc'), icon: '📺' }, [list]);
  return { el, update: s => paint(s.widgets) };
};

/**
 * GTA 6 themed widgets: links plus their settings (plate title, time-left stages, Top-6 rotation, background).
 * @returns Component.
 * @example gtaWidgets().el;
 */
const gtaWidgets = (): Component => {
  const list = h('div', { class: 'dt-widget-grid dt-widget-grid--gta' });
  const paint = tileGrid(list);
  const title = textareaField({ label: t('gtaPlateTitle'), hint: t('gtaPlateTitleHint'), rows: 2, maxLength: 120, placeholder: 'Марафон\nGTA 6' });
  const stageField = (label: string) => numberField({ label, min: 0, max: 1440, step: 1, suffix: t('mm') });
  const warn = stageField(t('gtaStageWarn'));
  const danger = stageField(t('gtaStageDanger'));
  const critical = stageField(t('gtaStageCritical'));
  const slide = numberField({ label: t('gtaSlide'), min: 1, max: 600, step: 0.5, suffix: t('ss') });
  const fade = numberField({ label: t('gtaFade'), min: 0, max: 10, step: 0.1, suffix: t('ss') });
  const bgField = (label: string) => numberField({ label, min: 0, max: 100, step: 5, suffix: '%' });
  const bgTimer = bgField(t('w_gta_timer'));
  const bgRotate = bgField(t('w_gta_top_rotate'));
  const bgList = bgField(t('w_gta_top_list'));

  const component = settingsCard({
    title: t('gtaTitle'),
    description: t('gtaDesc'),
    icon: '🌴',
    class: 'dt-gta',
    fields: {
      'gta.title': title,
      'gta.warnMinutes': warn,
      'gta.dangerMinutes': danger,
      'gta.criticalMinutes': critical,
      'gta.topSlideSeconds': slide,
      'gta.topFadeSeconds': fade,
      'gta.timerBgOpacity': bgTimer,
      'gta.topRotateBgOpacity': bgRotate,
      'gta.topListBgOpacity': bgList,
    },
    layout: [
      list,
      h('div', { class: 'dt-gta-settings' }, [
        group(t('gtaGroupTimer'), [title.el]),
        group(t('gtaGroupTop'), [grid(slide.el, fade.el)], t('gtaGroupTopHint')),
        // Time-left stages and background opacity each take a full-width row below the two groups.
        h('div', { class: 'dt-gta-wide' }, [group(t('gtaGroupStages'), [grid(warn.el, danger.el, critical.el)], t('gtaStagesHint'))]),
        h('div', { class: 'dt-gta-wide' }, [group(t('gtaGroupLook'), [grid(bgTimer.el, bgRotate.el, bgList.el)], t('gtaBgHint'))]),
      ]),
    ],
    render: s => paint(s.gtaWidgets),
  });
  return component;
};

/**
 * "OBS widgets" tab content: classic widgets, then the GTA 6 section.
 * @returns Components.
 * @example widgetsTab().map(c => c.el);
 */
export const widgetsTab = (): Component[] => [classicWidgets(), gtaWidgets()];
