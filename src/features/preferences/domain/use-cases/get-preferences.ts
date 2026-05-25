import type { UserPreferences } from '../entities/user-preferences';
import type { PreferencesRepository } from '../repositories/preferences-repository';

export class GetPreferences {
  constructor(private readonly repo: PreferencesRepository) {}

  async call(): Promise<UserPreferences> {
    return this.repo.get();
  }
}
