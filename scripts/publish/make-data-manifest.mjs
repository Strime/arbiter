#!/usr/bin/env node
// Génère les artefacts de publication OTA de la brand DB :
//   .output/data-publish/brands.json          (copie octet-à-octet de public/data/brands.json)
//   .output/data-publish/brands-manifest.json (manifest conforme au contrat OTA)
//
// Contrat du manifest (docs/brands-db-ota-updates.md) :
//   { schemaVersion, dataVersion, url, sha256, sizeBytes, minExtensionVersion, publishedAt }
//   - schemaVersion DOIT être égal au champ `version` interne de brands.json
//     (BrandsFileSchema) : c'est la version du FORMAT, le client refuse un écart.
//   - dataVersion : identifiant de PUBLICATION. Choix ici : `AAAA-MM-JJ.HHMM` (UTC),
//     volontairement SANS ÉTAT — pas de compteur N à persister entre deux runs CI ;
//     deux publications le même jour produisent des identifiants distincts, et le
//     client compare par `!==` (jamais par ordre), donc le format n'a besoin que
//     d'unicité pratique, pas de monotonie.
//   - sha256 : hex minuscule, calculé sur les octets exacts publiés (intégrité de
//     transit uniquement).
//
// Usage : node scripts/publish/make-data-manifest.mjs [--min-ext-version X.Y.Z]
//   --min-ext-version : borne basse de version d'extension capable de consommer
//                       ce fichier (défaut : 0.1.0).
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const INPUT = join(ROOT, 'public/data/brands.json');
const OUT_DIR = join(ROOT, '.output/data-publish');
const DATA_URL = 'https://strime.github.io/arbiter/data/brands.json';
const DEFAULT_MIN_EXT_VERSION = '0.1.0';

const readArg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const fail = (msg) => {
  console.error(`make-data-manifest : ${msg}`);
  process.exit(1);
};

const main = async () => {
  const minExtensionVersion = readArg('--min-ext-version', DEFAULT_MIN_EXT_VERSION);
  if (!/^\d+\.\d+\.\d+$/.test(minExtensionVersion)) {
    fail(`--min-ext-version invalide : "${minExtensionVersion}" (attendu X.Y.Z)`);
  }

  // Octets exacts publiés : sha256 et sizeBytes sont calculés sur le buffer copié
  // tel quel, jamais sur une re-sérialisation.
  const bytes = await readFile(INPUT).catch(() =>
    fail(`introuvable : ${INPUT} — lancer \`npm run build:brands\` d'abord`),
  );

  // Garde-fous minimaux sur le contenu (le format complet est validé côté client via Zod).
  let parsed;
  try {
    parsed = JSON.parse(bytes.toString('utf-8'));
  } catch {
    fail(`${INPUT} n'est pas un JSON valide`);
  }
  if (!Number.isInteger(parsed.version) || parsed.version < 1) {
    fail(`champ interne "version" invalide : ${JSON.stringify(parsed.version)}`);
  }
  if (!Array.isArray(parsed.brands) || parsed.brands.length === 0) {
    fail('champ interne "brands" absent ou vide');
  }

  const now = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  const dataVersion = `${now.getUTCFullYear()}-${p2(now.getUTCMonth() + 1)}-${p2(now.getUTCDate())}.${p2(now.getUTCHours())}${p2(now.getUTCMinutes())}`;

  const manifest = {
    schemaVersion: parsed.version,
    dataVersion,
    url: DATA_URL,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    sizeBytes: bytes.length,
    minExtensionVersion,
    publishedAt: now.toISOString(),
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, 'brands.json'), bytes);
  await writeFile(join(OUT_DIR, 'brands-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');

  console.log('=== make-data-manifest ===');
  console.log(`  entrées       : ${parsed.brands.length}`);
  console.log(`  manifest      : ${JSON.stringify(manifest, null, 2)}`);
  console.log(`  écrit dans    : ${OUT_DIR}`);
};

await main();
