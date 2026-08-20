# Coquade

Extension cross-browser qui affiche l'origine des produits (marque + fabrication) sur les sites de drive français — Carrefour, Intermarché, Auchan, Leclerc, Lidl. But : favoriser FR/EU, éviter US.

L'origine est mesurée sur **deux dimensions distinctes** :
- **Marque** : nationalité de l'entreprise propriétaire (Head & Shoulders = US, même fabriqué en Belgique).
- **Fabrication** : lieu physique de production (extrait des mentions "Origine: France", AOP/AOC/IGP, OpenFoodFacts).

## Stack

- [WXT](https://wxt.dev/) + Vite + React 19 + TypeScript strict
- [Zod](https://zod.dev/) pour la validation runtime de toute donnée externe
- Cross-browser : Chrome MV3, Firefox MV2 (cible par défaut de WXT 0.20), Edge MV3
- V0 : 100% local (chrome.storage + brand DB bundled + OpenFoodFacts via background)
- V1 (roadmap) : Firebase Auth + Firestore + Cloud Functions

## Quick start

```bash
npm install

# Chrome (default)
npm run dev

# Firefox
npm run dev:firefox

# Production builds
npm run build              # Chrome
npm run build:firefox      # Firefox

# Zip per store
npm run zip
npm run zip:firefox

# Type check
npm run compile
```

Charger l'extension en dev : `chrome://extensions` → "Load unpacked" → `output/chrome-mv3/`.

## Architecture — Feature-first Clean Architecture

```
src/
├── features/
│   ├── origin-detection/    # moteur — brand origin + manufacturing origin
│   ├── site-adapters/       # plugins DOM par site (Carrefour, etc.)
│   ├── badge-injection/     # rendu Shadow DOM du badge
│   └── preferences/         # toggle on/off, popup, options
├── core/
│   ├── messaging/           # protocole typé content ↔ background (Zod)
│   ├── observer/            # MutationObserver helper (throttle + cleanup)
│   ├── di/                  # composition roots par entrypoint
│   └── result/              # Result<T, E>
└── entrypoints/             # wiring fin (WXT)
    ├── background.ts
    ├── content.ts
    ├── popup/
    └── options/
```

Règles non négociables :
- Pas d'import cross-feature en dehors des use-cases publics
- Repository pattern : `browser.storage` / `fetch` / `firebase` uniquement dans `features/*/data/**`
- Composition roots uniquement dans `core/di/*-container.ts`
- Models data = primitives, mappers obligatoires
- Zod à toute frontière externe
- Badge en Shadow DOM (isolation CSS totale)

## Sites supportés

| Site | Statut V0 |
|---|---|
| Carrefour Drive | adapter calibré sur DOM réel |
| Intermarché Drive | adapter calibré sur DOM réel |
| Auchan Drive | adapter en place — sélecteurs spéculatifs, jamais validés en live |
| Leclerc Drive | adapter en place — sélecteurs spéculatifs, jamais validés en live |
| Lidl | adapter en place (pas d'EAN extrait → pas de fallback OpenFoodFacts) |

## Roadmap

- **V0** (actuel) : Carrefour + brand DB local + heuristiques + OFF fallback via background
- **V0.x** : adapters Intermarché / Auchan / Leclerc, croissance brand DB
- **V1** : Firebase Auth (`browser.identity.launchWebAuthFlow` + custom token), Firestore sync préférences, Cloud Function proxy OpenFoodFacts avec cache mutualisé
- **Stores** : Chrome Web Store, AMO, Edge Add-ons

## Pour Claude

Le projet définit 4 agents dans [.claude/agents/](.claude/agents/) :

- **[extension-architect](.claude/agents/extension-architect.md)** — tech lead MV3 cross-browser + Clean Archi + plan V1 Firebase
- **[site-adapter-author](.claude/agents/site-adapter-author.md)** — auteur des scrapers DOM par site
- **[origin-data-curator](.claude/agents/origin-data-curator.md)** — owner brand DB + OFF + heuristiques + dual signal
- **[extension-reviewer](.claude/agents/extension-reviewer.md)** — review + git workflow (conventional commits) + cross-browser parity
