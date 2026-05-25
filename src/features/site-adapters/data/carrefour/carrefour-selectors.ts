export const CARREFOUR_SELECTORS = {
  productCard: '[data-testid="product-card"], article.product-card',
  brand: '[data-testid="product-card-brand"], .product-card__brand',
  title: '[data-testid="product-card-title"], .product-card__title, h2',
  ean: '[data-ean], [data-gtin]',
} as const;

export const CARREFOUR_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/(www\.|drive\.)?carrefour\.fr\//,
];
