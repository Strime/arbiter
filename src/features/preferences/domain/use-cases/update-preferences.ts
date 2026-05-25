import type { UserPreferences } from '../entities/user-preferences';
import type { PreferencesRepository } from '../repositories/preferences-repository';

export class UpdatePreferences {
  constructor(private readonly repo: PreferencesRepository) {}

  async call(prefs: UserPreferences): Promise<void> {
    return this.repo.set(prefs);
  }
}
