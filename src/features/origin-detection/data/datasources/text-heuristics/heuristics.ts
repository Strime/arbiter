import type { OriginCountry } from '../../../domain/entities/origin';
import type { ManufacturingOrigin } from '../../../domain/entities/manufacturing-origin';

interface CountryPattern {
  readonly country: OriginCountry;
  readonly patterns: readonly RegExp[];
  readonly confidence: number;
}

const PATTERNS: readonly CountryPattern[] = [
  {
    country: 'FR',
    confidence: 0.9,
    patterns: [
      /origine\s*:?\s*france/i,
      /fabriqué\s+en\s+france/i,
      /produit\s+en\s+france/i,
      /\b(A\.?O\.?P|A\.?O\.?C|I\.?G\.?P|S\.?T\.?G)\b/,
      /label\s+rouge/i,
      /🇫🇷/u,
    ],
  },
  { country: 'BE', confidence: 0.85, patterns: [/origine\s*:?\s*belgique/i, /fabriqué\s+en\s+belgique/i, /🇧🇪/u] },
  { country: 'DE', confidence: 0.85, patterns: [/origine\s*:?\s*allemagne/i, /fabriqué\s+en\s+allemagne/i, /🇩🇪/u] },
  { country: 'IT', confidence: 0.85, patterns: [/origine\s*:?\s*italie/i, /fabriqué\s+en\s+italie/i, /🇮🇹/u] },
  { country: 'ES', confidence: 0.85, patterns: [/origine\s*:?\s*espagne/i, /fabriqué\s+en\s+espagne/i, /🇪🇸/u] },
  { country: 'NL', confidence: 0.85, patterns: [/origine\s*:?\s*pays-bas/i, /🇳🇱/u] },
  { country: 'PT', confidence: 0.85, patterns: [/origine\s*:?\s*portugal/i, /🇵🇹/u] },
  { country: 'US', confidence: 0.9, patterns: [/origine\s*:?\s*(usa|états-unis|etats-unis)/i, /made\s+in\s+usa/i, /🇺🇸/u] },
];

export class TextOriginHeuristics {
  detect(text: string): ManufacturingOrigin | null {
    for (const candidate of PATTERNS) {
      if (candidate.patterns.some((re) => re.test(text))) {
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
