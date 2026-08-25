# Notes de soumission stores

Checklist et textes prêts à coller pour Chrome Web Store, Firefox AMO, Edge Add-ons.

## Identité (figée — ne plus changer après la 1re soumission)

- Nom : **Coquade** — décision du 17 août 2026, en remplacement de « Cocarde »
  (nom indisponible), elle-même choisie le 14 août 2026 en remplacement
  d'« Arbiter » (mot anglais, noyé dans les outils d'arbitrage en recherche
  store, n'évoquait ni l'origine ni les courses). Néologisme (coq + -ade,
  morphologie type « galéjade ») : aucune occurrence web existante.
  Vérifications du 17 août 2026 : domaines coquade.fr / .com / .app / .io
  **libres** (RDAP AFNIC/Verisign) ; AMO : 0 résultat exact ; rien sur le
  Chrome Web Store ; aucune marque trouvée en recherche web.
  Recherche d'antériorité INPI (data.inpi.fr, 17 août 2026) : **0 résultat**
  sur « Coquade », toutes catégories (entreprises, marques, brevets, dessins
  et modèles). Reste AVANT soumission : **enregistrer coquade.fr et
  coquade.com** + Edge au moment venu.
  (Historique : l'audit complet du 14 août 2026 portait sur « Arbiter » —
  AMO vide, deux homonymes confidentiels sur Chrome, marques US éloignées.)
- **Nom de fiche recommandé** : « Coquade — Origine des produits (FR/EU/US) »
  (41 caractères, < 45 max CWS) : le suffixe indexe « origine »/« produits »
  en recherche store.
- id Firefox (`browser_specific_settings.gecko.id`) : `gaetan@alpsan.fr`
  — modifiable tant qu'aucune soumission AMO n'a eu lieu, plus jamais ensuite.
- Version : gérée par `package.json` (`version`), propagée par WXT.

## Description courte (les 3 stores)

> Affiche l'origine (marque et fabrication) des produits sur les
> drives français, pour des achats éclairés.

Ton factuel volontaire : l'extension **affiche** une information, elle ne
prescrit pas (« évitez US » est réservé à la communication hors store).

## Description longue (base commune)

> Coquade ajoute un badge d'origine sur les produits des drives Carrefour,
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

- Collecte automatique par le développeur : **aucune**. Un seul flux sortant
  vers le projet, à l'initiative de l'utilisateur : le **signalement d'erreur**
  (cf. docs/error-reporting.md).
