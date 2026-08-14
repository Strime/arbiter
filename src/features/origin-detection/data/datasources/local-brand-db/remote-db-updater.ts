import { z } from 'zod';
import { BrandsFileSchema, SUPPORTED_BRANDS_SCHEMA_VERSION } from './schemas';
import { fetchBundledBrandsFile } from './brand-db-provider';
import { readOverlay, readStoredEtag, writeOverlay } from './overlay-storage';

export const BRANDS_DB_UPDATE_ALARM = 'arbiter.brands-db.update';
export const BRANDS_DB_UPDATE_PERIOD_MINUTES = 24 * 60;
export const BRANDS_DB_UPDATE_MAX_JITTER_MINUTES = 60;

const MANIFEST_URL = 'https://strime.github.io/arbiter-data/data/brands-manifest.json';
const FETCH_TIMEOUT_MS = 6_000;
const MAX_DOWNLOAD_BYTES = 2 * 1024 * 1024;
const MIN_PLAUSIBLE_RATIO = 0.8;

export const BrandsManifestSchema = z.object({
  schemaVersion: z.number().int().positive(),
  dataVersion: z.string().min(1),
  url: z.url(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  sizeBytes: z.number().int().positive(),
  minExtensionVersion: z.string().min(1),
  publishedAt: z.string().min(1),
});

export type BrandsManifest = z.infer<typeof BrandsManifestSchema>;

/**
 * Comparaison de versions segment par segment en NUMÉRIQUE (jamais en chaînes :
 * "0.10.0" < "0.9.0" lexicographiquement est le piège classique).
 * Retourne < 0 si a < b, 0 si égales, > 0 si a > b.
 */
export function compareExtensionVersions(a: string, b: string): number {
  const parse = (version: string): number[] =>
    version.split('.').map((segment) => {
      const value = Number.parseInt(segment, 10);
      return Number.isNaN(value) ? 0 : value;
    });
  const left = parse(a);
  const right = parse(b);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const l = left[i] ?? 0;
    const r = right[i] ?? 0;
    if (l !== r) return l < r ? -1 : 1;
  }
  return 0;
}

interface ManifestFetchResult {
  readonly manifest: BrandsManifest;
  readonly etag: string | null;
}

async function fetchManifest(storedEtag: string | null): Promise<ManifestFetchResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT_MS);
  try {
    const headers = new Headers();
    if (storedEtag !== null) headers.set('If-None-Match', storedEtag);
    const response = await fetch(MANIFEST_URL, { headers, signal: controller.signal });
    // 304 : le manifest n'a pas changé depuis le dernier ETag stocké — fini.
    if (response.status === 304) return null;
    if (!response.ok) return null;
    const json: unknown = await response.json();
    const parsed = BrandsManifestSchema.safeParse(json);
    if (!parsed.success) return null;
    return { manifest: parsed.data, etag: response.headers.get('ETag') };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Télécharge le corps EN FLUX avec compteur cumulatif plafonné : on n'accorde
 * aucune confiance au seul Content-Length, et on abort() dès le dépassement.
 */
async function downloadCapped(url: string): Promise<Uint8Array<ArrayBuffer> | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok || response.body === null) return null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_DOWNLOAD_BYTES) {
        controller.abort();
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function sha256Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Vérifie le manifest distant et applique l'overlay si tous les garde-fous
 * passent. Tout échec (réseau, hash, Zod, plausibilité) conserve l'existant :
 * console.debug, jamais d'erreur sortante — retry au prochain tick d'alarme.
 */
export async function runBrandsDbUpdate(): Promise<void> {
  try {
    const storedEtag = await readStoredEtag();
    const fetched = await fetchManifest(storedEtag);
    if (fetched === null) return;
    const { manifest, etag } = fetched;

    if (manifest.schemaVersion !== SUPPORTED_BRANDS_SCHEMA_VERSION) {
      console.debug('[arbiter] brands-db update skipped: unsupported schemaVersion', manifest.schemaVersion);
      return;
    }

    const extensionVersion = browser.runtime.getManifest().version;
    if (compareExtensionVersions(manifest.minExtensionVersion, extensionVersion) > 0) {
      console.debug('[arbiter] brands-db update skipped: requires extension', manifest.minExtensionVersion);
      return;
    }

    // ≠ et pas > : republier une version antérieure permet un rollback.
    const overlay = await readOverlay();
    if (overlay !== null && overlay.dataVersion === manifest.dataVersion) return;

    const bytes = await downloadCapped(manifest.url);
    if (bytes === null) {
      console.debug('[arbiter] brands-db update skipped: download failed or exceeded cap');
      return;
    }

    const hash = await sha256Hex(bytes);
    if (hash !== manifest.sha256) {
      console.debug('[arbiter] brands-db update skipped: sha256 mismatch');
      return;
    }

    if (bytes.byteLength !== manifest.sizeBytes) {
      console.debug('[arbiter] brands-db update skipped: sizeBytes mismatch');
      return;
    }

    const json: unknown = JSON.parse(new TextDecoder().decode(bytes));
    const parsed = BrandsFileSchema.safeParse(json);
    if (!parsed.success) {
      console.debug('[arbiter] brands-db update skipped: invalid brands file', parsed.error);
      return;
    }

    // La version interne du fichier téléchargé doit être égale au schemaVersion
    // annoncé par le manifest : refuse tout écart.
    if (parsed.data.version !== manifest.schemaVersion) {
      console.debug('[arbiter] brands-db update skipped: file/manifest version mismatch');
      return;
    }

    // Plausibilité : comparer au seul bundle figé laisserait passer un gros
    // recul une fois la vraie DB devenue plus grosse que la dernière release.
    const bundled = await fetchBundledBrandsFile().catch(() => null);
    const bundledCount = bundled?.brands.length ?? 0;
    const previousCount = overlay?.file.brands.length ?? 0;
    if (parsed.data.brands.length < MIN_PLAUSIBLE_RATIO * Math.max(bundledCount, previousCount)) {
      console.debug('[arbiter] brands-db update skipped: implausible entry count', parsed.data.brands.length);
      return;
    }

    await writeOverlay(manifest.dataVersion, parsed.data, etag);
    console.debug('[arbiter] brands-db overlay applied', manifest.dataVersion);
  } catch (error) {
    console.debug('[arbiter] brands-db update failed', error);
  }
}
