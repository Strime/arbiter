export interface BrandEntryModel {
  name: string;
  country: string;
  parentCompany?: string;
  source: 'manual' | 'wikidata' | 'openfoodfacts' | 'crowdsourced';
  confidence: number;
  addedAt: string;
}
