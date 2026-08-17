import { describe, expect, it } from 'vitest';
import {
  OriginVerdictPayloadSchema,
  RequestOriginPayloadSchema,
} from '../protocol';

const validVerdict = {
  brand: { country: 'FR', source: 'manual', confidence: 0.9 },
  manufacturing: { country: 'EU', source: 'heuristic', confidence: 0.85 },
  brandRegion: 'FR',
  manufacturingRegion: 'EU',
  ownershipRegion: 'UNKNOWN',
};

describe('OriginVerdictPayloadSchema', () => {
  it("accepte un verdict avec country 'FR' et 'EU'", () => {
    const result = OriginVerdictPayloadSchema.safeParse(validVerdict);
    expect(result.success).toBe(true);
  });

  it('accepte un verdict sans brand ni manufacturing (optionnels)', () => {
    const result = OriginVerdictPayloadSchema.safeParse({
      brandRegion: 'UNKNOWN',
      manufacturingRegion: 'UNKNOWN',
      ownershipRegion: 'UNKNOWN',
    });
    expect(result.success).toBe(true);
  });

  it('accepte un brand avec parentCountry ISO-2', () => {
    const result = OriginVerdictPayloadSchema.safeParse({
      ...validVerdict,
      brand: { ...validVerdict.brand, parentCompany: 'Anta Sports', parentCountry: 'CN' },
      ownershipRegion: 'OTHER',
    });
    expect(result.success).toBe(true);
  });

  it("rejette un parentCountry hors format ISO-2 ('Chine')", () => {
    const result = OriginVerdictPayloadSchema.safeParse({
      ...validVerdict,
      brand: { ...validVerdict.brand, parentCountry: 'Chine' },
    });
    expect(result.success).toBe(false);
  });

  it("rejette country 'France' (nom complet)", () => {
    const result = OriginVerdictPayloadSchema.safeParse({
      ...validVerdict,
      brand: { ...validVerdict.brand, country: 'France' },
    });
    expect(result.success).toBe(false);
  });

  it("rejette country 'fr' (minuscules)", () => {
    const result = OriginVerdictPayloadSchema.safeParse({
      ...validVerdict,
      brand: { ...validVerdict.brand, country: 'fr' },
    });
    expect(result.success).toBe(false);
  });

  it("rejette country '' (vide)", () => {
    const result = OriginVerdictPayloadSchema.safeParse({
      ...validVerdict,
      manufacturing: { ...validVerdict.manufacturing, country: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejette une région hors énumération', () => {
    const result = OriginVerdictPayloadSchema.safeParse({
      ...validVerdict,
      brandRegion: 'FRANCE',
    });
    expect(result.success).toBe(false);
  });
});

describe('RequestOriginPayloadSchema', () => {
  it('accepte une requête sans brandGuessed (optionnel)', () => {
    const result = RequestOriginPayloadSchema.safeParse({
      brand: 'Danone',
      title: 'Yaourt nature',
    });
    expect(result.success).toBe(true);
  });

  it('accepte une requête avec brandGuessed booléen', () => {
    const result = RequestOriginPayloadSchema.safeParse({
      brand: 'Danone',
      title: 'Yaourt nature',
      brandGuessed: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejette un brandGuessed non booléen', () => {
    const result = RequestOriginPayloadSchema.safeParse({
      brand: 'Danone',
      title: 'Yaourt nature',
      brandGuessed: 'oui',
    });
    expect(result.success).toBe(false);
  });
});
