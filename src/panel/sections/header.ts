import { act, onConnection } from '../api';
import { h, setText } from '../dom';
import { humanDuration, shortClock } from '../format';
import { t } from '../i18n';
import { goToTab } from '../store';
import type { Component } from '../types';
import { button } from '../ui/card';
import { confirmDialog } from '../ui/confirm';
import { flipClock } from '../ui/flip-clock';

/**
 * Sticky header: big timer, status, current rate and the main controls.
 * @returns Component.
 * @example document.body.append(header().el);
 */
export const header = (): Component => {
  const status = h('span', { class: 'dt-status' });
  const clock = flipClock();
  const rate = h('span', { class: 'dt-hero-rate' });
  const bonus = h('button', {
    class: 'dt-chip dt-chip--bonus',
    attrs: { type: 'button', hidden: true },
    on: { click: () => goToTab('bonus') },
  });
  const blink = h('div', { class: 'dt-banner dt-banner--warn', attrs: { hidden: true } });
  const offline = h('div', { class: 'dt-banner dt-banner--error', text: t('err_network'), attrs: { hidden: true } });

  let initialSeconds = 0;
  let timerStatus: 'stopped' | 'running' | 'paused' = 'stopped';
  /** One main button: Start when stopped, Pause while running, Resume while paused. */
  const mainBtn = button('', () => void act(timerStatus === 'stopped' ? 'start' : 'pause'), { variant: 'primary', class: 'dt-btn--lg dt-btn--main' });
  const resetBtn = button(`↺  ${t('reset')}`, async () => {
    if (await confirmDialog(t('confirmResetTitle'), t('confirmReset', { t: humanDuration(initialSeconds) }), true)) {
      void act('reset');
    }
  }, { variant: 'ghost', class: 'dt-btn--lg' });

  const el = h('header', { class: 'dt-hero' }, [
    h('div', { class: 'dt-hero-inner' }, [
      h('div', { class: 'dt-hero-main' }, [
        h('div', { class: 'dt-hero-top' }, [status, bonus]),
        clock.el,
        rate,
      ]),
      h('div', { class: 'dt-hero-actions' }, [mainBtn, resetBtn]),
    ]),
    blink,
    offline,
  ]);

  onConnection(online => {
    offline.hidden = online;
  });

  return {
    el,
    update: s => {
      initialSeconds = s.settings.initialSeconds;
      const mode = s.timer.blinking ? 'blink' : s.timer.status;
      el.dataset.mode = mode;
      setText(status, s.timer.blinking ? t('statusBlinking') : t(s.timer.status === 'running' ? 'statusRunning' : s.timer.status === 'paused' ? 'statusPaused' : 'statusStopped'));
      clock.set(s.timer.remaining, s.timer.blinking, s.timer.status === 'running');
      setText(rate, `${t('headerRate')}: ${s.rateText.replace(/ /g, ' ')}`);
      bonus.hidden = s.bonus.mode !== 'live';
      setText(bonus, `⚡ ${t('headerBonusLive', { p: s.bonus.percent, t: shortClock(s.bonus.left) })}`);
      blink.hidden = !s.timer.blinking;
      setText(blink, t('blinkInfo', { n: s.timer.blinkLeft, b: s.timer.buffered }));
      timerStatus = s.timer.status;
      mainBtn.disabled = s.timer.blinking;
      mainBtn.dataset.action = s.timer.status;
      setText(mainBtn, s.timer.status === 'running' ? `❚❚  ${t('pause')}` : s.timer.status === 'paused' ? `▶  ${t('resume')}` : `▶  ${t('start')}`);
    },
  };
};
