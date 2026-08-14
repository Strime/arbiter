# Plan — mise à jour de brands.json sans release store (OTA)

*Revu par l'agent extension-architect (14 août 2026) : architecture validée,
précisions d'implémentation intégrées ci-dessous. Sources vérifiées : code WXT
(copie de `public/`, fusion `host_permissions`→`permissions` en MV2), doc
Chrome (CORS/service worker, alarms), test HTTP réel sur GitHub Pages.*

**Problème** : brands.json (3 727 entrées, ~500 Ko) est bundlé dans le zip et
inliné dans `background.js`. Corriger UNE donnée erronée exige : commit →
release → review store (heures à jours sur CWS, plus long sur AMO, pire sur
Edge) → propagation des mises à jour navigateur. Un verdict faux signalé reste
donc visible plusieurs jours, et la donnée périme toute seule (rachats de
marques, nouvelles MDD).

**Cible** : la DB devient une donnée versionnée, mise à jour over-the-air en
< 24 h, avec la copie bundlée comme fallback permanent. Aucun code distant
(politique CWS/AMO : le *code* distant est interdit, les *données* pures
jamais exécutées sont autorisées — pratique établie, cf. listes de filtres des
bloqueurs de pub), aucune donnée utilisateur envoyée.

---

## Architecture

```
┌────────────── release store (rare) ──────────────┐
│ zip : public/data/brands.json  (fallback bundlé) │
└──────────────────────────────────────────────────┘
┌────────────── publication data (fréquente) ──────┐
│ CI (merge sur main touchant scripts/sources/**)  │
│   build:brands → eval:brands (gate) → gh-pages   │
│   ├─ data/brands-manifest.json   (~200 o)        │
│   └─ data/brands.json            (~500 Ko)       │
└──────────────────────────────────────────────────┘
                     │  alarme quotidienne (background)
                     ▼
   storage.local  arbiter.brands-db:{version,data}
                     │
                     ▼
   BrandDbProvider : overlay storage si valide, sinon bundle
```

### Prérequis — fiabiliser les alarmes du background ✅ (corrigé)

Le `browser.alarms.create()` inconditionnel au top-level de `background.ts`
remplaçait l'alarme (et son décompte) à chaque réveil du service worker : sur
une session active, une alarme périodique peut ainsi ne jamais sonner. Corrigé
par une garde `alarms.get()` avant `create()`. **Toute nouvelle alarme (dont
celle du plan) doit suivre ce pattern**, sans quoi le jitter (voir plus bas)
se re-tirerait à chaque réveil et l'OTA pourrait silencieusement ne jamais
tourner. Le dispatch se fait par nom dans l'unique listener `onAlarm` existant.

### Étape A — sortir la DB du bundle background (prérequis, gain immédiat)

- `brands.json` déplacé vers `public/data/brands.json` (vérifié dans le code
  WXT : `public/` est copié tel quel à la racine du zip, MV2 comme MV3).
  L'import statique disparaît : `background.js` retombe de ~515 Ko à ~15 Ko et
  le service worker ne re-parse plus 500 Ko à chaque réveil.
- Lecture via `fetch(browser.runtime.getURL('/data/brands.json'))` + validation
  Zod (`BrandsFileSchema` existant) + Map mémoïsée au niveau module (une
  construction par vie du service worker). **Pas de `web_accessible_resources`** :
  cette déclaration n'expose des ressources qu'aux pages web/content scripts
  externes ; le background lit ses propres fichiers sans rien déclarer.
- Rayon d'impact vérifié minimal : 2 call sites (`background-container.ts`,
  `local-brand-origin-repository.ts`), `findByBrandName` est déjà async, les
  tests mockent l'interface `BrandOriginRepository` — aucun test à changer.

### Étape B — overlay distant

