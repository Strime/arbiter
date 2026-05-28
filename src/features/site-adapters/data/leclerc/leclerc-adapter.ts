import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { LECLERC_HOST_PATTERNS, LECLERC_SELECTORS } from './leclerc-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';

export class LeclercAdapter implements SiteAdapter {
  readonly id = 'leclerc';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return LECLERC_HOST_PATTERNS.some((re) => re.test(url));
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
      subtree.querySelectorAll<HTMLElement>(LECLERC_SELECTORS.productCard).forEach(emitForCard);
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
    const brandText =
      brandNode?.getAttribute('content') ??
      brandNode?.textContent ??
      this.guessBrandFromTitle(title);
    const brand = brandText.replace(/\s+/g, ' ').trim();

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
      title,
      rawText: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
      node,
    };
  }

  private guessBrandFromTitle(title: string): string {
    return title.split(/\s+/)[0] ?? '';
  }
}
