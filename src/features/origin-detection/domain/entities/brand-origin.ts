import type { OriginCountry, OriginSource } from './origin';

export interface BrandOrigin {
  readonly country: OriginCountry;
  readonly parentCompany?: string;
  readonly source: OriginSource;
  readonly confidence: number;
}
