/**
 * Timer engine: countdown, donation application, blink buffer, manual actions and bonus windows.
 * Behaviour follows the desktop Donate Timer (`donate_timer.py`).
 */
import {
  canOpen,
  goalLatchKey,
  isActive,
  manualStart,
  nowSec,
  onDonation,
  processorRate,
  rateForDonation,
  reconcile,
  stopWindow,
  subtractBank,
  validationError,
} from './bonus';
import { ALERT_TTL_MS, CLEAR_SIGNAL_MS } from './constants';
import { baseCurrency, toBase } from './currency';
import { grantText } from './format';
import { alertColor, goalProgress } from './stats';
import { cloneJson, db, flush, markDirty, sanitizeSettings } from './store';
import type {
  AlertColor,
  AlertState,
  BonusState,
  BufferedDonation,
  DonateTimerSettings,
  DonationEntry,
} from './types';

/** Result of a control-panel action. */
export type ActionResult = { success: true } | { success: false; error: string };

/**
 * Success result.
 * @example return ok();
 */
const ok = (): ActionResult => ({ success: true });

/**
 * Failure result with an i18n key.
 * @param error i18n key understood by the control panel.
 * @example return fail('timerZero');
 */
const fail = (error: string): ActionResult => ({ success: false, error });

/** Last alert for the timer widgets. */
let alert: AlertState | null = null;
/** `__CLEAR__` signal deadline (ms epoch). */
let clearSignalUntil = 0;
/** Listener notified after any state change. */
let changeListener: (() => void) | null = null;
/** Last tick moment used to subtract real elapsed time. */
let lastTickAt = Date.now();
/** Serializes async donation processing so totals stay ordered. */
let queue: Promise<unknown> = Promise.resolve();

/**
 * Registers the listener that pushes snapshots to widgets.
 * @param listener Callback.
 * @example setChangeListener(() => broadcast());
 */
export const setChangeListener = (listener: () => void) => {
  changeListener = listener;
};

/**
 * Notifies the change listener.
 * @example changed();
 */
const changed = () => {
  changeListener?.();
};

/**
 * Current alert for widgets: `nick|+text|id|color`, `__CLEAR__`, or empty.
 * @returns `donation_alert.txt` content.
 * @example alertText(); // 'Bob|+1м|1763450000000|blue'
 */
export const alertText = () => {
  const now = Date.now();
  if (now < clearSignalUntil) return '__CLEAR__';
  if (!alert || now - alert.at > ALERT_TTL_MS) return '';
  return `${alert.nick}|+${alert.text}|${alert.id}|${alert.color}`;
};

/**
 * Publishes a new alert.
 * @param nick Donor name.
 * @param seconds Granted seconds.
 * @param color Plate color.
 * @example showAlert('Bob', 90, 'blue');
 */
const showAlert = (nick: string, seconds: number, color: AlertColor) => {
  const at = Date.now();
  clearSignalUntil = 0;
  alert = { id: String(at), nick, text: grantText(seconds), color, at };
};

/**
 * Asks widgets to dismiss the visible alert.
 * @example signalClearAlert();
 */
const signalClearAlert = () => {
  alert = null;
  clearSignalUntil = Date.now() + CLEAR_SIGNAL_MS;
};

/**
 * True while the "time is up" blink is running.
 * @returns Blink flag.
 * @example if (isBlinking()) return;
 */
export const isBlinking = () => db.timer.blinkUntil > Date.now();

/**
 * Rate that applies to a donation right now (bonus aware).
 * @returns Effective rate.
 * @example rateInEffect(); // 10
 */
export const rateInEffect = () =>
  processorRate(db.bonus, db.settings.bonus, db.settings.rate, db.settings.rateMode, nowSec());

/**
 * Seconds bought by an amount at a rate.
 * @param amount Base-currency amount.
 * @param rate Rate in the configured mode.
 * @returns Seconds.
 * @example secondsFor(100, 10); // 10 (amount_per_sec)
 */
const secondsFor = (amount: number, rate: number) => {
  if (db.settings.rateMode === 'sec_per_amount') return amount * rate;
  return rate > 0 ? amount / rate : 0;
};

