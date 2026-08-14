import { buildBackgroundContainer } from '../core/di/background-container';
import {
  OFF_CACHE_PURGE_ALARM,
  OFF_CACHE_PURGE_PERIOD_MINUTES,
} from '../features/origin-detection/data/datasources/openfoodfacts/off-cache';
import {
  RequestOriginMessageSchema,
  type OriginResponseMessage,
} from '../core/messaging/protocol';

export default defineBackground(() => {
  const container = buildBackgroundContainer();

  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason !== 'install') return;
    browser.tabs
      .create({ url: browser.runtime.getURL('/onboarding.html') })
      .catch((error: unknown) => {
        console.error('[arbiter] onboarding tab creation failed', error);
      });
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== OFF_CACHE_PURGE_ALARM) return;
    container.offCache.purge().catch((error: unknown) => {
      console.error('[arbiter] off-cache purge failed', error);
    });
  });

  void browser.alarms.create(OFF_CACHE_PURGE_ALARM, {
    periodInMinutes: OFF_CACHE_PURGE_PERIOD_MINUTES,
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id !== browser.runtime.id) return false;

    const parsed = RequestOriginMessageSchema.safeParse(message);
    if (!parsed.success) return false;

    container.determineOriginVerdict
      .call(parsed.data.payload)
      .then((verdict) => {
        const response: OriginResponseMessage = {
          type: 'arbiter/origin-response',
          payload: {
            brand: verdict.brand,
            manufacturing: verdict.manufacturing,
            brandRegion: verdict.brandRegion,
            manufacturingRegion: verdict.manufacturingRegion,
          },
        };
        sendResponse(response);
      })
      .catch((error: unknown) => {
        console.error('[arbiter] determine-origin failed', error);
        sendResponse(null);
      });

    return true;
  });
});
