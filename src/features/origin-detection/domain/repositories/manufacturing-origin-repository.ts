import type { ManufacturingOrigin } from '../entities/manufacturing-origin';
import type { Product } from '../entities/product';

export interface ManufacturingOriginRepository {
  findForProduct(product: Product): Promise<ManufacturingOrigin | null>;
}
