import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { LECLERC_HOST_PATTERNS, LECLERC_SELECTORS } from './leclerc-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';
import { createCardObserver } from '../create-card-observer';
import { guessBrandFromTitle } from '../guess-brand-from-title';

export class LeclercAdapter implements SiteAdapter {
  readonly id = 'leclerc';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return LECLERC_HOST_PATTERNS.some((re) => re.test(url));
  }

  observe(root: Document, listener: ProductCardListener): () => void {
    return createCardObserver({
      observerHelper: this.observerHelper,
      cardSelector: LECLERC_SELECTORS.productCard,
      extractCard: (node) => this.extractCard(node),
      root,
      listener,
    });
  }

  private extractCard(node: HTMLElement): RawProductCard | null {
    const titleNode = node.querySelector<HTMLElement>(LECLERC_SELECTORS.title);
    if (!titleNode) return null;
    const title = (
      titleNode.textContent ??
      titleNode.getAttribute('content') ??
      titleNode.getAttribute('title') ??
      ''
    )
      .replace(/\s+/g, ' ')
      .trim();
    if (!title) return null;

    const brandNode = node.querySelector<HTMLElement>(LECLERC_SELECTORS.brand);
    const brandFromDom = (brandNode?.getAttribute('content') ?? brandNode?.textContent ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    const brand = brandFromDom || (guessBrandFromTitle(title) ?? '');
    const brandGuessed = !brandFromDom && brand.length > 0;

    const eanNode = node.querySelector<HTMLElement>(LECLERC_SELECTORS.ean);
    const ean =
      eanNode?.getAttribute('content') ??
      eanNode?.textContent?.trim() ??
      eanNode?.dataset.ean ??
      eanNode?.dataset.gtin ??
      undefined;

    const id = node.dataset.productId ?? node.dataset.id ?? ean ?? `${brand}::${title}`;

    return {
      id,
      ean,
      brand,
      brandGuessed,
      title,
      rawText: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
      node,
    };
  }
}
