import {
  OriginResponseMessageSchema,
  StatsResponseMessageSchema,
  type GetStatsMessage,
  type OriginResponseMessage,
  type RequestOriginMessage,
  type StatsResponseMessage,
} from './protocol';

export class MessagingClient {
  async requestOrigin(payload: RequestOriginMessage['payload']): Promise<OriginResponseMessage['payload'] | null> {
    const message: RequestOriginMessage = { type: 'cocarde/request-origin', payload };
    let response: unknown;
    try {
      response = await browser.runtime.sendMessage(message);
    } catch {
      return null;
    }
    const parsed = OriginResponseMessageSchema.safeParse(response);
    if (!parsed.success) return null;
    return parsed.data.payload;
  }

  /**
   * Interroge le content script de l'onglet donné.
   * Retourne null s'il n'y a pas de récepteur (site non supporté) ou
   * si la réponse est invalide.
   */
  async requestTabStats(tabId: number): Promise<StatsResponseMessage['payload'] | null> {
    const message: GetStatsMessage = { type: 'cocarde/get-stats' };
    let response: unknown;
    try {
      response = await browser.tabs.sendMessage(tabId, message);
    } catch {
      return null;
    }
    const parsed = StatsResponseMessageSchema.safeParse(response);
    if (!parsed.success) return null;
    return parsed.data.payload;
  }
}
