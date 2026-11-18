/**
 * Shared types for the Donate Timer worker and its control panel.
 */

/**
 * How the donation rate is interpreted.
 * - `amount_per_sec` — how much money buys one second (original `rur_per_sec`).
 * - `sec_per_amount` — how many seconds one money unit buys (original `sec_per_rur`).
 */
export type RateMode = 'amount_per_sec' | 'sec_per_amount';

/** Timer run state. */
export type TimerStatus = 'stopped' | 'running' | 'paused';

/** Accent palettes used by marathon widgets (`random` re-rolls every local hour). */
export type MarathonAccent =
  | 'orange'
  | 'purple'
  | 'green'
  | 'blue'
  | 'red'
  | 'pink'
  | 'yellow'
  | 'lime'
  | 'navy'
  | 'gray'
  | 'random';

/** Alert plate color picked by donation amount. */
export type AlertColor = 'black' | 'blue' | 'purple' | 'green' | 'red';

/** Amount thresholds that pick the alert plate color. */
export type ColorLevels = {
  /** When false every alert uses the black plate. */
  enabled: boolean;
  /** Minimum amount for the blue plate. */
  blue: number;
  /** Minimum amount for the purple plate. */
  purple: number;
  /** Minimum amount for the green plate. */
  green: number;
  /** Minimum amount for the red plate. */
  red: number;
};

/** Donation goal (progress bar widget). */
export type DonationGoalSettings = {
  /** Shows the goal widget. */
  enabled: boolean;
  /** Goal title shown above the bar. */
  title: string;
  /** Target amount in the base currency. */
  target: number;
  /** Amount already collected before tracking started. */
  start: number;
  /** Only donations at or after this moment count (ms epoch, 0 = not set). */
  startAt: number;
  /** Track (background) opacity, 0–100. */
  trackOpacity: number;
  /** Fill opacity, 0–100. */
  fillOpacity: number;
};

/** Marathon statistics settings. */
export type MarathonSettings = {
  /** Marathon start (ms epoch, 0 = whole history, on-air counter stays at zero). */
  startAt: number;
  /** Platform commission percent used for the net amount. */
  commissionPercent: number;
  /** Widget accent palette. */
  accent: MarathonAccent;
};

/** Marathon total-duration goal. */
export type TimeGoalSettings = {
  /** Shows the goal line in the Top widget. */
  enabled: boolean;
  /** Goal duration in whole hours (digits only, empty = not set). */
  hours: string;
  /** Label shown before the countdown. */
  title: string;
  /** Text shown once the goal is reached (empty keeps `00:00:00`). */
  done: string;
};

/** Bonus rate window settings (port of `BonusConfig`). */
export type BonusSettings = {
  /** Feature switch. */
  enabled: boolean;
  /** Shows an idle preview of the widget while no window is live. */
  showObs: boolean;
  /** Viewer benefit percent (0–500). */
  percent: number;
  /** Window length lower bound, minutes. */
  durationMin: number;
  /** Window length upper bound, minutes. */
  durationMax: number;
  /** Cooldown after a window, minutes. */
  cooldownMin: number;
  /** Bank amount that opens a window (0 = off). */
  bankStep: number;
  /** Single donation that opens a window (0 = off). */
  whale: number;
  /** Opens a window once when the donation goal is reached. */
  onGoal: boolean;
  /** First widget title line. */
  title1: string;
  /** Second widget title line. */
  title2: string;
  /** Plays the countdown bomb sound in the bonus widget. */
  bombSound: boolean;
  /** Optional sound URL played in the bonus widget when a window opens. */
  openSoundUrl: string;
  /** Widget sound volume, 0–100. */
  volume: number;
};

