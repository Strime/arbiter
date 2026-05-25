export interface UserPreferences {
  readonly enabled: boolean;
  readonly blockedSites: readonly string[];
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  enabled: true,
  blockedSites: [],
};
