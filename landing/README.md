# Landing page Coquade

Site vitrine statique — aucun build, aucune dépendance.

**En ligne : https://coquade.fr** (Firebase Hosting, projet `cocarde-extension`,
site `arbiter-landing` — le même projet portera Auth/Firestore/Functions en V1).

> **Identité (19 août 2026)** : la marque visible est « Coquade » ; les noms
> techniques restent sur `arbiter` (repos GitHub, package). Domaine coquade.fr
> actif depuis le 19 août 2026, branché sur le site Hosting `arbiter-landing`
> (canonical/og/sitemap/robots pointent dessus). Cibles de déploiement dans
> `.firebaserc` / `firebase.json` :
> - cible `arbiter` → site `arbiter-landing` : **sert coquade.fr** (et
>   arbiter-landing.web.app, même contenu — Firebase ne permet pas de
>   rediriger la seule URL web.app d'un site qui porte le domaine) ;
> - cible `cocarde` → site `cocarde-extension` : 301 vers coquade.fr
>   (chemins préservés).
>
> L'**ancien projet Firebase « Arbiter »** (`arbiter-extension`, d'avant le
> renommage d'août 2026) fait aussi un 301 vers coquade.fr — déployé depuis
> une config minimale hors repo. À terme : supprimer ce projet.

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
