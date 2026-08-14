import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { OffCache } from '../off-cache';
import type { OffProductModel } from '../../../models/off-product-model';

// Constantes miroir de l'implémentation (off-cache.ts).
const NAMESPACE = 'arbiter.off-cache';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 2_000;

const PRODUCT: OffProductModel = {
  code: '3560070976478',
  origins_tags: ['en:france'],
};

const storageKey = (ean: string): string => `${NAMESPACE}:${ean}`;

const seedEntry = async (
  ean: string,
  cachedAt: number,
  value: OffProductModel | null = null,
): Promise<void> => {
  await fakeBrowser.storage.local.set({ [storageKey(ean)]: { value, cachedAt } });
};

describe('OffCache', () => {
  let cache: OffCache;

  beforeEach(() => {
    fakeBrowser.reset();
    cache = new OffCache();
  });

  describe('set', () => {
    it("ignore les erreurs transitoires (rien n'est écrit)", async () => {
      await cache.set('111', { outcome: 'transient-error' });

      const all = await fakeBrowser.storage.local.get(null);
      expect(Object.keys(all)).toHaveLength(0);
      const result = await cache.get('111');
      expect(result).toEqual({ hit: false, value: null });
    });

    it("met en cache un résultat 'found' avec le produit", async () => {
      await cache.set('222', { outcome: 'found', product: PRODUCT });

      const result = await cache.get('222');
      expect(result.hit).toBe(true);
      expect(result.value).toEqual(PRODUCT);
    });

    it("met en cache un résultat 'not-found' (cache négatif)", async () => {
      await cache.set('333', { outcome: 'not-found' });

      const result = await cache.get('333');
      expect(result.hit).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe('get', () => {
    it('rate sur une entrée expirée (TTL 7 jours) et la supprime', async () => {
      await seedEntry('444', Date.now() - TTL_MS - 1_000, PRODUCT);

      const result = await cache.get('444');

      expect(result).toEqual({ hit: false, value: null });
      const remaining = await fakeBrowser.storage.local.get(storageKey('444'));
      expect(remaining[storageKey('444')]).toBeUndefined();
    });

    it('rate sur un EAN jamais vu', async () => {
      const result = await cache.get('999');
      expect(result).toEqual({ hit: false, value: null });
    });
  });

  describe('purge', () => {
    it('supprime les entrées expirées, garde les fraîches et les clés hors namespace', async () => {
      const now = Date.now();
      await seedEntry('old', now - TTL_MS - 1_000);
      await seedEntry('fresh', now);
      await fakeBrowser.storage.local.set({ 'arbiter.preferences': { theme: 'dark' } });

      await cache.purge();

      const all = await fakeBrowser.storage.local.get(null);
      expect(all[storageKey('old')]).toBeUndefined();
      expect(all[storageKey('fresh')]).toBeDefined();
      expect(all['arbiter.preferences']).toBeDefined();
    });

    it(`plafonne à ${MAX_ENTRIES} entrées en évinçant les plus anciennes`, async () => {
      const now = Date.now();
      const surplus = 3;
      const total = MAX_ENTRIES + surplus;
      // cachedAt croissant avec l'index : les index les plus bas sont les plus anciens.
      const items: Record<string, { value: null; cachedAt: number }> = {};
      for (let i = 0; i < total; i += 1) {
        items[storageKey(`ean-${i}`)] = { value: null, cachedAt: now - (total - i) * 1_000 };
      }
      await fakeBrowser.storage.local.set(items);

      await cache.purge();

      const all = await fakeBrowser.storage.local.get(null);
      const cacheKeys = Object.keys(all).filter((key) => key.startsWith(`${NAMESPACE}:`));
      expect(cacheKeys).toHaveLength(MAX_ENTRIES);
      // Les `surplus` plus anciennes ont été évincées, les plus récentes conservées.
      for (let i = 0; i < surplus; i += 1) {
        expect(all[storageKey(`ean-${i}`)]).toBeUndefined();
      }
      expect(all[storageKey(`ean-${surplus}`)]).toBeDefined();
      expect(all[storageKey(`ean-${total - 1}`)]).toBeDefined();
    });
  });
});
