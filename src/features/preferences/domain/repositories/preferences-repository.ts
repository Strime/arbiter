import type { UserPreferences } from '../entities/user-preferences';

export interface PreferencesRepository {
  get(): Promise<UserPreferences>;
  set(prefs: UserPreferences): Promise<void>;
  watch(listener: (prefs: UserPreferences) => void): () => void;
}
