import { act } from '../api';
import { h, setText } from '../dom';
import { money, symbol } from '../format';
import { t } from '../i18n';
import type { Component, PanelState } from '../types';
import { button } from '../ui/card';
import { datetimeField, numberField, textField, toggleField } from '../ui/fields';
import { grid, settingsCard } from '../ui/settings-card';

/**
 * Statistic chip used inside cards.
 * @param label Caption.
 * @returns `{ el, value }`.
 * @example const gross = stat('Collected');
 */
const stat = (label: string) => {
  const value = h('b');
  return { el: h('div', { class: 'dt-stat' }, [h('span', { text: label }), value]), value };
};

/**
 * Marathon card: start moment, commission and totals.
 * @returns Component.
 * @example marathonCard().el;
 */
const marathonCard = (): Component => {
  const start = datetimeField({ label: t('marathonStart'), hint: t('marathonStartHint'), clearable: true });
  const commission = numberField({ label: t('commission'), hint: t('commissionHint'), min: 0, max: 100, suffix: '%' });
  const gross = stat(t('gross'));
  const net = stat(t('net'));
  const count = stat(t('donationsCount'));
  return settingsCard({
    title: t('marathonTitle'),
    description: t('marathonDesc'),
    icon: '🏁',
    fields: { 'marathon.startAt': start, 'marathon.commissionPercent': commission },
    layout: [h('div', { class: 'dt-stats' }, [gross.el, net.el, count.el]), start.el, commission.el],
    render: s => {
      setText(gross.value, money(s.stats.gross, s.currency));
      setText(net.value, money(s.stats.net, s.currency));
      setText(count.value, String(s.stats.count));
    },
  });
};

/**
 * Donation goal card with a progress preview.
 * @returns Component.
 * @example goalCard().el;
 */
const goalCard = (): Component => {
  let state: PanelState | null = null;
  const cur = () => (state ? symbol(state.currency) : '');
  const enabled = toggleField({ label: t('on'), wide: false });
  const title = textField({ label: t('goalName'), placeholder: 'На новый микрофон' });
  const target = numberField({ label: t('goalTarget'), min: 0, suffix: cur });
  const start = numberField({ label: t('goalStart'), hint: t('goalStartHint'), min: 0, suffix: cur });
  const startAt = datetimeField({ label: t('goalStartAt'), hint: t('goalStartAtHint') });
  const track = numberField({ label: t('trackOpacity'), min: 0, max: 100, step: 1, suffix: '%' });
  const fill = numberField({ label: t('fillOpacity'), min: 0, max: 100, step: 1, suffix: '%' });

  const barFill = h('i');
  const barLabel = h('span');
  const bar = h('div', { class: 'dt-goalbar' }, [barFill, barLabel]);
  const barTitle = h('div', { class: 'dt-goalbar-title' });

  return settingsCard({
    title: t('goalTitle'),
    description: t('goalDesc'),
    icon: '🎯',
    toggle: 'goal.enabled',
    fields: {
      'goal.enabled': enabled,
      'goal.title': title,
      'goal.target': target,
      'goal.start': start,
      'goal.startAt': startAt,
      'goal.trackOpacity': track,
      'goal.fillOpacity': fill,
    },
    layout: [h('div', { class: 'dt-goal-preview' }, [barTitle, bar]), title.el, grid(target.el, start.el), startAt.el, grid(track.el, fill.el)],
    render: (s, values) => {
      state = s;
      const v = values();
      const goal = Number(v['goal.target']) || 0;
      const current = s.goal.collected + (Number(v['goal.start']) || 0);
      const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
      barFill.style.width = `${pct}%`;
      barFill.style.opacity = String((Number(v['goal.fillOpacity']) || 0) / 100);
      bar.style.setProperty('--track', String((Number(v['goal.trackOpacity']) || 0) / 100));
      setText(barLabel, t('goalProgress', { c: money(current), g: money(goal, s.currency), p: Math.round(pct) }));
      setText(barTitle, String(v['goal.title'] || t('goalTitle')));
      bar.parentElement?.classList.toggle('dt-disabled', !v['goal.enabled']);
    },
  });
};

/**
 * Marathon length goal card with the current widget output.
 * @returns Component.
 * @example timeGoalCard().el;
 */
const timeGoalCard = (): Component => {
  const enabled = toggleField({ label: t('on'), wide: false });
  const hours = textField({ label: t('tgHours'), numeric: true, maxLength: 6, placeholder: '24' });
  const label = textField({ label: t('tgLabel'), placeholder: t('tgLabelHint') });
  const done = textField({ label: t('tgDone'), placeholder: '🎉' });
  const output = h('b', { class: 'dt-output-value' });
  const warn = h('p', { class: 'dt-note', text: t('tgNeedsStart'), attrs: { hidden: true } });
  const out = h('div', { class: 'dt-output' }, [
    h('span', { class: 'dt-label', text: t('tgNow') }),
    output,
    button(`↻  ${t('recalc')}`, () => void act('timeGoalReset'), { small: true, variant: 'ghost' }),
  ]);
  return settingsCard({
    title: t('tgTitle'),
    description: t('tgDesc'),
    icon: '⏳',
    toggle: 'timeGoal.enabled',
    fields: { 'timeGoal.enabled': enabled, 'timeGoal.hours': hours, 'timeGoal.title': label, 'timeGoal.done': done },
    layout: [out, warn, grid(hours.el, label.el), done.el],
    render: (s, values) => {
      const text = s.timeGoal ? s.timeGoal.slice(2) : '—';
      setText(output, text);
      out.classList.toggle('dt-disabled', !values()['timeGoal.enabled']);
      warn.hidden = !(values()['timeGoal.enabled'] && !s.settings.marathon.startAt);
    },
  });
};

/**
 * "Marathon and goals" tab content.
 * @returns Components.
 * @example marathonTab();
 */
export const marathonTab = (): Component[] => [marathonCard(), goalCard(), timeGoalCard()];
