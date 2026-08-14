import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { compareExtensionVersions, runBrandsDbUpdate } from '../remote-db-updater';
import { OVERLAY_DATA_KEY, OVERLAY_ETAG_KEY, OVERLAY_VERSION_KEY } from '../overlay-storage';
import type { BrandsFile } from '../schemas';

const MANIFEST_URL = 'https://strime.github.io/arbiter-data/data/brands-manifest.json';
const DATA_URL = 'https://strime.github.io/arbiter-data/data/brands.json';
const BUNDLED_URL = 'chrome-extension://arbiter/data/brands.json';

const sha256Of = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');

const makeFile = (entryCount: number, version = 1): BrandsFile => ({
  version,
  brands: Array.from({ length: entryCount }, (_, i) => ({
    name: `Marque ${String(i)}`,
    country: 'FR',
    source: 'manual' as const,
    confidence: 0.9,
    addedAt: '2026-01-01',
  })),
});

const BUNDLED_FILE = makeFile(10);

interface ManifestOverrides {
  readonly [key: string]: unknown;
}

const makeManifest = (dataText: string, overrides: ManifestOverrides = {}): object => ({
  schemaVersion: 1,
  dataVersion: '2026-08-14.1',
  url: DATA_URL,
  sha256: sha256Of(dataText),
  sizeBytes: new TextEncoder().encode(dataText).byteLength,
  minExtensionVersion: '0.1.0',
  publishedAt: '2026-08-14T09:00:00Z',
  ...overrides,
});

