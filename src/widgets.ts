/**
 * Widget data feed. The OBS pages are ports of the desktop app widgets, which polled text
 * files; `widgets/bridge.js` serves those "files" from the snapshot built here.
 */
import { formatSecondsLabel, isActive, nowSec, secondsPerUnit } from './bonus';
import { SOCKET_PATH, WIDGET_LOG_LINES, WIDGETS } from './constants';
import { baseCurrency } from './currency';
import { alertText, isBlinking, rateInEffect, takeTimeGoalForce } from './engine';
import { amountText, currencySymbol, hms, localStamp, rateText } from './format';
import { effectiveAccent, goalPayload, onAirSeconds, timeGoalText, widgetRows, widgetTotals } from './stats';
import { db } from './store';

/** Snapshot sent to widgets. `null` file values answer with HTTP 404 (missing file). */
export type WidgetSnapshot = {
  /** Emulated text files keyed by the original file name. */
  files: Record<string, string | null>;
  /** Extra data for patched widget code. */
  meta: {
    /** Base currency code. */
    currency: string;
    /** Base currency symbol. */
    symbol: string;
    /** Bonus widget sound options. */
    sounds: { bomb: boolean; openUrl: string; volume: number };
    /** Server time (ms epoch) for clock drift checks. */
    serverTime: number;
  };
};

/**
 * `bonus_rate.json` payload (port of `widget_payload`).
 * @returns Widget JSON object.
 * @example bonusPayload().active;
 */
const bonusPayload = () => {
  const cfg = db.settings.bonus;
  const now = nowSec();
  const live = cfg.enabled && isActive(db.bonus, now);
  const percent = live ? db.bonus.lockedPercent ?? 0 : cfg.percent;
  const perUnit = secondsPerUnit(db.settings.rate, db.settings.rateMode, percent);
  return {
    enabled: cfg.enabled,
    show_obs: cfg.showObs,
    active: live,
    percent,
    multiplier: 1 + percent / 100,
    rate_text: rateText(rateInEffect(), db.settings.rateMode, baseCurrency()),
    seconds_per_rub: formatSecondsLabel(perUnit),
    title_1: cfg.title1,
    title_2: cfg.title2,
    ...(live ? { ends_at: db.bonus.endsAt, started_at: db.bonus.startedAt } : {}),
  };
};

/**
 * `logs.txt` lines in the desktop app format (`[stamp] nick - amount CUR (+Nс)`).
 * @returns Recent visible journal rows.
 * @example logsText().split('\n');
 */
const logsText = () =>
  widgetRows()
    .slice(-WIDGET_LOG_LINES)
    .map(
      row =>
        `[${localStamp(row.timestamp)}] ${row.username} - ${amountText(row.amount)} ${row.currency} (+${Math.round(row.seconds)}с)`
    )
    .join('\n');

/**
 * Builds the full widget snapshot.
 * @returns Snapshot.
 * @example network.socketEndpoints.emit('live', 'snapshot', buildSnapshot());
 */
export const buildSnapshot = (): WidgetSnapshot => {
  const blinking = isBlinking();
  const totals = widgetTotals();
  const code = baseCurrency();
  return {
    files: {
      'timer.txt': blinking ? '00:00:00' : hms(db.timer.remaining),
      'rate.txt': rateText(rateInEffect(), db.settings.rateMode, code),
      'title.txt': db.settings.title,
      'blink.flag': blinking ? '1' : null,
      'donation_alert.txt': alertText(),
      'logs.txt': logsText(),
      'on_air.txt': hms(onAirSeconds()),
      'total_donations_rub.txt': String(Math.round(totals.total)),
      'top5_marathon_inline.txt': totals.inline,
      'top5_marathon_list.txt': totals.list,
      'marathon_time_goal.txt': timeGoalText(db.timer.remaining, takeTimeGoalForce()),
      'marathon_widget_accent.txt': `${effectiveAccent()}\n`,
      'donation_goal.json': JSON.stringify(goalPayload()),
      'bonus_rate.json': JSON.stringify(bonusPayload()),
    },
    meta: {
      currency: code,
      symbol: currencySymbol(code),
      sounds: {
        bomb: db.settings.bonus.bombSound,
        openUrl: db.settings.bonus.openSoundUrl,
        volume: db.settings.bonus.volume,
      },
      serverTime: Date.now(),
    },
  };
};

/** Latest snapshot (rebuilt on every broadcast). */
let latest: WidgetSnapshot | null = null;
/** Pending debounced broadcast. */
let broadcastTimer: number | null = null;

/**
 * Latest snapshot, building one if none exists yet.
 * @returns Snapshot.
 * @example currentSnapshot().files['timer.txt'];
 */
export const currentSnapshot = () => latest ?? (latest = buildSnapshot());

/**
 * Rebuilds the snapshot and pushes it to every connected widget (debounced ~50 ms).
 * @example scheduleBroadcast();
 */
export const scheduleBroadcast = () => {
  if (broadcastTimer !== null) return;
  broadcastTimer = setTimeout(() => {
    broadcastTimer = null;
    latest = buildSnapshot();
    void network.socketEndpoints.emit(SOCKET_PATH, 'snapshot', latest);
  }, 50);
};

/**
 * Absolute widget URLs for OBS browser sources.
 * @returns Map of widget id to URL.
 * @example widgetUrls().timer_new;
 */
export const widgetUrls = () =>
  Object.fromEntries(
    WIDGETS.map(id => [
      id,
      `http://localhost:${WEB_SERVER_PORT}/addon_static/${encodeURIComponent(data.id)}/widgets/${id}.html?token=${encodeURIComponent(data.token)}`,
    ])
  ) as Record<(typeof WIDGETS)[number], string>;

/**
 * Registers the widget socket namespace and the HTTP fallback endpoint.
 * @returns Promise resolved after registration.
 * @example await registerWidgetFeed();
 */
export const registerWidgetFeed = async () => {
  await network.socketEndpoints.create(SOCKET_PATH, 'onWidgetSocket');
  events.On('onWidgetSocket', payload => {
    if (payload?.type === 'connect' && payload.socketId) {
      void network.socketEndpoints.emit(SOCKET_PATH, 'snapshot', currentSnapshot(), payload.socketId);
    }
    if (payload?.type === 'event' && payload.event === 'snapshot:get') {
      return currentSnapshot();
    }
    return undefined;
  });

  await network.endpoints.create('snapshot', 'GET', 'onWidgetSnapshot');
  events.On('onWidgetSnapshot', ({ query }) => {
    if (query?.token !== data.token) return { success: false, message: 'Unauthorized' };
    return currentSnapshot();
  });
};
