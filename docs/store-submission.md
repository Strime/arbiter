# Notes de soumission stores

Checklist et textes prêts à coller pour Chrome Web Store, Firefox AMO, Edge Add-ons.

## Identité (figée — ne plus changer après la 1re soumission)

- Nom : **Arbiter** — disponibilité vérifiée (14 août 2026) : rien sur AMO,
  deux homonymes confidentiels sans audience sur Chrome (« Arbiter — Recall
  JIRA tickets », « Mail Arbiter »), pas de marque FR/UE bloquante trouvée
  (marques US existantes : Elasticsearch « ARBITER » classe 42, ArbiterSports —
  publics B2B éloignés, risque de confusion très faible). Reste : un coup d'œil
  manuel TMview/INPI (2 min) et Edge au moment de la soumission.
- **Nom de fiche recommandé** : « Arbiter — Origine des produits (FR/EU/US) »
  (~35 caractères, < 45 max CWS) : « Arbiter » seul se noie dans les outils
  d'arbitrage en recherche store, le suffixe indexe « origine »/« produits ».
- id Firefox (`browser_specific_settings.gecko.id`) : `gaetan@alpsan.fr`
  — modifiable tant qu'aucune soumission AMO n'a eu lieu, plus jamais ensuite.
- Version : gérée par `package.json` (`version`), propagée par WXT.

## Description courte (les 3 stores)

> Affiche l'origine (marque et fabrication — FR, EU, US) des produits sur les
> drives français, pour des achats éclairés.

Ton factuel volontaire : l'extension **affiche** une information, elle ne
prescrit pas (« évitez US » est réservé à la communication hors store).

## Description longue (base commune)

> Arbiter ajoute un badge d'origine sur les produits des drives Carrefour,
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

- [x] Screenshots 1280×800 : 2 produits (docs/store-assets/screenshot-auchan.png,
      screenshot-lidl.png — badges réels calculés depuis brands.json, injectés
      avec le rendu exact du badge sur les pages live du 14 août 2026).
      À compléter si possible : Carrefour/Intermarché (bloqués Datadome en
      session automatisée) + un cliché de la popup et du tooltip.
- [ ] Icône 128 px : générée (`scripts/generate-icons.py`) — remplacer par un
      vrai branding si souhaité, AVANT la 1re soumission.
- [ ] Email de contact vérifié sur le dashboard CWS.

## Par store

### Chrome Web Store
- Compte développeur (5 $ une fois), fiche + formulaire données + privacy URL.
- Upload : `npm run zip` → `.output/arbiter-<version>-chrome.zip`.

### Firefox AMO
- `npm run zip:firefox` → zip + `-sources.zip` (obligatoire, build minifié).
  Ajouter dans les notes reviewer : `npm ci && npm run zip:firefox`, Node 22.
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
