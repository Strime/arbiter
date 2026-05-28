export const LECLERC_SELECTORS = {
  productCard:
    'li.product-thumbnail, article.product-thumbnail, [data-product-id], [itemtype*="Product"], .stime-prdItem, li.prdItem, .product-cell',
  brand: '[itemprop="brand"], .prd-marque, .product-brand, .prdMarque',
  title:
    '[itemprop="name"], .prd-libelle, .product-title, .prdLibelle, h2, h3, a[title]',
  ean: '[data-ean], [data-gtin], [itemprop="gtin13"]',
} as const;

export const LECLERC_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/([a-z0-9-]+\.)?leclercdrive\.fr\//,
];
