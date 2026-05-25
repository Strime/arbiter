import type { OffProductModel } from '../../models/off-product-model';

const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const NAMESPACE = 'arbiter.off-cache';

interface CacheEntry {
  value: OffProductModel | null;
  cachedAt: number;
}

export class OffCache {
  async get(ean: string): Promise<{ hit: boolean; value: OffProductModel | null }> {
    const key = `${NAMESPACE}:${ean}`;
    const stored = await browser.storage.local.get(key);
    const entry = stored[key] as CacheEntry | undefined;
    if (!entry) return { hit: false, value: null };
    if (Date.now() - entry.cachedAt > TTL_MS) {
      await browser.storage.local.remove(key);
      return { hit: false, value: null };
    }
    return { hit: true, value: entry.value };
  }

  async set(ean: string, value: OffProductModel | null): Promise<void> {
    const key = `${NAMESPACE}:${ean}`;
    const entry: CacheEntry = { value, cachedAt: Date.now() };
    await browser.storage.local.set({ [key]: entry });
  }
}
