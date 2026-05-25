import type { BrandOrigin } from './brand-origin';
import type { ManufacturingOrigin } from './manufacturing-origin';
import type { OriginRegion } from './origin';

export interface OriginVerdict {
  readonly brand?: BrandOrigin;
  readonly manufacturing?: ManufacturingOrigin;
  readonly brandRegion: OriginRegion;
  readonly manufacturingRegion: OriginRegion;
}
