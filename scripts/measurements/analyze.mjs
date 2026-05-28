import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const BRANDS_PATH = path.join(ROOT, '..', '..', 'src', 'features', 'origin-detection', 'data', 'datasources', 'local-brand-db', 'brands.json');

const DIACRITICS = /[̀-ͯ]/g;
const NON_ALPHANUM = /[^a-z0-9]/g;
const normalize = (s) => s.toLowerCase().normalize('NFD').replace(DIACRITICS, '').replace(NON_ALPHANUM, '');

const EU = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE']);
const regionOf = (c) => {
  if (!c) return 'UNKNOWN';
  if (c === 'FR') return 'FR';
  if (c === 'US') return 'US';
  if (EU.has(c)) return 'EU';
  return 'OTHER';
};

const db = JSON.parse(fs.readFileSync(BRANDS_PATH, 'utf-8'));
const lookup = new Map();
for (const b of db.brands) lookup.set(normalize(b.name), b);

function lookupBrand(brandRaw) {
  if (!brandRaw) return null;
  const key = normalize(brandRaw);
  if (!key) return null;
  const direct = lookup.get(key);
  if (direct) return direct;
  // Try splitting on whitespace and taking first token (common pattern: "MILKA OREO" → MILKA)
  const tokens = brandRaw.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    const hit = lookup.get(normalize(t));
    if (hit) return hit;
  }
  return null;
}

function analyze(label, file) {
  const products = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const stats = {
    total: products.length,
    noBrand: 0,
    hit: 0,
    miss: 0,
    byRegion: { FR: 0, EU: 0, US: 0, OTHER: 0 },
    misses: [],
  };
  for (const p of products) {
    const brand = (p.brand ?? '').trim();
    if (!brand) { stats.noBrand++; continue; }
    const entry = lookupBrand(brand);
    if (!entry) { stats.miss++; stats.misses.push(brand); continue; }
    stats.hit++;
    stats.byRegion[regionOf(entry.country)]++;
  }
  return { label, ...stats };
}

const files = [
  ['CF biscuits', 'cf-biscuits.json'],
  ['CF shampoing', 'cf-shampoing.json'],
  ['CF céréales', 'cf-cereales.json'],
  ['CF lessive', 'cf-lessive.json'],
  ['CF eau', 'cf-eau.json'],
  ['AU biscuits', 'au-biscuits.json'],
  ['AU shampoing', 'au-shampoing.json'],
  ['AU céréales', 'au-cereales.json'],
  ['AU eau', 'au-eau.json'],
  ['AU pains', 'au-pains.json'],
];

const results = files.map(([label, f]) => analyze(label, path.join(ROOT, f)));

console.log('\n=== PER RAYON ===\n');
console.log('Rayon          | total | no-brand | hit | miss | hit%  | FR | EU | US | OTHER');
console.log('-'.repeat(95));
for (const r of results) {
  const branded = r.total - r.noBrand;
  const hitPct = branded ? Math.round((r.hit / branded) * 100) : 0;
  console.log(
    `${r.label.padEnd(14)} | ${String(r.total).padStart(5)} | ${String(r.noBrand).padStart(8)} | ${String(r.hit).padStart(3)} | ${String(r.miss).padStart(4)} | ${String(hitPct).padStart(3)}%  | ${String(r.byRegion.FR).padStart(2)} | ${String(r.byRegion.EU).padStart(2)} | ${String(r.byRegion.US).padStart(2)} | ${String(r.byRegion.OTHER).padStart(2)}`
  );
}

const agg = results.reduce((a, r) => ({
  total: a.total + r.total,
  noBrand: a.noBrand + r.noBrand,
  hit: a.hit + r.hit,
  miss: a.miss + r.miss,
  byRegion: {
    FR: a.byRegion.FR + r.byRegion.FR,
    EU: a.byRegion.EU + r.byRegion.EU,
    US: a.byRegion.US + r.byRegion.US,
    OTHER: a.byRegion.OTHER + r.byRegion.OTHER,
  },
  misses: [...a.misses, ...r.misses],
}), { total: 0, noBrand: 0, hit: 0, miss: 0, byRegion: { FR:0, EU:0, US:0, OTHER:0 }, misses: [] });

console.log('\n=== GLOBAL ===\n');
console.log(`Total products inspected:  ${agg.total}`);
console.log(`Products with brand:       ${agg.total - agg.noBrand} (${Math.round(((agg.total - agg.noBrand) / agg.total) * 100)}%)`);
console.log(`Products without brand:    ${agg.noBrand}`);
console.log(`Brand DB hits:             ${agg.hit} (${Math.round((agg.hit / (agg.total - agg.noBrand)) * 100)}% of branded)`);
console.log(`Brand DB misses:           ${agg.miss}`);
console.log('\nVerdict distribution (over hits):');
console.log(`  FR:    ${agg.byRegion.FR} (${Math.round((agg.byRegion.FR / agg.hit) * 100)}%)`);
console.log(`  EU:    ${agg.byRegion.EU} (${Math.round((agg.byRegion.EU / agg.hit) * 100)}%)`);
console.log(`  US:    ${agg.byRegion.US} (${Math.round((agg.byRegion.US / agg.hit) * 100)}%)`);
console.log(`  OTHER: ${agg.byRegion.OTHER} (${Math.round((agg.byRegion.OTHER / agg.hit) * 100)}%)`);

console.log('\n=== TOP MISSED BRANDS (candidates to add to DB) ===\n');
const missCount = new Map();
for (const m of agg.misses) missCount.set(m, (missCount.get(m) ?? 0) + 1);
const sorted = Array.from(missCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 25);
for (const [brand, n] of sorted) console.log(`  ${String(n).padStart(3)}× ${brand}`);
