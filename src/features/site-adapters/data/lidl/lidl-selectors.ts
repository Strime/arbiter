export const LIDL_SELECTORS = {
  productCard: 'div.product-grid-box, article.product-grid-box, a.odsc-tile',
  brand: '.product-grid-box__brand',
  title: '.product-grid-box__title',
  impressionAnchor: 'a[data-product-impression]',
} as const;

export const LIDL_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/([a-z0-9-]+\.)?lidl\.fr\//,
];
