import { MARATHON_COLOR_ACCENTS } from './constants';
import { baseCurrency } from './currency';
import { hms, localStamp, oneLine } from './format';
import { db } from './store';
import type { AlertColor, DonationEntry, MarathonAccent } from './types';

/**
 * Journal rows that count as money in the base currency.
 * @param rows Journal rows.
 * @returns Rows with a positive base-currency amount.
 * @example moneyRows(db.donations);
 */
export const moneyRows = (rows: DonationEntry[]) => {
  const code = baseCurrency();
  return rows.filter(row => row.currency === code && row.amount > 0);
};

/**
 * Journal rows at or after a moment (all rows when `startAt` is 0).
 * @param rows Journal rows.
 * @param startAt Epoch ms (0 = no filter).
 * @returns Filtered rows.
 * @example since(db.donations, db.settings.marathon.startAt);
 */
export const since = (rows: DonationEntry[], startAt: number) =>
  startAt > 0 ? rows.filter(row => row.timestamp >= startAt) : rows;

/**
 * Journal rows still visible to widget statistics after "Clear widgets".
 * @returns Visible rows.
 * @example widgetRows().length;
 */
export const widgetRows = () => {
  if (!db.widgetExcludedIds.length) return db.donations;
  const hidden = new Set(db.widgetExcludedIds);
  return db.donations.filter(row => !hidden.has(row.id));
};

/**
 * Seconds since the marathon start (0 when the start is not set or in the future).
 * @param now Epoch ms.
 * @returns On-air seconds.
 * @example onAirSeconds(Date.now());
 */
export const onAirSeconds = (now = Date.now()) => {
  const start = db.settings.marathon.startAt;
  return start > 0 ? Math.max(0, Math.floor((now - start) / 1000)) : 0;
};

/**
 * Sums amounts of rows.
 * @param rows Journal rows.
 * @returns Total amount.
 * @example sum(moneyRows(db.donations));
 */
const sum = (rows: DonationEntry[]) => rows.reduce((acc, row) => acc + row.amount, 0);

/**
 * Marathon statistics for the control panel (whole journal since the marathon start).
 * @returns Gross, net and count.
 * @example const { gross, net } = marathonStats();
 */
export const marathonStats = () => {
  const rows = moneyRows(since(db.donations, db.settings.marathon.startAt));
  const gross = sum(rows);
  return {
    gross,
    net: gross * (1 - db.settings.marathon.commissionPercent / 100),
    count: rows.length,
  };
};

/**
 * Widget totals: marathon sum and Top-6 (inline and list forms).
 * @returns Values for `total_donations_rub.txt`, `top5_marathon_inline.txt`, `top5_marathon_list.txt`.
 * @example const { total, inline } = widgetTotals();
 */
