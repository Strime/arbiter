import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCardObserver } from '../create-card-observer';
import { MutationObserverHelper } from '../../../../core/observer/mutation-observer-helper';
import type { ProductCardEvent } from '../../domain/entities/product-card-event';
import type { RawProductCard } from '../../domain/entities/raw-product-card';

const CARD_SELECTOR = '[data-card]';

/**
 * Helper de test : même contrat que MutationObserverHelper mais déclenchement
 * manuel et synchrone des batches de MutationRecord (pas de throttle, pas de
 * dépendance au timing du MutationObserver de happy-dom).
 */
class ManualObserverHelper extends MutationObserverHelper {
  private handler: ((records: MutationRecord[]) => void) | null = null;

  override observe(_target: Node, handler: (records: MutationRecord[]) => void): () => void {
    this.handler = handler;
    return () => {
      this.handler = null;
    };
  }

  emit(records: MutationRecord[]): void {
    this.handler?.(records);
  }
}

const fakeRecord = (init: { target: Node; addedNodes?: Node[] }): MutationRecord =>
  ({
    target: init.target,
    addedNodes: init.addedNodes ?? [],
    removedNodes: [],
    type: 'childList',
  }) as unknown as MutationRecord;

const buildCard = (id: string, title: string): HTMLElement => {
  const card = document.createElement('article');
  card.setAttribute('data-card', '');
  card.setAttribute('data-id', id);
  const heading = document.createElement('h3');
  heading.textContent = title;
  card.appendChild(heading);
  return card;
};

const extractCard = (node: HTMLElement): RawProductCard | null => {
  const id = node.getAttribute('data-id');
  const title = node.querySelector('h3')?.textContent?.trim() ?? '';
  if (!id || !title) return null;
  return { id, brand: '', title, node };
};

const setup = (): {
  events: ProductCardEvent[];
  helper: ManualObserverHelper;
  stop: () => void;
} => {
  const events: ProductCardEvent[] = [];
  const helper = new ManualObserverHelper();
  const stop = createCardObserver({
    observerHelper: helper,
    cardSelector: CARD_SELECTOR,
    extractCard,
    root: document,
    listener: (event) => events.push(event),
  });
  return { events, helper, stop };
};

describe('createCardObserver', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it("émet 'added' pour les cartes déjà présentes au démarrage (scan initial)", () => {
    document.body.appendChild(buildCard('a1', 'Produit A'));
    document.body.appendChild(buildCard('a2', 'Produit B'));

    const { events, stop } = setup();

    expect(events).toHaveLength(2);
    expect(events.every((event) => event.type === 'added')).toBe(true);
    expect(events.map((event) => event.card.id)).toEqual(['a1', 'a2']);
    stop();
  });

  it("émet 'added' quand un nœud carte est ajouté après coup", () => {
    const { events, helper, stop } = setup();
    expect(events).toHaveLength(0);

    const card = buildCard('b1', 'Produit B');
    document.body.appendChild(card);
    helper.emit([fakeRecord({ target: document.body, addedNodes: [card] })]);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('added');
    expect(events[0]?.card.id).toBe('b1');
    stop();
  });

  it("détecte les cartes descendantes d'un sous-arbre ajouté", () => {
    const { events, helper, stop } = setup();

    const wrapper = document.createElement('section');
    wrapper.appendChild(buildCard('c1', 'Produit C'));
    document.body.appendChild(wrapper);
    helper.emit([fakeRecord({ target: document.body, addedNodes: [wrapper] })]);

    expect(events.map((event) => event.card.id)).toEqual(['c1']);
    stop();
  });

  it("ne ré-émet pas pour une mutation sans changement d'identité de carte", () => {
    const card = buildCard('d1', 'Produit D');
    document.body.appendChild(card);
    const { events, helper, stop } = setup();
    expect(events).toHaveLength(1);

    // Mutation cosmétique dans la carte : même id extrait -> aucun nouvel événement.
    helper.emit([fakeRecord({ target: card.querySelector('h3') as Node })]);

    expect(events).toHaveLength(1);
    stop();
  });

  it("recyclage : retire l'ancien host de badge et ré-émet 'added'", () => {
    const card = buildCard('e1', 'Produit E');
    document.body.appendChild(card);
    const { events, helper, stop } = setup();
    expect(events.map((event) => event.card.id)).toEqual(['e1']);

    // L'extension a injecté son badge dans la carte.
    const badgeHost = document.createElement('div');
    badgeHost.setAttribute('data-cocarde-badge', '');
    card.appendChild(badgeHost);

    // Le site (SPA à scroll infini) recycle le même élément pour un autre produit.
    card.setAttribute('data-id', 'e2');
    const heading = card.querySelector('h3');
    if (heading) heading.textContent = 'Produit E2';
    helper.emit([fakeRecord({ target: heading as Node })]);

    expect(badgeHost.isConnected).toBe(false);
    expect(events).toHaveLength(2);
    expect(events[1]?.type).toBe('added');
    expect(events[1]?.card.id).toBe('e2');
    stop();
  });

  it("intégration : le MutationObserver réel (happy-dom) + throttle émet 'added'", async () => {
    vi.useFakeTimers();
    const events: ProductCardEvent[] = [];
    const stop = createCardObserver({
      observerHelper: new MutationObserverHelper(120),
      cardSelector: CARD_SELECTOR,
      extractCard,
      root: document,
      listener: (event) => events.push(event),
    });

    document.body.appendChild(buildCard('f1', 'Produit F'));
    // Laisse happy-dom livrer les MutationRecords (microtask) puis dépasse le throttle.
    await vi.advanceTimersByTimeAsync(200);

    expect(events.map((event) => event.card.id)).toEqual(['f1']);
    stop();
  });
});
