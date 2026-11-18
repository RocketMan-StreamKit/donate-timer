import { act } from '../api';
import { h, setText } from '../dom';
import { humanDuration, secondsFor, symbol } from '../format';
import { t } from '../i18n';
import type { Component, PanelState } from '../types';
import { button, card } from '../ui/card';
import { numberField, selectField, textField } from '../ui/fields';
import { toast } from '../ui/toast';

/**
 * Manual donation: nickname, amount and currency (defaults to the StreamKit+ currency).
 * Counted like a real donation: rate, bonus window, totals and goal.
 * @returns Component.
 * @example pane.append(donationCard().el);
 */
export const donationCard = (): Component => {
  let state: PanelState | null = null;
  /** Currency picked by the user (null = follow the app currency). */
  let picked: string | null = null;

  const nick = textField({ label: t('nickname'), maxLength: 100, placeholder: t('nicknamePlaceholder') });
  const amount = numberField({ label: t('amount'), min: 0, placeholder: '100' });
  const currency = selectField({
    label: t('currency'),
    options: () => {
      if (!state) return [];
      const codes = state.currencies.length ? state.currencies : [state.appCurrency, state.currency];
      const ordered = [state.appCurrency, ...codes.filter(c => c !== state?.appCurrency)];
      return [...new Set(ordered)].map(code => [code, code === state?.appCurrency ? `${code} · ${t('currencyDefault')}` : `${code} · ${symbol(code)}`] as [string, string]);
    },
  });
  currency.el.addEventListener('change', () => {
    picked = String(currency.get());
  });

  const preview = h('p', { class: 'dt-preview', attrs: { hidden: true } });
  const paintPreview = () => {
    if (!state) return;
    const value = Number(amount.get());
    const code = String(currency.get() || state.appCurrency);
    preview.hidden = !(value > 0);
    if (code === state.currency) {
      setText(preview, t('willAdd', { t: humanDuration(secondsFor(value, state.settings.rate, state.settings.rateMode)) }));
    } else {
      setText(preview, t('willConvert', { c: state.currency }));
    }
  };

  const submit = async () => {
    if (!state) return;
    const ok = await act('addAmountWithName', {
      amount: Number(amount.get()),
      username: String(nick.get()),
      currency: String(currency.get() || state.appCurrency),
    });
    if (ok) {
      amount.set('');
      nick.set('');
      paintPreview();
      toast(t('donationAdded'));
    }
  };

  const fields = h('div', { class: 'dt-fields dt-fields--donation' }, [nick.el, amount.el, currency.el]);
  fields.addEventListener('input', paintPreview);
  fields.addEventListener('change', paintPreview);
  fields.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    }
  });

  const { el } = card({ title: t('donationTitle'), description: t('donationHint'), icon: '💸' }, [
    fields,
    preview,
    h('div', { class: 'dt-actions' }, [button(`+  ${t('addDonation')}`, () => void submit(), { variant: 'primary', class: 'dt-grow' })]),
  ]);

  return {
    el,
    update: s => {
      state = s;
      currency.refresh();
      currency.set(picked ?? s.appCurrency);
      paintPreview();
    },
  };
};
