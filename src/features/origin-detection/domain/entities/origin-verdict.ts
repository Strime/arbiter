import type { BrandOrigin } from './brand-origin';
import type { ManufacturingOrigin } from './manufacturing-origin';
import type { OriginRegion } from './origin';

export interface OriginVerdict {
  readonly brand?: BrandOrigin;
  readonly manufacturing?: ManufacturingOrigin;
  readonly brandRegion: OriginRegion;
  readonly manufacturingRegion: OriginRegion;
  /**
   * Région du propriétaire ultime de la marque. Signal séparé : il ne
   * renverse jamais brandRegion (une marque FR à capitaux étrangers reste
   * affichée FR, l'actionnariat est montré à côté).
   */
  readonly ownershipRegion: OriginRegion;
}