/**
 * Stores a new bonus state; clears the idle preview once a real window is live.
 * @param next New bonus state.
 * @returns Whether a window just opened.
 * @example commitBonus(nextState);
 */
const commitBonus = (next: BonusState) => {
  const now = nowSec();
  const cfg = db.settings.bonus;
  const wasLive = cfg.enabled && isActive(db.bonus, now);
  db.bonus = next;
  const live = cfg.enabled && isActive(next, now);
  if (live && cfg.showObs) cfg.showObs = false;
  markDirty();
  return live && !wasLive;
};

/**
 * Feeds a base-currency donation into the bonus bank.
 * @param entry Journal entry (amount already converted).
 * @returns `[countedInBank, openedWindow]`.
 * @example const [counted, opened] = considerBonus(entry);
 */
const considerBonus = (
  entry: Pick<DonationEntry, 'amount' | 'currency' | 'timestamp'>
): [boolean, boolean] => {
  if (entry.currency !== baseCurrency() || entry.amount <= 0) return [false, false];
  const cfg = db.settings.bonus;
  const now = nowSec();
  const wasLive = isActive(db.bonus, now);
  const { goal } = db.settings;
  let reached = false;
  let key = '';
  if (goal.enabled && goal.target > 0) {
    const counts = goal.startAt > 0 && entry.timestamp >= goal.startAt;
    const current = goalProgress().current + (counts ? entry.amount : 0);
    reached = current >= goal.target;
    key = goalLatchKey(goal.startAt, goal.target, goal.start);
  }
  const [next, opened] = onDonation(db.bonus, cfg, {
    amount: entry.amount,
    now,
    goalReached: reached,
    goalKey: key,
  });
  commitBonus(next);
  return [cfg.enabled && !wasLive, opened];
};

/**
 * Remembers a processed dashboard record id.
 * @param id Record id.
 * @example rememberId('abc');
 */
const rememberId = (id: string) => {
  if (!db.processedIds.includes(id)) db.processedIds.push(id);
};

/**
 * Adds seconds to the timer, never going below zero.
 * @param seconds Delta.
 * @example shiftTimer(-60);
 */
const shiftTimer = (seconds: number) => {
  db.timer.remaining = Math.max(0, db.timer.remaining + seconds);
};

/**
 * Applies a journal entry: bonus, seconds, timer, journal and alert.
 * While blinking the entry is buffered instead.
 * @param item Entry with optional fixed seconds.
 * @returns Stored entry or `null` when nothing was added.
 * @example applyEntry({ entry, journal: true });
 */
const applyEntry = (item: BufferedDonation): DonationEntry | null => {
  if (isBlinking()) {
    db.blinkBuffer.push(cloneJson(item));
    flush();
    return null;
  }
  const { entry } = item;
  if (item.journal === false) {
    shiftTimer(item.fixedSeconds ?? 0);
    markDirty();
    return null;
  }

  let seconds: number;
  let bonusCounted = false;
  if (item.fixedSeconds !== undefined) {
    seconds = item.fixedSeconds;
  } else {
    const before = rateInEffect();
    const [counted, opened] = considerBonus(entry);
    bonusCounted = counted;
    seconds = secondsFor(entry.amount, rateForDonation(before, rateInEffect(), opened));
  }
  if (!(seconds > 0)) return null;

  const stored: DonationEntry = { ...entry, seconds, ...(bonusCounted ? { bonusCounted } : {}) };
  shiftTimer(seconds);
  db.donations.push(stored);
  showAlert(
    stored.username,
    seconds,
    stored.source === 'manual_time' ? 'black' : alertColor(stored.amount)
  );
  flush();
  return stored;
};

/**
 * Builds a fresh journal entry skeleton.
 * @param fields Entry fields.
 * @returns Entry without seconds.
 * @example newEntry({ id: 'x', username: 'Bob', amount: 100, source: 'manual_amount' });
 */
