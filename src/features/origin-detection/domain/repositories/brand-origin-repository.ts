import type { BrandOrigin } from '../entities/brand-origin';

export interface BrandOriginRepository {
  findByBrandName(brand: string): Promise<BrandOrigin | null>;
}
