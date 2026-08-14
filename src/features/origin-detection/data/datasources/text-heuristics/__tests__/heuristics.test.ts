import { describe, expect, it } from 'vitest';
import { TextOriginHeuristics } from '../heuristics';

describe('TextOriginHeuristics', () => {
  const heuristics = new TextOriginHeuristics();

  it('détecte « Origine : France » comme FR', () => {
    const result = heuristics.detect('Origine : France');
    expect(result).not.toBeNull();
    expect(result?.country).toBe('FR');
    expect(result?.source).toBe('heuristic');
  });

  it('détecte « FABRIQUE EN FRANCE » (majuscules, sans accent) comme FR', () => {
    const result = heuristics.detect('FABRIQUE EN FRANCE');
    expect(result?.country).toBe('FR');
  });

  it('détecte « FABRIQUÉ EN FRANCE » (majuscules accentuées) comme FR', () => {
    const result = heuristics.detect('FABRIQUÉ EN FRANCE');
    expect(result?.country).toBe('FR');
  });

  it('classe « feta AOP » comme EU (label européen), pas FR', () => {
    const result = heuristics.detect('feta AOP');
    expect(result?.country).toBe('EU');
  });

  it('classe « AOC » comme FR (label français)', () => {
    const result = heuristics.detect('Vin AOC Côtes du Rhône');
    expect(result?.country).toBe('FR');
  });

  it('classe « Origine : France ou UE » comme EU, pas FR', () => {
    const result = heuristics.detect('Origine : France ou UE');
    expect(result?.country).toBe('EU');
  });

  it('détecte « Origine : Espagne » comme ES', () => {
    const result = heuristics.detect('Origine : Espagne');
    expect(result?.country).toBe('ES');
  });

  it('ignore un nom de pays isolé sans contexte d’origine', () => {
    expect(heuristics.detect('France')).toBeNull();
    expect(heuristics.detect('Espagne')).toBeNull();
    expect(heuristics.detect('Salade France 200g')).toBeNull();
  });

  it('retourne null pour un texte vide', () => {
    expect(heuristics.detect('')).toBeNull();
  });
});
