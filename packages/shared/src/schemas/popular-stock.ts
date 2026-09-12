import { z } from "zod";
import { marketCategorySchema } from "./stock.js";

export const popularStockSchema = z.object({
  rank: z.number().int().positive(),
  stockCode: z.string().min(1),
  name: z.string().min(1),
  market: marketCategorySchema,
  price: z.number(),
  change: z.number(),
  changeRate: z.number(),
  volume: z.number(),
  tradingValue: z.number(),
});

export type PopularStock = z.infer<typeof popularStockSchema>;
