// Calibration LIVE effectuée le 2026-08-14 sur www.lidl.fr (pages catégorie + /q/search).
// Les tuiles produit sont des DIV (pas des <a>) et portent directement les données
// structurées en attribut — deux variantes coexistent sur une même page :
//   1. div.odsc-tile[data-grid-data]                       → JSON brut
//   2. div.product-grid-box.odsc-tile[data-gridbox-impression] → JSON URL-encodé
// Un fallback DOM (classes historiques) est conservé en dernier recours si Lidl
// change à nouveau son marquage et que ni l'un ni l'autre attribut n'est présent.
export const LIDL_SELECTORS = {
  productCard: '[data-grid-data], [data-gridbox-impression], div.product-grid-box',
  brand: '.product-grid-box__brand',
  title: '.product-grid-box__title',
} as const;

export const LIDL_DATA_ATTRS = {
  gridData: 'data-grid-data',
  gridboxImpression: 'data-gridbox-impression',
} as const;

export const LIDL_HOST_PATTERNS: readonly RegExp[] = [
  /^https?:\/\/([a-z0-9-]+\.)?lidl\.fr\//,
];
