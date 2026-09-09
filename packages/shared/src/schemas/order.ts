import { z } from 'zod';

export const orderSideSchema = z.enum(['BUY', 'SELL']);

export const createOrderRequestSchema = z.object({
  clientOrderId: z.string().uuid(),
  stockCode: z.string().min(1),
  side: orderSideSchema,
  quantity: z.number().int().positive(),
  rationale: z.string().min(1),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
