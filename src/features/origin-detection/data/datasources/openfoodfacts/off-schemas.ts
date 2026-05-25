import { z } from 'zod';

export const OffProductSchema = z.object({
  code: z.string(),
  brands: z.string().optional(),
  brands_tags: z.array(z.string()).optional(),
  origins: z.string().optional(),
  origins_tags: z.array(z.string()).optional(),
  manufacturing_places: z.string().optional(),
  manufacturing_places_tags: z.array(z.string()).optional(),
  countries_tags: z.array(z.string()).optional(),
  labels_tags: z.array(z.string()).optional(),
});

export const OffResponseSchema = z.object({
  status: z.number(),
  product: OffProductSchema.optional(),
});

export type OffResponse = z.infer<typeof OffResponseSchema>;
