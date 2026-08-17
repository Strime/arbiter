import type { OriginCountry, OriginSource } from './origin';

export interface BrandOrigin {
  readonly country: OriginCountry;
  readonly parentCompany?: string;
  /** Pays du groupe propriétaire ultime (ex. Salomon : country=FR, parentCountry=CN). */
  readonly parentCountry?: OriginCountry;
  readonly source: OriginSource;
  readonly confidence: number;
}
