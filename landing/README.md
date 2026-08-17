# Landing page Coquade

Site vitrine statique — aucun build, aucune dépendance.

**En ligne : https://cocarde-extension.web.app** (Firebase Hosting, projet
`cocarde-extension` — le même projet portera Auth/Firestore/Functions en V1).

> **Renommage Coquade (17 août 2026)** : la marque visible est « Coquade » ;
> les noms techniques restent sur `arbiter` (repos GitHub, package). Le projet
> Firebase `cocarde-extension` héberge deux sites servis à l'identique par
> `firebase deploy --only hosting` (cibles dans `.firebaserc`, config dupliquée
> par cible dans `firebase.json` — garder les deux blocs synchronisés) :
> - `arbiter-landing.web.app` — site au nom technique, **c'est ici qu'il faut
>   brancher coquade.fr en domaine custom** (console Firebase → Hosting) ;
> - `cocarde-extension.web.app` — site historique, conservé le temps de la
>   transition.
>
> Une fois coquade.fr actif : mettre à jour canonical/og:url/sitemap/robots
> dans ces fichiers, puis faire rediriger les URLs web.app.

## Déployer

```bash
firebase deploy --only hosting
```

La config est à la racine du repo : `firebase.json` (répertoire public =
`landing/`, cache immutable 1 an sur les fontes, 24 h sur css/js/png, 5 min
sur le HTML) et `.firebaserc` (projet par défaut).

## Aperçu local

```bash
npx serve landing
# ou
python3 -m http.server 8000 --directory landing
```

## Structure

```
landing/
├── index.html          # contenu complet, sémantique, une seule page
├── css/
│   ├── tokens.css      # design tokens — SEULE source de vérité (couleurs, typo, rythme)
│   ├── base.css        # reset léger, @font-face, typographie, utilitaires
│   ├── components.css  # boutons, chips, cartes, réplique du badge Coquade
│   └── sections.css    # mise en page section par section + responsive
├── js/
│   └── main.js         # amélioration progressive (header, reveal, tap des badges)
└── assets/
    ├── fonts/          # Bricolage Grotesque auto-hébergée (latin, variable 400–800)
    └── icon-128.png    # icône de l'extension (copiée depuis public/icon/)
```

## Choix de conception

- **L'identité vient du produit** : l'accent de la page est le bleu du badge FR
  (`#1e40af`), et la démo du hero est une réplique exacte du badge de
  l'extension (`src/features/badge-injection/presentation/badge.css`) — mêmes
  couleurs, mêmes proportions, mêmes drapeaux SVG. Si le badge évolue,
  synchroniser la réplique dans `components.css`.
- **Fonte auto-hébergée** (pas de CDN Google Fonts) : conformité CNIL/RGPD.
- **Thème clair unique, assumé** ; tous les fonds sont peints explicitement.
- **Sans JS, tout fonctionne** : les animations ne s'activent que si JS pose la
  classe `js` sur `<html>` ; la FAQ utilise `<details>` natif.

## Avant le lancement

Chercher les `TODO` dans `index.html` :

- URLs Chrome Web Store / Firefox AMO sur les 4 boutons d'installation ;
- balises `og:image` (1200×630) et `og:url`.
