import type { BadgeRenderRequest } from '../domain/entities/badge-render-request';
import type { ShadowHostFactory } from './shadow-host';
import { renderBadge } from './badge-element';

export class RenderBadgeForCard {
  constructor(private readonly shadowHostFactory: ShadowHostFactory) {}

  call(request: BadgeRenderRequest): void {
    if (request.verdict.brandRegion === 'UNKNOWN') {
      return;
    }
    const shadow = this.shadowHostFactory.ensureHost(request.card.node);
    renderBadge(shadow, request.verdict, {
      brand: request.card.brand,
      ean: request.card.ean,
    });
  }
}
