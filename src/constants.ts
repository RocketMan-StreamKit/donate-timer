import type { DonateTimerSettings, MarathonAccent } from './types';

/**
 * Manifest id of this addon (official RocketMan-StreamKit repository → bare repo name).
 * @example `/addon/${ADDON_ID}/panel`
 */
export const ADDON_ID = 'donate-timer';

/**
 * Socket.IO namespace suffix used by OBS widgets.
 * @example network.socketEndpoints.emit(SOCKET_PATH, 'snapshot', payload);
 */
export const SOCKET_PATH = 'live';

/**
 * Current persisted data format version.
 * @example if (stored.version !== DATA_VERSION) migrate(stored);
 */
export const DATA_VERSION = 1;

/**
 * Upper bound for remembered dashboard record ids (oldest are dropped).
 * @example ids.slice(-PROCESSED_IDS_LIMIT)
 */
export const PROCESSED_IDS_LIMIT = 5000;

/**
 * Number of recent journal rows exposed to widgets as `logs.txt`.
 * @example donations.slice(-WIDGET_LOG_LINES)
 */
export const WIDGET_LOG_LINES = 50;

/**
 * Alerts older than this are not shown again by freshly loaded widgets (ms).
 * @example if (Date.now() - alert.at > ALERT_TTL_MS) skip();
 */
export const ALERT_TTL_MS = 20_000;

/**
 * How long the `__CLEAR__` alert signal stays visible to widgets (ms).
 * @example clearSignalUntil = Date.now() + CLEAR_SIGNAL_MS;
 */
export const CLEAR_SIGNAL_MS = 5_000;

/**
 * Maximum bonus percent (same cap as the desktop app).
 * @example if (percent > BONUS_PERCENT_CAP) return 'error';
 */
export const BONUS_PERCENT_CAP = 500;

/**
 * Concrete accent colors (without `random`).
 * @example MARATHON_COLOR_ACCENTS.includes('orange'); // true
 */
export const MARATHON_COLOR_ACCENTS: Exclude<MarathonAccent, 'random'>[] = [
  'orange',
  'purple',
  'green',
  'blue',
  'red',
  'pink',
  'yellow',
  'lime',
  'navy',
  'gray',
];

/**
 * Every accent value accepted in settings.
 * @example MARATHON_ACCENTS.includes('random'); // true
 */
export const MARATHON_ACCENTS: MarathonAccent[] = [
  ...MARATHON_COLOR_ACCENTS,
  'random',
];

/**
 * Widget pages shipped in `widgets/` (file name without extension).
 * @example WIDGETS.map(w => `widgets/${w}.html`)
 */
export const WIDGETS = [
  'timer_new',
  'timer_marathon_block',
  'marathon_gold_small_v2',
  'top5_marathon_inline',
  'top5_marathon_block',
  'donation_goal',
  'bonus_rate',
  'clock_datetime_inline',
  'webcam_frame',
] as const;

/** Widget page id. */
export type WidgetId = (typeof WIDGETS)[number];

/**
 * Default settings for a fresh install (mirrors `config.ini.example` of the desktop app).
 * @example const settings = structuredClone(DEFAULT_SETTINGS);
 */
export const DEFAULT_SETTINGS: DonateTimerSettings = {
  currency: 'app',
  rate: 10,
  rateMode: 'amount_per_sec',
  initialSeconds: 3600,
  title: '',
  blinkSeconds: 30,
  colorLevels: {
    enabled: false,
    blue: 50,
    purple: 100,
    green: 200,
    red: 500,
  },
  goal: {
    enabled: false,
    title: '',
    target: 200000,
    start: 0,
    startAt: 0,
    trackOpacity: 72,
    fillOpacity: 100,
  },
  marathon: {
    startAt: 0,
    commissionPercent: 10,
    accent: 'orange',
  },
  timeGoal: {
    enabled: false,
    hours: '',
    title: '',
    done: '',
  },
  bonus: {
    enabled: false,
    showObs: false,
    percent: 0,
    durationMin: 5,
    durationMax: 15,
    cooldownMin: 10,
    bankStep: 0,
    whale: 0,
    onGoal: false,
    title1: '',
    title2: '',
    bombSound: true,
    openSoundUrl: '',
    volume: 80,
  },
};

/**
 * Short currency symbols used in widget texts; other codes are shown as-is.
 * @example CURRENCY_SYMBOLS.RUB; // '₽'
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: '₽',
  UAH: '₴',
  USD: '$',
  EUR: '€',
  KZT: '₸',
  BYN: 'Br',
  GBP: '£',
  PLN: 'zł',
  TRY: '₺',
};
