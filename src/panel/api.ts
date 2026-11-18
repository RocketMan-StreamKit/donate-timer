import { has, t } from './i18n';
import { setState } from './store';
import type { PanelState } from './types';
import { toast } from './ui/toast';

/** Addon id from `/addon_static/{id}/index.html`. */
const addonId = decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || 'donate-timer');
/** Frontend token from the window URL. */
const token = new URLSearchParams(window.location.search).get('token') ?? '';
/** Base URL of the worker endpoints. */
const apiBase = `${window.location.origin}/addon/${encodeURIComponent(addonId)}`;

/** Connection listeners (true = worker answered). */
const connectionListeners = new Set<(online: boolean) => void>();

/**
 * Subscribes to worker reachability changes.
 * @param fn Listener.
 * @example onConnection(ok => banner.hidden = ok);
 */
export const onConnection = (fn: (online: boolean) => void) => {
  connectionListeners.add(fn);
};

/**
 * Localized text for a worker error key.
 * @param key Error key.
 * @returns Message.
 * @example errorText('timerZero');
 */
export const errorText = (key?: string) => (key && has(`err_${key}`) ? t(`err_${key}`) : t('err_unknown'));

/**
 * Loads the panel state.
 * @param refreshCurrency Ask the worker to re-read the app currency.
 * @returns Promise resolved after the state is stored.
 * @example await refresh();
 */
export const refresh = async (refreshCurrency = false) => {
  try {
    const res = await fetch(`${apiBase}/panel?token=${encodeURIComponent(token)}${refreshCurrency ? '&refreshCurrency=1' : ''}`);
    const next = (await res.json()) as PanelState;
    connectionListeners.forEach(fn => fn(true));
    if (!next.success) {
      toast(errorText(next.error), 'error');
      return;
    }
    setState(next);
  } catch {
    connectionListeners.forEach(fn => fn(false));
  }
};

/**
 * Sends an action to the worker; the returned state is applied.
 * @param type Action type.
 * @param payload Extra fields.
 * @returns Whether the action succeeded (errors are shown as a toast).
 * @example await act('addTime', { seconds: 60 });
 */
export const act = async (type: string, payload: Record<string, unknown> = {}) => {
  try {
    const res = await fetch(`${apiBase}/action?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload }),
    });
    const result = (await res.json()) as { success: boolean; error?: string; state?: PanelState };
    if (result.state) setState(result.state);
    if (!result.success) toast(errorText(result.error), 'error');
    return result.success;
  } catch {
    toast(t('err_network'), 'error');
    return false;
  }
};
