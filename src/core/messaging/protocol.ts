import { z } from 'zod';

export const RequestOriginPayloadSchema = z.object({
  ean: z.string().optional(),
  brand: z.string(),
  title: z.string(),
  rawText: z.string().optional(),
  brandGuessed: z.boolean().optional(),
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

const CountryCodeSchema = z.string().regex(/^[A-Z]{2}$/);

export const OriginVerdictPayloadSchema = z.object({
  brand: z
    .object({
      country: CountryCodeSchema,
      parentCompany: z.string().optional(),
      source: OriginSourceSchema,
      confidence: z.number(),
    })
    .optional(),
  manufacturing: z
    .object({
      country: CountryCodeSchema,
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

export const GetStatsMessageSchema = z.object({
  type: z.literal('arbiter/get-stats'),
});

export const StatsResponseMessageSchema = z.object({
  type: z.literal('arbiter/stats-response'),
  payload: z.object({
    badgeCount: z.number().int().nonnegative(),
  }),
});

export type RequestOriginMessage = z.infer<typeof RequestOriginMessageSchema>;
export type OriginResponseMessage = z.infer<typeof OriginResponseMessageSchema>;
export type GetStatsMessage = z.infer<typeof GetStatsMessageSchema>;
export type StatsResponseMessage = z.infer<typeof StatsResponseMessageSchema>;
