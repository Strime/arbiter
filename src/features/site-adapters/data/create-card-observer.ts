import type { ProductCardListener } from '../domain/entities/site-adapter';
import type { RawProductCard } from '../domain/entities/raw-product-card';
import type { MutationObserverHelper } from '../../../core/observer/mutation-observer-helper';

const BADGE_HOST_MARKER = 'data-cocarde-badge';

interface CardObserverOptions {
  readonly observerHelper: MutationObserverHelper;
  readonly cardSelector: string;
  readonly extractCard: (node: HTMLElement) => RawProductCard | null;
  readonly root: Document;
  readonly listener: ProductCardListener;
}

export function createCardObserver(options: CardObserverOptions): () => void {
  const { observerHelper, cardSelector, extractCard, root, listener } = options;
  const seen = new WeakMap<HTMLElement, string>();

  const emitForCard = (node: HTMLElement): void => {
    const previousId = seen.get(node);
    const card = extractCard(node);
    if (!card) return;
    if (previousId === card.id) return;
    if (previousId !== undefined) {
      node.querySelectorAll<HTMLElement>(`[${BADGE_HOST_MARKER}]`).forEach((host) => {
        host.remove();
      });
    }
    seen.set(node, card.id);
    listener({ type: 'added', card });
  };

  const collectInto = (subtree: ParentNode, candidates: Set<HTMLElement>): void => {
    subtree.querySelectorAll<HTMLElement>(cardSelector).forEach((node) => candidates.add(node));
  };

  const initial = new Set<HTMLElement>();
  collectInto(root, initial);
  initial.forEach(emitForCard);

  return observerHelper.observe(root.body, (records) => {
    const candidates = new Set<HTMLElement>();
    for (const record of records) {
      record.addedNodes.forEach((added) => {
        if (!(added instanceof HTMLElement)) return;
        if (added.matches(cardSelector)) candidates.add(added);
        collectInto(added, candidates);
      });
      if (record.target instanceof HTMLElement) {
        const ancestorCard = record.target.closest<HTMLElement>(cardSelector);
        if (ancestorCard) candidates.add(ancestorCard);
      }
    }
    candidates.forEach(emitForCard);
  });
}
