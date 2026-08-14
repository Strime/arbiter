import { describe, expect, it } from 'vitest';
import { normalizeBrandKey } from '../normalize';

describe('normalizeBrandKey', () => {
  it('normalise la casse', () => {
    expect(normalizeBrandKey('DANONE')).toBe('danone');
    expect(normalizeBrandKey('Danone')).toBe('danone');
  });

  it('supprime les accents', () => {
    expect(normalizeBrandKey('Bébé')).toBe('bebe');
    expect(normalizeBrandKey('Pâturages')).toBe('paturages');
    expect(normalizeBrandKey('Häagen-Dazs')).toBe('haagendazs');
  });

  it('supprime espaces et caractères non alphanumériques', () => {
    expect(normalizeBrandKey('La Vache Qui Rit')).toBe('lavachequirit');
    expect(normalizeBrandKey('  Head & Shoulders  ')).toBe('headshoulders');
    expect(normalizeBrandKey("Nestlé's")).toBe('nestles');
  });

  it('conserve les chiffres', () => {
    expect(normalizeBrandKey('1664')).toBe('1664');
  });

  it('produit la même clé pour des variantes de la même marque', () => {
    expect(normalizeBrandKey('CARREFOUR BIO')).toBe(normalizeBrandKey('carrefour-bio'));
  });
});
