import { OffResponseSchema } from './off-schemas';
import type { OffProductModel } from '../../models/off-product-model';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const APP_IDENTITY = 'Arbiter/0.1.0 (https://github.com/Strime/arbiter)';
const FETCH_TIMEOUT_MS = 6_000;
const MAX_CONCURRENT_REQUESTS = 4;
const MIN_DISPATCH_INTERVAL_MS = 150;

export type OffFetchResult =
  | { readonly outcome: 'found'; readonly product: OffProductModel }
  | { readonly outcome: 'not-found' }
  | { readonly outcome: 'transient-error' };

class RequestGate {
  private active = 0;
  private nextDispatchAt = 0;
  private readonly waiting: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (this.active >= MAX_CONCURRENT_REQUESTS || this.waiting.length > 0) {
      await new Promise<void>((resolve) => {
        this.waiting.push(resolve);
      });
    }
    this.active += 1;
    const now = Date.now();
    const delay = this.nextDispatchAt - now;
    this.nextDispatchAt = Math.max(now, this.nextDispatchAt) + MIN_DISPATCH_INTERVAL_MS;
    if (delay > 0) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  release(): void {
    this.active -= 1;
    this.waiting.shift()?.();
  }
}

const gate = new RequestGate();

function buildHeaders(): Headers {
  const headers = new Headers({ 'X-App-Name': APP_IDENTITY });
  try {
    headers.set('User-Agent', APP_IDENTITY);
  } catch {
    // User-Agent non modifiable dans ce contexte fetch
  }
  return headers;
}

export class OffClient {
  async fetchByEan(ean: string): Promise<OffFetchResult> {
    const url = `${OFF_BASE}/${encodeURIComponent(ean)}.json`;
    await gate.acquire();
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: buildHeaders(),
        signal: controller.signal,
      });
      if (response.status === 404) return { outcome: 'not-found' };
      if (!response.ok) return { outcome: 'transient-error' };
      const json: unknown = await response.json();
      const parsed = OffResponseSchema.safeParse(json);
      if (!parsed.success) return { outcome: 'transient-error' };
      if (parsed.data.status !== 1 || !parsed.data.product) {
        return { outcome: 'not-found' };
      }
      return { outcome: 'found', product: parsed.data.product };
    } catch {
      return { outcome: 'transient-error' };
    } finally {
      clearTimeout(timeout);
      gate.release();
    }
  }
}
