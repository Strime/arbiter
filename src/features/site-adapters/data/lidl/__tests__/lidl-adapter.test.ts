import { afterEach, describe, expect, it } from 'vitest';
import cardFixture from '../__fixtures__/card.html?raw';
import { LidlAdapter } from '../lidl-adapter';
import { MutationObserverHelper } from '../../../../../core/observer/mutation-observer-helper';
import type { RawProductCard } from '../../../domain/entities/raw-product-card';

/**
 * Monte le HTML dans le document happy-dom puis récupère les cartes émises par
 * le scan initial synchrone de observe() (extractCard est privé, on passe par
 * l'API publique de l'adapter).
 */
const extractCards = (adapter: LidlAdapter, html: string): RawProductCard[] => {
  document.body.innerHTML = html;
  const cards: RawProductCard[] = [];
  const stop = adapter.observe(document, (event) => {
    if (event.type === 'added') cards.push(event.card);
  });
  stop();
  return cards;
};

describe('LidlAdapter', () => {
  const adapter = new LidlAdapter(new MutationObserverHelper());

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('matche les URLs des pages catégorie et recherche Lidl', () => {
    expect(adapter.matches('https://www.lidl.fr/c/epicerie')).toBe(true);
    expect(adapter.matches('https://www.lidl.fr/q/search?q=chocolat')).toBe(true);
    expect(adapter.matches('https://www.carrefour.fr/')).toBe(false);
  });

  it('extrait les deux variantes de tuile présentes sur la fixture', () => {
    const cards = extractCards(adapter, cardFixture);

    expect(cards).toHaveLength(2);
  });

  it('lit la variante data-grid-data (JSON brut) avec marque structurée', () => {
    const cards = extractCards(adapter, cardFixture);
    const card = cards.find((c) => c.id === '10037536');

    expect(card).toBeDefined();
    expect(card?.title).toBe('CONFISERIE FIRENZE Muffins aux pépites de chocolat');
    expect(card?.brand).toBe('CONFISERIE FIRENZE');
    expect(card?.brandGuessed).toBe(false);
    expect(card?.ean).toBeUndefined();
  });

  it('lit la variante data-gridbox-impression (JSON URL-encodé) avec marque structurée', () => {
    const cards = extractCards(adapter, cardFixture);
    const card = cards.find((c) => c.id === '10038000');

    expect(card).toBeDefined();
    expect(card?.title).toBe('Assortiment biscuits apéritifs 250g');
    expect(card?.brand).toBe('ALLINI');
    expect(card?.brandGuessed).toBe(false);
    expect(card?.ean).toBeUndefined();
  });

  it('ignore la marque quand brand.showBrand est false et devine depuis le titre', () => {
    const cards = extractCards(
      adapter,
      `<div class="odsc-tile" data-grid-data='{"fullTitle":"Bonduelle maïs doux 300g","productId":42,"brand":{"name":"Bonduelle","showBrand":false}}'></div>`,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.brand).toBe('Bonduelle');
    expect(cards[0]?.brandGuessed).toBe(true);
  });

  it('retombe sur erpNumber quand productId est absent', () => {
    const cards = extractCards(
      adapter,
      `<div class="odsc-tile" data-grid-data='{"fullTitle":"Carrot cake avec glaçage","erpNumber":"10037676","brand":{"showBrand":false}}'></div>`,
    );

    expect(cards[0]?.id).toBe('10037676');
  });

  it('retombe sur le DOM classique quand le JSON est invalide', () => {
    const cards = extractCards(
      adapter,
      `<div class="odsc-tile" data-grid-data='{not valid json'>
        <div class="product-grid-box__brand">Danone</div>
        <div class="product-grid-box__title">Yaourt nature x8</div>
      </div>`,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.brand).toBe('Danone');
    expect(cards[0]?.title).toBe('Yaourt nature x8');
    expect(cards[0]?.brandGuessed).toBe(false);
  });

  it('ignore une carte sans titre exploitable', () => {
    const cards = extractCards(
      adapter,
      `<div class="odsc-tile" data-grid-data='{"productId":1,"brand":{"showBrand":false}}'></div>`,
    );

    expect(cards).toHaveLength(0);
  });
});