const newEntry = (
  fields: Pick<DonationEntry, 'id' | 'username' | 'amount' | 'source'> &
    Partial<Pick<DonationEntry, 'currency' | 'originalAmount' | 'originalCurrency' | 'platform'>>
): BufferedDonation['entry'] => ({
  currency: baseCurrency(),
  timestamp: Date.now(),
  ...fields,
  username: fields.username.trim() || 'Anonymous',
});

/**
 * Handles an incoming dashboard donation record.
 * @param input Record data.
 * @returns Promise resolved once the donation is applied or skipped.
 * @example await handleDonation({ id: 'r1', username: 'Bob', amount: 5, currency: 'USD', platform: 'donationalerts' });
 */
export const handleDonation = (input: {
  id: string;
  username: string;
  amount: number;
  currency: string;
  platform?: string;
}) => {
  const job = queue.then(async () => {
    if (!input.id || db.processedIds.includes(input.id) || !(input.amount > 0)) return;
    rememberId(input.id);
    const converted = await toBase(input.amount, input.currency);
    if (converted === null) {
      console.warn('[donate-timer] skipped donation: no exchange rate', input);
      notify.Send({
        id: 'donate-timer-currency',
        type: 'warning',
        title: { en: 'Donate Timer', ru: 'Донат-таймер', uk: 'Донат-таймер' },
        message: {
          en: `Cannot convert ${input.currency} to ${baseCurrency()}; the donation did not add time.`,
          ru: `Не удалось перевести ${input.currency} в ${baseCurrency()}; донат не добавил время.`,
          uk: `Не вдалося перевести ${input.currency} у ${baseCurrency()}; донат не додав час.`,
        },
        temp: true,
      });
      flush();
      return;
    }
    const sameCurrency = input.currency.toUpperCase() === baseCurrency();
    applyEntry({
      entry: newEntry({
        id: input.id,
        username: input.username,
        amount: converted,
        source: 'donation',
        platform: input.platform,
        ...(sameCurrency ? {} : { originalAmount: input.amount, originalCurrency: input.currency }),
      }),
    });
    changed();
  });
  queue = job.catch(error => console.error('[donate-timer] donation failed', error));
  return queue;
};

/**
 * Ends the blink: applies buffered donations and restarts the timer when time was added.
 * @example endBlink();
 */
const endBlink = () => {
  db.timer.blinkUntil = 0;
  const buffered = db.blinkBuffer;
  db.blinkBuffer = [];
  for (const item of buffered) applyEntry(item);
  if (db.timer.remaining > 0) {
    db.timer.status = 'running';
    lastTickAt = Date.now();
  }
  flush();
  changed();
};

/**
 * Handles the countdown reaching zero.
 * @example finishTimer();
 */
const finishTimer = () => {
  db.timer.remaining = 0;
  db.timer.status = 'stopped';
  signalClearAlert();
  notify.Send({
    id: 'donate-timer-finished',
    type: 'warning',
    title: { en: 'Donate Timer', ru: 'Донат-таймер', uk: 'Донат-таймер' },
    message: { en: 'Time is up!', ru: 'Время истекло!', uk: 'Час вийшов!' },
    temp: true,
  });
  if (db.settings.blinkSeconds > 0) {
    db.timer.blinkUntil = Date.now() + db.settings.blinkSeconds * 1000;
    flush();
  } else {
    endBlink();
  }
};

/** Last whole second published to widgets. */
let lastShownSecond = -1;

/**
 * Periodic tick: counts down, ends the blink, expires bonus windows.
 * Pushes a snapshot when the visible second or any state changes.
 * @example setInterval(tick, 250);
 */
export const tick = () => {
  const now = Date.now();
  const elapsed = Math.max(0, (now - lastTickAt) / 1000);
  lastTickAt = now;
  let dirty = false;

  if (db.timer.status === 'running' && !isBlinking()) {
    db.timer.remaining = Math.max(0, db.timer.remaining - elapsed);
    markDirty();
    if (db.timer.remaining <= 0) {
      finishTimer();
      dirty = true;
    }
  }
  if (db.timer.blinkUntil > 0 && now >= db.timer.blinkUntil) {
    endBlink();
    dirty = true;
  }
  const [bonus, bonusChanged] = reconcile(db.bonus, db.settings.bonus, now / 1000);
  if (bonusChanged) {
    commitBonus(bonus);
    dirty = true;
  }
  const second = Math.floor(now / 1000);
  if (dirty || second !== lastShownSecond) {
    lastShownSecond = second;
    changed();
  }
};

