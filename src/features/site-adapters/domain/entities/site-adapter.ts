import type { ProductCardEvent } from './product-card-event';

export type ProductCardListener = (event: ProductCardEvent) => void;

export interface SiteAdapter {
  readonly id: string;
  matches(url: string): boolean;
  observe(root: Document, listener: ProductCardListener): () => void;
}
