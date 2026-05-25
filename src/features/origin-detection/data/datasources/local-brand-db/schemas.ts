import { z } from 'zod';

export const BrandSourceSchema = z.enum([
  'manual',
  'wikidata',
  'openfoodfacts',
  'crowdsourced',
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
