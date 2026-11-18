/**
 * Donate Timer — StreamKit+ port of the desktop Donate Timer.
 * Donations come from the StreamKit+ dashboard feed (any installed donation platform addon).
 * @see https://rocketman-streamkit.github.io/types/
 */
import { ADDON_ID } from './constants';
import { refreshAppCurrency } from './currency';
import { handleDonation, setChangeListener, tick } from './engine';
import { registerPanelEndpoints } from './endpoints';
import { flush } from './store';
import { registerWidgetFeed, scheduleBroadcast } from './widgets';

/**
 * Subscribes to dashboard donation records.
 * @returns Promise resolved after subscription.
 * @example await subscribeDonations();
 */
const subscribeDonations = async () => {
  await dashboard.onRecord(payload => {
    const record = payload?.record;
    if (!record || record.type !== 'donation' || !record.amount) return;
    const [amount, code] = record.amount;
    if (typeof amount !== 'number' || !(amount > 0) || !code) return;
    void handleDonation({
      id: String(payload.id || record.id || ''),
      username: payload.user?.name || record.from || '',
      amount,
      currency: String(code),
      platform: record.platform,
    });
  });
};

/**
 * Worker startup.
 * @returns Promise resolved when the addon is ready.
 * @example void start();
 */
const start = async () => {
  await refreshAppCurrency();
  setChangeListener(scheduleBroadcast);
  await registerWidgetFeed();
  await registerPanelEndpoints();
  await subscribeDonations();
  setInterval(tick, 250);
  setInterval(() => void refreshAppCurrency(), 60_000);
  status.Update({ current: 'online' });
  scheduleBroadcast();
  console.log(`[${ADDON_ID}] ready`);
};

events.On('addon:prepare-stop', () => {
  flush();
});

void start().catch(error => {
  console.error(`[${ADDON_ID}] startup failed`, error);
  status.Update({ current: 'error' });
});
