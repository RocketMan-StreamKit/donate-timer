import {
  DATA_VERSION,
  DEFAULT_SETTINGS,
  MARATHON_ACCENTS,
  PROCESSED_IDS_LIMIT,
} from './constants';
import type {
  BonusState,
  DonateTimerSettings,
  DonationEntry,
  MarathonAccent,
  PersistedData,
  TimerState,
} from './types';

/**
 * Deep-copies a JSON-compatible value (the VM has no guaranteed `structuredClone`).
 * @param value Value to copy.
 * @returns Independent copy.
 * @example const copy = cloneJson(DEFAULT_SETTINGS);
 */
export const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * Reads a finite number or returns the fallback.
 * @param value Raw value.
 * @param fallback Value used when `value` is not a finite number.
 * @returns Parsed number.
 * @example num('12.5', 0); // 12.5
 */
export const num = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Reads a number and clamps it to a range.
 * @param value Raw value.
 * @param fallback Value used when parsing fails.
 * @param min Lower bound.
 * @param max Upper bound.
 * @returns Clamped number.
 * @example clamp(150, 0, 0, 100); // 100
 */
export const clamp = (value: unknown, fallback: number, min: number, max: number) =>
  Math.min(max, Math.max(min, num(value, fallback)));

/**
 * Reads a boolean (accepts `'true'`, `'1'`, `'on'`).
 * @param value Raw value.
 * @param fallback Value used when `value` is undefined.
 * @returns Parsed boolean.
 * @example bool('on', false); // true
 */
export const bool = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

/**
 * Reads a single-line trimmed string.
 * @param value Raw value.
 * @param fallback Value used when `value` is not a string.
 * @param max Maximum length.
 * @returns Clean string.
 * @example str('  Hello\n', ''); // 'Hello'
 */
export const str = (value: unknown, fallback: string, max = 200): string =>
  typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, max) : fallback;

/**
 * Sanitizes a full or partial settings object over a base.
 * Unknown keys are dropped; invalid values fall back to `base`.
 * @param raw Incoming settings (from storage or the control panel).
 * @param base Settings to merge over.
 * @returns Valid settings.
 * @example const next = sanitizeSettings({ rate: 5 }, current);
 */
export const sanitizeSettings = (
  raw: unknown,
  base: DonateTimerSettings = DEFAULT_SETTINGS
): DonateTimerSettings => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;
  const cl = (r.colorLevels ?? {}) as Record<string, unknown>;
  const goal = (r.goal ?? {}) as Record<string, unknown>;
  const mar = (r.marathon ?? {}) as Record<string, unknown>;
  const tg = (r.timeGoal ?? {}) as Record<string, unknown>;
  const bo = (r.bonus ?? {}) as Record<string, unknown>;
  const accent = MARATHON_ACCENTS.includes(mar.accent as MarathonAccent)
    ? (mar.accent as MarathonAccent)
    : base.marathon.accent;
  const hours = typeof tg.hours === 'string' || typeof tg.hours === 'number'
    ? String(tg.hours).trim()
    : base.timeGoal.hours;
  const durationMin = Math.round(clamp(bo.durationMin, base.bonus.durationMin, 1, 1440));
  const durationMax = Math.round(clamp(bo.durationMax, base.bonus.durationMax, 1, 1440));

  return {
    currency: typeof r.currency === 'string' && /^[A-Za-z]{3,6}$|^app$/.test(r.currency)
      ? (r.currency === 'app' ? 'app' : r.currency.toUpperCase())
      : base.currency,
    rate: num(r.rate, base.rate) > 0 ? num(r.rate, base.rate) : base.rate,
    rateMode: r.rateMode === 'sec_per_amount' || r.rateMode === 'amount_per_sec'
      ? r.rateMode
      : base.rateMode,
    initialSeconds: Math.round(clamp(r.initialSeconds, base.initialSeconds, 1, 10 * 365 * 86400)),
    title: str(r.title, base.title),
    blinkSeconds: Math.round(clamp(r.blinkSeconds, base.blinkSeconds, 0, 600)),
    colorLevels: {
      enabled: bool(cl.enabled, base.colorLevels.enabled),
      blue: clamp(cl.blue, base.colorLevels.blue, 0, 1e9),
      purple: clamp(cl.purple, base.colorLevels.purple, 0, 1e9),
      green: clamp(cl.green, base.colorLevels.green, 0, 1e9),
      red: clamp(cl.red, base.colorLevels.red, 0, 1e9),
    },
    goal: {
      enabled: bool(goal.enabled, base.goal.enabled),
      title: str(goal.title, base.goal.title),
      target: clamp(goal.target, base.goal.target, 0, 1e12),
      start: clamp(goal.start, base.goal.start, 0, 1e12),
      startAt: Math.round(clamp(goal.startAt, base.goal.startAt, 0, 8.64e15)),
      trackOpacity: Math.round(clamp(goal.trackOpacity, base.goal.trackOpacity, 0, 100)),
      fillOpacity: Math.round(clamp(goal.fillOpacity, base.goal.fillOpacity, 0, 100)),
    },
    marathon: {
      startAt: Math.round(clamp(mar.startAt, base.marathon.startAt, 0, 8.64e15)),
      commissionPercent: clamp(mar.commissionPercent, base.marathon.commissionPercent, 0, 100),
      accent,
    },
    timeGoal: {
      enabled: bool(tg.enabled, base.timeGoal.enabled),
      hours: /^\d{0,6}$/.test(hours) ? hours : base.timeGoal.hours,
      title: str(tg.title, base.timeGoal.title),
      done: str(tg.done, base.timeGoal.done),
    },
    bonus: {
      enabled: bool(bo.enabled, base.bonus.enabled),
      showObs: bool(bo.showObs, base.bonus.showObs),
      percent: clamp(bo.percent, base.bonus.percent, 0, 1e9),
      durationMin,
      durationMax,
      cooldownMin: Math.round(clamp(bo.cooldownMin, base.bonus.cooldownMin, 0, 1440)),
      bankStep: clamp(bo.bankStep, base.bonus.bankStep, 0, 1e12),
      whale: clamp(bo.whale, base.bonus.whale, 0, 1e12),
      onGoal: bool(bo.onGoal, base.bonus.onGoal),
      title1: str(bo.title1, base.bonus.title1),
      title2: str(bo.title2, base.bonus.title2),
      bombSound: bool(bo.bombSound, base.bonus.bombSound),
      openSoundUrl: /^(https?:\/\/[^\s]+)?$/i.test(str(bo.openSoundUrl, '', 2000))
        ? str(bo.openSoundUrl, base.bonus.openSoundUrl, 2000)
        : base.bonus.openSoundUrl,
      volume: Math.round(clamp(bo.volume, base.bonus.volume, 0, 100)),
    },
  };
};

