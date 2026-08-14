import { afterEach, describe, expect, it } from 'vitest';
import cardFixture from '../__fixtures__/card.html?raw';
import { IntermarcheAdapter } from '../intermarche-adapter';
import { MutationObserverHelper } from '../../../../../core/observer/mutation-observer-helper';
import type { RawProductCard } from '../../../domain/entities/raw-product-card';

/**
 * Monte le HTML dans le document happy-dom puis récupère les cartes émises par
 * le scan initial synchrone de observe() (extractCard est privé, on passe par
 * l'API publique de l'adapter).
 */
const extractCards = (adapter: IntermarcheAdapter, html: string): RawProductCard[] => {
  document.body.innerHTML = html;
  const cards: RawProductCard[] = [];
  const stop = adapter.observe(document, (event) => {
    if (event.type === 'added') cards.push(event.card);
  });
  stop();
  return cards;
};

describe('IntermarcheAdapter', () => {
  const adapter = new IntermarcheAdapter(new MutationObserverHelper());

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('matche les URLs Intermarché', () => {
    expect(adapter.matches('https://www.intermarche.com/rayons')).toBe(true);
    expect(adapter.matches('https://drive.intermarche.com/accueil')).toBe(true);
    expect(adapter.matches('https://www.carrefour.fr/')).toBe(false);
  });

  it("extrait titre, marque (suffixe MDD retiré) et EAN depuis l'href de la fixture", () => {
    const cards = extractCards(adapter, cardFixture);

    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(card?.title).toBe('Lait demi-écrémé UHT bio 1L');
    expect(card?.brand).toBe('Pâturages');
    expect(card?.brandGuessed).toBe(false);
    expect(card?.ean).toBe('3560070976478');
    expect(card?.id).toBe('3560070976478');
  });

  it('privilégie la marque microdata [itemprop="brand"] quand elle est présente', () => {
    const cards = extractCards(
      adapter,
      `<div data-testid="product-layout">
        <h2 class="stime-product--details__title">Compote pomme 4x100g</h2>
        <span itemprop="brand" content="Andros"></span>
      </div>`,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.brand).toBe('Andros');
    expect(cards[0]?.brandGuessed).toBe(false);
  });

  it('devine la marque depuis le titre quand aucun bloc marque n’existe', () => {
    const cards = extractCards(
      adapter,
      `<div data-testid="product-layout">
        <h2 class="stime-product--details__title">Danone yaourt nature x8</h2>
      </div>`,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.brand).toBe('Danone');
    expect(cards[0]?.brandGuessed).toBe(true);
  });

  it('ignore une carte sans titre', () => {
    const cards = extractCards(
      adapter,
      `<div data-testid="product-layout"><a href="/produit/x/12345678">x</a></div>`,
    );

    expect(cards).toHaveLength(0);
  });
});
