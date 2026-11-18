import { act } from '../api';
import { h, setText } from '../dom';
import { humanDuration, money } from '../format';
import { t } from '../i18n';
import type { Component, JournalRow, PanelState } from '../types';
import { button, card } from '../ui/card';
import { confirmDialog } from '../ui/confirm';

/**
 * Alert plate color the widgets use for a row (mirrors the worker thresholds).
 * @param row Journal row.
 * @param s Panel state.
 * @returns Color name.
 * @example plateColor(row, state); // 'red'
 */
const plateColor = (row: JournalRow, s: PanelState) => {
  const cl = s.settings.colorLevels;
  if (row.source === 'manual_time' || !cl.enabled || row.currency !== s.currency) return 'black';
  if (row.amount >= cl.red) return 'red';
  if (row.amount >= cl.green) return 'green';
  if (row.amount >= cl.purple) return 'purple';
  if (row.amount >= cl.blue) return 'blue';
  return 'black';
};

/**
 * One journal row.
 * @param row Row data.
 * @param s Panel state.
 * @returns List item.
 * @example rowItem(row, state);
 */
const rowItem = (row: JournalRow, s: PanelState) => {
  const when = new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const orig = row.originalCurrency && row.originalAmount !== undefined ? ` (${money(row.originalAmount)} ${row.originalCurrency})` : '';
  const what =
    row.source === 'manual_time'
      ? t('srcManualTime')
      : `${money(row.amount, row.currency)}${orig}${row.source === 'manual_amount' ? ` · ${t('srcManualAmount')}` : row.platform ? ` · ${row.platform}` : ''}`;
  return h('li', { class: 'dt-row', attrs: { 'data-plate': plateColor(row, s) } }, [
    h('span', { class: 'dt-avatar', text: (row.username.trim()[0] || '?').toUpperCase(), attrs: { 'aria-hidden': 'true' } }),
    h('span', { class: 'dt-row-main' }, [h('b', { text: row.username }), h('small', { text: `${when} · ${what}` })]),
    h('span', { class: 'dt-row-time', text: `+${humanDuration(row.seconds)}` }),
  ]);
};

/**
 * Donation journal with undo and cleanup actions.
 * @returns Component.
 * @example pane.append(journal().el);
 */
export const journal = (): Component => {
  let state: PanelState | null = null;
  const summary = h('p', { class: 'dt-card-desc' });
  const cleared = h('p', { class: 'dt-note', attrs: { hidden: true } });
  const list = h('ol', { class: 'dt-rows' });
  const empty = h('div', { class: 'dt-empty' }, [h('span', { text: '🫙', attrs: { 'aria-hidden': 'true' } }), h('p', { text: t('journalEmpty') })]);

  const undo = button(`↶  ${t('removeLast')}`, async () => {
    const last = state?.journal[0];
    if (!last) return;
    if (await confirmDialog(t('confirmRemoveLastTitle'), t('confirmRemoveLast', { name: last.username, t: humanDuration(last.seconds) }), true)) {
      void act('removeLast');
    }
  }, { small: true });

  const menu = h('details', { class: 'dt-menu' }, [
    h('summary', { class: 'dt-btn dt-btn--sm dt-btn--ghost', text: `⋯  ${t('more')}` }),
    h('div', { class: 'dt-menu-list' }, [
      button(t('clearWidgets'), async () => {
        menu.open = false;
        if (await confirmDialog(t('confirmClearWidgetsTitle'), t('confirmClearWidgets'))) void act('clearWidgets');
      }, { variant: 'plain' }),
      button(t('clearHistory'), async () => {
        menu.open = false;
        if (await confirmDialog(t('confirmClearHistoryTitle'), t('confirmClearHistory'), true)) void act('clearHistory');
      }, { variant: 'danger' }),
    ]),
  ]);
  document.addEventListener('click', event => {
    if (menu.open && !menu.contains(event.target as Node)) menu.open = false;
  });

  const actions = h('div', { class: 'dt-card-tools' }, [undo, menu]);
  const { el } = card({ title: t('journalTitle'), icon: '📜', aside: actions, class: 'dt-journal' }, [summary, cleared, empty, list]);

  let signature = '';
  return {
    el,
    update: s => {
      state = s;
      setText(summary, t('journalSummary', { n: s.summary.count, t: humanDuration(s.summary.seconds), a: money(s.summary.amount, s.currency) }));
      cleared.hidden = s.widgetsCleared === 0;
      setText(cleared, t('widgetsCleared', { n: s.widgetsCleared }));
      undo.disabled = s.journal.length === 0;
      empty.hidden = s.journal.length > 0;
      const next = `${s.journal.map(r => r.id).join('|')}#${JSON.stringify(s.settings.colorLevels)}`;
      if (next === signature) return;
      signature = next;
      list.replaceChildren(...s.journal.map(row => rowItem(row, s)));
    },
  };
};
