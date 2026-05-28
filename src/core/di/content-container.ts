import { MutationObserverHelper } from '../observer/mutation-observer-helper';
import { MessagingClient } from '../messaging/client';
import { buildAdapterRegistry } from '../../features/site-adapters/data/registry';
import { ResolveAdapterForUrl } from '../../features/site-adapters/domain/use-cases/resolve-adapter-for-url';
import { ShadowHostFactory } from '../../features/badge-injection/presentation/shadow-host';
import { RenderBadgeForCard } from '../../features/badge-injection/presentation/render-badge-for-card';
import { ChromePreferencesRepository } from '../../features/preferences/data/repositories/chrome-preferences-repository';
import { GetPreferences } from '../../features/preferences/domain/use-cases/get-preferences';
import type { PreferencesRepository } from '../../features/preferences/domain/repositories/preferences-repository';

export interface ContentContainer {
  readonly resolveAdapter: ResolveAdapterForUrl;
  readonly messagingClient: MessagingClient;
  readonly renderBadge: RenderBadgeForCard;
  readonly getPreferences: GetPreferences;
  readonly preferencesRepository: PreferencesRepository;
}

export function buildContentContainer(): ContentContainer {
  const observerHelper = new MutationObserverHelper();
  const adapters = buildAdapterRegistry(observerHelper);
  const shadowHostFactory = new ShadowHostFactory();
  const preferencesRepository = new ChromePreferencesRepository();

  return {
    resolveAdapter: new ResolveAdapterForUrl(adapters),
    messagingClient: new MessagingClient(),
    renderBadge: new RenderBadgeForCard(shadowHostFactory),
    getPreferences: new GetPreferences(preferencesRepository),
    preferencesRepository,
  };
}
