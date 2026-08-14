import { afterEach, describe, expect, it } from 'vitest';
import cardFixture from '../__fixtures__/card.html?raw';
import { CarrefourAdapter } from '../carrefour-adapter';
import { MutationObserverHelper } from '../../../../../core/observer/mutation-observer-helper';
import type { RawProductCard } from '../../../domain/entities/raw-product-card';

/**
 * Monte le HTML dans le document happy-dom puis récupère les cartes émises par
 * le scan initial synchrone de observe() (extractCard est privé, on passe par
 * l'API publique de l'adapter).
 */
const extractCards = (adapter: CarrefourAdapter, html: string): RawProductCard[] => {
  document.body.innerHTML = html;
  const cards: RawProductCard[] = [];
  const stop = adapter.observe(document, (event) => {
    if (event.type === 'added') cards.push(event.card);
  });
  stop();
  return cards;
};

describe('CarrefourAdapter', () => {
  const adapter = new CarrefourAdapter(new MutationObserverHelper());

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('matche les URLs du drive Carrefour', () => {
    expect(adapter.matches('https://www.carrefour.fr/r/cremerie')).toBe(true);
    expect(adapter.matches('https://drive.carrefour.fr/courses')).toBe(true);
    expect(adapter.matches('https://www.auchan.fr/')).toBe(false);
  });

  it('extrait titre, marque et EAN de la fixture', () => {
    const cards = extractCards(adapter, cardFixture);

    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(card?.title).toBe('Lait demi-écrémé bio 1L');
    expect(card?.brand).toBe('CARREFOUR BIO');
    expect(card?.brandGuessed).toBe(false);
    expect(card?.ean).toBe('3270190207924');
    expect(card?.id).toBe('3270190207924');
  });

  it('devine la marque depuis le titre quand le nœud marque est absent', () => {
    const cards = extractCards(
      adapter,
      `<article class="product-card">
        <h3>Bonduelle maïs doux 300g</h3>
      </article>`,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.brand).toBe('Bonduelle');
    expect(cards[0]?.brandGuessed).toBe(true);
    expect(cards[0]?.ean).toBeUndefined();
  });

  it('lit un EAN numérique porté par data-testid en dernier recours', () => {
    const cards = extractCards(
      adapter,
      `<article class="product-card" data-testid="3560070976478">
        <h3>Danone yaourt nature x8</h3>
      </article>`,
    );

    expect(cards[0]?.ean).toBe('3560070976478');
  });

  it('ignore une carte sans titre', () => {
    const cards = extractCards(
      adapter,
      `<article class="product-card"><div class="product-card-price">2 €</div></article>`,
    );

    expect(cards).toHaveLength(0);
  });
});
