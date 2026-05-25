export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface BadgeConfig {
  readonly position: BadgePosition;
  readonly size: 'small' | 'medium';
}

export const DEFAULT_BADGE_CONFIG: BadgeConfig = {
  position: 'top-right',
  size: 'small',
};