**Hébergement** : GitHub Pages du repo public dédié **Strime/arbiter-data**
(`https://strime.github.io/arbiter-data/data/`) — le repo de code est privé,
donc les données ET la politique de confidentialité (PRIVACY.html) sont servies
par ce repo public, déployé exclusivement par la CI via deploy key.
Gratuit, HTTPS, ETag (vérifié par test réel), CDN Fastly. Note debug : le CDN
sert `max-age=600` — compter jusqu'à ~10 min de propagation après un déploiement.
Alternative future : `data.alpsan.fr` (URL centralisée dans une constante, le
mécanisme ne change pas).

**CORS / permissions** (vérifié) : GitHub Pages sert
`Access-Control-Allow-Origin: *` sur ses fichiers, et `host_permissions` fait
de toute façon bypasser CORS pour un fetch depuis le service worker MV3. La
permission est donc une défense en profondeur + une exigence de transparence
store, pas un prérequis technique fragile. Une seule entrée
`https://strime.github.io/*` dans `wxt.config.ts` suffit pour les deux
navigateurs : WXT fusionne automatiquement `host_permissions` dans
`permissions` pour le build Firefox MV2. **À ajouter avant la première
soumission store** : l'extension n'étant pas encore publiée, la fenêtre est
gratuite (aucun utilisateur existant à qui déclencher un warning de nouvelle
permission).

**Fichier manifest de données** (`brands-manifest.json`) :

```json
{
  "schemaVersion": 1,
  "dataVersion": "2026-08-14.1",
  "url": "https://strime.github.io/arbiter-data/data/brands.json",
  "sha256": "…",
  "sizeBytes": 512340,
  "minExtensionVersion": "0.1.0",
  "publishedAt": "2026-08-14T09:00:00Z"
}
```

Sémantique des versions (pour éviter toute divergence) :
- `schemaVersion` (manifest) **doit être égal** au champ `version` interne de
  `brands.json` (`BrandsFileSchema.version`) : c'est la version du *format*.
  Le client vérifie les deux et refuse un écart.
- `dataVersion` : identifiant de *publication* (datée), sans rapport avec le
  format. C'est lui qui déclenche un téléchargement.
- `minExtensionVersion` : comparé **segment par segment en numérique** (jamais
  en comparaison de chaînes : `"0.10.0" < "0.9.0"` lexicographiquement est le
  piège classique).

**Client (background uniquement)** :
1. Alarme quotidienne (24 h) créée avec la garde `alarms.get()` du prérequis ;
   jitter simulé par un `delayInMinutes` randomisé au premier `create()` (pas
   de jitter natif dans l'API alarms) — stable puisque le create ne s'exécute
   qu'une fois. Premier déclenchement aussi au premier démarrage post-install.
2. `GET brands-manifest.json` avec `If-None-Match` (ETag stocké) → 304 = fini.
   Timeout par `AbortController` (6 s, même pattern que `off-client.ts`), sur
   ce fetch ET celui des données.
3. Garde-fous avant application :
   - `schemaVersion` supporté et égal au `version` interne du fichier reçu ;
   - `minExtensionVersion` ≤ version courante (comparaison numérique) ;
   - `dataVersion` ≠ version de l'overlay actuel (≠ et pas > : permet un
     **rollback** en republiant une version antérieure) ;
   - téléchargement plafonné à 2 Mo **en lisant le corps en flux avec compteur
     cumulatif + `abort()` au dépassement** (ne jamais se fier au seul
     `Content-Length`), puis vérification `sha256` et `sizeBytes` ;
   - validation Zod complète + garde de plausibilité : nombre d'entrées ≥ 80 %
     de `max(DB bundlée, overlay précédemment appliqué)` — comparer au seul
     bundle figé laisserait passer un gros recul une fois la vraie DB devenue
     bien plus grosse que le bundle de la dernière release.
