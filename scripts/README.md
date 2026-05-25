# scripts/

Build-time tooling. **Not bundled into the extension.** All entry points are `.mjs` (plain ESM JavaScript) — no TypeScript transpile needed.

## `build-brands-db.mjs`

Generates [`src/features/origin-detection/data/datasources/local-brand-db/brands.json`](../src/features/origin-detection/data/datasources/local-brand-db/brands.json) from three sources :

1. **`sources/manual-overrides.json`** — hand-curated entries. **Source of truth.** Wins on every conflict. Edit this file when Wikidata is wrong or the brand isn't in Wikidata (private labels like `Carrefour Classic'`, regional FR brands like `Estandon`, etc.).
2. **`sources/harvest-carrefour.json`** — brand names harvested via chrome-devtools-mcp from real Carrefour Drive category pages. Used as input names for Wikidata label-based queries.
3. **OpenFoodFacts brand taxonomy** (`https://world.openfoodfacts.org/data/taxonomies/brands.json`) — fetched live, cached in `sources/off-taxonomy-cache.json`. ~460 brands, ~280 with direct Wikidata IDs (fast path).

Wikidata SPARQL (`https://query.wikidata.org/sparql`) provides `country of origin` (P495), `headquarters location` (P159), and `owned by` (P127). Cached per-query in `sources/wikidata-cache/`.

```bash
npm run build:brands
```

Output rendered as one entry per line for diff-friendliness. Re-run after editing `manual-overrides.json` or `harvest-carrefour.json`.

### Editing brand data

- **Never edit `brands.json` directly** — it is generated.
- To pin a brand's metadata (override Wikidata or add a missing entry), edit `sources/manual-overrides.json` and re-run.
- To re-query Wikidata (e.g. after a Wikidata edit), delete the relevant file in `sources/wikidata-cache/` or wipe the directory and re-run.

### Re-harvesting Carrefour

The `harvest-carrefour.json` snapshot is a static capture. To refresh it, re-run the chrome-devtools-mcp exploration of the same 8 categories listed in the file's `categories` field, extract brand names, and update.
