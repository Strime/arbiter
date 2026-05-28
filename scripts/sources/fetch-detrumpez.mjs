import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, 'detrumpez-cache.json');
const SOURCE_URL =
  'https://raw.githubusercontent.com/Sacha213/detrumpez-vous/main/assets/brandlist.json';

const TODAY = '2026-05-25';

const readCache = async () => {
  try {
    return JSON.parse(await readFile(CACHE_PATH, 'utf-8'));
  } catch {
    return null;
  }
};

const writeCache = async (data) => {
  await mkdir(dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(data), 'utf-8');
};

export const fetchDetrumpezBrands = async ({ useCache = true } = {}) => {
  if (useCache) {
    const cached = await readCache();
    if (cached) {
      console.log(`[detrumpez] using cache (${cached.length} entries)`);
      return cached;
    }
  }
  console.log(`[detrumpez] fetching ${SOURCE_URL}`);
  const res = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent': 'arbiter-brand-db-builder/0.1 (+https://github.com/Gaetan-S/arbiter)',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`detrumpez fetch failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('detrumpez: expected JSON array');
  await writeCache(data);
  console.log(`[detrumpez] received ${data.length} brand entries`);
  return data;
};

// Map a detrumpez entry to our BrandEntry schema.
// Skip entries with empty parentOrigin (no useful classification).
// Their `origin` field (product manufacturing origin) is intentionally dropped — our
// architecture computes manufacturing origin dynamically via heuristics + OFF API, not
// from the brand DB.
// ISO 3166-1 alpha-2 country codes are exactly two uppercase ASCII letters.
// Detrumpez free-text values like "INCONNU", "Variable (ex: FR, BE)", "IT/CH",
// "GB / US" are rejected here — the BrandEntrySchema enforces .length(2) at runtime
// and would crash the loader otherwise.
const ISO_3166_ALPHA2 = /^[A-Z]{2}$/;

export const mapDetrumpezEntry = (entry) => {
  if (!entry || typeof entry.name !== 'string' || !entry.parentOrigin) return null;
  if (!ISO_3166_ALPHA2.test(entry.parentOrigin)) return null;
  const result = {
    name: entry.name,
    country: entry.parentOrigin,
    source: 'detrumpez',
    confidence: 0.9,
    addedAt: TODAY,
  };
  if (entry.parentCompany && typeof entry.parentCompany === 'string') {
    result.parentCompany = entry.parentCompany;
  }
  return result;
};

export const extractMappedEntries = (rawEntries) =>
  rawEntries.map(mapDetrumpezEntry).filter((e) => e !== null);
