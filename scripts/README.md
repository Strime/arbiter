# scripts/

Build-time tooling. **Not bundled into the extension.** All entry points are `.mjs` (plain ESM JavaScript) — no TypeScript transpile needed.

## `build-brands-db.mjs`

Generates [`public/data/brands.json`](../public/data/brands.json) (chemin canonique : copié tel quel à la racine du zip par WXT, servi à `/data/brands.json`, et publié à l'identique sur gh-pages) from three sources :

1. **`sources/manual-overrides.json`** — hand-curated entries. **Source of truth.** Wins on every conflict. Edit this file when Wikidata is wrong or the brand isn't in Wikidata (private labels like `Carrefour Classic'`, regional FR brands like `Estandon`, etc.).
2. **`sources/harvest-carrefour.json`** — brand names harvested via chrome-devtools-mcp from real Carrefour Drive category pages. Used as input names for Wikidata label-based queries.
3. **OpenFoodFacts brand taxonomy** (`https://world.openfoodfacts.org/data/taxonomies/brands.json`) — fetched live, cached in `sources/off-taxonomy-cache.json`. ~460 brands, ~280 with direct Wikidata IDs (fast path).
4. **`sources/exclusions.json`** — blocklist appliquée en dernière couche du merge (gagne sur toutes les sources, `manual` compris). Contient des noms génériques de produits qui ne sont pas des marques (« Petit Beurre », « Cappuccino », « Orange »…) : avec le fallback `brandGuessed` (premier mot du titre), ces clés produiraient des faux positifs massifs.

Wikidata SPARQL (`https://query.wikidata.org/sparql`) provides `country of origin` (P495), `headquarters location` (P159), and `owned by` (P127). Cached per-query in `sources/wikidata-cache/`.

```bash
npm run build:brands
```

Output rendered as one entry per line for diff-friendliness. Re-run after editing `manual-overrides.json` or `harvest-carrefour.json`.

### Editing brand data

- **Never edit `brands.json` directly** — it is generated. Cela vaut aussi pour les scripts d'appoint : `measurements/add-harvest-brands.mjs` mutait `brands.json` hors pipeline ; ses entrées ont été rapatriées dans `sources/manual-overrides.json` (2026-08-14) et toute nouvelle marque doit passer par ce fichier.
- To pin a brand's metadata (override Wikidata or add a missing entry), edit `sources/manual-overrides.json` and re-run.
- To remove a generic non-brand key, add it to `sources/exclusions.json` and re-run.
- To re-query Wikidata (e.g. after a Wikidata edit), delete the relevant file in `sources/wikidata-cache/` or wipe the directory and re-run.

### Re-harvesting Carrefour

The `harvest-carrefour.json` snapshot is a static capture. To refresh it, re-run the chrome-devtools-mcp exploration of the same 8 categories listed in the file's `categories` field, extract brand names, and update.

## `measurements/eval-accuracy.mjs`

Harnais de précision : évalue `brands.json` contre `measurements/ground-truth.json` (~300 marques étiquetées à la main — top des harvests drive, MDD Intermarché/Leclerc/Carrefour/Auchan, cas pièges type filiales de multinationales et marques rachetées). Réplique la sémantique de lookup du runtime (`LocalBrandDbLoader` + `normalizeBrandKey`, match exact — sans le fallback par tokens d'`analyze.mjs`) et imprime couverture, précision pays, précision région et désaccords. Les cas `incertain: true` (rachats récents, JV, marque-héritage vs propriétaire) sont exclus des métriques et listés à part.

```bash
npm run eval:brands            # affichage complet
npm run eval:brands -- --gate  # mode CI : exit 1 si couverture < 95 % ou précision pays < 98 %
```

À relancer après chaque régénération de la base (non-régression). Le mode
`--gate` est utilisé par `.github/workflows/publish-data.yml` pour bloquer la
publication OTA en cas de régression.

## `publish/make-data-manifest.mjs`

Produit les artefacts de publication OTA dans `.output/data-publish/` :
`brands.json` (copie octet-à-octet de `public/data/brands.json`) et
`brands-manifest.json` (schemaVersion = champ `version` interne, dataVersion
datée sans état `AAAA-MM-JJ.HHMM` UTC, sha256, sizeBytes, minExtensionVersion
via `--min-ext-version`, défaut `0.1.0`). Déployé sur `gh-pages` sous `data/`
par le workflow `publish-data`.
