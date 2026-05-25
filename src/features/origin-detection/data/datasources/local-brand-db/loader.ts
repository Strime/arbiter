import { BrandsFileSchema } from './schemas';
import type { BrandEntryModel } from '../../models/brand-entry-model';
import brandsJson from './brands.json';

export class LocalBrandDbLoader {
  private cache: Map<string, BrandEntryModel> | null = null;

  load(): Map<string, BrandEntryModel> {
    if (this.cache) return this.cache;
    const parsed = BrandsFileSchema.parse(brandsJson);
    const map = new Map<string, BrandEntryModel>();
    for (const entry of parsed.brands) {
      map.set(entry.name.toLowerCase(), entry);
    }
    this.cache = map;
    return map;
  }
}
