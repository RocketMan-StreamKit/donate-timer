/**
 * Bonus rate window — pure decisions ported from the desktop app `bonus_rate.py`.
 * All times are seconds since epoch (same as the widget payload).
 */
import { BONUS_PERCENT_CAP } from './constants';
import type { BonusSettings, BonusState, RateMode } from './types';

/**
 * Current time in epoch seconds.
 * @returns Seconds with fraction.
 * @example nowSec(); // 1763450000.123
 */
export const nowSec = () => Date.now() / 1000;

/**
 * True while a window is live.
 * @param state Bonus state.
 * @param now Epoch seconds.
 * @returns Whether `now` is before `endsAt`.
 * @example isActive(state, nowSec());
 */
export const isActive = (state: BonusState, now: number) =>
  state.endsAt !== null && now < state.endsAt;

/**
 * True when the settings allow a window to open.
 * @param cfg Bonus settings.
 * @returns Whether a window may open.
 * @example canOpen({ ...cfg, enabled: true, percent: 50 });
 */
export const canOpen = (cfg: BonusSettings) =>
  cfg.enabled &&
  cfg.percent > 0 &&
  cfg.percent <= BONUS_PERCENT_CAP &&
  cfg.durationMin >= 1 &&
  cfg.durationMax >= 1 &&
  cfg.durationMin <= cfg.durationMax;

/**
 * Validation message key for the control panel, or `null` when valid.
 * @param cfg Bonus settings.
 * @returns i18n key of the problem.
 * @example validationError({ ...cfg, percent: 900 }); // 'bonusErrPercent'
 */
export const validationError = (cfg: BonusSettings): string | null => {
  if (cfg.percent < 0 || cfg.percent > BONUS_PERCENT_CAP) return 'bonusErrPercent';
  if (cfg.durationMin < 1 || cfg.durationMax < 1) return 'bonusErrDuration';
  if (cfg.durationMin > cfg.durationMax) return 'bonusErrRange';
  if (cfg.cooldownMin < 0) return 'bonusErrCooldown';
  if (cfg.bankStep < 0 || cfg.whale < 0) return 'bonusErrAmounts';
  return null;
};

/**
 * Viewer benefit: more seconds per money unit. Percent 0 keeps the base rate.
 * @param base Base rate.
 * @param mode Rate mode.
 * @param percent Benefit percent.
 * @returns Effective rate in the same mode.
 * @example effectiveRate(10, 'amount_per_sec', 100); // 5
 */
export const effectiveRate = (base: number, mode: RateMode, percent: number) => {
  if (base <= 0 || percent <= 0) return base;
  const multiplier = 1 + percent / 100;
  return mode === 'sec_per_amount' ? base * multiplier : base / multiplier;
};

/**
 * Rate that applies right now (boosted only while a window is live).
 * @param state Bonus state.
 * @param cfg Bonus settings.
 * @param base Base rate.
 * @param mode Rate mode.
 * @param now Epoch seconds.
 * @returns Effective rate.
 * @example processorRate(state, cfg, 10, 'amount_per_sec', nowSec());
 */
export const processorRate = (
  state: BonusState,
  cfg: BonusSettings,
  base: number,
  mode: RateMode,
  now: number
) =>
  cfg.enabled && isActive(state, now) && state.lockedPercent
    ? effectiveRate(base, mode, state.lockedPercent)
    : base;

/**
 * The donation that opens the window keeps the rate from before it opened.
 * @param before Rate before the donation.
 * @param after Rate after the donation.
 * @param opened Whether this donation opened the window.
 * @returns Rate for this donation.
 * @example rateForDonation(10, 5, true); // 10
 */
export const rateForDonation = (before: number, after: number, opened: boolean) =>
  opened ? before : after;

/**
 * Builds the key that remembers which goal already opened a window.
 * @param startAt Goal start (ms epoch).
 * @param target Goal target.
 * @param start Goal starting amount.
 * @returns Latch key.
 * @example goalLatchKey(0, 1000, 0); // '0|1000.00|0.00'
 */
export const goalLatchKey = (startAt: number, target: number, start: number) =>
  `${startAt}|${target.toFixed(2)}|${start.toFixed(2)}`;

/**
 * Random integer in `[min, max]`.
 * @param min Lower bound.
 * @param max Upper bound.
 * @returns Integer.
 * @example randInt(5, 15);
 */
const randInt = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1));

/**
 * Opens a window of random length.
 * @param state Bonus state.
 * @param cfg Bonus settings.
 * @param now Epoch seconds.
 * @param consumeStep Subtract one bank step (bank trigger).
 * @param latchKey Goal latch to store, or `null` to keep.
 * @returns New state.
 * @example openWindow(state, cfg, nowSec(), true, null);
 */
const openWindow = (
  state: BonusState,
  cfg: BonusSettings,
  now: number,
  consumeStep: boolean,
  latchKey: string | null
): BonusState => {
  const minutes = randInt(Math.round(cfg.durationMin), Math.round(cfg.durationMax));
  const bank = Math.max(0, consumeStep ? state.bank - cfg.bankStep : state.bank);
  return {
    ...state,
    bank,
    endsAt: now + minutes * 60,
    cooldownUntil: null,
    lockedPercent: cfg.percent,
    goalLatchKey: latchKey ?? state.goalLatchKey,
    startedAt: now,
  };
};

/**
 * Closes a window whose end has passed. Cooldown starts at `endsAt`.
 * @param state Bonus state.
 * @param cfg Bonus settings.
 * @param now Epoch seconds.
 * @returns `[state, changed]`.
 * @example const [next, expired] = expireIfDue(state, cfg, nowSec());
 */
