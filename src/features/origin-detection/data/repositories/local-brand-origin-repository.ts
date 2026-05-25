import type { BrandOrigin } from '../../domain/entities/brand-origin';
import type { BrandOriginRepository } from '../../domain/repositories/brand-origin-repository';
import type { LocalBrandDbLoader } from '../datasources/local-brand-db/loader';
import { normalizeBrandKey } from '../datasources/local-brand-db/normalize';
import type { BrandEntryToBrandOriginMapper } from '../mappers/brand-entry-to-brand-origin';

export class LocalBrandOriginRepository implements BrandOriginRepository {
  constructor(
    private readonly loader: LocalBrandDbLoader,
    private readonly mapper: BrandEntryToBrandOriginMapper,
  ) {}

  async findByBrandName(brand: string): Promise<BrandOrigin | null> {
    const map = this.loader.load();
    const entry = map.get(normalizeBrandKey(brand));
    return entry ? this.mapper.toEntity(entry) : null;
  }
}
