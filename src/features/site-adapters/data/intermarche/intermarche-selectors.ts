export const INTERMARCHE_SELECTORS = {
  productCard: '[data-testid="product-layout"]',
  productLink: 'a[href*="/produit/"]',
  title: 'h2.stime-product--details__title, [itemprop="name"]',
  brandContainer: '.stime-product--details__summary > div:first-child',
  brand: '[itemprop="brand"]',
} as const;

export const INTERMARCHE_EAN_FROM_HREF = /\/produit\/[^/?#]+\/(\d{8,14})(?:[/?#]|$)/;

export const INTERMARCHE_BRAND_MDD_SUFFIX = /,?\s*une marque\s+intermarch[eé].*$/i;

export const INTERMARCHE_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/([a-z0-9-]+\.)?intermarche\.com\//,
];