/**
 * Empty bonus state.
 * @returns Fresh state.
 * @example const bonus = emptyBonusState();
 */
export const emptyBonusState = (): BonusState => ({
  bank: 0,
  endsAt: null,
  cooldownUntil: null,
  lockedPercent: null,
  goalLatchKey: '',
  startedAt: null,
});

/**
 * Reads a nullable number.
 * @param value Raw value.
 * @returns Number or `null`.
 * @example optNum(''); // null
 */
const optNum = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Builds a valid bonus state from stored data.
 * @param raw Stored value.
 * @returns Valid state.
 * @example sanitizeBonusState(stored.bonus);
 */
const sanitizeBonusState = (raw: unknown): BonusState => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    bank: Math.max(0, num(r.bank, 0)),
    endsAt: optNum(r.endsAt),
    cooldownUntil: optNum(r.cooldownUntil),
    lockedPercent: optNum(r.lockedPercent),
    goalLatchKey: typeof r.goalLatchKey === 'string' ? r.goalLatchKey : '',
    startedAt: optNum(r.startedAt),
  };
};

/**
 * Builds a valid timer state from stored data.
 * A timer that was running when the worker stopped comes back paused, so the
 * streamer decides when to resume (the desktop app also did not auto-start).
 * @param raw Stored value.
 * @param initial Fallback remaining seconds.
 * @returns Valid state.
 * @example sanitizeTimer(stored.timer, 3600);
 */
const sanitizeTimer = (raw: unknown, initial: number): TimerState => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const status = r.status === 'running' || r.status === 'paused' ? 'paused' : 'stopped';
  return {
    remaining: Math.max(0, num(r.remaining, initial)),
    status,
    blinkUntil: 0,
  };
};

/**
 * Validates one journal row.
 * @param raw Stored row.
 * @returns Row or `null` when unusable.
 * @example sanitizeDonation({ id: 'a', username: 'x', amount: 1, seconds: 1 });
 */
const sanitizeDonation = (raw: unknown): DonationEntry | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id) return null;
  const source = r.source === 'manual_time' || r.source === 'manual_amount' ? r.source : 'donation';
  return {
    id: r.id,
    username: str(r.username, 'Anonymous') || 'Anonymous',
    amount: num(r.amount, 0),
    currency: typeof r.currency === 'string' ? r.currency : '',
    originalAmount: optNum(r.originalAmount) ?? undefined,
    originalCurrency: typeof r.originalCurrency === 'string' ? r.originalCurrency : undefined,
    seconds: num(r.seconds, 0),
    timestamp: num(r.timestamp, Date.now()),
    source,
    platform: typeof r.platform === 'string' ? r.platform : undefined,
    bonusCounted: r.bonusCounted === true ? true : undefined,
  };
};

/**
 * Loads persisted data, filling defaults and repairing invalid fields.
 * @returns Valid data blob.
 * @example const db = loadData();
 */
export const loadData = (): PersistedData => {
  const raw = (storage.Read<Partial<PersistedData>>() ?? {}) as Partial<PersistedData>;
  const settings = sanitizeSettings(raw.settings, DEFAULT_SETTINGS);
  const donations = Array.isArray(raw.donations)
    ? raw.donations.map(sanitizeDonation).filter((d): d is DonationEntry => d !== null)
    : [];
  const strings = (value: unknown) =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

  return {
    version: DATA_VERSION,
    settings,
    timer: sanitizeTimer(raw.timer, settings.initialSeconds),
    donations,
    processedIds: strings(raw.processedIds).slice(-PROCESSED_IDS_LIMIT),
    widgetExcludedIds: strings(raw.widgetExcludedIds),
    bonus: sanitizeBonusState(raw.bonus),
    blinkBuffer: Array.isArray(raw.blinkBuffer) ? raw.blinkBuffer : [],
  };
};

/**
 * Live in-memory data; mutate it, then call {@link markDirty} or {@link flush}.
 * @example db.timer.remaining += 60; markDirty();
 */
export const db: PersistedData = loadData();

/** Pending throttled write handle. */
let saveTimer: number | null = null;

/**
 * Writes the data blob to `storage_data.json` right away.
 * @example flush();
 */
export const flush = () => {
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  db.processedIds = db.processedIds.slice(-PROCESSED_IDS_LIMIT);
  try {
    storage.Write<PersistedData>(db);
  } catch (error) {
    console.error('[donate-timer] storage write failed', error);
  }
};

/**
 * Schedules a write within a few seconds (coalesces timer ticks).
 * @param delayMs Maximum delay before the write.
 * @example markDirty();
 */
export const markDirty = (delayMs = 3000) => {
  if (saveTimer !== null) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    flush();
  }, delayMs);
};
