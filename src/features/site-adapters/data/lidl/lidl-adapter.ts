import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { LIDL_HOST_PATTERNS, LIDL_SELECTORS } from './lidl-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';
import { createCardObserver } from '../create-card-observer';
import { guessBrandFromTitle } from '../guess-brand-from-title';

interface ProductImpression {
  readonly id?: string | number;
  readonly name?: string;
  readonly brand?: string;
}

export class LidlAdapter implements SiteAdapter {
  readonly id = 'lidl';

  constructor(private readonly observerHelper: MutationObserverHelper) {}

  matches(url: string): boolean {
    return LIDL_HOST_PATTERNS.some((re) => re.test(url));
  }

  observe(root: Document, listener: ProductCardListener): () => void {
    return createCardObserver({
      observerHelper: this.observerHelper,
      cardSelector: LIDL_SELECTORS.productCard,
      extractCard: (node) => this.extractCard(node),
      root,
      listener,
    });
  }

  private extractCard(node: HTMLElement): RawProductCard | null {
    const impression = this.readImpression(node);

    const brandNode = node.querySelector<HTMLElement>(LIDL_SELECTORS.brand);
    const titleNode = node.querySelector<HTMLElement>(LIDL_SELECTORS.title);

    const titleFromDom = (titleNode?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const brandFromDom = (brandNode?.textContent ?? '').replace(/\s+/g, ' ').trim();

    const title = (impression?.name ?? titleFromDom).trim();
    if (!title) return null;

    const brandRaw = (impression?.brand ?? brandFromDom).trim();
    const brand = brandRaw ? this.stripTrademarks(brandRaw) : (guessBrandFromTitle(title) ?? '');
    const brandGuessed = !brandRaw && brand.length > 0;

    const id =
      (impression?.id != null ? String(impression.id) : null) ??
      node.dataset.productId ??
      `${brand}::${title}`;

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

  private readImpression(node: HTMLElement): ProductImpression | null {
    const anchor =
      node.matches(LIDL_SELECTORS.impressionAnchor)
        ? node
        : node.querySelector<HTMLElement>(LIDL_SELECTORS.impressionAnchor) ??
          node.closest(LIDL_SELECTORS.impressionAnchor);
    const raw = anchor?.getAttribute('data-product-impression');
    if (!raw) return null;
    try {
      const decoded = decodeURIComponent(raw);
      const parsed = JSON.parse(decoded) as { products?: ProductImpression[] };
      const first = parsed.products?.[0];
      return first ?? null;
    } catch {
      return null;
    }
  }

  private stripTrademarks(brand: string): string {
    return brand.replace(/[®™©]/g, '').replace(/\s+/g, ' ').trim();
  }
}
