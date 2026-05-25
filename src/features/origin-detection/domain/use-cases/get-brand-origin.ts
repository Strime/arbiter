import type { BrandOrigin } from '../entities/brand-origin';
import type { BrandOriginRepository } from '../repositories/brand-origin-repository';

export class GetBrandOrigin {
  constructor(private readonly repo: BrandOriginRepository) {}

  async call(brand: string): Promise<BrandOrigin | null> {
    return this.repo.findByBrandName(brand);
  }
}
