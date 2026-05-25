import { MutationObserverHelper } from '../observer/mutation-observer-helper';
import { MessagingClient } from '../messaging/client';
import { buildAdapterRegistry } from '../../features/site-adapters/data/registry';
import { ResolveAdapterForUrl } from '../../features/site-adapters/domain/use-cases/resolve-adapter-for-url';
import { ShadowHostFactory } from '../../features/badge-injection/presentation/shadow-host';
import { RenderBadgeForCard } from '../../features/badge-injection/presentation/render-badge-for-card';

export interface ContentContainer {
  readonly resolveAdapter: ResolveAdapterForUrl;
  readonly messagingClient: MessagingClient;
  readonly renderBadge: RenderBadgeForCard;
}

export function buildContentContainer(): ContentContainer {
  const observerHelper = new MutationObserverHelper();
  const adapters = buildAdapterRegistry(observerHelper);
  const shadowHostFactory = new ShadowHostFactory();

  return {
    resolveAdapter: new ResolveAdapterForUrl(adapters),
    messagingClient: new MessagingClient(),
    renderBadge: new RenderBadgeForCard(shadowHostFactory),
  };
}
