import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { AUCHAN_HOST_PATTERNS, AUCHAN_SELECTORS } from './auchan-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';

export class AuchanAdapter implements SiteAdapter {
  readonly id = 'auchan';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return AUCHAN_HOST_PATTERNS.some((re) => re.test(url));
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
      subtree.querySelectorAll<HTMLElement>(AUCHAN_SELECTORS.productCard).forEach(emitForCard);
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
    const nameNode = node.querySelector<HTMLElement>(AUCHAN_SELECTORS.titleAndBrand);
    const rawNameText = (nameNode?.textContent ?? '').trim();
    if (!rawNameText) return null;

    const brandNode = node.querySelector<HTMLElement>(AUCHAN_SELECTORS.brand);
    const brand = (brandNode?.textContent ?? this.guessBrandFromText(rawNameText)).trim();

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
      title,
      rawText: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
      node,
    };
  }

  private guessBrandFromText(text: string): string {
    const firstToken = text.split(/\s+/)[0] ?? '';
    return firstToken;
  }
}