export const expireIfDue = (
  state: BonusState,
  cfg: BonusSettings,
  now: number
): [BonusState, boolean] => {
  if (state.endsAt === null || now < state.endsAt) return [state, false];
  return [
    {
      ...state,
      bank: 0,
      endsAt: null,
      lockedPercent: null,
      startedAt: null,
      cooldownUntil: state.endsAt + Math.max(0, cfg.cooldownMin) * 60,
    },
    true,
  ];
};

/**
 * Cuts a live window short. Cooldown starts now.
 * @param state Bonus state.
 * @param cfg Bonus settings.
 * @param now Epoch seconds.
 * @returns `[state, changed]`.
 * @example stopWindow(state, cfg, nowSec());
 */
export const stopWindow = (
  state: BonusState,
  cfg: BonusSettings,
  now: number
): [BonusState, boolean] => {
  if (!isActive(state, now)) return [state, false];
  return [
    {
      ...state,
      bank: 0,
      endsAt: null,
      lockedPercent: null,
      startedAt: null,
      cooldownUntil: now + Math.max(0, cfg.cooldownMin) * 60,
    },
    true,
  ];
};

/**
 * Tick: expires windows and closes a live one when the feature was turned off.
 * @param state Bonus state.
 * @param cfg Bonus settings.
 * @param now Epoch seconds.
 * @returns `[state, changed]`.
 * @example reconcile(state, cfg, nowSec());
 */
export const reconcile = (
  state: BonusState,
  cfg: BonusSettings,
  now: number
): [BonusState, boolean] => {
  const [expired, changed] = expireIfDue(state, cfg, now);
  if (!cfg.enabled && isActive(expired, now)) {
    return [stopWindow(expired, cfg, now)[0], true];
  }
  return [expired, changed];
};

/**
 * Applies one base-currency donation. Opens at most one window.
 * @param state Bonus state.
 * @param cfg Bonus settings.
 * @param input Donation amount, time and goal context.
 * @returns `[state, opened]`.
 * @example onDonation(state, cfg, { amount: 500, now: nowSec(), goalReached: false, goalKey: '' });
 */
export const onDonation = (
  state: BonusState,
  cfg: BonusSettings,
  input: { amount: number; now: number; goalReached: boolean; goalKey: string }
): [BonusState, boolean] => {
  const { amount, now, goalReached, goalKey } = input;
  let [next] = reconcile(state, cfg, now);
  if (amount <= 0 || !cfg.enabled) return [next, false];
  if (isActive(next, now)) return [next, false];
  next = { ...next, bank: next.bank + amount };
  const inCooldown = next.cooldownUntil !== null && now < next.cooldownUntil;
  if (inCooldown || !canOpen(cfg)) return [next, false];

  const whale = cfg.whale > 0 && amount >= cfg.whale;
  const bank = cfg.bankStep > 0 && next.bank >= cfg.bankStep;
  const goal = cfg.onGoal && goalReached && !!goalKey && next.goalLatchKey !== goalKey;
  if (!(whale || bank || goal)) return [next, false];

  const consumeStep = bank && !whale && !goal;
  return [openWindow(next, cfg, now, consumeStep, goal ? goalKey : null), true];
};

/**
 * Opens a window by hand.
 * @param state Bonus state.
 * @param cfg Bonus settings.
 * @param now Epoch seconds.
 * @returns `[state, opened]`.
 * @example manualStart(state, cfg, nowSec());
 */
export const manualStart = (
  state: BonusState,
  cfg: BonusSettings,
  now: number
): [BonusState, boolean] => {
  const [next] = reconcile(state, cfg, now);
  if (isActive(next, now) || !canOpen(cfg)) return [next, false];
  return [openWindow(next, cfg, now, false, null), true];
};

/**
 * Removes one donation from the bank (never below zero; live window untouched).
 * @param state Bonus state.
 * @param amount Amount to subtract.
 * @returns New state.
 * @example subtractBank(state, 100);
 */
export const subtractBank = (state: BonusState, amount: number): BonusState =>
  amount > 0 ? { ...state, bank: Math.max(0, state.bank - amount) } : state;

/**
 * Seconds added for one money unit at the given bonus percent.
 * @param base Base rate.
 * @param mode Rate mode.
 * @param percent Bonus percent.
 * @returns Seconds per unit.
 * @example secondsPerUnit(10, 'amount_per_sec', 0); // 0.1
 */
export const secondsPerUnit = (base: number, mode: RateMode, percent: number) => {
  const eff = effectiveRate(base, mode, percent);
  if (eff <= 0) return 0;
  return mode === 'sec_per_amount' ? eff : 1 / eff;
};

/**
 * Whole number when already whole, otherwise one decimal.
 * @param seconds Value.
 * @returns Label.
 * @example formatSecondsLabel(2.5); // '2.5'
 */
export const formatSecondsLabel = (seconds: number) => {
  const nearest = Math.round(seconds);
  return Math.abs(seconds - nearest) < 0.05 ? String(nearest) : seconds.toFixed(1);
};

/**
 * Countdown sound offset: the clip's audible hit lands near the widget explosion.
 * `bomb_timer.mp3` is 50.14 s long; playback starts when this many seconds remain.
 * @example if (left <= BOMB_START_AT) audio.currentTime = BOMB_START_AT - left;
 */
export const BOMB_START_AT = 45.1 - 0.25;
