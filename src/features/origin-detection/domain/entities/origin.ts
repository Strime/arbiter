export type OriginCountry = string;

export type OriginRegion = 'FR' | 'EU' | 'US' | 'OTHER' | 'UNKNOWN';

export type OriginSource =
  | 'manual'
  | 'wikidata'
  | 'openfoodfacts'
  | 'crowdsourced'
  | 'heuristic';

export const EU_COUNTRIES: readonly OriginCountry[] = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
];

export function regionOf(country: OriginCountry | undefined): OriginRegion {
  if (!country) return 'UNKNOWN';
  if (country === 'FR') return 'FR';
  if (country === 'US') return 'US';
  // 'EU' : signal « Union européenne » sans pays précis (labels AOP/IGP, tag OFF en:european-union)
  if (country === 'EU') return 'EU';
  if ((EU_COUNTRIES as readonly string[]).includes(country)) return 'EU';
  return 'OTHER';
}
