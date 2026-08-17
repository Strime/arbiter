import { z } from 'zod';

export const BrandSourceSchema = z.enum([
  'manual',
  'wikidata',
  'openfoodfacts',
  'crowdsourced',
  'detrumpez',
]);

// Doctrine des deux pays :
// - `country` : pays d'origine de la marque (siège historique, rattachement
//   perçu par le consommateur). Salomon = FR, Lu = FR.
// - `parentCountry` : pays du groupe propriétaire ULTIME (tête de la chaîne de
//   détention, pas le parent intermédiaire). Salomon = CN (Anta via Amer
//   Sports), Lu = US (Mondelez). Absent quand la marque est indépendante ou
//   que la détention est inconnue.
export const BrandEntrySchema = z.object({
  name: z.string().min(1),
  country: z.string().length(2),
  parentCompany: z.string().optional(),
  parentCountry: z.string().length(2).optional(),
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
