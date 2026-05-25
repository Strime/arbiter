import type { RawProductCard } from '../../../site-adapters/domain/entities/raw-product-card';
import type { OriginVerdict } from '../../../origin-detection/domain/entities/origin-verdict';

export interface BadgeRenderRequest {
  readonly card: RawProductCard;
  readonly verdict: OriginVerdict;
}
