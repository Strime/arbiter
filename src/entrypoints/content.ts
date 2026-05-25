import { buildContentContainer } from '../core/di/content-container';

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

    adapter.observe(document, async ({ type, card }) => {
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
  },
});
