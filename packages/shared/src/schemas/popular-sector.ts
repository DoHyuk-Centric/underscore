import { z } from "zod";

export const popularSectorSchema = z.object({
  rank: z.number().int().positive(),
  name: z.string().min(1),
  changeRate: z.number(),
  tradingValue: z.number(),
  baseDate: z.string().min(1),
});

export type PopularSector = z.infer<typeof popularSectorSchema>;
