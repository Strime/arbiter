import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { AUCHAN_HOST_PATTERNS, AUCHAN_ID_FROM_HREF, AUCHAN_SELECTORS } from './auchan-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';
import { createCardObserver } from '../create-card-observer';
import { guessBrandFromTitle } from '../guess-brand-from-title';

export class AuchanAdapter implements SiteAdapter {
  readonly id = 'auchan';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return AUCHAN_HOST_PATTERNS.some((re) => re.test(url));
  }

  observe(root: Document, listener: ProductCardListener): () => void {
    return createCardObserver({
      observerHelper: this.observerHelper,
      cardSelector: AUCHAN_SELECTORS.productCard,
      extractCard: (node) => this.extractCard(node),
      root,
      listener,
    });
  }

  private extractCard(node: HTMLElement): RawProductCard | null {
    const nameNode = node.querySelector<HTMLElement>(AUCHAN_SELECTORS.titleAndBrand);
    const rawNameText = (nameNode?.textContent ?? '').trim();
    if (!rawNameText) return null;

    const brandNode = node.querySelector<HTMLElement>(AUCHAN_SELECTORS.brand);
    const brandFromDom = (brandNode?.textContent ?? '').trim();
    const brand = brandFromDom || (guessBrandFromTitle(rawNameText) ?? '');
    const brandGuessed = !brandFromDom && brand.length > 0;

    // Strip brand prefix from rawNameText when present to derive a clean title.
    let title = rawNameText;
    if (brand && rawNameText.startsWith(brand)) {
      title = rawNameText.slice(brand.length).replace(/^\s+/, '');
    }
    title = title.replace(/\s+/g, ' ').trim();
    if (!title) title = rawNameText.replace(/\s+/g, ' ').trim();

    // data-id est un UUID instable (régénéré entre deux chargements) : on préfère le
    // code produit stable porté par le href de la carte (pattern /pr-C<chiffres>).
    const link = node.querySelector<HTMLAnchorElement>(AUCHAN_SELECTORS.productLink);
    const href = link?.getAttribute('href') ?? '';
    const idFromHref = AUCHAN_ID_FROM_HREF.exec(href)?.[1];
    const id = idFromHref ?? node.dataset.id ?? `${brand}::${title}`;

    return {
      id,
      // Aucun EAN n'est présent dans les cartes Auchan (vérifié en live le 2026-08-14).
      ean: undefined,
      brand,
      brandGuessed,
      title,
      rawText: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
      node,
    };
  }
}
