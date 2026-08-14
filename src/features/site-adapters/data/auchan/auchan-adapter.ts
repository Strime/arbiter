import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { AUCHAN_HOST_PATTERNS, AUCHAN_SELECTORS } from './auchan-selectors';
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

    const id = node.dataset.id ?? `${brand}::${title}`;

    return {
      id,
      ean: undefined,
      brand,
      brandGuessed,
      title,
      rawText: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
      node,
    };
  }
}
