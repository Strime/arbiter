import type { OffProductModel } from '../models/off-product-model';
import type { ManufacturingOrigin } from '../../domain/entities/manufacturing-origin';

const COUNTRY_TAG_TO_CODE: Record<string, string> = {
  'en:france': 'FR',
  'en:united-states': 'US',
  'en:belgium': 'BE',
  'en:germany': 'DE',
  'en:italy': 'IT',
  'en:spain': 'ES',
  'en:netherlands': 'NL',
  'en:portugal': 'PT',
  'en:switzerland': 'CH',
  'en:united-kingdom': 'GB',
  'en:austria': 'AT',
  'en:poland': 'PL',
  'en:sweden': 'SE',
  'en:denmark': 'DK',
  'en:ireland': 'IE',
};

export class OffToManufacturingOriginMapper {
  toEntity(off: OffProductModel): ManufacturingOrigin | null {
    const candidate =
      off.origins_tags?.[0] ?? off.manufacturing_places_tags?.[0] ?? off.countries_tags?.[0];
    if (!candidate) return null;
    const country = COUNTRY_TAG_TO_CODE[candidate];
    if (!country) return null;
    return {
      country,
      source: 'openfoodfacts',
      confidence: 0.75,
    };
  }
}
