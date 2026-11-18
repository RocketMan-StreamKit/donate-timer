import { h, setText } from '../dom';
import { hms, humanDuration, money, shortClock } from '../format';
import { t } from '../i18n';
import { goToTab, type TabId } from '../store';
import type { Component } from '../types';

/**
 * One statistic tile.
 * @param label Caption.
 * @param tab Tab opened on click (optional).
 * @returns Tile parts.
 * @example tile('Donations');
 */
const tile = (label: string, tab?: TabId) => {
  const value = h('b', { class: 'dt-tile-value' });
  const sub = h('span', { class: 'dt-tile-sub' });
  const bar = h('i');
  const meter = h('span', { class: 'dt-meter', attrs: { hidden: true } }, [bar]);
  const el = h(tab ? 'button' : 'div', {
    class: ['dt-tile', tab ? 'dt-tile--link' : null],
    attrs: tab ? { type: 'button' } : {},
    on: tab ? { click: () => goToTab(tab) } : {},
  }, [h('span', { class: 'dt-tile-label', text: label }), value, meter, sub]);
  return { el, value, sub, meter, bar };
};

/**
 * Summary tiles: totals, time added, on air, goal and bonus status.
 * @returns Component.
 * @example pane.append(overview().el);
 */
export const overview = (): Component => {
  const collected = tile(t('ovNet'), 'marathon');
  const donations = tile(t('ovDonations'));
  const added = tile(t('ovAdded'));
  const onAir = tile(t('ovOnAir'), 'marathon');
  const goal = tile(t('ovGoal'), 'marathon');
  const bonus = tile(t('ovBonus'), 'bonus');
  const el = h('section', { class: 'dt-tiles', attrs: { 'aria-label': t('overviewTitle') } }, [
    collected.el,
    donations.el,
    added.el,
    onAir.el,
    goal.el,
    bonus.el,
  ]);

  return {
    el,
    update: s => {
      setText(collected.value, money(s.stats.net, s.currency));
      setText(collected.sub, `${t('gross')}: ${money(s.stats.gross, s.currency)}`);
      setText(donations.value, String(s.stats.count));
      setText(added.value, humanDuration(s.summary.seconds));
      setText(onAir.value, s.onAir > 0 ? hms(s.onAir) : '—');

      const goalOn = !!s.settings.goal.enabled && s.goal.target > 0;
      const pct = goalOn ? Math.min(100, (s.goal.current / s.goal.target) * 100) : 0;
      setText(goal.value, goalOn ? `${Math.round(pct)}%` : t('ovGoalOff'));
      setText(goal.sub, goalOn ? `${money(s.goal.current)} / ${money(s.goal.target, s.currency)}` : '');
      goal.meter.hidden = !goalOn;
      goal.bar.style.width = `${pct}%`;

      const b = s.bonus;
      bonus.el.dataset.mode = b.mode;
      setText(
        bonus.value,
        b.mode === 'live' ? `+${b.percent}%` : b.mode === 'cooldown' ? shortClock(b.left) : b.mode === 'off' ? t('bonusOff') : '—'
      );
      setText(bonus.sub, b.mode === 'off' ? '' : b.mode === 'live' ? t('bonusLive', { p: b.percent, t: shortClock(b.left) }) : b.mode === 'cooldown' ? t('bonusCooldownLeft', { t: shortClock(b.left) }) : t('bonusIdle'));
    },
  };
};
