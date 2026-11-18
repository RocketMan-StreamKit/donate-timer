/**
 * HTTP API for the in-app control panel (`index.html`). Every call requires `?token=`.
 */
import { isActive, nowSec } from './bonus';
import { baseCurrency, getAppCurrency, getCurrencyCodes, refreshAppCurrency } from './currency';
import {
  addAmountWithName,
  addTime,
  addTimeWithName,
  bonusResetBank,
  bonusResetCooldown,
  bonusStart,
  bonusStop,
  clearHistory,
  clearWidgets,
  isBlinking,
  pauseTimer,
  rateInEffect,
  removeLastDonation,
  resetTimer,
  setRemaining,
  startTimer,
  timeGoalReset,
  updateSettings,
  type ActionResult,
} from './engine';
import { rateText } from './format';
import { goalProgress, marathonStats, moneyRows, onAirSeconds } from './stats';
import { db } from './store';
import { currentSnapshot, gtaWidgetUrls, widgetUrls } from './widgets';

/** Journal rows returned to the panel (newest first). */
const PANEL_JOURNAL_LIMIT = 300;

/**
 * Unauthorized response.
 * @example return unauthorized();
 */
const unauthorized = () => ({ success: false, error: 'unauthorized' });

/**
 * Bonus status line data for the panel.
 * @returns Mode, seconds left and bank.
 * @example bonusStatus().mode; // 'idle'
 */
const bonusStatus = () => {
  const cfg = db.settings.bonus;
  const now = nowSec();
  let mode: 'off' | 'live' | 'cooldown' | 'idle' = 'idle';
  let left = 0;
  if (!cfg.enabled) mode = 'off';
  else if (isActive(db.bonus, now)) {
    mode = 'live';
    left = Math.max(0, Math.floor((db.bonus.endsAt ?? now) - now));
  } else if (db.bonus.cooldownUntil !== null && now < db.bonus.cooldownUntil) {
    mode = 'cooldown';
    left = Math.max(0, Math.floor(db.bonus.cooldownUntil - now));
  }
  return { mode, left, percent: db.bonus.lockedPercent ?? cfg.percent, bank: db.bonus.bank, bankStep: cfg.bankStep };
};

/**
 * Full panel state.
 * @returns JSON for the control panel.
 * @example panelState().timer.remaining;
 */
const panelState = () => {
  const money = moneyRows(db.donations);
  return {
    success: true,
    lang: LANG.current,
    currency: baseCurrency(),
    appCurrency: getAppCurrency(),
    currencies: getCurrencyCodes(),
    settings: db.settings,
    timer: {
      remaining: Math.floor(db.timer.remaining),
      status: db.timer.status,
      blinking: isBlinking(),
      blinkLeft: isBlinking() ? Math.ceil((db.timer.blinkUntil - Date.now()) / 1000) : 0,
      buffered: db.blinkBuffer.length,
    },
    rateText: rateText(rateInEffect(), db.settings.rateMode, baseCurrency()),
    bonus: bonusStatus(),
    stats: marathonStats(),
    goal: { ...goalProgress(), target: db.settings.goal.target },
    timeGoal: currentSnapshot().files['marathon_time_goal.txt'] ?? '',
    onAir: onAirSeconds(),
    summary: {
      count: db.donations.length,
      seconds: db.donations.reduce((acc, row) => acc + row.seconds, 0),
      amount: money.reduce((acc, row) => acc + row.amount, 0),
    },
    journal: db.donations.slice(-PANEL_JOURNAL_LIMIT).reverse(),
    widgetsCleared: db.widgetExcludedIds.length,
    widgets: widgetUrls(),
    gtaWidgets: gtaWidgetUrls(),
  };
};

/**
 * Reads a number from a request body field.
 * @param value Raw value.
 * @returns Number (NaN when invalid).
 * @example n('12'); // 12
 */
const n = (value: unknown) => (typeof value === 'number' ? value : Number(value));

/**
 * Reads a string from a request body field.
 * @param value Raw value.
 * @returns String or empty.
 * @example s(' Bob '); // ' Bob '
 */
const s = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * Runs one panel action.
 * @param body Request body `{ type, ... }`.
 * @returns Action result.
 * @example await runAction({ type: 'addTime', seconds: 60 });
 */
const runAction = async (body: Record<string, unknown>): Promise<ActionResult> => {
  switch (body.type) {
    case 'start':
      return startTimer();
    case 'pause':
      return pauseTimer();
    case 'reset':
      return resetTimer();
    case 'setRemaining':
      return setRemaining(n(body.seconds));
    case 'addTime':
      return addTime(n(body.seconds));
    case 'addTimeWithName':
      return addTimeWithName(n(body.seconds), s(body.username));
    case 'addAmountWithName':
      return addAmountWithName(n(body.amount), s(body.username), s(body.currency) || undefined);
    case 'removeLast':
      return removeLastDonation();
    case 'clearHistory':
      return clearHistory();
    case 'clearWidgets':
      return clearWidgets();
    case 'bonusStart':
      return bonusStart();
    case 'bonusStop':
      return bonusStop();
    case 'bonusResetBank':
      return bonusResetBank();
    case 'bonusResetCooldown':
      return bonusResetCooldown();
    case 'timeGoalReset':
      return timeGoalReset();
    case 'settings':
      return updateSettings((body.settings ?? {}) as Parameters<typeof updateSettings>[0]);
    case 'openUrl': {
      const url = s(body.url);
      if (!/^https?:\/\//i.test(url)) return { success: false, error: 'invalidUrl' };
      api.openUrl(url);
      return { success: true };
    }
    default:
      return { success: false, error: 'unknownAction' };
  }
};

/**
 * Registers panel endpoints.
 * @returns Promise resolved after registration.
 * @example await registerPanelEndpoints();
 */
export const registerPanelEndpoints = async () => {
  await network.endpoints.create('panel', 'GET', 'onPanelState');
  await network.endpoints.create('action', 'POST', 'onPanelAction');

  events.On('onPanelState', async ({ query }) => {
    if (query?.token !== data.token) return unauthorized();
    if (query?.refreshCurrency === '1') await refreshAppCurrency();
    return panelState();
  });

  events.On('onPanelAction', async ({ query, body }) => {
    if (query?.token !== data.token) return unauthorized();
    const result = await runAction((body && typeof body === 'object' ? body : {}) as Record<string, unknown>);
    return { ...result, state: panelState() };
  });
};