/** Route les trois URLs (manifest distant, données distantes, asset bundlé). */
const stubFetch = ({
  manifest,
  dataText,
  manifestHeaders = {},
}: {
  manifest: object;
  dataText: string;
  manifestHeaders?: Record<string, string>;
}): ReturnType<typeof vi.fn> => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === MANIFEST_URL) {
      return new Response(JSON.stringify(manifest), { headers: manifestHeaders });
    }
    if (url === DATA_URL) return new Response(dataText);
    if (url === BUNDLED_URL) return new Response(JSON.stringify(BUNDLED_FILE));
    throw new Error(`unexpected fetch: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const storedOverlay = async (): Promise<Record<string, unknown>> =>
  fakeBrowser.storage.local.get([OVERLAY_VERSION_KEY, OVERLAY_DATA_KEY, OVERLAY_ETAG_KEY]);

describe('compareExtensionVersions', () => {
  it('compare segment par segment en numérique (0.10.0 > 0.9.0)', () => {
    expect(compareExtensionVersions('0.10.0', '0.9.0')).toBeGreaterThan(0);
    expect(compareExtensionVersions('0.9.0', '0.10.0')).toBeLessThan(0);
  });

  it('traite les segments manquants comme 0', () => {
    expect(compareExtensionVersions('1.0', '1.0.0')).toBe(0);
    expect(compareExtensionVersions('1.0.1', '1.0')).toBeGreaterThan(0);
  });

  it('retourne 0 pour des versions égales', () => {
    expect(compareExtensionVersions('2.3.4', '2.3.4')).toBe(0);
  });
});

describe('runBrandsDbUpdate', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    fakeBrowser.runtime.getURL = ((path: string) =>
      `chrome-extension://arbiter${path}`) as typeof fakeBrowser.runtime.getURL;
    fakeBrowser.runtime.getManifest = (() => ({
      version: '0.1.0',
    })) as typeof fakeBrowser.runtime.getManifest;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('nominal : écrit version, données et ETag dans storage.local', async () => {
    const file = makeFile(10);
    const dataText = JSON.stringify(file);
    stubFetch({
      manifest: makeManifest(dataText),
      dataText,
      manifestHeaders: { ETag: '"etag-abc"' },
    });

    await runBrandsDbUpdate();

    const stored = await storedOverlay();
    expect(stored[OVERLAY_VERSION_KEY]).toBe('2026-08-14.1');
    expect(stored[OVERLAY_DATA_KEY]).toEqual(file);
    expect(stored[OVERLAY_ETAG_KEY]).toBe('"etag-abc"');
  });

  it('rejette un schemaVersion de manifest non supporté', async () => {
    const dataText = JSON.stringify(makeFile(10));
    stubFetch({ manifest: makeManifest(dataText, { schemaVersion: 2 }), dataText });

    await runBrandsDbUpdate();

    expect(await storedOverlay()).toEqual({});
  });

  it('rejette un fichier dont la version interne diffère du schemaVersion du manifest', async () => {
    const dataText = JSON.stringify(makeFile(10, 2));
    stubFetch({ manifest: makeManifest(dataText), dataText });

    await runBrandsDbUpdate();

    expect(await storedOverlay()).toEqual({});
  });

  it('rejette un manifest exigeant une version d’extension supérieure', async () => {
    const dataText = JSON.stringify(makeFile(10));
    const fetchMock = stubFetch({
      manifest: makeManifest(dataText, { minExtensionVersion: '0.2.0' }),
      dataText,
    });

    await runBrandsDbUpdate();

    expect(await storedOverlay()).toEqual({});
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('no-op quand dataVersion est identique à l’overlay actuel', async () => {
    const previous = makeFile(9);
    await fakeBrowser.storage.local.set({
      [OVERLAY_VERSION_KEY]: '2026-08-14.1',
      [OVERLAY_DATA_KEY]: previous,
    });
    const dataText = JSON.stringify(makeFile(10));
    const fetchMock = stubFetch({ manifest: makeManifest(dataText), dataText });

    await runBrandsDbUpdate();

    // Seul le manifest a été consulté, les données n'ont pas été téléchargées.
    expect(fetchMock).toHaveBeenCalledOnce();
    const stored = await storedOverlay();
    expect(stored[OVERLAY_DATA_KEY]).toEqual(previous);
  });

  it('aborte un téléchargement dépassant le plafond de 2 Mo', async () => {
    const dataText = JSON.stringify(makeFile(10));
    const oversized = 'x'.repeat(2 * 1024 * 1024 + 1);
    const fetchMock = stubFetch({ manifest: makeManifest(dataText), dataText: oversized });

    await runBrandsDbUpdate();

    expect(await storedOverlay()).toEqual({});
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejette un sha256 qui ne correspond pas', async () => {
    const dataText = JSON.stringify(makeFile(10));
    stubFetch({ manifest: makeManifest(dataText, { sha256: 'a'.repeat(64) }), dataText });

    await runBrandsDbUpdate();

    expect(await storedOverlay()).toEqual({});
  });

  it('rejette un fichier implausible (< 80 % du max bundle/overlay précédent)', async () => {
    // Bundle : 10 entrées → plancher à 8. Le fichier distant n'en a que 5.
    const dataText = JSON.stringify(makeFile(5));
    stubFetch({ manifest: makeManifest(dataText), dataText });

    await runBrandsDbUpdate();

    expect(await storedOverlay()).toEqual({});
  });

  it('applique la plausibilité contre l’overlay précédent quand il est plus gros que le bundle', async () => {
    const previous = makeFile(100);
    await fakeBrowser.storage.local.set({
      [OVERLAY_VERSION_KEY]: '2026-08-01.1',
      [OVERLAY_DATA_KEY]: previous,
    });
    // 50 < 0.8 * max(10, 100) = 80 → rejet malgré un bundle plus petit.
    const dataText = JSON.stringify(makeFile(50));
    stubFetch({ manifest: makeManifest(dataText), dataText });

    await runBrandsDbUpdate();

    const stored = await storedOverlay();
    expect(stored[OVERLAY_VERSION_KEY]).toBe('2026-08-01.1');
    expect(stored[OVERLAY_DATA_KEY]).toEqual(previous);
  });

  it('envoie If-None-Match avec l’ETag stocké et s’arrête sur 304', async () => {
    await fakeBrowser.storage.local.set({ [OVERLAY_ETAG_KEY]: '"etag-abc"' });
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(MANIFEST_URL);
      expect(new Headers(init?.headers).get('If-None-Match')).toBe('"etag-abc"');
      return new Response(null, { status: 304 });
    });
    vi.stubGlobal('fetch', fetchMock);

    await runBrandsDbUpdate();

    expect(fetchMock).toHaveBeenCalledOnce();
    const stored = await storedOverlay();
    expect(stored[OVERLAY_DATA_KEY]).toBeUndefined();
  });

  it('ne throw jamais sur un échec réseau', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('network down');
      }),
    );

    await expect(runBrandsDbUpdate()).resolves.toBeUndefined();
    expect(await storedOverlay()).toEqual({});
  });
});
