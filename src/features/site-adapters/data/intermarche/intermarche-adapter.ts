import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import {
  INTERMARCHE_BRAND_MDD_SUFFIX,
  INTERMARCHE_EAN_FROM_HREF,
  INTERMARCHE_HOST_PATTERNS,
  INTERMARCHE_SELECTORS,
} from './intermarche-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';
import { createCardObserver } from '../create-card-observer';
import { guessBrandFromTitle } from '../guess-brand-from-title';

export class IntermarcheAdapter implements SiteAdapter {
  readonly id = 'intermarche';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return INTERMARCHE_HOST_PATTERNS.some((re) => re.test(url));
  }

  observe(root: Document, listener: ProductCardListener): () => void {
    return createCardObserver({
      observerHelper: this.observerHelper,
      cardSelector: INTERMARCHE_SELECTORS.productCard,
      extractCard: (node) => this.extractCard(node),
      root,
      listener,
    });
  }

  private extractCard(node: HTMLElement): RawProductCard | null {
    const titleNode = node.querySelector<HTMLElement>(INTERMARCHE_SELECTORS.title);
    if (!titleNode) return null;
    const title = (titleNode.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!title) return null;

    const brandFromDom = this.extractBrand(node);
    const brand = brandFromDom ?? guessBrandFromTitle(title) ?? '';
    const brandGuessed = brandFromDom === null && brand.length > 0;

    const link = node.querySelector<HTMLAnchorElement>(INTERMARCHE_SELECTORS.productLink);
    const href = link?.getAttribute('href') ?? '';
    const ean = INTERMARCHE_EAN_FROM_HREF.exec(href)?.[1];

    const id = ean ?? `${brand}::${title}`;

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
}
