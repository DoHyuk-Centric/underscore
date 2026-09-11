import type { PopularStock } from '@underscore/shared';
import { toPopularStock, type KrxTradingItem } from './mappers/krx-trading.mapper.js';

export function rankPopularStocks(items: KrxTradingItem[], limit = 10): PopularStock[] {
  return [...items]
    .sort((a, b) => toNumber(b.ACC_TRDVAL) - toNumber(a.ACC_TRDVAL))
    .slice(0, limit)
    .map((item, index) => toPopularStock(item, index + 1));
}

function toNumber(value?: string): number {
  return Number(value?.replaceAll(',', '').replaceAll('%', '') ?? 0) || 0;
}
