import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import { LIDL_DATA_ATTRS, LIDL_HOST_PATTERNS, LIDL_SELECTORS } from './lidl-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';
import { createCardObserver } from '../create-card-observer';
import { guessBrandFromTitle } from '../guess-brand-from-title';

/** Forme de l'objet JSON porté par `data-grid-data` (variante `odsc-tile`). */
interface LidlGridData {
  readonly fullTitle?: string;
  readonly productId?: number | string;
  readonly erpNumber?: string;
  readonly brand?: {
    readonly name?: string;
    readonly showBrand?: boolean;
  };
}

/** Forme de l'objet JSON (URL-encodé) porté par `data-gridbox-impression`. */
interface LidlGridboxImpression {
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
    const gridData = this.parseGridData(node);
    if (gridData) {
      return this.cardFromGridData(node, gridData);
    }

    const impression = this.parseGridboxImpression(node);
    if (impression) {
      return this.cardFromImpression(node, impression);
    }

    return this.cardFromDom(node);
  }

  private cardFromGridData(node: HTMLElement, data: LidlGridData): RawProductCard | null {
    const title = (data.fullTitle ?? '').replace(/\s+/g, ' ').trim();
    if (!title) return null;

    const brandRaw =
      data.brand?.showBrand === true && data.brand.name ? data.brand.name.trim() : '';
    const brand = brandRaw ? this.stripTrademarks(brandRaw) : (guessBrandFromTitle(title) ?? '');
    const brandGuessed = !brandRaw && brand.length > 0;

    const id =
      data.productId != null && data.productId !== ''
        ? String(data.productId)
        : (data.erpNumber ?? `${brand}::${title}`);

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

  private cardFromImpression(node: HTMLElement, data: LidlGridboxImpression): RawProductCard | null {
    const title = (data.name ?? '').replace(/\s+/g, ' ').trim();
    if (!title) return null;

    const brandRaw = (data.brand ?? '').trim();
    const brand = brandRaw ? this.stripTrademarks(brandRaw) : (guessBrandFromTitle(title) ?? '');
    const brandGuessed = !brandRaw && brand.length > 0;

    const id = data.id != null && data.id !== '' ? String(data.id) : `${brand}::${title}`;

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

  private cardFromDom(node: HTMLElement): RawProductCard | null {
    const brandNode = node.querySelector<HTMLElement>(LIDL_SELECTORS.brand);
    const titleNode = node.querySelector<HTMLElement>(LIDL_SELECTORS.title);

    const title = (titleNode?.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!title) return null;

    const brandFromDom = (brandNode?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const brand = brandFromDom
      ? this.stripTrademarks(brandFromDom)
      : (guessBrandFromTitle(title) ?? '');
    const brandGuessed = !brandFromDom && brand.length > 0;

    const id = node.dataset.productId ?? `${brand}::${title}`;

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

  /** JSON brut : `JSON.parse` direct. */
  private parseGridData(node: HTMLElement): LidlGridData | null {
    const raw = node.getAttribute(LIDL_DATA_ATTRS.gridData);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LidlGridData;
    } catch {
      return null;
    }
  }

  /** JSON URL-encodé : `decodeURIComponent` puis `JSON.parse`. */
  private parseGridboxImpression(node: HTMLElement): LidlGridboxImpression | null {
    const raw = node.getAttribute(LIDL_DATA_ATTRS.gridboxImpression);
    if (!raw) return null;
    try {
      const decoded = decodeURIComponent(raw);
      return JSON.parse(decoded) as LidlGridboxImpression;
    } catch {
      return null;
    }
  }

  private stripTrademarks(brand: string): string {
    return brand.replace(/[®™©]/g, '').replace(/\s+/g, ' ').trim();
  }
}
