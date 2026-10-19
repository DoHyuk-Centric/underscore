import { z } from "zod";

export const dailyPriceSchema = z.object({
  stockCode: z.string().min(1),
  name: z.string(),
  date: z.string().length(8),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  /** 전일 종가 대비 등락률(%) */
  changeRate: z.number(),
  volume: z.number(),
  tradingValue: z.number(),
});

export type DailyPrice = z.infer<typeof dailyPriceSchema>;

export type TradeEntryPriceIssue = {
  field: "price" | "quantity";
  message: string;
};

// 2023년 1월부터 코스피·코스닥 주식에 같은 호가 단위가 적용됩니다. (ETF·ETN은 단위가 달라 따로 다뤄야 합니다.)
const TICK_SIZES = [
  { below: 2_000, tick: 1 },
  { below: 5_000, tick: 5 },
  { below: 20_000, tick: 10 },
  { below: 50_000, tick: 50 },
  { below: 200_000, tick: 100 },
  { below: 500_000, tick: 500 },
  { below: Infinity, tick: 1_000 },
];

export const getTickSize = (price: number) => TICK_SIZES.find(({ below }) => price < below)!.tick;

const formatWon = (value: number) => value.toLocaleString("ko-KR");

// 거래대금처럼 큰 금액은 "6.1조 원", "3,120억 원"처럼 읽기 쉬운 단위로 보여줍니다.
const formatLargeWon = (value: number) => {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(1)}조 원`;
  if (value >= 100_000_000) return `${formatWon(Math.floor(value / 100_000_000))}억 원`;
  if (value >= 10_000) return `${formatWon(Math.floor(value / 10_000))}만 원`;
  return `${formatWon(value)}원`;
};

const getPriceRangeIssue = (price: number, dailyPrice: DailyPrice): string | null =>
  price < dailyPrice.low || price > dailyPrice.high
    ? `이날 거래된 가격은 ${formatWon(dailyPrice.low)}~${formatWon(dailyPrice.high)}원이에요.`
    : null;

/** 호가 단위에 맞지 않으면 바로 아래·위의 거래 가능한 가격을 함께 알려줍니다. */
const getTickSizeIssue = (price: number): string | null => {
  const tick = getTickSize(price);
  if (price % tick === 0) return null;

  const lower = Math.floor(price / tick) * tick;
  return `이 가격대는 ${formatWon(tick)}원 단위로 거래돼요. ${formatWon(lower)}원이나 ${formatWon(lower + tick)}원처럼 입력해주세요.`;
};

type TradeEntryInput = { date: string; price?: number; quantity?: number };

type SameDayTotals = { quantity: number; amount: number };

/** 같은 날짜의 다른 분할 건들이 이미 차지한 수량과 금액입니다. */
const sumOtherSameDayEntries = (entries: TradeEntryInput[], index: number): SameDayTotals =>
  entries.reduce<SameDayTotals>(
    (totals, entry, entryIndex) =>
      entryIndex === index || entry.date !== entries[index].date
        ? totals
        : {
            quantity: totals.quantity + (entry.quantity ?? 0),
            amount: totals.amount + (entry.price ?? 0) * (entry.quantity ?? 0),
          },
    { quantity: 0, amount: 0 },
  );

/** 이 건에 남은 수량을 안내합니다. 같은 날 다른 건이 이미 한도를 채웠으면 그 사실을 알려줍니다. */
const describeRemaining = (remainingQuantity: number) =>
  remainingQuantity > 0
    ? `이 건은 ${formatWon(remainingQuantity)}주까지 입력할 수 있어요.`
    : "같은 날 다른 건만으로 이미 한도를 채웠어요.";

const getVolumeIssue = (quantity: number, others: SameDayTotals, dailyPrice: DailyPrice): string | null => {
  const { volume } = dailyPrice;

  if (quantity > volume) return `이날 거래량인 ${formatWon(volume)}주보다 많이 거래할 수 없어요.`;
  if (quantity + others.quantity > volume) {
    return `같은 날 거래를 합치면 이날 거래량(${formatWon(volume)}주)을 넘어요. ${describeRemaining(volume - others.quantity)}`;
  }
  return null;
};

const getTradingValueIssue = (
  price: number | undefined,
  quantity: number,
  others: SameDayTotals,
  dailyPrice: DailyPrice,
): string | null => {
  if (price === undefined) return null;
  const { tradingValue } = dailyPrice;
  const amount = price * quantity;

  if (amount > tradingValue) return `이날 거래대금(${formatLargeWon(tradingValue)})보다 큰 금액은 거래할 수 없어요.`;
  if (amount + others.amount > tradingValue) {
    const remainingQuantity = Math.floor((tradingValue - others.amount) / price);
    return `같은 날 거래를 합치면 이날 거래대금(${formatLargeWon(tradingValue)})을 넘어요. ${describeRemaining(remainingQuantity)}`;
  }
  return null;
};

/**
 * 분할 매수(또는 매도) 목록에서 index번째 건이 그날 시세로 가능한 거래인지 검사합니다.
 * 같은 날짜의 다른 건과 합친 수량·금액도 그날 거래량·거래대금을 넘을 수 없습니다.
 */
export function getTradeEntryPriceIssues(
  entries: TradeEntryInput[],
  index: number,
  dailyPrice: DailyPrice,
): TradeEntryPriceIssue[] {
  const issues: TradeEntryPriceIssue[] = [];
  const { price, quantity } = entries[index];

  if (price !== undefined) {
    // 범위를 벗어난 가격은 단위보다 범위를 먼저 알려줍니다.
    const priceIssue = getPriceRangeIssue(price, dailyPrice) ?? getTickSizeIssue(price);
    if (priceIssue) issues.push({ field: "price", message: priceIssue });
  }

  if (quantity !== undefined) {
    // 가상 거래의 자유도는 두되, 한 건이 그날 시장 전체에서 거래된 수량·금액보다 클 수는 없습니다.
    const others = sumOtherSameDayEntries(entries, index);
    const quantityIssue =
      getVolumeIssue(quantity, others, dailyPrice) ?? getTradingValueIssue(price, quantity, others, dailyPrice);
    if (quantityIssue) issues.push({ field: "quantity", message: quantityIssue });
  }

  return issues;
}
