import { OffResponseSchema } from './off-schemas';
import type { OffProductModel } from '../../models/off-product-model';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';

export class OffClient {
  async fetchByEan(ean: string): Promise<OffProductModel | null> {
    const url = `${OFF_BASE}/${encodeURIComponent(ean)}.json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const json: unknown = await response.json();
    const parsed = OffResponseSchema.safeParse(json);
    if (!parsed.success || parsed.data.status !== 1 || !parsed.data.product) {
      return null;
    }
    return parsed.data.product;
  }
}
