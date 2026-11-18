import { h, readLocal, writeLocal } from '../dom';
import { t } from '../i18n';
import { onTab, type TabId } from '../store';

/** Tab definition. */
export type TabDef = { id: TabId; icon: string; label: string; content: HTMLElement[] };

/** localStorage key of the last opened tab. */
const TAB_KEY = 'donate-timer:tab';

/**
 * Tab bar and panels. The last opened tab is remembered per viewer.
 * @param tabs Tab definitions.
 * @returns `{ bar, panels }`.
 * @example const { bar, panels } = tabs([{ id: 'control', icon: '🎛', label: 'Control', content: [...] }]);
 */
export const tabs = (tabs: TabDef[]) => {
  const buttons = new Map<TabId, HTMLButtonElement>();
  const panes = new Map<TabId, HTMLElement>();

  const show = (id: TabId) => {
    if (!panes.has(id)) id = tabs[0].id;
    buttons.forEach((btn, key) => {
      const on = key === id;
      btn.classList.toggle('dt-tab--active', on);
      btn.setAttribute('aria-selected', String(on));
      if (on) btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    panes.forEach((pane, key) => {
      pane.hidden = key !== id;
    });
    writeLocal(TAB_KEY, id);
    window.scrollTo({ top: 0 });
  };

  const bar = h(
    'nav',
    { class: 'dt-tabs', attrs: { role: 'tablist', 'aria-label': t('appTitle') } },
    tabs.map(tab => {
      const btn = h('button', { class: 'dt-tab', attrs: { type: 'button', role: 'tab' }, on: { click: () => show(tab.id) } }, [
        h('span', { class: 'dt-tab-icon', text: tab.icon, attrs: { 'aria-hidden': 'true' } }),
        h('span', { class: 'dt-tab-label', text: tab.label }),
      ]);
      buttons.set(tab.id, btn);
      return btn;
    })
  );

  const panels = h(
    'main',
    { class: 'dt-panels' },
    tabs.map(tab => {
      const pane = h('div', { class: 'dt-pane', attrs: { role: 'tabpanel' } }, tab.content);
      panes.set(tab.id, pane);
      return pane;
    })
  );

  onTab(show);
  const fromHash = /(?:^|[#&])tab=(\w+)/.exec(window.location.hash)?.[1];
  show((fromHash ?? readLocal(TAB_KEY, 'control')) as TabId);
  return { bar, panels };
};
