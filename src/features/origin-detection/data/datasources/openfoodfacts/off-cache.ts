import type { OffProductModel } from '../../models/off-product-model';
import type { OffFetchResult } from './off-client';

const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const NAMESPACE = 'cocarde.off-cache';
const MAX_ENTRIES = 2_000;

export const OFF_CACHE_PURGE_ALARM = 'cocarde.off-cache.purge';
export const OFF_CACHE_PURGE_PERIOD_MINUTES = 6 * 60;

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

  async set(ean: string, result: OffFetchResult): Promise<void> {
    if (result.outcome === 'transient-error') return;
    const key = `${NAMESPACE}:${ean}`;
    const entry: CacheEntry = {
      value: result.outcome === 'found' ? result.product : null,
      cachedAt: Date.now(),
    };
    await browser.storage.local.set({ [key]: entry });
  }

  async purge(): Promise<void> {
    const all = await browser.storage.local.get(null);
    const now = Date.now();
    const prefix = `${NAMESPACE}:`;
    const expired: string[] = [];
    const alive: Array<{ key: string; cachedAt: number }> = [];
    for (const [key, raw] of Object.entries(all)) {
      if (!key.startsWith(prefix)) continue;
      const entry = raw as CacheEntry;
      if (now - entry.cachedAt > TTL_MS) {
        expired.push(key);
      } else {
        alive.push({ key, cachedAt: entry.cachedAt });
      }
    }
    const overflow = alive.length - MAX_ENTRIES;
    const evicted =
      overflow > 0
        ? alive
            .sort((a, b) => a.cachedAt - b.cachedAt)
            .slice(0, overflow)
            .map((entry) => entry.key)
        : [];
    const toRemove = [...expired, ...evicted];
    if (toRemove.length > 0) {
      await browser.storage.local.remove(toRemove);
    }
  }
}
