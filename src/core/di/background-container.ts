import { DetermineOriginVerdict } from '../../features/origin-detection/domain/use-cases/determine-origin-verdict';
import { LocalBrandDbLoader } from '../../features/origin-detection/data/datasources/local-brand-db/loader';
import { BrandEntryToBrandOriginMapper } from '../../features/origin-detection/data/mappers/brand-entry-to-brand-origin';
import { LocalBrandOriginRepository } from '../../features/origin-detection/data/repositories/local-brand-origin-repository';
import { TextOriginHeuristics } from '../../features/origin-detection/data/datasources/text-heuristics/heuristics';
import { OffClient } from '../../features/origin-detection/data/datasources/openfoodfacts/off-client';
import { OffCache } from '../../features/origin-detection/data/datasources/openfoodfacts/off-cache';
import { OffToManufacturingOriginMapper } from '../../features/origin-detection/data/mappers/off-to-manufacturing-origin';
import { CompositeManufacturingOriginRepository } from '../../features/origin-detection/data/repositories/composite-manufacturing-origin-repository';

export interface BackgroundContainer {
  readonly determineOriginVerdict: DetermineOriginVerdict;
  readonly offCache: OffCache;
}

export function buildBackgroundContainer(): BackgroundContainer {
  const brandLoader = new LocalBrandDbLoader();
  const brandMapper = new BrandEntryToBrandOriginMapper();
  const brandRepo = new LocalBrandOriginRepository(brandLoader, brandMapper);

  const heuristics = new TextOriginHeuristics();
  const offClient = new OffClient();
  const offCache = new OffCache();
  const offMapper = new OffToManufacturingOriginMapper();
  const manufacturingRepo = new CompositeManufacturingOriginRepository(
    heuristics,
    offClient,
    offCache,
    offMapper,
  );

  return {
    determineOriginVerdict: new DetermineOriginVerdict(brandRepo, manufacturingRepo),
    offCache,
  };
}
