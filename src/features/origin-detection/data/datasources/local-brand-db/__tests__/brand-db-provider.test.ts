import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { BrandDbProvider, resetBrandDbProviderCacheForTests } from '../brand-db-provider';
import { OVERLAY_DATA_KEY, OVERLAY_VERSION_KEY } from '../overlay-storage';
import type { BrandsFile } from '../schemas';

const BUNDLED_URL = 'chrome-extension://arbiter/data/brands.json';

const entry = (name: string, country: string): BrandsFile['brands'][number] => ({
  name,
  country,
  source: 'manual',
  confidence: 0.9,
  addedAt: '2026-01-01',
});

const BUNDLED_FILE: BrandsFile = { version: 1, brands: [entry('Marque Bundlée', 'FR')] };
const OVERLAY_FILE: BrandsFile = { version: 1, brands: [entry('Marque Overlay', 'DE')] };

const seedOverlay = async (file: unknown, dataVersion = '2026-08-14.1'): Promise<void> => {
  await fakeBrowser.storage.local.set({
    [OVERLAY_VERSION_KEY]: dataVersion,
    [OVERLAY_DATA_KEY]: file,
  });
};

describe('BrandDbProvider', () => {
  let provider: BrandDbProvider;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fakeBrowser.reset();
    resetBrandDbProviderCacheForTests();
    fakeBrowser.runtime.getURL = ((path: string) =>
      `chrome-extension://arbiter${path}`) as typeof fakeBrowser.runtime.getURL;
    fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === BUNDLED_URL) return new Response(JSON.stringify(BUNDLED_FILE));
      throw new Error(`unexpected fetch: ${String(input)}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    provider = new BrandDbProvider();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('charge le bundle quand aucun overlay n’est présent', async () => {
    const map = await provider.load();

    expect(map.get('marquebundlee')?.country).toBe('FR');
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('privilégie un overlay storage valide (le bundle n’est pas lu)', async () => {
    await seedOverlay(OVERLAY_FILE);

    const map = await provider.load();

    expect(map.get('marqueoverlay')?.country).toBe('DE');
    expect(map.has('marquebundlee')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retombe sur le bundle quand l’overlay a un schemaVersion incompatible', async () => {
    await seedOverlay({ ...OVERLAY_FILE, version: 2 });

    const map = await provider.load();

    expect(map.get('marquebundlee')?.country).toBe('FR');
    expect(map.has('marqueoverlay')).toBe(false);
  });

  it('retombe sur le bundle quand l’overlay est corrompu (Zod)', async () => {
    await seedOverlay({ version: 1, brands: 'corrompu' });

    const map = await provider.load();

    expect(map.get('marquebundlee')?.country).toBe('FR');
  });

  it('mémoïse la Map au niveau module (une seule lecture par vie de SW)', async () => {
    const first = await provider.load();
    const second = await new BrandDbProvider().load();

    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('retourne une Map vide sans throw si le bundle est illisible, sans mémoïser l’échec', async () => {
    fetchMock.mockImplementation(async () => new Response('nope', { status: 404 }));

    const map = await provider.load();
    expect(map.size).toBe(0);

    // L'échec n'est pas mémoïsé : un appel suivant retente la lecture.
    fetchMock.mockImplementation(async () => new Response(JSON.stringify(BUNDLED_FILE)));
    const retried = await provider.load();
    expect(retried.get('marquebundlee')?.country).toBe('FR');
  });
});
