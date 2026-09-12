import type { PopularStock } from '@underscore/shared';
import {
  toPopularStock,
  type KrxTradingItem,
} from './mappers/krx-trading.mapper.js';

export function rankPopularStocks(
  items: KrxTradingItem[],
  limit = 10,
): PopularStock[] {
  return [...items]
    .filter(isEligibleStock)
    .sort((a, b) => toNumber(b.ACC_TRDVAL) - toNumber(a.ACC_TRDVAL))
    .slice(0, limit)
    .map((item, index) => toPopularStock(item, index + 1));
}

function isEligibleStock(item: KrxTradingItem): boolean {
  const name = item.ISU_NM ?? '';
  const price = toNumber(item.TDD_CLSPRC);
  const volume = toNumber(item.ACC_TRDVOL);
  const tradingValue = toNumber(item.ACC_TRDVAL);

  const isSpac = /(스팩|SPAC|기업인수목적)/i.test(name);
  const isPreferredStock = /우(?:B|C)?$/i.test(name);
  const isReit = /(리츠|REIT)/i.test(name);

  return (
    !isSpac &&
    !isPreferredStock &&
    !isReit &&
    price > 0 &&
    volume > 0 &&
    tradingValue > 0
  );
}

function toNumber(value?: string): number {
  return Number(value?.replaceAll(',', '').replaceAll('%', '') ?? 0) || 0;
}
