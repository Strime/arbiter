import type { Product } from '../../domain/entities/product';
import type { ManufacturingOrigin } from '../../domain/entities/manufacturing-origin';
import type { ManufacturingOriginRepository } from '../../domain/repositories/manufacturing-origin-repository';
import type { TextOriginHeuristics } from '../datasources/text-heuristics/heuristics';
import type { OffClient } from '../datasources/openfoodfacts/off-client';
import type { OffCache } from '../datasources/openfoodfacts/off-cache';
import type { OffToManufacturingOriginMapper } from '../mappers/off-to-manufacturing-origin';

export class CompositeManufacturingOriginRepository implements ManufacturingOriginRepository {
  private readonly inflight = new Map<string, Promise<ManufacturingOrigin | null>>();

  constructor(
    private readonly heuristics: TextOriginHeuristics,
    private readonly offClient: OffClient,
    private readonly offCache: OffCache,
    private readonly offMapper: OffToManufacturingOriginMapper,
  ) {}

  async findForProduct(product: Product): Promise<ManufacturingOrigin | null> {
    try {
      const text = `${product.title} ${product.rawText ?? ''}`;
      const heuristic = this.heuristics.detect(text);
      if (heuristic) return heuristic;
      if (!product.ean) return null;
      return await this.fetchOff(product.ean);
    } catch {
      return null;
    }
  }

  private async fetchOff(ean: string): Promise<ManufacturingOrigin | null> {
    const existing = this.inflight.get(ean);
    if (existing) return existing;
    const promise = this.fetchOffUncached(ean);
    this.inflight.set(ean, promise);
    try {
      return await promise;
    } finally {
      this.inflight.delete(ean);
    }
  }

  private async fetchOffUncached(ean: string): Promise<ManufacturingOrigin | null> {
    const cached = await this.offCache.get(ean);
    if (cached.hit) {
      return cached.value ? this.offMapper.toEntity(cached.value) : null;
    }
    const result = await this.offClient.fetchByEan(ean);
    await this.offCache.set(ean, result);
    return result.outcome === 'found' ? this.offMapper.toEntity(result.product) : null;
  }
}
