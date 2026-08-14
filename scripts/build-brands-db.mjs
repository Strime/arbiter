#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchOffTaxonomy, extractBrandsFromTaxonomy } from './sources/fetch-off-top.mjs';
import { fetchDetrumpezBrands, extractMappedEntries } from './sources/fetch-detrumpez.mjs';
import { queryByIds, queryByLabels, batched } from './sources/wikidata-sparql.mjs';
import { normalizeBrandKey } from './lib/normalize.mjs';
import { mergeEntries, validateNoDuplicateKeys } from './merge.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARREFOUR_HARVEST = join(__dirname, 'sources/harvest-carrefour.json');
const AUCHAN_HARVEST = join(__dirname, 'sources/harvest-auchan.json');
const MANUAL_OVERRIDES = join(__dirname, 'sources/manual-overrides.json');
const EXCLUSIONS = join(__dirname, 'sources/exclusions.json');
// Chemin canonique de la DB bundlée : copiée telle quelle à la racine du zip par WXT
// (servie à /data/brands.json), et publiée à l'identique sur gh-pages par le job publish-data.
const OUTPUT = join(ROOT, 'public/data/brands.json');
const TODAY = '2026-05-25';

const readJson = async (p) => JSON.parse(await readFile(p, 'utf-8'));

const main = async () => {
  console.log('=== build-brands-db ===');

  // 1. Load source lists.
  const carrefour = await readJson(CARREFOUR_HARVEST);
  const auchan = await readJson(AUCHAN_HARVEST);
  const manual = await readJson(MANUAL_OVERRIDES);
  const exclusions = await readJson(EXCLUSIONS);
  const offTaxonomy = await fetchOffTaxonomy();
  const offEntries = extractBrandsFromTaxonomy(offTaxonomy);
  const detrumpezRaw = await fetchDetrumpezBrands();
  const detrumpezEntries = extractMappedEntries(detrumpezRaw);
  console.log(`  carrefour harvest : ${carrefour.brands.length}`);
  console.log(`  auchan harvest    : ${auchan.brands.length}`);
  console.log(`  manual overrides  : ${manual.brands.length}`);
  console.log(`  exclusions        : ${exclusions.exclusions.length}`);
  console.log(`  off taxonomy      : ${offEntries.length} (${offEntries.filter((e) => e.wikidataId).length} with wikidataId)`);
  console.log(`  detrumpez         : ${detrumpezEntries.length} (mapped from ${detrumpezRaw.length} raw)`);

  // 2. Build the input set for Wikidata enrichment.
  //    - Names from drive harvests (no IDs, ALL CAPS extracted from DOM)
  //    - OFF entries split: with-ID → fast path, without-ID → label fallback
  const offWithId = offEntries.filter((e) => e.wikidataId);
  const offWithoutId = offEntries.filter((e) => !e.wikidataId);
  const namesForLabelQuery = [
    ...carrefour.brands.map((s) => titleCase(s)),
    ...auchan.brands.map((s) => titleCase(s)),
    ...offWithoutId.map((e) => e.name),
  ];
  // Dedup by normalized key.
  const seenNorm = new Set();
  const uniqueLabelNames = [];
  for (const n of namesForLabelQuery) {
    const k = normalizeBrandKey(n);
    if (k && !seenNorm.has(k)) {
      seenNorm.add(k);
      uniqueLabelNames.push(n);
    }
  }
  console.log(`  → wikidata by ID  : ${offWithId.length}`);
  console.log(`  → wikidata by lbl : ${uniqueLabelNames.length} (dedup from ${namesForLabelQuery.length})`);

  // 3. Run SPARQL batches.
  const wikidataResults = [];

  for (const batch of batched(offWithId.map((e) => e.wikidataId), 50)) {
    const res = await queryByIds(batch);
    for (const [, v] of res) {
      if (v.country && v.name && v.name !== v.id) {
        wikidataResults.push({
          name: v.name,
          country: v.country,
          parentCompany: v.parentCompany ?? undefined,
          source: 'wikidata',
          confidence: 0.85,
          addedAt: TODAY,
        });
      }
    }
  }
  console.log(`  wikidata-by-id results with country: ${wikidataResults.length}`);

  const beforeLabelCount = wikidataResults.length;
  for (const batch of batched(uniqueLabelNames, 50)) {
    const res = await queryByLabels(batch);
    for (const [inputName, v] of res) {
      if (!v.country) continue;
      // Prefer the input name (matches DOM extraction) when it normalizes the same as
      // the Wikidata canonical label. Otherwise use the Wikidata label.
      const useName = normalizeBrandKey(inputName) === normalizeBrandKey(v.name) ? v.name : inputName;
      wikidataResults.push({
        name: useName,
        country: v.country,
        parentCompany: v.parentCompany ?? undefined,
        source: 'wikidata',
        confidence: 0.85,
        addedAt: TODAY,
      });
    }
  }
  console.log(`  wikidata-by-label results with country: ${wikidataResults.length - beforeLabelCount}`);

  // 4. Merge — layered priority: wikidata < detrumpez < manual, puis exclusions (retrait).
  const merged = mergeEntries({
    wikidata: wikidataResults,
    detrumpez: detrumpezEntries,
    manualOverrides: manual.brands,
    exclusions: exclusions.exclusions.map((e) => e.name),
  });
  validateNoDuplicateKeys(merged);

  // Strip undefined fields for clean JSON.
  const cleaned = merged.map((e) => {
    const o = { name: e.name, country: e.country };
    if (e.parentCompany) o.parentCompany = e.parentCompany;
    o.source = e.source;
    o.confidence = e.confidence;
    o.addedAt = e.addedAt;
    return o;
  });

  const out = { version: 1, brands: cleaned };

  // Render with one entry per line for diffability.
  const jsonBody = cleaned
    .map((e) => '    ' + JSON.stringify(e))
    .join(',\n');
  const rendered = `{\n  "version": 1,\n  "brands": [\n${jsonBody}\n  ]\n}\n`;

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, rendered, 'utf-8');

  // Stats.
  const bySource = {};
  for (const e of cleaned) bySource[e.source] = (bySource[e.source] ?? 0) + 1;
  console.log('=== output ===');
  console.log(`  total entries  : ${cleaned.length}`);
  console.log(`  by source      : ${JSON.stringify(bySource)}`);
  const byCountry = {};
  for (const e of cleaned) byCountry[e.country] = (byCountry[e.country] ?? 0) + 1;
  console.log(`  by country     : ${JSON.stringify(byCountry)}`);
  console.log(`  written to     : ${OUTPUT}`);
};

// Title-case helper for ALL-CAPS inputs from MCP harvest ("NESCAFE" → "Nescafe").
// Doesn't try to be smart — just helps SPARQL label matching where case can matter.
const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|\s|['-])([a-zà-ÿ])/g, (_, sep, c) => sep + c.toUpperCase());

await main();
