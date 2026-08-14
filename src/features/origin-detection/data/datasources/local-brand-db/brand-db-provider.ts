import { BrandsFileSchema, type BrandsFile } from './schemas';
import { normalizeBrandKey } from './normalize';
import type { BrandEntryModel } from '../../models/brand-entry-model';
import { readOverlay } from './overlay-storage';

export const BUNDLED_DB_PATH = '/data/brands.json';

/** Charge et valide la copie bundlée dans le zip (fallback permanent). */
export async function fetchBundledBrandsFile(): Promise<BrandsFile> {
  const response = await fetch(browser.runtime.getURL(BUNDLED_DB_PATH));
  if (!response.ok) {
    throw new Error(`bundled brands.json unreadable (HTTP ${String(response.status)})`);
  }
  const json: unknown = await response.json();
  return BrandsFileSchema.parse(json);
}

function buildMap(file: BrandsFile): Map<string, BrandEntryModel> {
  const map = new Map<string, BrandEntryModel>();
  for (const entry of file.brands) {
    map.set(normalizeBrandKey(entry.name), entry);
  }
  return map;
}

async function resolveMap(): Promise<Map<string, BrandEntryModel>> {
  // Overlay OTA prioritaire s'il est présent et de schéma compatible ; le
  // bundle reste le plancher de qualité (jamais supprimé).
  const overlay = await readOverlay();
  if (overlay) return buildMap(overlay.file);
  return buildMap(await fetchBundledBrandsFile());
}

// Mémoïsation au niveau module : une seule construction par vie du service
// worker, partagée entre toutes les instances du provider.
let cachedMap: Promise<Map<string, BrandEntryModel>> | null = null;

export class BrandDbProvider {
  load(): Promise<Map<string, BrandEntryModel>> {
    cachedMap ??= resolveMap().catch((error: unknown) => {
      // Échec de lecture (asset ou storage) : Map vide, jamais d'erreur
      // sortante, et pas de mémoïsation de l'échec (retente au prochain appel).
      cachedMap = null;
      console.debug('[arbiter] brand-db load failed', error);
      return new Map<string, BrandEntryModel>();
    });
    return cachedMap;
  }
}

/** Réservé aux tests : purge la mémoïsation module. */
export function resetBrandDbProviderCacheForTests(): void {
  cachedMap = null;
}
