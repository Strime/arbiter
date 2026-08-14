// Calibré sur DOM RÉEL du 2026-08-14 (capture manuelle, session utilisateur — Datadome
// contourné par navigation humaine ; magasin Ville-la-Grand/Annemasse 027411). Widget
// serveur WCRS310 (ASP.NET Infomil), hôtes fd2-courses.leclercdrive.fr /
// mgt.leclercdrive.fr.
//
// Constats DOM (source de vérité, remplace toute spéculation antérieure) :
//   - Carte : li.liWCRS310_Product. Variante indisponible : classe additionnelle
//     liWCRS310_Unavailable + data-vignette="bientotDisponible" — extraite aussi (le
//     badge y a du sens, l'utilisateur peut vouloir vérifier l'origine avant réappro).
//   - Titre : a.aWCRS310_Product dans p.pWCRS310_Desc. Le libellé produit est le
//     PREMIER nœud texte de l'ancre (avant le <br> qui introduit la variante/poids,
//     ex. "Mini feuilletés Côté Table<br>Apéritifs - x30 - 360g") — extraction faite
//     dans l'adapter via childNodes, pas via textContent qui fusionnerait les deux.
//   - Aucun JSON-LD, aucun data-ean/data-gtin, aucune microdata itemprop="gtin13", et
//     les liens produit sont SANS href (navigation JS pure) : EAN toujours undefined.
//   - Aucun élément marque dédié : la marque est incrustée dans le titre en position
//     variable ("Mini feuilletés Côté Table" : marque en fin ; "Gyoza Ajinomoto" :
//     marque en fin aussi). Signal MDD fort : img[alt="Marque repère"]
//     (logohandler.ashx?logo=1) dans la zone stickers ⇒ brand = "Marque Repère",
//     prioritaire sur le guess premier-mot du titre.
//   - Id produit stable : id de la photo produit (image.ashx?id=NNN&use=l&cat=p…).
//     Fallback : attribut id du <li> (sIdN, positionnel), puis brand::title.
//   - Stickers qualité (Nutri-Score, labels type "Viande Bovine Française", "Vegan"…)
//     sont des <img alt="…"> dans .divWCRS310_ZonesStickerVignette, invisibles au
//     textContent : concaténés dans rawText pour que l'heuristique texte les voie.
export const LECLERC_SELECTORS = {
  productCard: 'li.liWCRS310_Product',
  title: 'p.pWCRS310_Desc a.aWCRS310_Product',
  // Photo produit : porte l'id stable dans son URL. Deux emplacements possibles selon
  // la disponibilité — enveloppée dans l'ancre produit (dispo) ou directe (indispo).
  productImage: 'a.aWCRS310_Product img, img.vignetteProduitBientotDisponible',
  // Signal MDD fort (Marque Repère = MDD Leclerc) : présence du logo, pas son texte.
  mddBadge: 'img[alt="Marque repère"]',
  // Stickers qualité/labels de la carte, alt uniquement (repris dans rawText).
  stickerImages: '.divWCRS310_ZonesStickerVignette img[alt]',
} as const;

export const LECLERC_PRODUCT_ID_FROM_IMAGE_SRC = /[?&]id=(\d+)/;

export const LECLERC_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/([a-z0-9-]+\.)?leclercdrive\.fr\//,
];
