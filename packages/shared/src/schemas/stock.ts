import { z } from 'zod';

export const marketCategorySchema = z.enum(['KOSPI', 'KOSDAQ', 'KONEX']);

export const stockSchema = z.object({
  stockCode: z.string().min(1),
  isinCode: z.string().min(1),
  name: z.string().min(1),
  market: marketCategorySchema,
  corpName: z.string().min(1),
  corpRegistrationNo: z.string().min(1),
  baseDate: z.string().length(8),
});

export type KRXStock = z.infer<typeof stockSchema>;