export const widgetTotals = () => {
  const rows = moneyRows(since(widgetRows(), db.settings.marathon.startAt));
  const total = sum(rows);
  const byUser = new Map<string, number>();
  for (const row of rows) {
    const name = row.username.trim();
    if (!name) continue;
    byUser.set(name, (byUser.get(name) ?? 0) + row.amount);
  }
  const top = [...byUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  let denom = total;
  if (denom <= 0) denom = [...byUser.values()].reduce((a, b) => a + b, 0);
  const lines = top.map(([name, amount]) => {
    const pct = denom > 0 ? (amount / denom) * 100 : 0;
    return `${name} - ${pct.toFixed(1).replace('.', ',')}%`;
  });
  return {
    total,
    inline: lines.length ? lines.join(' | ') : '—',
    list: lines.length ? lines.join('\n') : '—',
  };
};

/**
 * Donation goal amounts (journal since the goal start; widget exclusions ignored).
 * @returns Collected and current amounts.
 * @example goalProgress().current;
 */
export const goalProgress = () => {
  const { goal } = db.settings;
  const collected = goal.startAt > 0 ? sum(moneyRows(since(db.donations, goal.startAt))) : 0;
  return { collected, current: Math.max(0, goal.start + collected) };
};

/**
 * Amount rounded for the goal widget (integers unless cents are present).
 * @param value Amount.
 * @returns Rounded number.
 * @example goalNumber(12.0); // 12
 */
const goalNumber = (value: number) => Math.round(Math.max(0, value) * 100) / 100;

/**
 * `donation_goal.json` payload.
 * @returns Widget JSON object.
 * @example JSON.stringify(goalPayload());
 */
export const goalPayload = () => {
  const { goal } = db.settings;
  const { collected, current } = goalProgress();
  return {
    enabled: goal.enabled,
    title: goal.title,
    goal_rub: goalNumber(goal.target),
    start_rub: goalNumber(goal.start),
    current_rub: goalNumber(current),
    collected_rub: goalNumber(collected),
    start_datetime: goal.startAt > 0 ? localStamp(goal.startAt) : '',
    track_opacity_percent: goal.trackOpacity,
    fill_opacity_percent: goal.fillOpacity,
  };
};

/** Last published time-goal need (smoothing state). */
let lastNeed: number | null = null;
/** Last published time-goal text. */
let lastGoalText = '';

/**
 * `marathon_time_goal.txt` content: `T\t<title>: HH:MM:SS`, `D\t<done>` or empty.
 * A one-second drift between the on-air clock and the countdown is ignored, as in the desktop app.
 * @param remaining Timer remaining seconds.
 * @param force Publish a fresh value without smoothing.
 * @returns Widget text.
 * @example timeGoalText(db.timer.remaining);
 */
export const timeGoalText = (remaining: number, force = false) => {
  const tg = db.settings.timeGoal;
  if (!tg.enabled || !/^\d+$/.test(tg.hours)) {
    lastNeed = null;
    lastGoalText = '';
    return '';
  }
  let need = Math.max(
    0,
    Number(tg.hours) * 3600 - onAirSeconds() - Math.max(0, Math.floor(remaining))
  );
  if (!force && need !== 0 && lastNeed !== null) {
    if (lastNeed === 0 && need <= 1) need = 0;
    else if (Math.abs(need - lastNeed) <= 1) need = lastNeed;
  }
  lastNeed = need;
  const done = oneLine(tg.done);
  if (need === 0 && done) {
    lastGoalText = `D\t${done}`;
  } else {
    const label = oneLine(tg.title);
    lastGoalText = `T\t${label ? `${label}: ` : ''}${hms(need)}`;
  }
  return lastGoalText;
};

/**
 * Deterministic 32-bit PRNG seeded by an integer.
 * @param seed Seed value.
 * @returns Function returning floats in `[0, 1)`.
 * @example const rnd = mulberry32(42); rnd();
 */
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Random accent for a local hour; never repeats the previous hour's color.
 * Stable across restarts because it is derived from the calendar hour.
 * @param date Moment inside the hour.
 * @returns Concrete accent.
 * @example randomAccentFor(new Date());
 */
const randomAccentFor = (date: Date) => {
  const colors = MARATHON_COLOR_ACCENTS;
  const hourMs = 3_600_000;
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
  let prev: string | null = null;
  let pick: string = colors[0];
  for (let t = end - 48 * hourMs; t <= end; t += hourMs) {
    const d = new Date(t);
    const seed = d.getFullYear() * 1_000_000 + (d.getMonth() + 1) * 10_000 + d.getDate() * 100 + d.getHours();
    const rnd = mulberry32(seed);
    pick = colors[Math.floor(rnd() * colors.length)];
    if (prev !== null && pick === prev) {
      const rest = colors.filter(c => c !== prev);
      pick = rest[Math.floor(rnd() * rest.length)];
    }
    prev = pick;
  }
  return pick;
};

/**
 * Concrete accent written to `marathon_widget_accent.txt`.
 * @returns Accent color name.
 * @example effectiveAccent(); // 'orange'
 */
export const effectiveAccent = (): Exclude<MarathonAccent, 'random'> => {
  const accent = db.settings.marathon.accent;
  return accent === 'random'
    ? (randomAccentFor(new Date()) as Exclude<MarathonAccent, 'random'>)
    : accent;
};

/**
 * Alert plate color for an amount.
 * @param amount Base-currency amount.
 * @returns Plate color.
 * @example alertColor(600); // 'red' with default thresholds enabled
 */
export const alertColor = (amount: number): AlertColor => {
  const cl = db.settings.colorLevels;
  if (!cl.enabled) return 'black';
  if (amount >= cl.red) return 'red';
  if (amount >= cl.green) return 'green';
  if (amount >= cl.purple) return 'purple';
  if (amount >= cl.blue) return 'blue';
  return 'black';
};
