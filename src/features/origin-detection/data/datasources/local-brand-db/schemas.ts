import { z } from 'zod';

export const BrandSourceSchema = z.enum([
  'manual',
  'wikidata',
  'openfoodfacts',
  'crowdsourced',
  'detrumpez',
]);

export const BrandEntrySchema = z.object({
  name: z.string().min(1),
  country: z.string().length(2),
  parentCompany: z.string().optional(),
  source: BrandSourceSchema,
  confidence: z.number().min(0).max(1),
  addedAt: z.string(),
});

export const BrandsFileSchema = z.object({
  version: z.number().int().positive(),
  brands: z.array(BrandEntrySchema),
});

export type BrandsFile = z.infer<typeof BrandsFileSchema>;

// Version du *format* de brands.json comprise par ce build. Le manifest OTA
// (`schemaVersion`) et le champ `version` interne du fichier doivent lui être
// strictement égaux pour qu'un overlay soit appliqué ou chargé.
export const SUPPORTED_BRANDS_SCHEMA_VERSION = 1;
