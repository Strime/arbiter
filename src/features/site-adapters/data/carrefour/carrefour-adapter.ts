import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { CARREFOUR_HOST_PATTERNS, CARREFOUR_SELECTORS } from './carrefour-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';

export class CarrefourAdapter implements SiteAdapter {
  readonly id = 'carrefour';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return CARREFOUR_HOST_PATTERNS.some((re) => re.test(url));
  }

  observe(root: Document, listener: ProductCardListener): () => void {
    const seen = new WeakSet<HTMLElement>();

    const emitForCard = (node: HTMLElement): void => {
      if (seen.has(node)) return;
      const card = this.extractCard(node);
      if (!card) return;
      seen.add(node);
      listener({ type: 'added', card });
    };

    const scanRoot = (subtree: ParentNode): void => {
      subtree.querySelectorAll<HTMLElement>(CARREFOUR_SELECTORS.productCard).forEach(emitForCard);
    };

    scanRoot(root);

    return this.observerHelper.observe(root.body, (records) => {
      for (const record of records) {
        record.addedNodes.forEach((added) => {
          if (added instanceof HTMLElement) scanRoot(added);
        });
      }
    });
  }

  private extractCard(node: HTMLElement): RawProductCard | null {
    const titleNode = node.querySelector<HTMLElement>(CARREFOUR_SELECTORS.title);
    if (!titleNode) return null;
    const title = (titleNode.textContent ?? '').trim();
    if (!title) return null;

    const brandNode = node.querySelector<HTMLElement>(CARREFOUR_SELECTORS.brand);
    const brand = (brandNode?.textContent ?? this.guessBrandFromTitle(title)).trim();

    const eanNode = node.querySelector<HTMLElement>(CARREFOUR_SELECTORS.ean);
    const testid = node.dataset.testid;
    const eanFromTestid = testid && /^\d{8,14}$/.test(testid) ? testid : undefined;
    const ean = eanNode?.dataset.ean ?? eanNode?.dataset.gtin ?? eanFromTestid ?? undefined;

    const id = node.dataset.productId ?? ean ?? `${brand}::${title}`;

    return {
      id,
      ean,
      brand,
      title,
      rawText: (node.textContent ?? '').trim(),
      node,
    };
  }

  private guessBrandFromTitle(title: string): string {
    const firstToken = title.split(/\s+/)[0] ?? '';
    return firstToken;
  }
}