4. Écriture `storage.local` sous `arbiter.brands-db:` (~500 Ko ; Chrome :
   quota 10 Mo sans limite par item — `QUOTA_BYTES_PER_ITEM` n'existe que pour
   `storage.sync` ; Firefox : quota géré par le storage manager du profil,
   plus généreux — très large marge dans les deux cas, en cohabitation avec le
   cache OFF plafonné à 2 000 entrées).
5. Tout échec (réseau, hash, Zod, quota) → on garde l'existant, log
   `console.debug`, retry au prochain tick. Jamais bloquant.

**Portée du `sha256`** : intégrité de transit uniquement. Il ne protège pas
d'une compromission de l'hébergeur (qui recalculerait le hash). La vraie
barrière est le contrôle d'écriture sur `gh-pages` : **déploiement CI-only,
pas de push manuel**. Une signature ed25519 (clé publique embarquée) reste
l'upgrade si l'hébergement quitte un domaine contrôlé.

**Résolution au chargement** (`BrandDbProvider`) : overlay storage si présent
et compatible, sinon bundle. Le bundle n'est jamais supprimé : plancher de
qualité, re-synchronisé à chaque release store normale.

### Étape C — pipeline de publication

- Source de vérité inchangée : `scripts/sources/*` + `npm run build:brands`.
- Étape manuelle unique (non automatisable) : activer GitHub Pages sur le repo
  (branche `gh-pages`).
- Nouveau job GitHub Actions `publish-data` : sur push `main` modifiant
  `scripts/sources/**` → `build:brands` → `eval:brands` en **gate de
  non-régression** (échec si couverture ou précision baisse sur
  `ground-truth.json`) → génère le manifest (dataVersion datée, sha256,
  sizeBytes) → déploie `data/` sur `gh-pages`.
- Chemin de correction d'une erreur signalée : PR d'une ligne sur
  `manual-overrides.json` (ou `exclusions.json`) → merge → en prod chez tous
  les utilisateurs sous ~24 h (+ ≤10 min de CDN). Sans review store.

### Étape D — hors périmètre immédiat (notes)

- **Deltas** : à 500 Ko/24 h max par utilisateur, inutile. À revoir si la DB
  décuple.
- **V1 Firebase** : la roadmap prévoit Cloud Functions + cache mutualisé — ce
  mécanisme n'est pas jetable : la Cloud Function/CDN servira le même couple
  manifest + fichier (changer une constante d'URL), et l'overlay local reste
  le fallback hors-ligne.

### Alternatives écartées

- *API de lookup par marque à la demande* : latence par carte, IP + marques
  consultées envoyées à un serveur (recul sur la promesse vie privée), infra.
- *Firestore direct en V0.x* : SDK lourd, coûts, complexité MV3 — c'est
  précisément ce que la V1 tranchera.
- *IndexedDB* : inutile à cette volumétrie, `storage.local` suffit.

## Conformité & privacy

- Politique « remote code » CWS/AMO : respectée (données pures, validées Zod,
  jamais exécutées).
- `PRIVACY.md` à compléter : téléchargement quotidien d'un fichier statique de
  données (aucune donnée envoyée, aucun paramètre, IP visible de l'hébergeur
  comme pour tout CDN) — formulaire CWS inchangé (pas de collecte).
- `docs/store-submission.md` : ajouter la ligne `strime.github.io` au tableau
  de justification des permissions.

## Découpage & estimation

| Étape | Contenu | Effort |
|---|---|---|
| Prérequis | Garde `alarms.get()` dans background.ts | ✅ fait |
| A | DB en asset + provider async + tests | ~0,5 j |
| B | Overlay distant : alarme, garde-fous, storage, résolution + tests | ~1 j |
| C | Activation Pages (manuel) + CI publish + gate eval + PRIVACY + doc | ~0,5 j (serré) |
| | **Total** | **~2 j** |

Ordre : A seul est déjà un gain (poids du service worker) ; B sans C se teste
en publiant à la main sur gh-pages ; C clôt la boucle « signalement → correction
→ prod < 24 h » qui était l'angle mort de l'audit.
