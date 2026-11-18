import { CURRENCY_SYMBOLS } from './constants';
import { formatSecondsLabel } from './bonus';
import type { RateMode } from './types';

/**
 * Two-digit zero padding.
 * @param n Number to pad.
 * @returns Padded string.
 * @example pad2(7); // '07'
 */
export const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

/**
 * Formats seconds as `HH:MM:SS` (hours are not capped).
 * @param seconds Duration.
 * @returns Clock string.
 * @example hms(3725); // '01:02:05'
 */
export const hms = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${pad2(total / 3600)}:${pad2((total % 3600) / 60)}:${pad2(total % 60)}`;
};

/**
 * Grant text used by alerts and logs (`+1ч 2м 3с`).
 * @param seconds Granted seconds (rounded).
 * @returns Text without the leading plus.
 * @example grantText(90); // '1м 30с'
 */
export const grantText = (seconds: number) => {
  const total = Math.round(Math.abs(seconds));
  const parts: string[] = [];
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) parts.push(`${h}ч`);
  if (m > 0) parts.push(`${m}м`);
  if (s > 0) parts.push(`${s}с`);
  return parts.length ? parts.join(' ') : '0с';
};

/**
 * Local `YYYY-MM-DD HH:MM:SS` timestamp (format of the desktop app logs).
 * @param ms Epoch milliseconds.
 * @returns Local date-time string.
 * @example localStamp(Date.now()); // '2026-11-18 21:05:00'
 */
export const localStamp = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

/**
 * Amount without trailing zeros (two decimals max).
 * @param value Amount.
 * @returns Display string.
 * @example amountText(100); // '100'
 * @example amountText(12.5); // '12.5'
 */
export const amountText = (value: number) => String(Math.round(value * 100) / 100);

/**
 * Short currency sign for widgets.
 * @param code Currency code.
 * @returns Symbol or the code itself.
 * @example currencySymbol('RUB'); // '₽'
 */
export const currencySymbol = (code: string) => CURRENCY_SYMBOLS[code] ?? code;

/**
 * Widget rate line (`rate.txt`). Wording matches the desktop app for RUB.
 * @param rate Effective rate.
 * @param mode Rate mode.
 * @param currency Base currency code.
 * @returns Single-line text with non-breaking spaces.
 * @example rateText(10, 'amount_per_sec', 'RUB'); // '600 рублей = +1 мин'
 */
export const rateText = (rate: number, mode: RateMode, currency: string) => {
  const nb = ' ';
  const isRub = currency === 'RUB';
  if (mode === 'amount_per_sec') {
    const perMin = Math.floor(rate * 60);
    return isRub
      ? `${perMin} рублей = +1${nb}мин`
      : `${perMin}${nb}${currencySymbol(currency)} = +1${nb}мин`;
  }
  const one = isRub ? '1 рубль' : `1${nb}${currencySymbol(currency)}`;
  const mins = Math.floor(rate / 60);
  const secsPart = rate - mins * 60;
  const secsLabel = formatSecondsLabel(secsPart);
  if (mins > 0 && secsPart >= 0.05) return `${one} = +${mins}${nb}мин ${secsLabel}${nb}сек`;
  if (mins > 0) return `${one} = +${mins}${nb}мин`;
  return `${one} = +${secsLabel}${nb}сек`;
};

/**
 * Collapses whitespace into one line.
 * @param text Raw text.
 * @returns Single line.
 * @example oneLine(' a\n b '); // 'a b'
 */
export const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();
