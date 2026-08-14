import { describe, expect, it } from 'vitest';
import { OffToManufacturingOriginMapper } from '../off-to-manufacturing-origin';
import type { OffProductModel } from '../../models/off-product-model';

const product = (overrides: Partial<OffProductModel>): OffProductModel => ({
  code: '3560070976478',
  ...overrides,
});

describe('OffToManufacturingOriginMapper', () => {
  const mapper = new OffToManufacturingOriginMapper();

  it('priorise origins_tags sur manufacturing_places_tags', () => {
    const result = mapper.toEntity(
      product({
        origins_tags: ['en:italy'],
        manufacturing_places_tags: ['en:france'],
      }),
    );
    expect(result?.country).toBe('IT');
    expect(result?.source).toBe('openfoodfacts');
  });

  it('utilise manufacturing_places_tags en repli quand origins_tags est absent', () => {
    const result = mapper.toEntity(product({ manufacturing_places_tags: ['en:france'] }));
    expect(result?.country).toBe('FR');
  });

  it("n'utilise JAMAIS countries_tags (pays de vente ≠ pays d'origine)", () => {
    // Produit vendu en France mais sans info d'origine : verdict null.
    const result = mapper.toEntity(product({ countries_tags: ['en:france'] }));
    expect(result).toBeNull();
  });

  it("normalise un tag préfixé d'une autre langue ('fr:france' → FR)", () => {
    const result = mapper.toEntity(product({ origins_tags: ['fr:france'] }));
    expect(result?.country).toBe('FR');
  });

  it("mappe 'en:european-union' sur EU", () => {
    const result = mapper.toEntity(product({ origins_tags: ['en:european-union'] }));
    expect(result?.country).toBe('EU');
  });

  it('ignore un tag inconnu et passe au candidat suivant', () => {
    const result = mapper.toEntity(
      product({ origins_tags: ['en:atlantic-ocean', 'en:spain'] }),
    );
    expect(result?.country).toBe('ES');
  });

  it('retourne null quand aucun tag ne correspond', () => {
    const result = mapper.toEntity(product({ origins_tags: ['en:narnia'] }));
    expect(result).toBeNull();
  });
});