/**
 * Starts or resumes the countdown.
 * @returns Action result.
 * @example startTimer();
 */
export const startTimer = (): ActionResult => {
  if (isBlinking()) return fail('blinking');
  if (db.timer.remaining <= 0) return fail('timerZero');
  if (!(db.settings.rate > 0)) return fail('rateZero');
  db.timer.status = 'running';
  lastTickAt = Date.now();
  flush();
  changed();
  return ok();
};

/**
 * Toggles pause while the timer runs.
 * @returns Action result.
 * @example pauseTimer();
 */
export const pauseTimer = (): ActionResult => {
  if (db.timer.status === 'running') db.timer.status = 'paused';
  else if (db.timer.status === 'paused') {
    db.timer.status = 'running';
    lastTickAt = Date.now();
  } else return fail('notRunning');
  flush();
  changed();
  return ok();
};

/**
 * Stops the timer and restores the initial time (buffered blink donations are kept in the journal).
 * @returns Action result.
 * @example resetTimer();
 */
export const resetTimer = (): ActionResult => {
  if (db.timer.blinkUntil > 0) {
    db.timer.blinkUntil = 0;
    const buffered = db.blinkBuffer;
    db.blinkBuffer = [];
    for (const item of buffered) applyEntry(item);
  }
  db.timer.status = 'stopped';
  db.timer.remaining = db.settings.initialSeconds;
  flush();
  changed();
  return ok();
};

/**
 * Sets the remaining time directly.
 * @param seconds New remaining seconds.
 * @returns Action result.
 * @example setRemaining(7200);
 */
export const setRemaining = (seconds: number): ActionResult => {
  if (!Number.isFinite(seconds) || seconds < 0) return fail('invalidTime');
  db.timer.remaining = Math.floor(seconds);
  flush();
  changed();
  return ok();
};

/**
 * Adds or subtracts time without a journal row (quick buttons, custom time).
 * @param seconds Delta in seconds.
 * @returns Action result.
 * @example addTime(-300);
 */
export const addTime = (seconds: number): ActionResult => {
  if (!Number.isFinite(seconds) || seconds === 0) return fail('invalidTime');
  applyEntry({
    entry: newEntry({ id: `adj_${Date.now()}`, username: '', amount: 0, source: 'manual_time' }),
    fixedSeconds: seconds,
    journal: false,
  });
  changed();
  return ok();
};

/**
 * Adds time credited to a nickname (journal row and alert, no money).
 * @param seconds Seconds to add (positive).
 * @param username Donor name.
 * @returns Action result.
 * @example addTimeWithName(600, 'Bob');
 */
export const addTimeWithName = (seconds: number, username: string): ActionResult => {
  if (!(seconds > 0) || !username.trim()) return fail('timeAndName');
  applyEntry({
    entry: newEntry({ id: `manual_${Date.now()}`, username, amount: 0, source: 'manual_time' }),
    fixedSeconds: seconds,
  });
  changed();
  return ok();
};

/**
 * Adds a donation by amount for a nickname (bonus aware, like a real donation).
 * @param amount Base-currency amount.
 * @param username Donor name.
 * @returns Action result.
 * @example addAmountWithName(500, 'Bob');
 */
export const addAmountWithName = (amount: number, username: string): ActionResult => {
  if (!(amount > 0) || !username.trim()) return fail('amountAndName');
  if (!isBlinking() && !(secondsFor(amount, rateInEffect()) > 0)) return fail('rateZero');
  applyEntry({
    entry: newEntry({ id: `manual_amount_${Date.now()}`, username, amount, source: 'manual_amount' }),
  });
  changed();
  return ok();
};

/**
 * Removes the newest journal row and takes its time back.
 * @returns Action result.
 * @example removeLastDonation();
 */
