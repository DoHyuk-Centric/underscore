import { z } from "zod";

export const diagnosisNewsLinkSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
});

export const stockDiagnosisSchema = z.object({
  rank: z.number().int().positive(),
  stockCode: z.string().min(1),
  stockName: z.string().min(1),
  headline: z.string().min(1),
  companyIntro: z.string().min(1).nullable(),
  impactContext: z.string().min(1).nullable(),
  marketContext: z.array(z.string().min(1)),
  news: z.array(diagnosisNewsLinkSchema),
  caution: z.string().min(1),
});

export type StockDiagnosis = z.infer<typeof stockDiagnosisSchema>;
export type DiagnosisNewsLink = z.infer<typeof diagnosisNewsLinkSchema>;
