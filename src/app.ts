/**
 * Donate Timer control panel (in-app StreamKit+ window).
 * Built from components in `panel/`; state comes from `GET /addon/{id}/panel` once per second.
 */
import { refresh } from './panel/api';
import { h } from './panel/dom';
import { setLang, t } from './panel/i18n';
import { bonusTab } from './panel/sections/bonus';
import { donationCard } from './panel/sections/donation';
import { header } from './panel/sections/header';
import { journal } from './panel/sections/journal';
import { manual } from './panel/sections/manual';
import { marathonTab } from './panel/sections/marathon';
import { onboarding } from './panel/sections/onboarding';
import { overview } from './panel/sections/overview';
import { setupTab } from './panel/sections/setup';
import { tabs } from './panel/sections/tabs';
import { widgetsTab } from './panel/sections/widgets';
import { subscribe } from './panel/store';
import type { Component } from './panel/types';
import { masonry } from './panel/ui/layout';

/** App root element from `index.html`. */
const root = document.getElementById('app') as HTMLElement;

/** Language the UI was built for (the UI is rebuilt when StreamKit+ switches language). */
let builtLang = '';
/** Mounted components receiving state updates. */
let components: Component[] = [];

/**
 * Builds the whole UI for the current language.
 * @example build();
 */
const build = () => {
  const head = header();
  const onb = onboarding();
  const control = [overview(), donationCard(), manual(), journal()];
  const setup = setupTab();
  const marathon = marathonTab();
  const bonus = bonusTab();
  const widgets = widgetsTab();
  components = [head, onb, ...control, ...setup, ...marathon, ...bonus, widgets];

  const columns = (items: Component[]) => masonry(items.map(c => c.el), 360);
  const { bar, panels } = tabs([
    {
      id: 'control',
      icon: '🎛',
      label: t('tabControl'),
      content: [
        onb.el,
        control[0].el,
        h('div', { class: 'dt-columns dt-columns--control' }, [h('div', { class: 'dt-stack' }, [control[1].el, control[2].el]), control[3].el]),
        h('div', { class: 'dt-footer' }, [onb.restore]),
      ],
    },
    { id: 'setup', icon: '💱', label: t('tabSetup'), content: [columns(setup)] },
    { id: 'marathon', icon: '🏁', label: t('tabMarathon'), content: [columns(marathon)] },
    { id: 'bonus', icon: '⚡', label: t('tabBonus'), content: [columns(bonus)] },
    { id: 'widgets', icon: '📺', label: t('tabWidgets'), content: [widgets.el] },
  ]);

  root.replaceChildren(h('div', { class: 'dt-sticky' }, [head.el, bar]), panels);
  document.title = t('appTitle');
};

subscribe(state => {
  if (state.lang !== builtLang) {
    builtLang = state.lang;
    setLang(state.lang);
    build();
  }
  components.forEach(c => c.update?.(state));
});

void refresh(true);
window.setInterval(() => void refresh(), 1000);
