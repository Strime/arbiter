import { BrandsFileSchema, SUPPORTED_BRANDS_SCHEMA_VERSION, type BrandsFile } from './schemas';

const NAMESPACE = 'cocarde.brands-db';

export const OVERLAY_VERSION_KEY = `${NAMESPACE}:version`;
export const OVERLAY_DATA_KEY = `${NAMESPACE}:data`;
export const OVERLAY_ETAG_KEY = `${NAMESPACE}:etag`;

export interface OverlayRecord {
  readonly dataVersion: string;
  readonly file: BrandsFile;
}

/**
 * Lit l'overlay OTA depuis storage.local. Retourne null si absent, corrompu
 * (Zod) ou de schéma incompatible — jamais d'erreur sortante.
 */
export async function readOverlay(): Promise<OverlayRecord | null> {
  try {
    const stored = await browser.storage.local.get([OVERLAY_VERSION_KEY, OVERLAY_DATA_KEY]);
    const dataVersion = stored[OVERLAY_VERSION_KEY];
    if (typeof dataVersion !== 'string') return null;
    const parsed = BrandsFileSchema.safeParse(stored[OVERLAY_DATA_KEY]);
    if (!parsed.success) return null;
    if (parsed.data.version !== SUPPORTED_BRANDS_SCHEMA_VERSION) return null;
    return { dataVersion, file: parsed.data };
  } catch {
    return null;
  }
}

export async function writeOverlay(
  dataVersion: string,
  file: BrandsFile,
  etag: string | null,
): Promise<void> {
  await browser.storage.local.set({
    [OVERLAY_VERSION_KEY]: dataVersion,
    [OVERLAY_DATA_KEY]: file,
    ...(etag !== null && { [OVERLAY_ETAG_KEY]: etag }),
  });
}

export async function readStoredEtag(): Promise<string | null> {
  try {
    const stored = await browser.storage.local.get(OVERLAY_ETAG_KEY);
    const etag = stored[OVERLAY_ETAG_KEY];
    return typeof etag === 'string' ? etag : null;
  } catch {
    return null;
  }
}
