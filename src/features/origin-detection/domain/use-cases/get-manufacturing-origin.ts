import type { ManufacturingOrigin } from '../entities/manufacturing-origin';
import type { Product } from '../entities/product';
import type { ManufacturingOriginRepository } from '../repositories/manufacturing-origin-repository';

export class GetManufacturingOrigin {
  constructor(private readonly repo: ManufacturingOriginRepository) {}

  async call(product: Product): Promise<ManufacturingOrigin | null> {
    return this.repo.findForProduct(product);
  }
}
