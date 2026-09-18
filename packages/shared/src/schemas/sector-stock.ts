import { z } from "zod";
import { marketCategorySchema } from "./stock.js";

export const sectorStockSchema = z.object({
  rank: z.number().int().positive(),
  stockCode: z.string().min(1),
  name: z.string().min(1),
  market: marketCategorySchema,
  price: z.number(),
  change: z.number(),
  changeRate: z.number(),
  marketCap: z.number(),
});

export type SectorStock = z.infer<typeof sectorStockSchema>;
