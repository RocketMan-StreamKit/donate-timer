import { h, readLocal, writeLocal } from '../dom';
import { t } from '../i18n';
import { goToTab, type TabId } from '../store';
import type { Component } from '../types';
import { button } from '../ui/card';

/** localStorage key prefix for onboarding progress. */
const KEY = 'donate-timer:onb:';

/** Onboarding step ids that are completed by user actions. */
export type OnboardingStep = 'rate' | 'time' | 'widgets';

/**
 * Marks a getting-started step as done.
 * @param step Step id.
 * @example markStep('widgets');
 */
export const markStep = (step: OnboardingStep) => {
  writeLocal(KEY + step, '1');
  stepListeners.forEach(fn => fn());
};

/** Re-render hooks for onboarding progress. */
const stepListeners = new Set<() => void>();

/**
 * "Getting started" checklist. Steps tick themselves off; the card can be hidden and restored.
 * @returns Component plus a small link that restores the card.
 * @example const onb = onboarding(); pane.append(onb.el, onb.restore);
 */
export const onboarding = (): Component & { restore: HTMLElement } => {
  const steps: { id: OnboardingStep | 'start'; label: string; tab: TabId }[] = [
    { id: 'rate', label: t('onbRate'), tab: 'setup' },
    { id: 'time', label: t('onbTime'), tab: 'setup' },
    { id: 'widgets', label: t('onbWidgets'), tab: 'widgets' },
    { id: 'start', label: t('onbStart'), tab: 'control' },
  ];
  let started = false;
  const items = steps.map((step, index) => {
    const li = h('li', { class: 'dt-step' }, [
      h('span', { class: 'dt-step-num', text: String(index + 1), attrs: { 'aria-hidden': 'true' } }),
      h('span', { class: 'dt-step-text', text: step.label }),
      step.id !== 'start' ? button(t('onbGo'), () => goToTab(step.tab), { small: true, variant: 'ghost' }) : null,
    ]);
    return { step, li };
  });
  const el = h('section', { class: 'dt-card dt-onboarding' }, [
    h('div', { class: 'dt-onb-head' }, [
      h('div', {}, [h('h2', { text: `👋  ${t('onbTitle')}` }), h('p', { class: 'dt-card-desc', text: t('onbText') })]),
      button(t('onbHide'), () => {
        writeLocal(`${KEY}hidden`, '1');
        paint();
      }, { small: true, variant: 'ghost' }),
    ]),
    h('ol', { class: 'dt-steps' }, items.map(i => i.li)),
  ]);
  const restore = h('button', {
    class: 'dt-link',
    text: t('onbShow'),
    attrs: { type: 'button' },
    on: {
      click: () => {
        writeLocal(`${KEY}hidden`, '');
        paint();
      },
    },
  });

  const paint = () => {
    const done = (id: string) => (id === 'start' ? started : readLocal(KEY + id, '') === '1');
    items.forEach(({ step, li }) => li.classList.toggle('dt-step--done', done(step.id)));
    const allDone = steps.every(step => done(step.id));
    const hidden = readLocal(`${KEY}hidden`, '') === '1';
    el.hidden = hidden || allDone;
    restore.hidden = !hidden || allDone;
  };
  stepListeners.add(paint);

  return {
    el,
    restore,
    update: s => {
      started = started || s.timer.status !== 'stopped' || s.summary.count > 0;
      paint();
    },
  };
};
