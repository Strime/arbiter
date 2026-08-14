import type { OffProductModel } from '../models/off-product-model';
import type { ManufacturingOrigin } from '../../domain/entities/manufacturing-origin';

const COUNTRY_TAG_TO_CODE: Record<string, string> = {
  'en:austria': 'AT',
  'en:belgium': 'BE',
  'en:bulgaria': 'BG',
  'en:croatia': 'HR',
  'en:cyprus': 'CY',
  'en:czech-republic': 'CZ',
  'en:denmark': 'DK',
  'en:estonia': 'EE',
  'en:finland': 'FI',
  'en:france': 'FR',
  'en:germany': 'DE',
  'en:greece': 'GR',
  'en:hungary': 'HU',
  'en:ireland': 'IE',
  'en:italy': 'IT',
  'en:latvia': 'LV',
  'en:lithuania': 'LT',
  'en:luxembourg': 'LU',
  'en:malta': 'MT',
  'en:netherlands': 'NL',
  'en:poland': 'PL',
  'en:portugal': 'PT',
  'en:romania': 'RO',
  'en:slovakia': 'SK',
  'en:slovenia': 'SI',
  'en:spain': 'ES',
  'en:sweden': 'SE',
  'en:united-kingdom': 'GB',
  'en:switzerland': 'CH',
  'en:united-states': 'US',
  'en:canada': 'CA',
  'en:morocco': 'MA',
  'en:tunisia': 'TN',
  'en:turkey': 'TR',
  'en:china': 'CN',
  'en:european-union': 'EU',
};

const normalizeTag = (tag: string): string =>
  tag.toLowerCase().replace(/^[a-z]{2}:/, 'en:');

export class OffToManufacturingOriginMapper {
  toEntity(off: OffProductModel): ManufacturingOrigin | null {
    const candidates = [
      ...(off.origins_tags ?? []),
      ...(off.manufacturing_places_tags ?? []),
    ];
    for (const tag of candidates) {
      const country = COUNTRY_TAG_TO_CODE[normalizeTag(tag)];
      if (country) {
        return {
          country,
          source: 'openfoodfacts',
          confidence: 0.75,
        };
      }
    }
    return null;
  }
}
