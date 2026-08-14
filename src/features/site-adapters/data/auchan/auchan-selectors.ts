export const AUCHAN_SELECTORS = {
  productCard: 'article.product-thumbnail',
  brand: '[itemprop="brand"]',
  // Auchan's <p> exposes both brand and title via "name description" itemprop value.
  // The split is done in the adapter.
  titleAndBrand: 'p[itemprop~="name"]',
  // Lien de la carte : source de l'id produit stable (voir AUCHAN_ID_FROM_HREF).
  productLink: 'a[href]',
} as const;

// Calibration LIVE du 2026-08-14 (www.auchan.fr/recherche, 79/79 cartes) : l'attribut
// data-id de l'article est un UUID instable qui change entre deux chargements. L'id
// produit stable est porté par le href sous la forme /pr-C<chiffres> (ex.
// /nestle-dessert-tablette-de-chocolat-noir-patissier/pr-C1246750).
export const AUCHAN_ID_FROM_HREF = /\/pr-(C\d+)(?:[/?#]|$)/;

export const AUCHAN_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/(www\.)?auchan\.fr\//,
];
