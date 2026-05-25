import type { RawProductCard } from './raw-product-card';

export type ProductCardEventType = 'added' | 'updated' | 'removed';

export interface ProductCardEvent {
  readonly type: ProductCardEventType;
  readonly card: RawProductCard;
}
