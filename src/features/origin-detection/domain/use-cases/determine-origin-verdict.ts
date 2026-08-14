import type { Product } from '../entities/product';
import type { BrandOrigin } from '../entities/brand-origin';
import type { ManufacturingOrigin } from '../entities/manufacturing-origin';
import type { OriginVerdict } from '../entities/origin-verdict';
import { regionOf } from '../entities/origin';
import type { BrandOriginRepository } from '../repositories/brand-origin-repository';
import type { ManufacturingOriginRepository } from '../repositories/manufacturing-origin-repository';

const GUESSED_BRAND_CONFIDENCE_FACTOR = 0.7;

export interface DetermineOriginVerdictInput extends Product {
  readonly brandGuessed?: boolean;
}

export class DetermineOriginVerdict {
  constructor(
    private readonly brandRepo: BrandOriginRepository,
    private readonly manufacturingRepo: ManufacturingOriginRepository,
  ) {}

  async call(product: DetermineOriginVerdictInput): Promise<OriginVerdict> {
    const brand = await this.resolveBrand(product);
    const brandRegion = regionOf(brand?.country);
    const manufacturing =
      brandRegion === 'UNKNOWN' ? null : await this.resolveManufacturing(product);
    return {
      brand: brand ?? undefined,
      manufacturing: manufacturing ?? undefined,
      brandRegion,
      manufacturingRegion: regionOf(manufacturing?.country),
    };
  }

  private async resolveBrand(product: DetermineOriginVerdictInput): Promise<BrandOrigin | null> {
    try {
      const brand = await this.brandRepo.findByBrandName(product.brand);
      if (!brand || !product.brandGuessed) return brand;
      const confidence = Math.min(
        1,
        Math.max(0, brand.confidence * GUESSED_BRAND_CONFIDENCE_FACTOR),
      );
      return { ...brand, confidence };
    } catch {
      return null;
    }
  }

  private async resolveManufacturing(product: Product): Promise<ManufacturingOrigin | null> {
    try {
      return await this.manufacturingRepo.findForProduct(product);
    } catch {
      return null;
    }
  }
}
