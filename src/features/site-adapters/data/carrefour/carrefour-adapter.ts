import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { CARREFOUR_HOST_PATTERNS, CARREFOUR_SELECTORS } from './carrefour-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';
import { createCardObserver } from '../create-card-observer';
import { guessBrandFromTitle } from '../guess-brand-from-title';

export class CarrefourAdapter implements SiteAdapter {
  readonly id = 'carrefour';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return CARREFOUR_HOST_PATTERNS.some((re) => re.test(url));
  }

  observe(root: Document, listener: ProductCardListener): () => void {
    return createCardObserver({
      observerHelper: this.observerHelper,
      cardSelector: CARREFOUR_SELECTORS.productCard,
      extractCard: (node) => this.extractCard(node),
      root,
      listener,
    });
  }

  private extractCard(node: HTMLElement): RawProductCard | null {
    const titleNode = node.querySelector<HTMLElement>(CARREFOUR_SELECTORS.title);
    if (!titleNode) return null;
    const title = (titleNode.textContent ?? '').trim();
    if (!title) return null;

    const brandNode = node.querySelector<HTMLElement>(CARREFOUR_SELECTORS.brand);
    const brandFromDom = (brandNode?.textContent ?? '').trim();
    const brand = brandFromDom || (guessBrandFromTitle(title) ?? '');
    const brandGuessed = !brandFromDom && brand.length > 0;

    const eanNode = node.querySelector<HTMLElement>(CARREFOUR_SELECTORS.ean);
    const testid = node.dataset.testid;
    const eanFromTestid = testid && /^\d{8,14}$/.test(testid) ? testid : undefined;
    const ean = eanNode?.dataset.ean ?? eanNode?.dataset.gtin ?? eanFromTestid ?? undefined;

    const id = node.dataset.productId ?? ean ?? `${brand}::${title}`;

    return {
      id,
      ean,
      brand,
      brandGuessed,
      title,
      rawText: (node.textContent ?? '').trim(),
      node,
    };
  }
}
