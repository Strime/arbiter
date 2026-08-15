# Notes de soumission stores

Checklist et textes prêts à coller pour Chrome Web Store, Firefox AMO, Edge Add-ons.

## Identité (figée — ne plus changer après la 1re soumission)

- Nom : **Cocarde** — décision du 14 août 2026, en remplacement d'« Arbiter »
  (mot anglais, noyé dans les outils d'arbitrage en recherche store, n'évoquait
  ni l'origine ni les courses). Vérification rapide (14 août 2026) : aucune
  extension ni app grand public homonyme trouvée en recherche web (CWS/AMO).
  Reste AVANT soumission : recherche directe dans les stores + contrôle
  TMview/INPI (2 min) + Edge au moment venu.
  (Historique : l'audit complet du 14 août 2026 portait sur « Arbiter » —
  AMO vide, deux homonymes confidentiels sur Chrome, marques US éloignées.)
- **Nom de fiche recommandé** : « Cocarde — Origine des produits (FR/EU/US) »
  (41 caractères, < 45 max CWS) : le suffixe indexe « origine »/« produits »
  en recherche store.
- id Firefox (`browser_specific_settings.gecko.id`) : `gaetan@alpsan.fr`
  — modifiable tant qu'aucune soumission AMO n'a eu lieu, plus jamais ensuite.
- Version : gérée par `package.json` (`version`), propagée par WXT.

## Description courte (les 3 stores)

> Affiche l'origine (marque et fabrication — FR, EU, US) des produits sur les
> drives français, pour des achats éclairés.

Ton factuel volontaire : l'extension **affiche** une information, elle ne
prescrit pas (« évitez US » est réservé à la communication hors store).

## Description longue (base commune)

> Cocarde ajoute un badge d'origine sur les produits des drives Carrefour,
> Intermarché, Auchan, Leclerc et Lidl.
>
> L'origine est mesurée sur deux dimensions distinctes :
> — la **marque** : nationalité de l'entreprise propriétaire ;
> — la **fabrication** : lieu de production (mentions « Origine : … », labels,
>   OpenFoodFacts).
>
> 100 % local : pas de compte, pas de collecte de données, pas de tracker.
> Les données de fabrication proviennent en partie d'OpenFoodFacts (© les
> contributeurs OpenFoodFacts, licence ODbL).

- Catégorie : **Shopping**.
- Langue de la fiche : français (extension FR-only assumée en V0).

## Formulaire « données » (CWS Data Usage / AMO data_collection)

- Collecte par le développeur : **aucune**.
- `data_collection_permissions.required: ["none"]` (déjà dans le manifest Firefox).
- CWS : déclarer la lecture de « website content » (cartes produits des drives,
  traitée localement) et la requête sortante OpenFoodFacts (EAN, fallback
  fonctionnel). URL de politique de confidentialité (servie par le repo public
  arbiter-data) : `https://strime.github.io/arbiter-data/PRIVACY.html`.

## Justification des permissions (formulaire reviewer)

| Permission | Justification à coller |
|---|---|
| `storage` | Stocke localement les préférences utilisateur et un cache 7 jours des réponses OpenFoodFacts. |
| `*.carrefour.fr`, `*.intermarche.com`, `*.auchan.fr`, `*.leclercdrive.fr`, `*.lidl.fr` | Injection du badge d'origine sur les cartes produits des drives. Domaines entiers requis : SPA à routage client, les chemins des pages produits ne sont pas stables. |
| `world.openfoodfacts.org` | Requête produit par code-barres (EAN) en fallback quand l'origine n'est pas déterminable localement. |
| `strime.github.io` | Téléchargement quotidien de la base de marques mise à jour (GitHub Pages du projet). Fichier statique versionné, identique pour tous les utilisateurs ; aucune donnée utilisateur envoyée. |

## Assets à produire avant soumission

- [x] Screenshots 1280×800 : 3 produits (docs/store-assets/screenshot-carrefour.png
      — 15 août 2026 —, screenshot-auchan.png, screenshot-lidl.png — badges
      réels calculés depuis brands.json, injectés avec le rendu exact du badge
      sur les pages live). Intermarché et Leclerc Drive re-testés le
      15 août 2026 : toujours bloqués par captcha Datadome en session
      automatisée — à capturer manuellement si souhaité. À compléter si
      possible : un cliché de la popup et du tooltip.
- [ ] Icône 128 px : générée (`scripts/generate-icons.py`) — remplacer par un
      vrai branding si souhaité, AVANT la 1re soumission.
- [ ] Email de contact vérifié sur le dashboard CWS.

## Par store

### Chrome Web Store
- Compte développeur (5 $ une fois), fiche + formulaire données + privacy URL.
- Upload : `npm run zip` → `.output/cocarde-<version>-chrome.zip`.

### Firefox AMO
- `npm run zip:firefox` → zip + `-sources.zip` (obligatoire, build minifié).
- Pré-validé par `npx web-ext lint` (14 août 2026) : **0 erreur, 7 warnings**,
  tous attendus — voir notes reviewer ci-dessous.
- **Notes reviewer à coller telles quelles** :
  > Build reproductible : Node 22, `npm ci && npm run zip:firefox` (WXT/Vite).
  > Les warnings du linter proviennent des bibliothèques bundlées, pas du code
  > applicatif : `DANGEROUS_EVAL` (Function constructor) vient de Zod v4
  > (parsing optimisé) et `UNSAFE_VAR_ASSIGNMENT` (innerHTML) de react-dom —
  > le code applicatif ne fait aucune assignation innerHTML interpolée
  > (drapeaux construits via createElementNS, textes via textContent).
  > Aucune collecte de données (`data_collection_permissions: ["none"]`),
  > stockage 100 % local, deux endpoints réseau : world.openfoodfacts.org
  > (lookup EAN en fallback) et strime.github.io (mise à jour quotidienne de
  > la base de marques, fichier statique versionné).
- Licence code : MIT (LICENSE à la racine).
- Firefox Android : **décision V0 (14 août 2026) : exclu.** Non testé au
  tactile (le tooltip a un toggle au tap mais jamais validé sur mobile), sites
  drive en responsive non vérifiés — décocher la compatibilité Android à la
  soumission. À réévaluer en V0.x après un test réel.

### Edge Add-ons
- **Décision V0 (14 août 2026) : soumission différée post-lancement.** Le zip
  Chrome est accepté tel quel ; certification la plus lente des trois. À
  soumettre une fois CWS + AMO stabilisés (retours utilisateurs intégrés).
- Compte Microsoft Partner Center à créer le moment venu.

## Données tierces — obligations

- **OpenFoodFacts (ODbL)** : attribution requise → présente dans PRIVACY.md,
  la description store et le tooltip (« source : OpenFoodFacts »).
- **DeTrumpez-vous (~92 % de brands.json)** : tranché (14 août 2026) — le repo
  source [Sacha213/detrumpez-vous](https://github.com/Sacha213/detrumpez-vous)
  est sous **GPL-3.0**, données incluses. Notre redistribution est autorisée
  avec : attribution (faite sur l'index d'arbiter-data), dataset dérivé publié
  sous GPL-3.0 (LICENSE-DATA sur le site de données), mention de modification.
  Le code de l'extension reste MIT (agrégat, GPLv3 §5) — un fichier de données
  statique lu à l'exécution ne contamine pas le code. Optionnel : issue de
  courtoisie chez l'auteur pour le prévenir de la réutilisation.
