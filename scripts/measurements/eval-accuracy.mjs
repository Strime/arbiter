#!/usr/bin/env node
// Mesure la qualité de brands.json contre ground-truth.json en répliquant la sémantique
// de lookup du RUNTIME (LocalBrandDbLoader + LocalBrandOriginRepository) : match EXACT
// sur clé normalisée — pas de fallback par tokens (celui d'analyze.mjs est une
// approximation qui n'existe pas dans l'extension).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRANDS_PATH = path.join(
  __dirname, '..', '..',
  'src/features/origin-detection/data/datasources/local-brand-db/brands.json',
);
const GROUND_TRUTH_PATH = path.join(__dirname, 'ground-truth.json');

// Réplique de src/features/origin-detection/data/datasources/local-brand-db/normalize.ts
const DIACRITICS = /[̀-ͯ]/g;
const NON_ALPHANUM = /[^a-z0-9]/g;
const normalizeBrandKey = (s) =>
  s.toLowerCase().normalize('NFD').replace(DIACRITICS, '').replace(NON_ALPHANUM, '');

// Réplique de regionOf() de src/features/origin-detection/domain/entities/origin.ts
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);
const regionOf = (country) => {
  if (!country) return 'UNKNOWN';
  if (country === 'FR') return 'FR';
  if (country === 'US') return 'US';
  if (country === 'EU') return 'EU';
  if (EU_COUNTRIES.has(country)) return 'EU';
  return 'OTHER';
};

const db = JSON.parse(fs.readFileSync(BRANDS_PATH, 'utf-8'));
const groundTruth = JSON.parse(fs.readFileSync(GROUND_TRUTH_PATH, 'utf-8'));

// Réplique de LocalBrandDbLoader.load() : Map clé normalisée → entrée (la dernière gagne).
const lookup = new Map();
for (const entry of db.brands) lookup.set(normalizeBrandKey(entry.name), entry);

const cases = groundTruth.cases;
const certain = [];
const uncertain = [];
for (const c of cases) (c.incertain ? uncertain : certain).push(c);

let hits = 0;
let countryOk = 0;
let regionOk = 0;
const misses = [];
const disagreements = [];
const uncertainHits = [];

for (const c of certain) {
  const entry = lookup.get(normalizeBrandKey(c.brand));
  if (!entry) {
    misses.push(c.brand);
    continue;
  }
  hits += 1;
  const gotRegion = regionOf(entry.country);
  const cOk = entry.country === c.expectedCountry;
  const rOk = gotRegion === c.expectedRegion;
  if (cOk) countryOk += 1;
  if (rOk) regionOk += 1;
  if (!cOk || !rOk) {
    disagreements.push({
      brand: c.brand,
      expected: `${c.expectedCountry}/${c.expectedRegion}`,
      got: `${entry.country}/${gotRegion}`,
      dbName: entry.name,
      source: entry.source,
      note: c.note ?? '',
    });
  }
}

for (const c of uncertain) {
  const entry = lookup.get(normalizeBrandKey(c.brand));
  if (!entry) continue;
  const gotRegion = regionOf(entry.country);
  if (entry.country !== c.expectedCountry || gotRegion !== c.expectedRegion) {
    uncertainHits.push({
      brand: c.brand,
      expected: `${c.expectedCountry}/${c.expectedRegion}`,
      got: `${entry.country}/${gotRegion}`,
      source: entry.source,
      note: c.note ?? '',
    });
  }
}

const pct = (n, d) => (d === 0 ? '—' : `${((n / d) * 100).toFixed(1)}%`);

console.log('=== eval-accuracy (sémantique runtime : match exact sur clé normalisée) ===');
console.log(`base           : ${db.brands.length} entrées`);
console.log(`vérité terrain : ${cases.length} cas (${certain.length} certains, ${uncertain.length} incertains)`);
console.log('');
console.log('--- métriques (cas certains uniquement) ---');
console.log(`couverture (hit rate)   : ${hits}/${certain.length} (${pct(hits, certain.length)})`);
console.log(`précision pays  (hits)  : ${countryOk}/${hits} (${pct(countryOk, hits)})`);
console.log(`précision région (hits) : ${regionOk}/${hits} (${pct(regionOk, hits)})`);

console.log('');
console.log(`--- désaccords (${disagreements.length}) ---`);
for (const d of disagreements) {
  console.log(`  ${d.brand.padEnd(28)} attendu ${d.expected.padEnd(9)} obtenu ${d.got.padEnd(9)} [${d.source}] ${d.note}`);
}

console.log('');
console.log(`--- misses (${misses.length}) ---`);
for (const m of misses) console.log(`  ${m}`);

console.log('');
console.log(`--- cas incertains en désaccord (info, hors métriques) (${uncertainHits.length}) ---`);
for (const d of uncertainHits) {
  console.log(`  ${d.brand.padEnd(28)} attendu ${d.expected.padEnd(9)} obtenu ${d.got.padEnd(9)} [${d.source}] ${d.note}`);
}
