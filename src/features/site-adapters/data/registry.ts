import type { SiteAdapter } from '../domain/entities/site-adapter';
import { CarrefourAdapter } from './carrefour/carrefour-adapter';
import { AuchanAdapter } from './auchan/auchan-adapter';
import { LidlAdapter } from './lidl/lidl-adapter';
import { IntermarcheAdapter } from './intermarche/intermarche-adapter';
import { LeclercAdapter } from './leclerc/leclerc-adapter';
import type { MutationObserverHelper } from '../../../core/observer/mutation-observer-helper';

export function buildAdapterRegistry(
  observerHelper: MutationObserverHelper,
): readonly SiteAdapter[] {
  return [
    new CarrefourAdapter(observerHelper),
    new AuchanAdapter(observerHelper),
    new LidlAdapter(observerHelper),
    new IntermarcheAdapter(observerHelper),
    new LeclercAdapter(observerHelper),
  ];
}
