import { z } from 'zod';

export const RequestOriginPayloadSchema = z.object({
  ean: z.string().optional(),
  brand: z.string(),
  title: z.string(),
  rawText: z.string().optional(),
});

export const RequestOriginMessageSchema = z.object({
  type: z.literal('arbiter/request-origin'),
  payload: RequestOriginPayloadSchema,
});

const OriginSourceSchema = z.enum([
  'manual',
  'wikidata',
  'openfoodfacts',
  'crowdsourced',
  'heuristic',
]);

const OriginRegionSchema = z.enum(['FR', 'EU', 'US', 'OTHER', 'UNKNOWN']);

export const OriginVerdictPayloadSchema = z.object({
  brand: z
    .object({
      country: z.string(),
      parentCompany: z.string().optional(),
      source: OriginSourceSchema,
      confidence: z.number(),
    })
    .optional(),
  manufacturing: z
    .object({
      country: z.string(),
      source: OriginSourceSchema,
      confidence: z.number(),
    })
    .optional(),
  brandRegion: OriginRegionSchema,
  manufacturingRegion: OriginRegionSchema,
});

export const OriginResponseMessageSchema = z.object({
  type: z.literal('arbiter/origin-response'),
  payload: OriginVerdictPayloadSchema,
});

export type RequestOriginMessage = z.infer<typeof RequestOriginMessageSchema>;
export type OriginResponseMessage = z.infer<typeof OriginResponseMessageSchema>;
