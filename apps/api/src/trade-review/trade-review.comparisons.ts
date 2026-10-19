import type { DailyPrice, TradeEntry, TradeReviewMetrics, TradeReviewRequest } from '@underscore/shared';
import type { DartDisclosure } from '../stock-diagnosis/dart.client.js';

/** AI가 직접 계산하지 않도록 서버가 미리 계산해 넘기는 비교 수치입니다. */
export interface PriceComparisons {
  /** 첫 매수일 종가 → 마지막 매도일 종가 */
  periodClose: { from: number; to: number; changePercent: number } | null;
  /** 두 번째 매수부터, 첫 매수 가격 대비 매수 가격 */
  laterBuysVsFirstBuy: { date: string; price: number; changePercent: number }[];
  /**
   * 매도 건마다 평균 매수가 대비 매도 가격. 첫 매수 대비 값과 섞이면 AI가 기준을 잘못 옮겨서
   * (예: 첫 매수 대비 +48.99%를 "평균 매수가 대비"로 씀) 기준이 다른 값은 따로 둡니다.
   */
  sellsVsAverageBuy: { date: string; price: number; changePercent: number }[];
  /** 공시일 종가 → 마지막 매도일 종가. 공시일 시세가 없으면 빠집니다. */
  afterDisclosures: { sourceId: string; date: string; close: number; changePercent: number }[];
  /** 같은 기간 시장 지수 변화와, 종목 종가 변화와의 차이(%p). 지수를 받지 못하면 null입니다. */
  market: { indexName: string; from: number; to: number; changePercent: number; gapPercentPoint: number } | null;
}

/** 첫 매수일과 마지막 매도일의 시장 지수 종가 */
export interface MarketIndexCloses {
  indexName: string;
  from: number;
  to: number;
}

export const changePercent = (from: number, to: number) => Number(((to / from - 1) * 100).toFixed(2));

const toDateKey = (date: string) => date.replaceAll('-', '');

export function comparePrices(
  request: TradeReviewRequest,
  metrics: TradeReviewMetrics,
  pricesByDate: Map<string, DailyPrice>,
  disclosures: DartDisclosure[],
  marketIndex: MarketIndexCloses | null = null,
): PriceComparisons {
  const firstClose = pricesByDate.get(metrics.firstBuyDate)?.close;
  const lastClose = pricesByDate.get(metrics.lastSellDate)?.close;
  const periodClose =
    firstClose && lastClose ? { from: firstClose, to: lastClose, changePercent: changePercent(firstClose, lastClose) } : null;

  return {
    periodClose,
    laterBuysVsFirstBuy: compareLaterBuysWithFirstBuy(request),
    sellsVsAverageBuy: compareSellsWithAverageBuy(request),
    afterDisclosures: lastClose ? compareAfterDisclosures(disclosures, pricesByDate, lastClose) : [],
    market: periodClose && marketIndex ? compareWithMarket(periodClose.changePercent, marketIndex) : null,
  };
}

function compareWithMarket(stockChangePercent: number, { indexName, from, to }: MarketIndexCloses) {
  const indexChangePercent = changePercent(from, to);
  return {
    indexName,
    from,
    to,
    changePercent: indexChangePercent,
    gapPercentPoint: Number((stockChangePercent - indexChangePercent).toFixed(2)),
  };
}

const byDate = (a: TradeEntry, b: TradeEntry) => a.date.localeCompare(b.date);

const compareWith = (basePrice: number) => (entry: TradeEntry) => ({
  date: entry.date,
  price: entry.price,
  changePercent: changePercent(basePrice, entry.price),
});

function compareLaterBuysWithFirstBuy(request: TradeReviewRequest): PriceComparisons['laterBuysVsFirstBuy'] {
  const [firstBuy, ...laterBuys] = [...request.buys].sort(byDate);
  return laterBuys.map(compareWith(firstBuy.price));
}

/** 반올림하지 않은 평균 매수가를 기준으로 해서, 매도가 한 건이면 매도분 수익률과 같은 값이 나옵니다. */
function compareSellsWithAverageBuy(request: TradeReviewRequest): PriceComparisons['sellsVsAverageBuy'] {
  const quantity = request.buys.reduce((total, entry) => total + entry.quantity, 0);
  const averageBuy = request.buys.reduce((total, entry) => total + entry.price * entry.quantity, 0) / quantity;
  return [...request.sells].sort(byDate).map(compareWith(averageBuy));
}

function compareAfterDisclosures(
  disclosures: DartDisclosure[],
  pricesByDate: Map<string, DailyPrice>,
  lastClose: number,
): PriceComparisons['afterDisclosures'] {
  return disclosures.flatMap((disclosure) => {
    const date = toDateKey(disclosure.receivedDate);
    const close = pricesByDate.get(date)?.close;
    return close ? [{ sourceId: `dart:${disclosure.id}`, date, close, changePercent: changePercent(close, lastClose) }] : [];
  });
}
