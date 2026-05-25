import type { BrandOrigin } from '../../domain/entities/brand-origin';
import type { BrandOriginRepository } from '../../domain/repositories/brand-origin-repository';
import type { LocalBrandDbLoader } from '../datasources/local-brand-db/loader';
import type { BrandEntryToBrandOriginMapper } from '../mappers/brand-entry-to-brand-origin';

export class LocalBrandOriginRepository implements BrandOriginRepository {
  constructor(
    private readonly loader: LocalBrandDbLoader,
    private readonly mapper: BrandEntryToBrandOriginMapper,
  ) {}

  async findByBrandName(brand: string): Promise<BrandOrigin | null> {
    const map = this.loader.load();
    const key = brand.toLowerCase().trim();
    const entry = map.get(key);
    return entry ? this.mapper.toEntity(entry) : null;
  }
}
