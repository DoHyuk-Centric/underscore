import { z } from "zod";

export const dailyPriceSchema = z.object({
  stockCode: z.string().min(1),
  name: z.string(),
  date: z.string().length(8),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type DailyPrice = z.infer<typeof dailyPriceSchema>;

// 가상 거래라도 실제 시장에서 불가능한 거래는 막습니다.
export const MAX_TRADE_AMOUNT = 100_000_000;
export const MAX_VOLUME_SHARE = 0.01;

export type TradeEntryPriceIssue = {
  field: "price" | "quantity";
  message: string;
};

export const getMaxTradeQuantity = (dailyPrice: DailyPrice) =>
  Math.max(1, Math.floor(dailyPrice.volume * MAX_VOLUME_SHARE));

export function getTradeEntryPriceIssues(
  entry: { price?: number; quantity?: number },
  dailyPrice: DailyPrice,
): TradeEntryPriceIssue[] {
  const issues: TradeEntryPriceIssue[] = [];
  const { price, quantity } = entry;

  if (price !== undefined && (price < dailyPrice.low || price > dailyPrice.high)) {
    issues.push({
      field: "price",
      message: `이날 거래된 가격은 ${dailyPrice.low.toLocaleString("ko-KR")}~${dailyPrice.high.toLocaleString("ko-KR")}원이에요.`,
    });
  }

  if (quantity !== undefined) {
    const maxQuantity = getMaxTradeQuantity(dailyPrice);

    if (quantity > maxQuantity) {
      issues.push({
        field: "quantity",
        message: `이날 거래량의 ${MAX_VOLUME_SHARE * 100}%인 ${maxQuantity.toLocaleString("ko-KR")}주까지만 거래할 수 있어요.`,
      });
    } else if (price !== undefined && price * quantity > MAX_TRADE_AMOUNT) {
      issues.push({
        field: "quantity",
        message: `한 번에 ${(MAX_TRADE_AMOUNT / 100_000_000).toLocaleString("ko-KR")}억 원까지만 거래할 수 있어요.`,
      });
    }
  }

  return issues;
}
