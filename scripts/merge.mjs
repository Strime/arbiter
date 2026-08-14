import { normalizeBrandKey } from './lib/normalize.mjs';

const sortByName = (entries) =>
  [...entries].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

// Sorting compatible with the existing brands.json: apostrophe-bearing names go before the
// plain-letter form (e.g. L'Oréal before Lactalis) because we want to keep the same human-
// readable order. localeCompare with sensitivity:'base' does that naturally for accents but
// not for apostrophes — fall back to codepoint order on tie.
const finalSort = (entries) =>
  [...entries].sort((a, b) => {
    const base = a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    if (base !== 0) return base;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });

export const mergeEntries = ({ wikidata, detrumpez = [], manualOverrides, exclusions = [] }) => {
  const byKey = new Map();
  // Layer 1: Wikidata (lowest priority — label-match noise expected).
  for (const e of wikidata) {
    if (!e.country) continue;
    byKey.set(normalizeBrandKey(e.name), e);
  }
  // Layer 2: detrumpez (curated, overrides Wikidata).
  for (const e of detrumpez) {
    if (!e.country) continue;
    byKey.set(normalizeBrandKey(e.name), e);
  }
  // Layer 3: manual overrides (human source of truth, wins on conflict).
  for (const e of manualOverrides) {
    byKey.set(normalizeBrandKey(e.name), e);
  }
  // Layer 4: exclusions — generic product words that are not brands. Removed last so they
  // win over every source, including manual.
  for (const name of exclusions) {
    byKey.delete(normalizeBrandKey(name));
  }
  return finalSort([...byKey.values()]);
};

export const validateNoDuplicateKeys = (entries) => {
  const seen = new Map();
  const dups = [];
  for (const e of entries) {
    const k = normalizeBrandKey(e.name);
    if (seen.has(k)) dups.push({ key: k, names: [seen.get(k), e.name] });
    else seen.set(k, e.name);
  }
  if (dups.length > 0) {
    throw new Error(`Duplicate normalized keys: ${JSON.stringify(dups)}`);
  }
};
