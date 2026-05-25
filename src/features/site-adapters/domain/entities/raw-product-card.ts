export interface RawProductCard {
  readonly id: string;
  readonly ean?: string;
  readonly brand: string;
  readonly title: string;
  readonly rawText?: string;
  readonly node: HTMLElement;
}
