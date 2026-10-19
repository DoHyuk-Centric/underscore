import { z } from "zod";

// 근거의 강도: 공시 문장처럼 직접 확인되면 direct, 같은 기간에 함께 나타난 관찰이면 circumstantial
export const evidenceStrengthSchema = z.enum(["direct", "circumstantial", "unavailable"]);

/** 서버가 사용자의 거래 기록으로 계산한 수치. AI는 이 값을 다시 계산하지 않고 인용만 한다. */
export const tradeReviewMetricsSchema = z.object({
  stockCode: z.string(),
  stockName: z.string(),
  firstBuyDate: z.string().length(8),
  lastSellDate: z.string().length(8),
  holdingDays: z.number().int(),
  buyQuantity: z.number().int(),
  sellQuantity: z.number().int(),
  remainingQuantity: z.number().int(),
  averageBuyPrice: z.number(),
  averageSellPrice: z.number(),
  realizedProfit: z.number(),
  returnPercent: z.number(),
});

export const tradeReviewSourceSchema = z.object({
  sourceId: z.string(),
  title: z.string(),
  date: z.string(),
  url: z.string().nullable(),
});

export const tradeReviewSchema = z.object({
  metrics: tradeReviewMetricsSchema,
  summary: z.string(),
  thesisVsOutcome: z.string(),
  confirmedFacts: z.array(z.object({ text: z.string(), sourceIds: z.array(z.string()) })),
  possibleFactors: z.array(
    z.object({
      factor: z.string(),
      reason: z.string(),
      sourceIds: z.array(z.string()),
      evidenceStrength: evidenceStrengthSchema,
    }),
  ),
  userJudgmentItems: z.array(
    z.object({
      topic: z.string(),
      knownFacts: z.array(z.string()),
      whyUserJudgment: z.string(),
    }),
  ),
  glossary: z.array(z.object({ term: z.string(), definition: z.string() })),
  sources: z.array(tradeReviewSourceSchema),
});

export type EvidenceStrength = z.infer<typeof evidenceStrengthSchema>;
export type TradeReviewMetrics = z.infer<typeof tradeReviewMetricsSchema>;
export type TradeReviewSource = z.infer<typeof tradeReviewSourceSchema>;
export type TradeReview = z.infer<typeof tradeReviewSchema>;
