import { buildContentContainer } from '../core/di/content-container';
import type { SiteAdapter } from '../features/site-adapters/domain/entities/site-adapter';
import type { ContentContainer } from '../core/di/content-container';

export default defineContentScript({
  matches: [
    '*://*.carrefour.fr/*',
    '*://drive.carrefour.fr/*',
    '*://*.intermarche.com/*',
    '*://*.auchan.fr/*',
    '*://*.leclercdrive.fr/*',
  ],
  runAt: 'document_idle',
  async main() {
    const container = buildContentContainer();
    const adapter = container.resolveAdapter.call(location.href);
    if (!adapter) {
      console.debug('[arbiter] no adapter matches', location.href);
      return;
    }
    console.info('[arbiter] adapter active:', adapter.id);

    let teardown: (() => void) | null = null;

    const start = (): void => {
      if (teardown) return;
      teardown = attachAdapter(container, adapter);
    };

    const stop = (): void => {
      if (!teardown) return;
      teardown();
      teardown = null;
    };

    const initial = await container.getPreferences.call();
    if (initial.enabled) start();
    else console.info('[arbiter] disabled by user preferences');

    container.preferencesRepository.watch((prefs) => {
      if (prefs.enabled) start();
      else stop();
    });
  },
});

function attachAdapter(container: ContentContainer, adapter: SiteAdapter): () => void {
  return adapter.observe(document, async ({ type, card }) => {
    if (type !== 'added') return;
    const verdict = await container.messagingClient.requestOrigin({
      ean: card.ean,
      brand: card.brand,
      title: card.title,
      rawText: card.rawText,
    });
    if (!verdict) return;
    container.renderBadge.call({ card, verdict });
  });
}
