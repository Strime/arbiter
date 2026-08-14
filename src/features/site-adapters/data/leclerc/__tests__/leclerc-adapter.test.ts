import { afterEach, describe, expect, it } from 'vitest';
import cardFixture from '../__fixtures__/card.html?raw';
import { LeclercAdapter } from '../leclerc-adapter';
import { MutationObserverHelper } from '../../../../../core/observer/mutation-observer-helper';
import type { RawProductCard } from '../../../domain/entities/raw-product-card';

/**
 * Monte le HTML dans le document happy-dom puis récupère les cartes émises par
 * le scan initial synchrone de observe() (extractCard est privé, on passe par
 * l'API publique de l'adapter).
 */
const extractCards = (adapter: LeclercAdapter, html: string): RawProductCard[] => {
  document.body.innerHTML = html;
  const cards: RawProductCard[] = [];
  const stop = adapter.observe(document, (event) => {
    if (event.type === 'added') cards.push(event.card);
  });
  stop();
  return cards;
};

describe('LeclercAdapter', () => {
  const adapter = new LeclercAdapter(new MutationObserverHelper());

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('matche les URLs du drive Leclerc (fd2-courses.*, mgt.*)', () => {
    expect(adapter.matches('https://fd2-courses.leclercdrive.fr/webcommander/')).toBe(true);
    expect(adapter.matches('https://mgt.leclercdrive.fr/magasin/027411')).toBe(true);
    expect(adapter.matches('https://www.carrefour.fr/')).toBe(false);
  });

  it('extrait les 4 cartes de la fixture, y compris la carte indisponible', () => {
    const cards = extractCards(adapter, cardFixture);

    expect(cards).toHaveLength(4);
  });

  it('détecte la MDD via le sticker "Marque repère" (prioritaire sur le guess) et l’id via la photo', () => {
    const cards = extractCards(adapter, cardFixture);
    const card = cards.find((c) => c.id === '2212509');

    expect(card).toBeDefined();
    expect(card?.title).toBe('Mini feuilletés Côté Table');
    expect(card?.brand).toBe('Marque Repère');
    expect(card?.brandGuessed).toBe(false);
    expect(card?.ean).toBeUndefined();
  });

  it('devine la marque depuis le premier mot du titre quand aucun sticker MDD n’est présent', () => {
    const cards = extractCards(adapter, cardFixture);
    const card = cards.find((c) => c.id === '2590327');

    expect(card).toBeDefined();
    expect(card?.title).toBe('Gyoza Ajinomoto');
    expect(card?.brand).toBe('Gyoza');
    expect(card?.brandGuessed).toBe(true);
    expect(card?.ean).toBeUndefined();
  });

  it('extrait aussi la carte indisponible (liWCRS310_Unavailable, data-vignette="bientotDisponible")', () => {
    const cards = extractCards(adapter, cardFixture);
    const card = cards.find((c) => c.id === '2590330');

    expect(card).toBeDefined();
    expect(card?.title).toBe('Gyoza Ajinomoto');
    expect(card?.brand).toBe('Gyoza');
    expect(card?.brandGuessed).toBe(true);
    expect(card?.ean).toBeUndefined();
  });

  it('construit rawText avec les alt des stickers qualité (invisibles au textContent)', () => {
    const cards = extractCards(adapter, cardFixture);
    const card = cards.find((c) => c.id === '2898266');

    expect(card).toBeDefined();
    expect(card?.brand).toBe('Marque Repère');
    expect(card?.brandGuessed).toBe(false);
    expect(card?.rawText).toContain('Viande Bovine Française');
  });

  it("ean n'est jamais renseigné, quelle que soit la carte", () => {
    const cards = extractCards(adapter, cardFixture);

    expect(cards.every((c) => c.ean === undefined)).toBe(true);
  });

  it('retombe sur l’id du <li> quand la photo produit est absente', () => {
    const cards = extractCards(
      adapter,
      `<li class="liWCRS310_Product" id="sId42" data-vignette="disponible">
        <div class="divWCRS310_Content">
          <p class="pWCRS310_Desc">
            <a class="aWCRS310_Product">Produit sans photo<br>Variante - 100g</a>
          </p>
        </div>
      </li>`,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.id).toBe('sId42');
  });

  it('retombe sur brand::title quand ni photo ni id de <li> ne sont disponibles', () => {
    const cards = extractCards(
      adapter,
      `<li class="liWCRS310_Product" data-vignette="disponible">
        <div class="divWCRS310_Content">
          <p class="pWCRS310_Desc">
            <a class="aWCRS310_Product">Produit fantôme<br>Variante - 100g</a>
          </p>
        </div>
      </li>`,
    );

    expect(cards[0]?.id).toBe('Produit::Produit fantôme');
  });

  it('ignore une carte sans titre exploitable', () => {
    const cards = extractCards(
      adapter,
      `<li class="liWCRS310_Product" id="sId99" data-vignette="disponible">
        <div class="divWCRS310_Content"></div>
      </li>`,
    );

    expect(cards).toHaveLength(0);
  });
});