/** Every user-editable setting of the addon. */
export type DonateTimerSettings = {
  /** Base currency (`app` follows the StreamKit+ main currency). */
  currency: string;
  /** Donation rate value (see {@link RateMode}). */
  rate: number;
  /** How {@link DonateTimerSettings.rate} is interpreted. */
  rateMode: RateMode;
  /** Timer value used by Reset, seconds. */
  initialSeconds: number;
  /** Title shown in widgets. */
  title: string;
  /** How long the "time is up" blink lasts, seconds. */
  blinkSeconds: number;
  /** Alert plate thresholds. */
  colorLevels: ColorLevels;
  /** Donation goal. */
  goal: DonationGoalSettings;
  /** Marathon statistics. */
  marathon: MarathonSettings;
  /** Marathon time goal. */
  timeGoal: TimeGoalSettings;
  /** Bonus rate window. */
  bonus: BonusSettings;
};

/** Origin of a journal entry. */
export type DonationSource = 'donation' | 'manual_time' | 'manual_amount';

/** One row of the donation journal. */
export type DonationEntry = {
  /** Unique id (dashboard record id or generated for manual rows). */
  id: string;
  /** Donor name (`Anonymous` placeholder when empty). */
  username: string;
  /** Amount in {@link DonationEntry.currency}. */
  amount: number;
  /** Currency code of {@link DonationEntry.amount} (base currency when converted). */
  currency: string;
  /** Amount before conversion. */
  originalAmount?: number;
  /** Currency before conversion. */
  originalCurrency?: string;
  /** Seconds added to the timer. */
  seconds: number;
  /** Moment the entry was stored (ms epoch). */
  timestamp: number;
  /** Where the entry came from. */
  source: DonationSource;
  /** Dashboard platform id for real donations. */
  platform?: string;
  /** Amount went into the bonus bank (subtracted again on removal). */
  bonusCounted?: boolean;
};

/** Donation received while the timer blinks; applied once the blink ends. */
export type BufferedDonation = {
  /** Journal entry data before seconds are calculated. */
  entry: Omit<DonationEntry, 'seconds' | 'bonusCounted'>;
  /** Fixed seconds for manual time rows (amount-based rows recalculate). */
  fixedSeconds?: number;
  /** `false` for anonymous quick adjustments that never reach the journal. */
  journal?: boolean;
};

/** Bonus window runtime state (seconds epoch, same as the Python app). */
export type BonusState = {
  /** Money collected toward {@link BonusSettings.bankStep}. */
  bank: number;
  /** Live window end (seconds epoch). */
  endsAt: number | null;
  /** Cooldown end (seconds epoch). */
  cooldownUntil: number | null;
  /** Percent frozen when the window opened. */
  lockedPercent: number | null;
  /** Goal identity that already opened a window. */
  goalLatchKey: string;
  /** Live window start (seconds epoch). */
  startedAt: number | null;
};

/** Persistent timer state. */
export type TimerState = {
  /** Remaining seconds (fractional while counting). */
  remaining: number;
  /** Run state. */
  status: TimerStatus;
  /** Blink end (ms epoch, 0 = not blinking). */
  blinkUntil: number;
};

/** Last alert shown by the timer widgets. */
export type AlertState = {
  /** Unique alert id (widgets dedupe by it). */
  id: string;
  /** Donor name. */
  nick: string;
  /** Grant text like `+1м 30с`. */
  text: string;
  /** Plate color. */
  color: AlertColor;
  /** Creation time (ms epoch). */
  at: number;
};

/** Whole persisted blob kept in addon `storage`. */
export type PersistedData = {
  /** Data format version. */
  version: number;
  /** User settings. */
  settings: DonateTimerSettings;
  /** Timer state. */
  timer: TimerState;
  /** Donation journal (oldest first). */
  donations: DonationEntry[];
  /** Dashboard record ids already handled (bounded). */
  processedIds: string[];
  /** Journal ids hidden from widget statistics by "Clear widgets". */
  widgetExcludedIds: string[];
  /** Bonus window state. */
  bonus: BonusState;
  /** Donations waiting for the blink to end. */
  blinkBuffer: BufferedDonation[];
};
