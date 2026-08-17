import { buildBackgroundContainer } from '../core/di/background-container';
import {
  OFF_CACHE_PURGE_ALARM,
  OFF_CACHE_PURGE_PERIOD_MINUTES,
} from '../features/origin-detection/data/datasources/openfoodfacts/off-cache';
import {
  BRANDS_DB_UPDATE_ALARM,
  BRANDS_DB_UPDATE_MAX_JITTER_MINUTES,
  BRANDS_DB_UPDATE_PERIOD_MINUTES,
  runBrandsDbUpdate,
} from '../features/origin-detection/data/datasources/local-brand-db/remote-db-updater';
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
        console.error('[coquade] onboarding tab creation failed', error);
      });
    // Première vérification OTA dès l'install (l'alarme prendra le relais).
    void runBrandsDbUpdate();
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === OFF_CACHE_PURGE_ALARM) {
      container.offCache.purge().catch((error: unknown) => {
        console.error('[coquade] off-cache purge failed', error);
      });
      return;
    }
    if (alarm.name === BRANDS_DB_UPDATE_ALARM) {
      // runBrandsDbUpdate ne rejette jamais (fallback silencieux interne).
      void runBrandsDbUpdate();
    }
  });

  // Un create() inconditionnel remplacerait l'alarme à chaque réveil du service
  // worker et réinitialiserait son décompte — elle pourrait ne jamais sonner.
  void browser.alarms.get(OFF_CACHE_PURGE_ALARM).then((existing) => {
    if (existing) return;
    return browser.alarms.create(OFF_CACHE_PURGE_ALARM, {
      periodInMinutes: OFF_CACHE_PURGE_PERIOD_MINUTES,
    });
  });

  // Même garde alarms.get() : le jitter (delayInMinutes aléatoire, étale la
  // charge sur le CDN) n'est ainsi tiré qu'au premier create(), jamais re-tiré
  // au réveil du service worker.
  void browser.alarms.get(BRANDS_DB_UPDATE_ALARM).then((existing) => {
    if (existing) return;
    return browser.alarms.create(BRANDS_DB_UPDATE_ALARM, {
      periodInMinutes: BRANDS_DB_UPDATE_PERIOD_MINUTES,
      delayInMinutes: Math.random() * BRANDS_DB_UPDATE_MAX_JITTER_MINUTES,
    });
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id !== browser.runtime.id) return false;

    const parsed = RequestOriginMessageSchema.safeParse(message);
    if (!parsed.success) return false;

    container.determineOriginVerdict
      .call(parsed.data.payload)
      .then((verdict) => {
        const response: OriginResponseMessage = {
          type: 'coquade/origin-response',
          payload: {
            brand: verdict.brand,
            manufacturing: verdict.manufacturing,
            brandRegion: verdict.brandRegion,
            manufacturingRegion: verdict.manufacturingRegion,
            ownershipRegion: verdict.ownershipRegion,
          },
        };
        sendResponse(response);
      })
      .catch((error: unknown) => {
        console.error('[coquade] determine-origin failed', error);
        sendResponse(null);
      });

    return true;
  });
});