export const removeLastDonation = (): ActionResult => {
  const removed = db.donations.pop();
  if (!removed) return fail('journalEmpty');
  shiftTimer(-removed.seconds);
  if (removed.bonusCounted) commitBonus(subtractBank(db.bonus, removed.amount));
  db.widgetExcludedIds = db.widgetExcludedIds.filter(id => id !== removed.id);
  flush();
  changed();
  return ok();
};

/**
 * Clears the journal (processed ids stay, so donations are not counted twice).
 * @returns Action result.
 * @example clearHistory();
 */
export const clearHistory = (): ActionResult => {
  db.donations = [];
  db.widgetExcludedIds = [];
  signalClearAlert();
  flush();
  changed();
  return ok();
};

/**
 * Hides current journal rows from widget totals, Top-6 and last donation; the journal stays.
 * @returns Action result.
 * @example clearWidgets();
 */
export const clearWidgets = (): ActionResult => {
  db.widgetExcludedIds = db.donations.map(row => row.id);
  signalClearAlert();
  flush();
  changed();
  return ok();
};

/**
 * Opens a bonus window by hand.
 * @returns Action result.
 * @example bonusStart();
 */
export const bonusStart = (): ActionResult => {
  const cfg = db.settings.bonus;
  const error = validationError(cfg);
  if (error) return fail(error);
  if (!canOpen(cfg)) return fail('bonusCannotOpen');
  const [next, opened] = manualStart(db.bonus, cfg, nowSec());
  if (!opened) return fail('bonusAlreadyLive');
  commitBonus(next);
  flush();
  changed();
  return ok();
};

/**
 * Cuts the live bonus window short.
 * @returns Action result.
 * @example bonusStop();
 */
export const bonusStop = (): ActionResult => {
  const [next, stopped] = stopWindow(db.bonus, db.settings.bonus, nowSec());
  if (stopped) {
    commitBonus(next);
    flush();
    changed();
  }
  return ok();
};

/**
 * Empties the bonus bank.
 * @returns Action result.
 * @example bonusResetBank();
 */
export const bonusResetBank = (): ActionResult => {
  commitBonus({ ...db.bonus, bank: 0 });
  flush();
  changed();
  return ok();
};

/**
 * Ends the bonus cooldown.
 * @returns Action result.
 * @example bonusResetCooldown();
 */
export const bonusResetCooldown = (): ActionResult => {
  commitBonus({ ...db.bonus, cooldownUntil: null });
  flush();
  changed();
  return ok();
};

/** One-shot flag: the next snapshot recalculates the time goal without smoothing. */
let timeGoalForce = false;

/**
 * Asks the next snapshot to recalculate the time goal from scratch.
 * @returns Action result.
 * @example timeGoalReset();
 */
export const timeGoalReset = (): ActionResult => {
  timeGoalForce = true;
  changed();
  return ok();
};

/**
 * Consumes the one-shot time-goal reset flag.
 * @returns Whether the next calculation must skip smoothing.
 * @example const force = takeTimeGoalForce();
 */
export const takeTimeGoalForce = () => {
  const force = timeGoalForce;
  timeGoalForce = false;
  return force;
};

/**
 * Merges and validates settings from the control panel.
 * @param patch Partial settings.
 * @returns Action result (bonus validation errors are reported).
 * @example updateSettings({ rate: 5 });
 */
export const updateSettings = (patch: Partial<DonateTimerSettings>): ActionResult => {
  const next = sanitizeSettings(
    { ...cloneJson(db.settings), ...patch } as DonateTimerSettings,
    db.settings
  );
  const error = validationError(next.bonus);
  if (error) return fail(error);
  if (next.goal.enabled && next.goal.startAt === 0) next.goal.startAt = Date.now();
  if (next.bonus.enabled && isActive(db.bonus, nowSec())) next.bonus.showObs = false;
  db.settings = next;
  const [bonus] = reconcile(db.bonus, next.bonus, nowSec());
  commitBonus(bonus);
  flush();
  changed();
  return ok();
};
