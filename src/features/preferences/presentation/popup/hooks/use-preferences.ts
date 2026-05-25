import { useEffect, useState } from 'react';
import type { UserPreferences } from '../../../domain/entities/user-preferences';
import { DEFAULT_PREFERENCES } from '../../../domain/entities/user-preferences';
import type { GetPreferences } from '../../../domain/use-cases/get-preferences';
import type { UpdatePreferences } from '../../../domain/use-cases/update-preferences';
import type { PreferencesRepository } from '../../../domain/repositories/preferences-repository';

interface UsePreferencesOptions {
  readonly getPreferences: GetPreferences;
  readonly updatePreferences: UpdatePreferences;
  readonly repository: PreferencesRepository;
}

interface UsePreferencesResult {
  readonly preferences: UserPreferences;
  readonly loading: boolean;
  readonly setEnabled: (enabled: boolean) => Promise<void>;
}

export function usePreferences(options: UsePreferencesOptions): UsePreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    options.getPreferences.call().then((prefs) => {
      if (!cancelled) {
        setPreferences(prefs);
        setLoading(false);
      }
    });
    const unsubscribe = options.repository.watch((next) => {
      if (!cancelled) setPreferences(next);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [options.getPreferences, options.repository]);

  const setEnabled = async (enabled: boolean): Promise<void> => {
    const next: UserPreferences = { ...preferences, enabled };
    setPreferences(next);
    await options.updatePreferences.call(next);
  };

  return { preferences, loading, setEnabled };
}