- Firefox : `data_collection_permissions = { required: ["none"], optional:
  ["websiteContent"] }`. Vérifié contre `addons-linter` : `"none"` doit rester
  **seul** dans `required` (`NONE_DATA_COLLECTION_IS_EXCLUSIVE`), n'est **pas**
  admis dans `optional`, et `technicalAndInteraction` n'est valide qu'en
  `optional`. La permission optionnelle n'est **jamais** accordée d'office :
  l'extension appelle `permissions.request()` depuis la page d'options (geste
  utilisateur sur une page d'extension obligatoire).
  → l'écran d'installation continue d'annoncer « ne collecte aucune donnée ».
- Pourquoi `websiteContent` et pas `technicalAndInteraction` : la catégorie se
  choisit d'après le **contenu** de la charge utile, pas d'après le motif de
  l'envoi. Marque et code-barres sont lus sur la page → contenu de site web.
  Pas de `personallyIdentifyingInfo` : aucun champ de texte libre n'est proposé
  (c'est la raison de ce choix de conception, à ne pas défaire à la légère).
- CWS : aucune clé de manifest à ajouter, tout se déclare au dashboard
  (Privacy practices). Cocher **Website content** — pour la lecture des cartes
  produits ET pour le signalement. Ne PAS cocher « Web history » : l'URL de la
  page n'est jamais transmise.
- **Depuis le 1er août 2026** (CWS policy updates 2026), toute collecte doit
  être « prominently disclosed » **dans l'interface du produit** — la fiche
  store et la politique de confidentialité ne suffisent plus. C'est le rôle de
  la ligne « Envoie la marque, le code-barres et le verdict affiché. Rien
  d'autre. » affichée dans le panneau de signalement : ne pas la retirer.
- Remote code : répondre **non**. Poster des données ne transmet aucune logique.
- URL de politique de confidentialité (servie par le repo public
  arbiter-data) : `https://strime.github.io/arbiter-data/PRIVACY.html`
  — **à republier** après toute modification de PRIVACY.md ; une divergence
  entre manifest, fiche store et politique est en soi un motif de rejet.

## Justification des permissions (formulaire reviewer)

| Permission | Justification à coller |
|---|---|
| `storage` | Stocke localement les préférences utilisateur et un cache 7 jours des réponses OpenFoodFacts. |
| `*.carrefour.fr`, `*.intermarche.com`, `*.auchan.fr`, `*.leclercdrive.fr`, `*.lidl.fr` | Injection du badge d'origine sur les cartes produits des drives. Domaines entiers requis : SPA à routage client, les chemins des pages produits ne sont pas stables. |
| `world.openfoodfacts.org` | Requête produit par code-barres (EAN) en fallback quand l'origine n'est pas déterminable localement. |
| `strime.github.io` | Téléchargement quotidien de la base de marques mise à jour (GitHub Pages du projet). Fichier statique versionné, identique pour tous les utilisateurs ; aucune donnée utilisateur envoyée. |
| `coquade.fr` | Envoi d'un signalement d'erreur de données, déclenché uniquement par un clic explicite de l'utilisateur sur « Signaler une erreur ». Charge utile fermée (marque, code-barres, enseigne, verdict affiché, version) : ni URL, ni identifiant, ni texte libre. |

## Assets à produire avant soumission

- [x] Screenshots 1280×800 (20 août 2026) : **jeu annoté à uploader dans
      l'ordre** — docs/store-assets/store-01-hero.png (frame d'ouverture),
      store-02-carrefour.png et store-03-auchan.png (captures réelles +
      bandeau explicatif), store-04-detail.png (tooltip marque/fabrication +
      confidentialité). Générés par `scripts/generate-store-screenshots.sh`
      depuis `scripts/assets/store/*.html` (Chrome headless ×2, même pipeline
      que l'og-image) — modifier les HTML puis relancer le script.
      Les captures brutes restent les sources : screenshot-carrefour.png,
      screenshot-auchan.png (badges réels calculés depuis brands.json sur les
      pages live, 15 août 2026), screenshot-lidl.png (non annotée, en réserve).
      screenshot-onboarding.png est OBSOLÈTE (marque « Arbiter ») — ne plus
      l'uploader. Intermarché et Leclerc Drive : toujours bloqués par captcha
      Datadome en session automatisée.
- [x] Icône 128 px : « cocarde à crête » (17 août 2026) — la cocarde tricolore
      avec crête de coq, dessin littéral du nom Coquade. Générée par
      `scripts/generate-icons.py` ; assets landing (favicon, apple-touch,
      og-image) alignés via `scripts/generate-landing-assets.py`.
- [ ] Email de contact vérifié sur le dashboard CWS.

## Publication automatisée (`wxt submit`)

WXT embarque [`publish-browser-extension`](https://github.com/aklinker1/publish-browser-extension)
sous la commande `wxt submit` : upload + soumission en revue via les APIs
officielles des stores. Pas besoin de Fastlane (mobile-only).

### En local

```bash
npx wxt submit init      # walkthrough interactif -> écrit .env.submit (gitignoré)
npm run zip:all          # zips chrome + firefox + sources, dans output/
npm run submit:dry       # vérifie l'authentification, n'envoie rien
npm run submit           # les deux stores
npm run submit:chrome    # un seul store
npm run submit:firefox
```

Les scripts construisent les chemins depuis `package.json`
(`output/$npm_package_name-$npm_package_version-*.zip`) : rien à passer à la
main, mais les zips doivent être ceux de la version courante — d'où
`npm run zip:all` juste avant.

Un store n'est soumis que si son zip est passé au CLI, et le CLI **exige alors
tous les credentials de ce store** : c'est pourquoi il existe une variante par
store, pour brancher Chrome d'abord et AMO plus tard.

### Secrets à obtenir

| Variable | Où la trouver |
|---|---|
| `CHROME_EXTENSION_ID` | `ceohpidjkdopmbhkanleijicbmioekdf` (fin de l'URL de la fiche CWS) |
| `CHROME_CLIENT_ID` / `CHROME_CLIENT_SECRET` | Google Cloud console : projet dédié → activer **Chrome Web Store API** → identifiants OAuth de type « Desktop app » |
| `CHROME_REFRESH_TOKEN` | échange du code OAuth (scope `https://www.googleapis.com/auth/chromewebstore`) — `wxt submit init` déroule l'échange |
| `FIREFOX_EXTENSION_ID` | `gaetan@alpsan.fr` (= `browser_specific_settings.gecko.id`) |
| `FIREFOX_JWT_ISSUER` / `FIREFOX_JWT_SECRET` | addons.mozilla.org → Tools → **Manage API Keys** (le secret n'est affiché qu'une fois) |

### Dans la CI

Le job `release` de [ci.yml](../.github/workflows/ci.yml) se déclenche sur tag
`v*`, après le job `check` (compile + tests + builds) :

1. refuse la release si le tag ≠ `package.json.version` — le manifest tient sa
   version de `package.json`, une divergence produirait un zip incohérent avec
   la release ;
2. `npm run zip` + `zip:firefox`, uploadés en artefact `store-zips-<tag>` ;
3. `npm run submit` avec les 7 secrets en secrets de dépôt GitHub. Si seuls les
   secrets d'un store sont présents, il ne soumet que celui-là ; si aucun n'est
   présent, il n'échoue pas et laisse les zips en artefact.

Publier une version revient donc à : bump de `package.json`, commit, tag
`vX.Y.Z`, push du tag.

### Pièges

- **Version strictement croissante** : les deux stores refusent le réupload
  d'une version déjà en ligne. Un tag rejoué = release échouée.
- **`gecko.id` figé** : le changer créerait un nouvel add-on AMO au lieu d'une
  mise à jour.
- **La revue reste humaine** des deux côtés : l'automatisation s'arrête à
  « soumis ». Ajouter `--chrome-skip-submit-review` pour se contenter d'un
  upload sans publication.
- Le zip de sources reste obligatoire côté AMO tant que le build est bundlé ;
  les notes reviewer, elles, restent à coller à la main au dashboard.

## Par store

### Chrome Web Store
- **Publiée le 20 août 2026** :
  https://chromewebstore.google.com/detail/ceohpidjkdopmbhkanleijicbmioekdf
  (liens « Ajouter à Chrome » de la landing branchés dessus).
- Compte développeur (5 $ une fois), fiche + formulaire données + privacy URL.
- Upload : `npm run zip` → `output/arbiter-<version>-chrome.zip`,
  ou `npm run submit:chrome` (cf. Publication automatisée).

### Firefox AMO
- `npm run zip:firefox` → zip + `-sources.zip` (obligatoire, build minifié),
  ou `npm run submit:firefox` (cf. Publication automatisée).
- Pré-validé par `npx web-ext lint` (14 août 2026) : **0 erreur, 7 warnings**,
  tous attendus — voir notes reviewer ci-dessous.
- Validation AMO à l'upload (20 août 2026, v0.1.1) : **0 erreur, 6 warnings** —
  les 5 eval/innerHTML des libs bundlées (Zod v4, react-dom) + 1 nouveau
  « strict_min_version requires Firefox for Android 140… » : ne concerne que
  Firefox Android (`data_collection_permissions` y requiert 142), sans objet
  puisque Android est décoché à la soumission.
- **Notes reviewer à coller telles quelles** :
  > Build reproductible : Node ≥ 22 (référence : Node 25.6.1, npm 11.9.0,
  > macOS 15 arm64), `npm ci && npm run zip:firefox` (WXT/Vite) — recette
  > détaillée dans le README du zip de sources, section « Build de
  > production ». Sortie : `output/arbiter-<version>-firefox.zip`.
  > Les warnings du linter proviennent des bibliothèques bundlées, pas du code
  > applicatif : `DANGEROUS_EVAL` (Function constructor) vient de Zod v4
  > (parsing optimisé) et `UNSAFE_VAR_ASSIGNMENT` (innerHTML) de react-dom —
  > le code applicatif ne fait aucune assignation innerHTML interpolée
  > (drapeaux construits via createElementNS, textes via textContent).
  > Aucune collecte automatique. `data_collection_permissions` déclare
  > `required: ["none"]` et `optional: ["websiteContent"]` : cette dernière
  > couvre le bouton « Signaler une erreur » d'une pastille, demandée par
  > `permissions.request()` depuis la page d'options et refusable. Charge
  > utile fermée, sans texte libre ni identifiant (détail dans PRIVACY.md),
  > stockage 100 % local, trois endpoints réseau : world.openfoodfacts.org
  > (lookup EAN en fallback), strime.github.io (mise à jour quotidienne de
  > la base de marques, fichier statique versionné) et coquade.fr/api/report
  > (signalement d'erreur, uniquement sur clic et après autorisation).
- Licence code : GPL-3.0 (LICENSE à la racine).
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
  Le code de l'extension est passé sous GPL-3.0 le 25 août 2026, en même temps
  que l'ouverture du dépôt : la question de l'agrégat (GPLv3 §5) qui gardait le
  code en MIT ne se pose donc plus, code et données sont sous la même licence.
  Optionnel : issue de courtoisie chez l'auteur pour le prévenir de la
  réutilisation.
