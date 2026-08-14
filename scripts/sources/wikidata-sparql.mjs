import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, 'wikidata-cache');
const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'cocarde-brand-db-builder/0.1 (+https://github.com/Gaetan-S/arbiter)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cacheKey = (query) => createHash('sha1').update(query).digest('hex').slice(0, 16);

const readCached = async (key) => {
  try {
    return JSON.parse(await readFile(join(CACHE_DIR, `${key}.json`), 'utf-8'));
  } catch {
    return null;
  }
};

const writeCached = async (key, data) => {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(join(CACHE_DIR, `${key}.json`), JSON.stringify(data), 'utf-8');
};

const runSparql = async (query, { useCache = true, maxRetries = 3 } = {}) => {
  const key = cacheKey(query);
  if (useCache) {
    const cached = await readCached(key);
    if (cached) return cached;
  }
  const url = `${SPARQL_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' },
    });
    if (res.ok) {
      const data = await res.json();
      await writeCached(key, data);
      return data;
    }
    if ([429, 502, 503, 504].includes(res.status) && attempt < maxRetries) {
      const wait = 2000 * Math.pow(2, attempt);
      console.warn(`[sparql] ${res.status}, retry in ${wait}ms (attempt ${attempt + 1})`);
      await sleep(wait);
      continue;
    }
    throw new Error(`SPARQL failed: ${res.status} ${res.statusText}`);
  }
  throw new Error('SPARQL: exhausted retries');
};

const escapeSparqlLiteral = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

// Query by Wikidata IDs — fastest path, no label ambiguity.
export const queryByIds = async (ids) => {
  if (ids.length === 0) return new Map();
  const values = ids.map((id) => `wd:${id}`).join(' ');
  const query = `
SELECT ?brand ?brandLabel ?countryCode ?ownerLabel WHERE {
  VALUES ?brand { ${values} }
  OPTIONAL {
    { ?brand wdt:P495 ?country. } UNION { ?brand wdt:P159/wdt:P17 ?country. }
    ?country wdt:P297 ?countryCode.
  }
  OPTIONAL { ?brand wdt:P127 ?owner. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;
  const data = await runSparql(query);
  const map = new Map();
  for (const row of data.results.bindings) {
    const id = row.brand.value.split('/').pop();
    const prev = map.get(id);
    const entry = {
      id,
      name: row.brandLabel?.value ?? null,
      country: row.countryCode?.value ?? null,
      parentCompany: row.ownerLabel?.value ?? null,
    };
    // Prefer rows with country filled.
    if (!prev || (!prev.country && entry.country)) map.set(id, entry);
  }
  return map;
};

// Query by label (with altLabel fallback). Filter to brand/enterprise.
// Picks the candidate with the most filled fields when multiple match.
export const queryByLabels = async (names) => {
  if (names.length === 0) return new Map();
  const values = names.map((n) => `"${escapeSparqlLiteral(n)}"@en "${escapeSparqlLiteral(n)}"@fr`).join(' ');
  const query = `
SELECT ?name ?brand ?brandLabel ?countryCode ?ownerLabel WHERE {
  VALUES ?name { ${values} }
  { ?brand rdfs:label ?name. } UNION { ?brand skos:altLabel ?name. }
  ?brand wdt:P31/wdt:P279* ?type.
  FILTER(?type IN (wd:Q431289, wd:Q167270, wd:Q21125433, wd:Q6881511, wd:Q43229))
  OPTIONAL {
    { ?brand wdt:P495 ?country. } UNION { ?brand wdt:P159/wdt:P17 ?country. }
    ?country wdt:P297 ?countryCode.
  }
  OPTIONAL { ?brand wdt:P127 ?owner. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 1000`;
  const data = await runSparql(query);
  const byName = new Map();
  for (const row of data.results.bindings) {
    const name = row.name.value;
    const id = row.brand.value.split('/').pop();
    const entry = {
      id,
      name: row.brandLabel?.value ?? name,
      country: row.countryCode?.value ?? null,
      parentCompany: row.ownerLabel?.value ?? null,
    };
    const prev = byName.get(name);
    if (!prev) byName.set(name, entry);
    else {
      // Prefer the candidate with country filled, then parentCompany, then first one.
      const score = (e) => (e.country ? 2 : 0) + (e.parentCompany ? 1 : 0);
      if (score(entry) > score(prev)) byName.set(name, entry);
    }
  }
  return byName;
};

export const batched = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
