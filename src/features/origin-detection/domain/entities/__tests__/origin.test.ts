import { describe, expect, it } from 'vitest';
import { regionOf } from '../origin';

describe('regionOf', () => {
  it("mappe 'FR' sur FR", () => {
    expect(regionOf('FR')).toBe('FR');
  });

  it("mappe 'US' sur US", () => {
    expect(regionOf('US')).toBe('US');
  });

  it("mappe le signal générique 'EU' sur EU", () => {
    expect(regionOf('EU')).toBe('EU');
  });

  it("mappe les pays membres de l'UE sur EU", () => {
    expect(regionOf('DE')).toBe('EU');
    expect(regionOf('ES')).toBe('EU');
    expect(regionOf('IT')).toBe('EU');
    expect(regionOf('PL')).toBe('EU');
  });

  it('mappe les autres pays sur OTHER', () => {
    expect(regionOf('CN')).toBe('OTHER');
    expect(regionOf('GB')).toBe('OTHER'); // post-Brexit
    expect(regionOf('CH')).toBe('OTHER');
    expect(regionOf('MA')).toBe('OTHER');
  });

  it('mappe undefined sur UNKNOWN', () => {
    expect(regionOf(undefined)).toBe('UNKNOWN');
  });

  it('mappe la chaîne vide sur UNKNOWN', () => {
    expect(regionOf('')).toBe('UNKNOWN');
  });
});
