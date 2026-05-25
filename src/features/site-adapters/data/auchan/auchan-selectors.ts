export const AUCHAN_SELECTORS = {
  productCard: 'article.product-thumbnail',
  brand: '[itemprop="brand"]',
  // Auchan's <p> exposes both brand and title via "name description" itemprop value.
  // The split is done in the adapter.
  titleAndBrand: 'p[itemprop~="name"]',
} as const;

export const AUCHAN_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/(www\.)?auchan\.fr\//,
];
