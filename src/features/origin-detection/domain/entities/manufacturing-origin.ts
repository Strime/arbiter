import type { OriginCountry, OriginSource } from './origin';

export interface ManufacturingOrigin {
  readonly country: OriginCountry;
  readonly source: OriginSource;
  readonly confidence: number;
}
