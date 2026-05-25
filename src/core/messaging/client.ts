import {
  OriginResponseMessageSchema,
  type OriginResponseMessage,
  type RequestOriginMessage,
} from './protocol';

export class MessagingClient {
  async requestOrigin(payload: RequestOriginMessage['payload']): Promise<OriginResponseMessage['payload'] | null> {
    const message: RequestOriginMessage = { type: 'arbiter/request-origin', payload };
    const response: unknown = await browser.runtime.sendMessage(message);
    const parsed = OriginResponseMessageSchema.safeParse(response);
    if (!parsed.success) return null;
    return parsed.data.payload;
  }
}
