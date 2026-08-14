# Notes de soumission stores

Checklist et textes prêts à coller pour Chrome Web Store, Firefox AMO, Edge Add-ons.

## Identité (figée — ne plus changer après la 1re soumission)

- Nom : **Arbiter** — ⚠️ vérifier la disponibilité du nom sur les 3 stores avant
  de figer (nom générique, collisions possibles) ; sinon prévoir « Arbiter — origine
  des produits ».
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
  fonctionnel). URL de politique de confidentialité : héberger `PRIVACY.md`
  (GitHub Pages ou page du repo) et coller l'URL publique.

## Justification des permissions (formulaire reviewer)

| Permission | Justification à coller |
|---|---|
| `storage` | Stocke localement les préférences utilisateur et un cache 7 jours des réponses OpenFoodFacts. |
| `*.carrefour.fr`, `*.intermarche.com`, `*.auchan.fr`, `*.leclercdrive.fr`, `*.lidl.fr` | Injection du badge d'origine sur les cartes produits des drives. Domaines entiers requis : SPA à routage client, les chemins des pages produits ne sont pas stables. |
| `world.openfoodfacts.org` | Requête produit par code-barres (EAN) en fallback quand l'origine n'est pas déterminable localement. |
| `strime.github.io` | Téléchargement quotidien de la base de marques mise à jour (GitHub Pages du projet). Fichier statique versionné, identique pour tous les utilisateurs ; aucune donnée utilisateur envoyée. |

## Assets à produire avant soumission

- [ ] 3 à 5 screenshots 1280×800 (badge en situation sur 2-3 drives + popup).
      CWS : minimum 1 ; AMO/Edge : recommandé.
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
- Firefox Android : **non testé** (tooltip au survol) — décocher la compatibilité
  Android à la soumission, ou tester avant.

### Edge Add-ons
- Compte Microsoft Partner Center. Le zip Chrome est accepté tel quel.
- Certification la plus lente des trois — soumettre en dernier, sans urgence.

## Données tierces — obligations

- **OpenFoodFacts (ODbL)** : attribution requise → présente dans PRIVACY.md,
  la description store et le tooltip (« source : OpenFoodFacts »).
- **detrumpez-vous (~93 % de brands.json)** : ⚠️ vérifier la licence du repo
  source et créditer dans le README avant publication. Point juridique restant.
