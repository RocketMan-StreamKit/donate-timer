import type { PanelState } from './types';

/** Latest worker state (null until the first load). */
let current: PanelState | null = null;
/** State subscribers. */
const listeners = new Set<(state: PanelState) => void>();

/**
 * Latest state.
 * @returns State or null.
 * @example getState()?.timer.remaining;
 */
export const getState = () => current;

/**
 * Replaces the state and notifies subscribers.
 * @param next New state.
 * @example setState(await res.json());
 */
export const setState = (next: PanelState) => {
  current = next;
  listeners.forEach(fn => fn(next));
};

/**
 * Subscribes to state changes (called right away when state exists).
 * @param fn Listener.
 * @returns Unsubscribe function.
 * @example subscribe(s => render(s));
 */
export const subscribe = (fn: (state: PanelState) => void) => {
  listeners.add(fn);
  if (current) fn(current);
  return () => listeners.delete(fn);
};

/** Tab ids. */
export type TabId = 'control' | 'setup' | 'marathon' | 'bonus' | 'widgets';

/** Tab change listeners. */
const tabListeners = new Set<(tab: TabId) => void>();

/**
 * Switches the visible tab (used by onboarding links too).
 * @param tab Tab id.
 * @example goToTab('widgets');
 */
export const goToTab = (tab: TabId) => {
  tabListeners.forEach(fn => fn(tab));
};

/**
 * Subscribes to tab switch requests.
 * @param fn Listener.
 * @example onTab(tab => show(tab));
 */
export const onTab = (fn: (tab: TabId) => void) => {
  tabListeners.add(fn);
};
