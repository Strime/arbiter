import type { Product } from '../entities/product';
import type { OriginVerdict } from '../entities/origin-verdict';
import { regionOf } from '../entities/origin';
import type { BrandOriginRepository } from '../repositories/brand-origin-repository';
import type { ManufacturingOriginRepository } from '../repositories/manufacturing-origin-repository';

export class DetermineOriginVerdict {
  constructor(
    private readonly brandRepo: BrandOriginRepository,
    private readonly manufacturingRepo: ManufacturingOriginRepository,
  ) {}

  async call(product: Product): Promise<OriginVerdict> {
    const [brand, manufacturing] = await Promise.all([
      this.brandRepo.findByBrandName(product.brand),
      this.manufacturingRepo.findForProduct(product),
    ]);
    return {
      brand: brand ?? undefined,
      manufacturing: manufacturing ?? undefined,
      brandRegion: regionOf(brand?.country),
      manufacturingRegion: regionOf(manufacturing?.country),
    };
  }
}
