import { describe, expect, it, vi } from 'vitest';
import { DetermineOriginVerdict } from '../determine-origin-verdict';
import type { BrandOrigin } from '../../entities/brand-origin';
import type { ManufacturingOrigin } from '../../entities/manufacturing-origin';
import type { BrandOriginRepository } from '../../repositories/brand-origin-repository';
import type { ManufacturingOriginRepository } from '../../repositories/manufacturing-origin-repository';

const FR_BRAND: BrandOrigin = { country: 'FR', source: 'manual', confidence: 0.9 };
const FR_BRAND_CN_OWNED: BrandOrigin = {
  country: 'FR',
  parentCompany: 'Anta Sports',
  parentCountry: 'CN',
  source: 'manual',
  confidence: 0.9,
};
const ES_MANUFACTURING: ManufacturingOrigin = {
  country: 'ES',
  source: 'openfoodfacts',
  confidence: 0.75,
};

const brandRepoReturning = (value: BrandOrigin | null): BrandOriginRepository => ({
  findByBrandName: vi.fn().mockResolvedValue(value),
});

const manufacturingRepoReturning = (
  value: ManufacturingOrigin | null,
): ManufacturingOriginRepository => ({
  findForProduct: vi.fn().mockResolvedValue(value),
});

const PRODUCT = { brand: 'Bonne Maman', title: 'Confiture de fraises' };

describe('DetermineOriginVerdict', () => {
  it('compose le verdict complet marque + fabrication', async () => {
    const useCase = new DetermineOriginVerdict(
      brandRepoReturning(FR_BRAND),
      manufacturingRepoReturning(ES_MANUFACTURING),
    );

    const verdict = await useCase.call(PRODUCT);

    expect(verdict.brand).toEqual(FR_BRAND);
    expect(verdict.brandRegion).toBe('FR');
    expect(verdict.manufacturing).toEqual(ES_MANUFACTURING);
    expect(verdict.manufacturingRegion).toBe('EU');
    expect(verdict.ownershipRegion).toBe('UNKNOWN');
  });

  it('calcule ownershipRegion depuis parentCountry sans renverser brandRegion', async () => {
    const useCase = new DetermineOriginVerdict(
      brandRepoReturning(FR_BRAND_CN_OWNED),
      manufacturingRepoReturning(null),
    );

    const verdict = await useCase.call(PRODUCT);

    // Cas Salomon : marque FR, propriétaire ultime CN — les deux signaux coexistent.
    expect(verdict.brandRegion).toBe('FR');
    expect(verdict.ownershipRegion).toBe('OTHER');
    expect(verdict.brand?.parentCountry).toBe('CN');
  });

  it('laisse ownershipRegion à UNKNOWN quand parentCountry est absent', async () => {
    const useCase = new DetermineOriginVerdict(
      brandRepoReturning(FR_BRAND),
      manufacturingRepoReturning(null),
    );

    const verdict = await useCase.call(PRODUCT);

    expect(verdict.ownershipRegion).toBe('UNKNOWN');
  });

  it('multiplie la confiance marque par 0.7 quand brandGuessed=true', async () => {
    const useCase = new DetermineOriginVerdict(
      brandRepoReturning(FR_BRAND),
      manufacturingRepoReturning(null),
    );

    const verdict = await useCase.call({ ...PRODUCT, brandGuessed: true });

    expect(verdict.brand?.confidence).toBeCloseTo(0.9 * 0.7, 10);
    expect(verdict.brand?.country).toBe('FR');
  });

  it('laisse la confiance intacte quand brandGuessed est absent', async () => {
    const useCase = new DetermineOriginVerdict(
      brandRepoReturning(FR_BRAND),
      manufacturingRepoReturning(null),
    );

    const verdict = await useCase.call(PRODUCT);

    expect(verdict.brand?.confidence).toBe(0.9);
  });

  it("n'appelle PAS le repo manufacturing quand la marque est UNKNOWN", async () => {
    const manufacturingRepo = manufacturingRepoReturning(ES_MANUFACTURING);
    const useCase = new DetermineOriginVerdict(brandRepoReturning(null), manufacturingRepo);

    const verdict = await useCase.call(PRODUCT);

    expect(manufacturingRepo.findForProduct).not.toHaveBeenCalled();
    expect(verdict.brand).toBeUndefined();
    expect(verdict.brandRegion).toBe('UNKNOWN');
    expect(verdict.manufacturing).toBeUndefined();
    expect(verdict.manufacturingRegion).toBe('UNKNOWN');
  });

  it('conserve le verdict marque quand le repo manufacturing rejette', async () => {
    const manufacturingRepo: ManufacturingOriginRepository = {
      findForProduct: vi.fn().mockRejectedValue(new Error('OFF indisponible')),
    };
    const useCase = new DetermineOriginVerdict(brandRepoReturning(FR_BRAND), manufacturingRepo);

    const verdict = await useCase.call(PRODUCT);

    expect(verdict.brand).toEqual(FR_BRAND);
    expect(verdict.brandRegion).toBe('FR');
    expect(verdict.manufacturing).toBeUndefined();
    expect(verdict.manufacturingRegion).toBe('UNKNOWN');
  });

  it('retourne un verdict UNKNOWN sans throw quand le repo marque rejette', async () => {
    const brandRepo: BrandOriginRepository = {
      findByBrandName: vi.fn().mockRejectedValue(new Error('DB corrompue')),
    };
    const manufacturingRepo = manufacturingRepoReturning(ES_MANUFACTURING);
    const useCase = new DetermineOriginVerdict(brandRepo, manufacturingRepo);

    const verdict = await useCase.call(PRODUCT);

    expect(verdict.brandRegion).toBe('UNKNOWN');
    expect(verdict.brand).toBeUndefined();
    // Marque inconnue -> pas de requête manufacturing non plus.
    expect(manufacturingRepo.findForProduct).not.toHaveBeenCalled();
  });
});
