export const INTERMARCHE_SELECTORS = {
  productCard:
    'article[itemtype*="Product"], article.stime-card, [data-testid="product-tile"], .product-tile, li.product, article.product',
  brand:
    '[itemprop="brand"], [data-testid="product-brand"], .product-tile__brand, .stime-card__brand',
  title:
    '[itemprop="name"], [data-testid="product-title"], .product-tile__title, .stime-card__title, h2, h3',
  ean: '[data-ean], [data-gtin], [itemprop="gtin13"], [itemprop="gtin"]',
} as const;

export const INTERMARCHE_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/([a-z0-9-]+\.)?intermarche\.com\//,
];
