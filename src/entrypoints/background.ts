import { buildBackgroundContainer } from '../core/di/background-container';
import {
  RequestOriginMessageSchema,
  type OriginResponseMessage,
} from '../core/messaging/protocol';

export default defineBackground(() => {
  const container = buildBackgroundContainer();

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
