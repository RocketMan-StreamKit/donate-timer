import { db } from './store';

/** Cached StreamKit+ main currency (refreshed periodically). */
let appCurrency = 'RUB';

/**
 * Refreshes the cached app currency from StreamKit+ settings.
 * @returns Promise resolved when the cache is updated.
 * @example await refreshAppCurrency();
 */
export const refreshAppCurrency = async () => {
  try {
    const res = await currency.getCurrent();
    if (res.success) appCurrency = res.currency;
  } catch (error) {
    console.warn('[donate-timer] currency.getCurrent failed', error);
  }
};

/**
 * Base currency used for rates, totals, goal and bonus thresholds.
 * @returns Currency code.
 * @example baseCurrency(); // 'RUB'
 */
export const baseCurrency = () =>
  db.settings.currency === 'app' ? appCurrency : db.settings.currency;

/** Currency code accepted by the sandbox `currency.convert`. */
type ConvertCode = Parameters<typeof currency.convert>[1];

/**
 * Converts an amount into the base currency.
 * @param amount Source amount.
 * @param from Source currency code.
 * @returns Converted amount or `null` when the conversion is not possible.
 * @example await toBase(10, 'USD'); // 930.5
 */
export const toBase = async (amount: number, from: string): Promise<number | null> => {
  const target = baseCurrency();
  const source = from.toUpperCase() === 'RUR' ? 'RUB' : from.toUpperCase();
  if (source === target) return amount;
  try {
    const res = await currency.convert(amount, source as ConvertCode, target as ConvertCode);
    if (res.success && Number.isFinite(res.amount)) {
      return Math.round(res.amount * 100) / 100;
    }
    console.warn('[donate-timer] currency conversion failed', source, target, res);
  } catch (error) {
    console.warn('[donate-timer] currency conversion error', error);
  }
  return null;
};
