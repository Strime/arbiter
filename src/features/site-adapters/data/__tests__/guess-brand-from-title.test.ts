import { describe, expect, it } from 'vitest';
import { guessBrandFromTitle } from '../guess-brand-from-title';

describe('guessBrandFromTitle', () => {
  it('refuse un premier mot de moins de 3 caractères', () => {
    expect(guessBrandFromTitle('Ab produit laitier')).toBeNull();
    expect(guessBrandFromTitle('Le lait entier')).toBeNull(); // < 3 chars ET article
  });

  it('refuse les articles français en tête de titre (insensible à la casse)', () => {
    expect(guessBrandFromTitle('Les petits plats du chef')).toBeNull();
    expect(guessBrandFromTitle('Une salade composée')).toBeNull();
    expect(guessBrandFromTitle('DES fruits rouges surgelés')).toBeNull();
  });

  it('accepte le cas nominal : marque en tête de titre', () => {
    expect(guessBrandFromTitle('Danone yaourt nature x8')).toBe('Danone');
    expect(guessBrandFromTitle('Bonduelle maïs doux 300g')).toBe('Bonduelle');
  });

  it('refuse un titre vide', () => {
    expect(guessBrandFromTitle('')).toBeNull();
  });
});
