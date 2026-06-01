import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import {
  INTERMARCHE_BRAND_MDD_SUFFIX,
  INTERMARCHE_EAN_FROM_HREF,
  INTERMARCHE_HOST_PATTERNS,
  INTERMARCHE_SELECTORS,
} from './intermarche-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';

export class IntermarcheAdapter implements SiteAdapter {
  readonly id = 'intermarche';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return INTERMARCHE_HOST_PATTERNS.some((re) => re.test(url));
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
      subtree.querySelectorAll<HTMLElement>(INTERMARCHE_SELECTORS.productCard).forEach(emitForCard);
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
    const titleNode = node.querySelector<HTMLElement>(INTERMARCHE_SELECTORS.title);
    if (!titleNode) return null;
    const title = (titleNode.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!title) return null;

    const brand = this.extractBrand(node) ?? this.guessBrandFromTitle(title);

    const link = node.querySelector<HTMLAnchorElement>(INTERMARCHE_SELECTORS.productLink);
    const href = link?.getAttribute('href') ?? '';
    const ean = INTERMARCHE_EAN_FROM_HREF.exec(href)?.[1];

    const id = ean ?? `${brand}::${title}`;

    return {
      id,
      ean,
      brand,
      title,
      rawText: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
      node,
    };
  }

  private extractBrand(node: HTMLElement): string | null {
    const microdataNode = node.querySelector<HTMLElement>(INTERMARCHE_SELECTORS.brand);
    if (microdataNode) {
      const text = (microdataNode.getAttribute('content') ?? microdataNode.textContent ?? '').trim();
      if (text) return this.cleanBrand(text);
    }

    const container = node.querySelector<HTMLElement>(INTERMARCHE_SELECTORS.brandContainer);
    if (!container) return null;
    const paragraphs = Array.from(container.querySelectorAll<HTMLParagraphElement>(':scope > p'));
    const brandNode = paragraphs[paragraphs.length - 1];
    const text = (brandNode?.textContent ?? '').trim();
    if (!text) return null;
    return this.cleanBrand(text);
  }

  private cleanBrand(raw: string): string {
    return raw
      .replace(INTERMARCHE_BRAND_MDD_SUFFIX, '')
      .replace(/\s+/g, ' ')
      .replace(/[,;]\s*$/, '')
      .trim();
  }

  private guessBrandFromTitle(title: string): string {
    return title.split(/\s+/)[0] ?? '';
  }
}
