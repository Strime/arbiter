import { afterEach, describe, expect, it } from 'vitest';
import cardFixture from '../__fixtures__/card.html?raw';
import { AuchanAdapter } from '../auchan-adapter';
import { MutationObserverHelper } from '../../../../../core/observer/mutation-observer-helper';
import type { RawProductCard } from '../../../domain/entities/raw-product-card';

/**
 * Monte le HTML dans le document happy-dom puis récupère les cartes émises par
 * le scan initial synchrone de observe() (extractCard est privé, on passe par
 * l'API publique de l'adapter).
 */
const extractCards = (adapter: AuchanAdapter, html: string): RawProductCard[] => {
  document.body.innerHTML = html;
  const cards: RawProductCard[] = [];
  const stop = adapter.observe(document, (event) => {
    if (event.type === 'added') cards.push(event.card);
  });
  stop();
  return cards;
};

describe('AuchanAdapter', () => {
  const adapter = new AuchanAdapter(new MutationObserverHelper());

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('matche les URLs du drive Auchan', () => {
    expect(adapter.matches('https://www.auchan.fr/recherche?text=chocolat')).toBe(true);
    expect(adapter.matches('https://www.carrefour.fr/')).toBe(false);
  });

  it('sépare le préfixe marque du titre et ne remonte pas d’EAN', () => {
    const cards = extractCards(adapter, cardFixture);

    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(card?.brand).toBe('NESTLE DESSERT');
    expect(card?.brandGuessed).toBe(false);
    expect(card?.title).toBe('Tablette de chocolat noir pâtissier 200g');
    expect(card?.ean).toBeUndefined();
  });

  it("dérive l'id produit depuis le code pr-C… du href plutôt que le data-id UUID instable", () => {
    const cards = extractCards(adapter, cardFixture);

    expect(cards[0]?.id).toBe('C1246750');
  });

  it('retombe sur data-id quand le href ne porte pas de code pr-C…', () => {
    const cards = extractCards(
      adapter,
      `<article class="product-thumbnail" data-id="fallback-uuid-123">
        <a href="/produit-sans-code"></a>
        <span itemprop="brand">MARQUE TEST</span>
        <p itemprop="name">MARQUE TEST
        Titre de test</p>
      </article>`,
    );

    expect(cards[0]?.id).toBe('fallback-uuid-123');
  });

  it('devine la marque depuis le titre quand le nœud marque est absent', () => {
    const cards = extractCards(
      adapter,
      `<article class="product-thumbnail">
        <a href="/x/pr-C999"></a>
        <p itemprop="name">Bonduelle maïs doux 300g</p>
      </article>`,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.brand).toBe('Bonduelle');
    expect(cards[0]?.brandGuessed).toBe(true);
    expect(cards[0]?.id).toBe('C999');
  });

  it('ignore une carte sans titre', () => {
    const cards = extractCards(
      adapter,
      `<article class="product-thumbnail"><div class="price">2 €</div></article>`,
    );

    expect(cards).toHaveLength(0);
  });
});
