import type { OriginCountry } from '../../../domain/entities/origin';
import type { ManufacturingOrigin } from '../../../domain/entities/manufacturing-origin';

interface CountryPattern {
  readonly country: OriginCountry;
  readonly patterns: readonly RegExp[];
  readonly confidence: number;
}

const withOriginContext = (names: readonly string[]): readonly RegExp[] => [
  ...names.map((name) => new RegExp(`origine\\s*:?\\s*${name}\\b`)),
  ...names.map(
    (name) => new RegExp(`(?:fabrique|produit|elabore)\\s+(?:en|au|aux)\\s+${name}\\b`),
  ),
];

const PATTERNS: readonly CountryPattern[] = [
  {
    country: 'EU',
    confidence: 0.85,
    patterns: [
      /origine\s*:?\s*france\s+ou\s+(?:ue|union\s+europeenne)\b/,
      /origine\s*:?\s*(?:ue|union\s+europeenne)\b/,
      /(?:fabrique|produit|elabore)\s+en\s+(?:ue|union\s+europeenne)\b/,
      /(?:fabrique|produit|elabore)\s+dans\s+l'(?:ue|union\s+europeenne)\b/,
    ],
  },
  {
    country: 'FR',
    confidence: 0.9,
    patterns: [
      /origine\s*:?\s*france\b/,
      /(?:fabrique|produit|elabore)\s+en\s+france\b/,
      /\ba\.?o\.?c\b/,
      /label\s+rouge/,
      /viande\s+(?:de\s+|d')?\w+\s+francaise\b/,
      /🇫🇷/u,
    ],
  },
  { country: 'BE', confidence: 0.85, patterns: [...withOriginContext(['belgique']), /🇧🇪/u] },
  { country: 'DE', confidence: 0.85, patterns: [...withOriginContext(['allemagne']), /🇩🇪/u] },
  { country: 'IT', confidence: 0.85, patterns: [...withOriginContext(['italie']), /🇮🇹/u] },
  { country: 'ES', confidence: 0.85, patterns: [...withOriginContext(['espagne']), /🇪🇸/u] },
  { country: 'NL', confidence: 0.85, patterns: [...withOriginContext(['pays[-\\s]bas']), /🇳🇱/u] },
  { country: 'PT', confidence: 0.85, patterns: [...withOriginContext(['portugal']), /🇵🇹/u] },
  { country: 'PL', confidence: 0.85, patterns: withOriginContext(['pologne']) },
  { country: 'IE', confidence: 0.85, patterns: withOriginContext(['irlande']) },
  { country: 'GR', confidence: 0.85, patterns: withOriginContext(['grece']) },
  { country: 'MA', confidence: 0.85, patterns: withOriginContext(['maroc']) },
  {
    country: 'US',
    confidence: 0.9,
    patterns: [
      ...withOriginContext(['usa', 'etats[-\\s]unis']),
      /made\s+in\s+usa\b/,
      /🇺🇸/u,
    ],
  },
  {
    country: 'EU',
    confidence: 0.85,
    patterns: [/\b(?:a\.?o\.?p|i\.?g\.?p|s\.?t\.?g)\b/],
  },
];

const normalizeForMatching = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .toLowerCase();

export class TextOriginHeuristics {
  detect(text: string): ManufacturingOrigin | null {
    const normalized = normalizeForMatching(text);
    for (const candidate of PATTERNS) {
      if (candidate.patterns.some((re) => re.test(normalized))) {
        return {
          country: candidate.country,
          source: 'heuristic',
          confidence: candidate.confidence,
        };
      }
    }
    return null;
  }
}
