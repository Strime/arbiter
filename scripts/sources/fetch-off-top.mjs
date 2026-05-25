import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, 'off-taxonomy-cache.json');
const OFF_TAXONOMY_URL = 'https://world.openfoodfacts.org/data/taxonomies/brands.json';

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

export const fetchOffTaxonomy = async ({ useCache = true } = {}) => {
  if (useCache) {
    const cached = await readCache();
    if (cached) {
      console.log(`[off] using cached taxonomy (${Object.keys(cached).length} entries)`);
      return cached;
    }
  }
  console.log(`[off] fetching ${OFF_TAXONOMY_URL}`);
  const res = await fetch(OFF_TAXONOMY_URL, {
    headers: {
      'User-Agent': 'arbiter-brand-db-builder/0.1 (+https://github.com/Gaetan-S/arbiter)',
      Accept: 'application/json',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`OFF taxonomy fetch failed: ${res.status}`);
  const data = await res.json();
  await writeCache(data);
  console.log(`[off] received ${Object.keys(data).length} taxonomy entries`);
  return data;
};

const preferredName = (entry, key) =>
  entry.name?.en || entry.name?.fr || entry.name?.xx || key.replace(/^[a-z]{2}:/, '');

export const extractBrandsFromTaxonomy = (taxonomy) => {
  return Object.entries(taxonomy).map(([key, entry]) => ({
    name: preferredName(entry, key),
    wikidataId: entry.wikidata?.en ?? null,
    source: 'off-taxonomy',
  }));
};
