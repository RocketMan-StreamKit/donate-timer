import { t } from './i18n';

/** Short currency signs; other codes are shown as-is. */
const SYMBOLS: Record<string, string> = {
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

/**
 * Currency sign for a code.
 * @param code Currency code.
 * @returns Symbol or the code.
 * @example symbol('RUB'); // '₽'
 */
export const symbol = (code: string) => SYMBOLS[code] ?? code;

/**
 * `HH:MM:SS` clock.
 * @param seconds Duration.
 * @returns Clock string.
 * @example hms(61); // '00:01:01'
 */
export const hms = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const p = (v: number) => String(Math.floor(v)).padStart(2, '0');
  return `${p(total / 3600)}:${p((total % 3600) / 60)}:${p(total % 60)}`;
};

/**
 * Short clock without leading zero hours (`04:59` or `1:04:59`).
 * @param seconds Duration.
 * @returns Clock string.
 * @example shortClock(299); // '04:59'
 */
export const shortClock = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const p = (v: number) => String(v).padStart(2, '0');
  const tail = `${p(Math.floor((total % 3600) / 60))}:${p(total % 60)}`;
  return h > 0 ? `${h}:${tail}` : tail;
};

/**
 * Human duration (`1 h 5 min 3 s`).
 * @param seconds Duration.
 * @returns Localized text.
 * @example humanDuration(3903); // '1 ч 5 мин 3 с'
 */
export const humanDuration = (seconds: number) => {
  const total = Math.round(Math.abs(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} ${t('hh')}`);
  if (m) parts.push(`${m} ${t('mm')}`);
  if (s || !parts.length) parts.push(`${s} ${t('ss')}`);
  return parts.join(' ');
};

/**
 * Money with grouping and up to two decimals.
 * @param value Amount.
 * @param code Currency code (adds the sign when given).
 * @returns Display string.
 * @example money(12345.5, 'RUB'); // '12 345.5 ₽'
 */
export const money = (value: number, code?: string) => {
  const rounded = Math.round(value * 100) / 100;
  const [int, frac] = String(Math.abs(rounded)).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const text = `${rounded < 0 ? '−' : ''}${grouped}${frac ? `.${frac}` : ''}`;
  return code ? `${text} ${symbol(code)}` : text;
};

/**
 * Epoch ms → `datetime-local` value.
 * @param ms Epoch ms (0 = empty).
 * @returns Input value.
 * @example toLocalInput(Date.now());
 */
export const toLocalInput = (ms: number) => {
  if (!ms) return '';
  const d = new Date(ms);
  const p = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/**
 * Seconds a donation buys at a rate (same math as the worker).
 * @param amount Amount.
 * @param rate Rate.
 * @param mode Rate mode.
 * @returns Seconds.
 * @example secondsFor(100, 10, 'amount_per_sec'); // 10
 */
export const secondsFor = (amount: number, rate: number, mode: string) => {
  if (!(rate > 0)) return 0;
  return mode === 'sec_per_amount' ? amount * rate : amount / rate;
};
