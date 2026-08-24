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
npm run zip:all            # les deux

# Soumission aux stores (secrets dans .env.submit, cf. docs/store-submission.md)
npm run submit:dry         # vérifie l'authentification, n'envoie rien
npm run submit             # Chrome + Firefox

# Type check
npm run compile
```

Publier une mise à jour : bump de `version` dans `package.json`, commit, puis
tag `vX.Y.Z` — la CI build, zippe et soumet aux stores. Détail et obtention des
secrets : [docs/store-submission.md](docs/store-submission.md).

Charger l'extension en dev : `chrome://extensions` → "Load unpacked" → `output/chrome-mv3/`.

## Build de production (reproduction exacte — revue AMO)

Environnement : tout OS (build de référence : macOS 15, arm64). Prérequis :
[Node.js](https://nodejs.org/) ≥ 22 (build de référence : Node 25.6.1,
npm 11.9.0). Aucune variable d'environnement ni secret requis.

```bash
npm ci                 # installe les dépendances exactes (package-lock.json)
npm run zip:firefox    # → output/arbiter-<version>-firefox.zip
npm run zip            # → output/arbiter-<version>-chrome.zip
```

`npm ci` exécute `wxt prepare` (postinstall, génère `.wxt/`) ; le build
bundle et minifie via WXT/Vite. Le contenu du zip est reproductible à
l'identique, seuls les timestamps des entrées zip diffèrent.

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
