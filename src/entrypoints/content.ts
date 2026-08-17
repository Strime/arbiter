import { buildContentContainer } from '../core/di/content-container';
import { countBadgeHosts, removeAllBadgeHosts } from '../features/badge-injection/presentation/shadow-host';
import { GetStatsMessageSchema, type StatsResponseMessage } from '../core/messaging/protocol';
import type { SiteAdapter } from '../features/site-adapters/domain/entities/site-adapter';
import type { ContentContainer } from '../core/di/content-container';

export default defineContentScript({
  matches: [
    'https://*.carrefour.fr/*',
    'https://*.intermarche.com/*',
    'https://*.auchan.fr/*',
    'https://*.leclercdrive.fr/*',
    'https://*.lidl.fr/*',
  ],
  runAt: 'document_idle',
  async main() {
    // Enregistré de manière SYNCHRONE (avant tout await) : la popup interroge
    // ce script via GET_STATS pour savoir si le site est supporté.
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (sender.id !== browser.runtime.id) return false;

      const parsed = GetStatsMessageSchema.safeParse(message);
      if (!parsed.success) return false;

      const response: StatsResponseMessage = {
        type: 'coquade/stats-response',
        payload: { badgeCount: countBadgeHosts() },
      };
      sendResponse(response);
      return true;
    });

    const container = buildContentContainer();
    const adapter = container.resolveAdapter.call(location.href);
    if (!adapter) {
      console.debug('[coquade] no adapter matches', location.href);
      return;
    }
    console.info('[coquade] adapter active:', adapter.id);

    let teardown: (() => void) | null = null;

    const start = (): void => {
      if (teardown) return;
      teardown = attachAdapter(container, adapter);
    };

    const stop = (): void => {
      if (!teardown) return;
      teardown();
      teardown = null;
      removeAllBadgeHosts();
    };

    let watchFired = false;
    container.preferencesRepository.watch((prefs) => {
      watchFired = true;
      if (prefs.enabled) start();
      else stop();
    });

    const initial = await container.getPreferences.call();
    if (watchFired) return;
    if (initial.enabled) start();
    else console.info('[coquade] disabled by user preferences');
  },
});

let adapterListenerFailureLogged = false;

function attachAdapter(container: ContentContainer, adapter: SiteAdapter): () => void {
  return adapter.observe(document, async ({ type, card }) => {
    if (type !== 'added') return;
    try {
      const verdict = await container.messagingClient.requestOrigin({
        ean: card.ean,
        brand: card.brand,
        title: card.title,
        rawText: card.rawText,
        brandGuessed: card.brandGuessed,
      });
      if (!verdict) return;
      container.renderBadge.call({ card, verdict });
    } catch (error) {
      if (adapterListenerFailureLogged) return;
      adapterListenerFailureLogged = true;
      console.debug('[coquade] card processing failed (extension context invalidated?)', error);
    }
  });
}
