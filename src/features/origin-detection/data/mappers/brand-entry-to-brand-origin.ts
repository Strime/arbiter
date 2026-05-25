import type { BrandEntryModel } from '../models/brand-entry-model';
import type { BrandOrigin } from '../../domain/entities/brand-origin';
import type { OriginSource } from '../../domain/entities/origin';

export class BrandEntryToBrandOriginMapper {
  toEntity(entry: BrandEntryModel): BrandOrigin {
    return {
      country: entry.country,
      parentCompany: entry.parentCompany,
      source: entry.source satisfies OriginSource,
      confidence: entry.confidence,
    };
  }
}
