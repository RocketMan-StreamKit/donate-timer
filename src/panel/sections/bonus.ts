import { act } from '../api';
import { h, setText } from '../dom';
import { money, shortClock, symbol } from '../format';
import { t } from '../i18n';
import type { Component, PanelState } from '../types';
import { button, card } from '../ui/card';
import { numberField, textField, toggleField } from '../ui/fields';
import { grid, group, settingsCard } from '../ui/settings-card';

/**
 * Live bonus status with manual controls and the bank progress.
 * @returns Component.
 * @example bonusStatus().el;
 */
const bonusStatus = (): Component => {
  const icon = h('span', { class: 'dt-bonus-icon', attrs: { 'aria-hidden': 'true' } });
  const head = h('b', { class: 'dt-bonus-head' });
  const bankLabel = h('span', { class: 'dt-bonus-bank' });
  const bankFill = h('i');
  const bankBar = h('span', { class: 'dt-meter' }, [bankFill]);
  const startBtn = button(`⚡  ${t('bonusStart')}`, () => void act('bonusStart'), { variant: 'primary' });
  const stopBtn = button(`■  ${t('bonusStop')}`, () => void act('bonusStop'), { variant: 'danger' });
  const bankBtn = button(t('bonusResetBank'), () => void act('bonusResetBank'), { small: true, variant: 'ghost' });
  const cdBtn = button(t('bonusResetCooldown'), () => void act('bonusResetCooldown'), { small: true, variant: 'ghost' });
  const { el } = card({ title: t('bonusTitle'), description: t('bonusDesc'), icon: '⚡', class: 'dt-bonus-card' }, [
    h('div', { class: 'dt-bonus-status' }, [icon, h('div', { class: 'dt-bonus-text' }, [head, bankLabel, bankBar])]),
    h('div', { class: 'dt-actions' }, [startBtn, stopBtn, bankBtn, cdBtn]),
    h('p', { class: 'dt-note', text: t('bonusOpenerNote') }),
  ]);
  return {
    el,
    update: s => {
      const b = s.bonus;
      el.dataset.mode = b.mode;
      setText(icon, b.mode === 'live' ? '🔥' : b.mode === 'cooldown' ? '⏸' : b.mode === 'off' ? '💤' : '⏳');
      setText(
        head,
        b.mode === 'live'
          ? t('bonusLive', { p: b.percent, t: shortClock(b.left) })
          : b.mode === 'cooldown'
            ? t('bonusCooldownLeft', { t: shortClock(b.left) })
            : b.mode === 'off'
              ? t('bonusOff')
              : t('bonusIdle')
      );
      const step = b.bankStep;
      setText(bankLabel, `${t('bonusBank')}: ${step > 0 ? `${money(b.bank)} / ${money(step, s.currency)}` : money(b.bank, s.currency)}`);
      bankBar.hidden = !(step > 0);
      bankFill.style.width = `${step > 0 ? Math.min(100, (b.bank / step) * 100) : 0}%`;
      startBtn.hidden = b.mode === 'live';
      stopBtn.hidden = b.mode !== 'live';
      cdBtn.hidden = b.mode !== 'cooldown';
      bankBtn.disabled = b.bank <= 0;
    },
  };
};

/**
 * Bonus settings grouped by purpose.
 * @returns Component.
 * @example bonusSettings().el;
 */
const bonusSettings = (): Component => {
  let state: PanelState | null = null;
  const cur = () => (state ? symbol(state.currency) : '');
  const enabled = toggleField({ label: t('on'), wide: false });
  const percent = numberField({ label: t('bonusPercent'), hint: t('bonusPercentHint'), min: 0, max: 500, suffix: '%' });
  const durMin = numberField({ label: t('bonusDurMin'), min: 1, step: 1, suffix: t('mm') });
  const durMax = numberField({ label: t('bonusDurMax'), min: 1, step: 1, suffix: t('mm') });
  const cooldown = numberField({ label: t('bonusCooldown'), min: 0, step: 1, suffix: t('mm') });
  const bankStep = numberField({ label: t('bonusBankStep'), hint: t('bonusBankStepHint'), min: 0, suffix: cur });
  const whale = numberField({ label: t('bonusWhale'), hint: t('bonusWhaleHint'), min: 0, suffix: cur });
  const onGoal = toggleField({ label: t('bonusOnGoal') });
  const showObs = toggleField({ label: t('bonusShowObs') });
  const title1 = textField({ label: t('bonusTitle1'), placeholder: 'БОНУСНЫЙ' });
  const title2 = textField({ label: t('bonusTitle2'), placeholder: 'КУРС' });
  const bomb = toggleField({ label: t('bonusBomb') });
  const openSound = textField({ label: t('bonusOpenSound'), type: 'url', maxLength: 2000, placeholder: 'https://…/start.mp3' });
  const volume = numberField({ label: t('bonusVolume'), min: 0, max: 100, step: 1, suffix: '%' });
  const durHint = h('p', { class: 'dt-hint', text: t('bonusDurHint') });

  return settingsCard({
    title: t('bonusSettingsTitle'),
    icon: '⚙',
    toggle: 'bonus.enabled',
    fields: {
      'bonus.enabled': enabled,
      'bonus.percent': percent,
      'bonus.durationMin': durMin,
      'bonus.durationMax': durMax,
      'bonus.cooldownMin': cooldown,
      'bonus.bankStep': bankStep,
      'bonus.whale': whale,
      'bonus.onGoal': onGoal,
      'bonus.showObs': showObs,
      'bonus.title1': title1,
      'bonus.title2': title2,
      'bonus.bombSound': bomb,
      'bonus.openSoundUrl': openSound,
      'bonus.volume': volume,
    },
    layout: [
      group(t('bonusGroupBenefit'), [percent.el, grid(durMin.el, durMax.el), durHint, cooldown.el]),
      group(t('bonusGroupTriggers'), [grid(bankStep.el, whale.el), onGoal.el], t('bonusGroupTriggersHint')),
      group(t('bonusGroupObs'), [showObs.el, grid(title1.el, title2.el), bomb.el, grid(openSound.el, volume.el)], t('bonusSoundHint')),
    ],
    render: s => {
      state = s;
    },
  });
};

/**
 * "Bonus rate" tab content.
 * @returns Components.
 * @example bonusTab();
 */
export const bonusTab = (): Component[] => [bonusStatus(), bonusSettings()];
