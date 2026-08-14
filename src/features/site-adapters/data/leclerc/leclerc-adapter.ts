import type { SiteAdapter, ProductCardListener } from '../../domain/entities/site-adapter';
import type { RawProductCard } from '../../domain/entities/raw-product-card';
import {
  LECLERC_HOST_PATTERNS,
  LECLERC_PRODUCT_ID_FROM_IMAGE_SRC,
  LECLERC_SELECTORS,
} from './leclerc-selectors';
import type { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';
import { createCardObserver } from '../create-card-observer';
import { guessBrandFromTitle } from '../guess-brand-from-title';

const MARQUE_REPERE_BRAND = 'Marque Repère';

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
    const titleAnchor = node.querySelector<HTMLAnchorElement>(LECLERC_SELECTORS.title);
    if (!titleAnchor) return null;

    // Le libellé produit est le PREMIER nœud texte de l'ancre : la ligne qui suit le
    // <br> porte la variante/poids, pas le nom du produit (ex. "Mini feuilletés Côté
    // Table<br>Apéritifs - x30 - 360g" → titre = "Mini feuilletés Côté Table").
    const firstText = Array.from(titleAnchor.childNodes).find(
      (child): child is Text => child.nodeType === Node.TEXT_NODE && !!child.textContent?.trim(),
    );
    const title = (firstText?.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!title) return null;

    // Aucun élément marque dédié sur Leclerc Drive. Seul signal fiable : le logo
    // "Marque repère" (MDD Leclerc), prioritaire sur le guess premier-mot du titre.
    const hasMarqueRepereBadge = node.querySelector(LECLERC_SELECTORS.mddBadge) !== null;
    const brandFromDom = hasMarqueRepereBadge ? MARQUE_REPERE_BRAND : '';
    const brand = brandFromDom || (guessBrandFromTitle(title) ?? '');
    const brandGuessed = !brandFromDom && brand.length > 0;

    const id = this.extractProductId(node, brand, title);

    // Stickers qualité/labels (ex. "Viande Bovine Française", "Vegan") sont des
    // <img alt="…"> invisibles au textContent : concaténés pour que l'heuristique
    // texte de détection d'origine puisse les voir.
    const stickerAlts = Array.from(
      node.querySelectorAll<HTMLImageElement>(LECLERC_SELECTORS.stickerImages),
    )
      .map((img) => img.getAttribute('alt')?.trim() ?? '')
      .filter(Boolean);
    const rawText = [(node.textContent ?? '').replace(/\s+/g, ' ').trim(), ...stickerAlts]
      .join(' ')
      .trim();

    return {
      id,
      // Aucun EAN sur Leclerc Drive : pas de JSON-LD, pas de data-ean/gtin, pas de
      // microdata gtin13, et les liens produit sont sans href (vérifié en live le
      // 2026-08-14).
      ean: undefined,
      brand,
      brandGuessed,
      title,
      rawText,
      node,
    };
  }

  private extractProductId(node: HTMLElement, brand: string, title: string): string {
    const image = node.querySelector<HTMLImageElement>(LECLERC_SELECTORS.productImage);
    const idFromImage = LECLERC_PRODUCT_ID_FROM_IMAGE_SRC.exec(
      image?.getAttribute('src') ?? '',
    )?.[1];
    if (idFromImage) return idFromImage;

    // Fallback positionnel : l'id du <li> (ex. "sId6") reste stable pour une même
    // session de navigation même s'il ne l'est pas entre deux chargements de page.
    if (node.id) return node.id;

    return `${brand}::${title}`;
  }
}
