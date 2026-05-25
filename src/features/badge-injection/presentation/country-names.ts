import type { OriginSource } from '../../origin-detection/domain/entities/origin';

export const COUNTRY_NAME_FR: Record<string, string> = {
  FR: 'France',
  AT: 'Autriche',
  BE: 'Belgique',
  BG: 'Bulgarie',
  HR: 'Croatie',
  CY: 'Chypre',
  CZ: 'Tchéquie',
  DK: 'Danemark',
  EE: 'Estonie',
  FI: 'Finlande',
  DE: 'Allemagne',
  GR: 'Grèce',
  HU: 'Hongrie',
  IE: 'Irlande',
  IT: 'Italie',
  LV: 'Lettonie',
  LT: 'Lituanie',
  LU: 'Luxembourg',
  MT: 'Malte',
  NL: 'Pays-Bas',
  PL: 'Pologne',
  PT: 'Portugal',
  RO: 'Roumanie',
  SK: 'Slovaquie',
  SI: 'Slovénie',
  ES: 'Espagne',
  SE: 'Suède',
  US: 'États-Unis',
  GB: 'Royaume-Uni',
  CH: 'Suisse',
  NO: 'Norvège',
  CN: 'Chine',
  JP: 'Japon',
  IN: 'Inde',
  BR: 'Brésil',
  MX: 'Mexique',
  CA: 'Canada',
  AU: 'Australie',
  TR: 'Turquie',
  MA: 'Maroc',
};

export function countryNameFr(country: string | undefined): string {
  if (!country) return 'Inconnu';
  return COUNTRY_NAME_FR[country] ?? country;
}

export const SOURCE_LABEL_FR: Record<OriginSource, string> = {
  manual: 'Vérifié manuellement',
  wikidata: 'Wikidata',
  openfoodfacts: 'OpenFoodFacts',
  crowdsourced: 'Communauté',
  heuristic: 'Heuristique',
};
