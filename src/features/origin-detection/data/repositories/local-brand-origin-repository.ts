import type { BrandOrigin } from '../../domain/entities/brand-origin';
import type { BrandOriginRepository } from '../../domain/repositories/brand-origin-repository';
import type { BrandDbProvider } from '../datasources/local-brand-db/brand-db-provider';
import { normalizeBrandKey } from '../datasources/local-brand-db/normalize';
import type { BrandEntryToBrandOriginMapper } from '../mappers/brand-entry-to-brand-origin';

export class LocalBrandOriginRepository implements BrandOriginRepository {
  constructor(
    private readonly provider: BrandDbProvider,
    private readonly mapper: BrandEntryToBrandOriginMapper,
  ) {}

  async findByBrandName(brand: string): Promise<BrandOrigin | null> {
    const map = await this.provider.load();
    const entry = map.get(normalizeBrandKey(brand));
    return entry ? this.mapper.toEntity(entry) : null;
  }
}
