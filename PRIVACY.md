# Politique de confidentialité — Coquade

*Dernière mise à jour : 13 août 2026*

Coquade est une extension de navigateur qui affiche l'origine (marque et fabrication)
des produits sur les sites de drive français. Elle est conçue pour fonctionner
**entièrement en local**.

## Ce que l'extension ne fait pas

- **Aucune donnée n'est collectée par le développeur.** Pas de compte, pas de
  télémétrie, pas d'analytics, pas de tracker.
- Aucune donnée n'est vendue, partagée ou transmise à des fins publicitaires.
- L'extension ne lit le contenu des pages que sur les sites de drive listés dans
  ses permissions (Carrefour, Intermarché, Auchan, Leclerc, Lidl), uniquement
  pour repérer les cartes produits (titre, marque, code-barres) et y afficher
  un badge d'origine. Ce contenu **n'est jamais transmis au développeur**.

## Données stockées localement (sur votre appareil)

Via `browser.storage.local`, jamais synchronisé vers un serveur du développeur :

- vos préférences (activation de l'extension) ;
- un cache temporaire des réponses OpenFoodFacts (7 jours), pour limiter les
  requêtes réseau.

Désinstaller l'extension supprime ces données.

## Requêtes vers OpenFoodFacts

Quand l'origine d'un produit n'est pas déterminable localement, l'extension peut
interroger l'API publique d'[OpenFoodFacts](https://world.openfoodfacts.org)
(association française, base de données alimentaire ouverte sous licence ODbL)
avec le **code-barres (EAN) du produit**. Cette requête part de votre navigateur :
OpenFoodFacts voit donc votre adresse IP et l'EAN consulté, comme pour toute
requête web. Aucune autre donnée (identité, historique, URL de la page) n'est
transmise.

Les données d'origine issues d'OpenFoodFacts sont © les contributeurs
OpenFoodFacts, sous licence ODbL.

## Mise à jour des données de marques

L'extension embarque une base de données de marques (marque → pays d'origine).
Pour la maintenir à jour sans attendre une nouvelle version de l'extension, elle
télécharge quotidiennement un fichier statique versionné depuis
`strime.github.io` (GitHub Pages, l'hébergement du projet). Cette requête ne
contient **aucune donnée** : pas de paramètre, pas d'identifiant, rien sur votre
navigation — c'est le téléchargement d'un fichier public identique pour tous les
utilisateurs. Comme pour tout téléchargement web (et tout CDN), l'hébergeur voit
votre adresse IP. Le fichier téléchargé est stocké localement via
`browser.storage.local`.

## Permissions demandées

| Permission | Usage |
|---|---|
| `storage` | Préférences + cache local |
| Accès aux sites de drive listés | Afficher le badge d'origine sur les pages produits |
| `world.openfoodfacts.org` | Requête produit par code-barres, en fallback |
| `strime.github.io` | Téléchargement quotidien de la base de marques mise à jour (fichier statique, aucune donnée envoyée) |

## Contact

Questions ou demandes : sancassani.gaetan@gmail.com
