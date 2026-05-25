import { ChromePreferencesRepository } from '../../features/preferences/data/repositories/chrome-preferences-repository';
import { GetPreferences } from '../../features/preferences/domain/use-cases/get-preferences';
import { UpdatePreferences } from '../../features/preferences/domain/use-cases/update-preferences';
import type { PreferencesRepository } from '../../features/preferences/domain/repositories/preferences-repository';

export interface PopupContainer {
  readonly getPreferences: GetPreferences;
  readonly updatePreferences: UpdatePreferences;
  readonly preferencesRepository: PreferencesRepository;
}

export function buildPopupContainer(): PopupContainer {
  const repo = new ChromePreferencesRepository();
  return {
    getPreferences: new GetPreferences(repo),
    updatePreferences: new UpdatePreferences(repo),
    preferencesRepository: repo,
  };
}
