export const CARREFOUR_SELECTORS = {
  productCard:
    'article.product-list-card-plp-grid-new, [data-testid="product-card"], article.product-card',
  // .c-link--tone-accent sans préfixe de balise : observé en <a> puis en
  // <span> sur le DOM live (dérive constatée le 15 août 2026).
  brand: '.c-link--tone-accent, [data-testid="product-card-brand"], .product-card__brand',
  title: 'h3, [data-testid="product-card-title"], .product-card__title, h2',
  ean: '[data-ean], [data-gtin]',
} as const;

export const CARREFOUR_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/(www\.|drive\.)?carrefour\.fr\//,
];
