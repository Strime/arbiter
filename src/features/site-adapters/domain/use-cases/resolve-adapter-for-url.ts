import type { SiteAdapter } from '../entities/site-adapter';

export class ResolveAdapterForUrl {
  constructor(private readonly adapters: readonly SiteAdapter[]) {}

  call(url: string): SiteAdapter | null {
    return this.adapters.find((adapter) => adapter.matches(url)) ?? null;
  }
}
