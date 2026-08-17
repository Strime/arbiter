import { z } from 'zod';
import type { UserPreferences } from '../../domain/entities/user-preferences';
import { DEFAULT_PREFERENCES } from '../../domain/entities/user-preferences';
import type { PreferencesRepository } from '../../domain/repositories/preferences-repository';

const STORAGE_KEY = 'coquade.preferences.v1';

const PreferencesSchema = z.object({
  enabled: z.boolean(),
  blockedSites: z.array(z.string()),
});

export class ChromePreferencesRepository implements PreferencesRepository {
  async get(): Promise<UserPreferences> {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    const raw = stored[STORAGE_KEY];
    if (raw === undefined) return DEFAULT_PREFERENCES;
    const parsed = PreferencesSchema.safeParse(raw);
    if (!parsed.success) return DEFAULT_PREFERENCES;
    return parsed.data;
  }

  async set(prefs: UserPreferences): Promise<void> {
    PreferencesSchema.parse(prefs);
    await browser.storage.local.set({ [STORAGE_KEY]: prefs });
  }

  watch(listener: (prefs: UserPreferences) => void): () => void {
    const handler = (changes: Record<string, { newValue?: unknown }>, area: string): void => {
      if (area !== 'local' || !(STORAGE_KEY in changes)) return;
      const next = changes[STORAGE_KEY]?.newValue;
      const parsed = PreferencesSchema.safeParse(next);
      listener(parsed.success ? parsed.data : DEFAULT_PREFERENCES);
    };
    browser.storage.onChanged.addListener(handler);
    return () => browser.storage.onChanged.removeListener(handler);
  }
}
