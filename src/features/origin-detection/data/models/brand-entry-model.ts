export interface BrandEntryModel {
  name: string;
  country: string;
  parentCompany?: string;
  parentCountry?: string;
  source: 'manual' | 'wikidata' | 'openfoodfacts' | 'crowdsourced' | 'detrumpez';
  confidence: number;
  addedAt: string;
}
