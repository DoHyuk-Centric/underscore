import type { PopularSector } from '@underscore/shared';
import {
  toPopularSector,
  SECTOR_INDEX_NAMES,
  type KrxIndexItem,
} from './mappers/krx-trading.mapper.js';

export function rankPopularSectors(
  items: KrxIndexItem[],
  limit = 10,
): PopularSector[] {
  return [...items]
    .filter(isEligibleSector)
    .sort(
      (a, b) =>
        toNumber(b.FLUC_RT) - toNumber(a.FLUC_RT) ||
        toNumber(b.ACC_TRDVAL) - toNumber(a.ACC_TRDVAL),
    )
    .slice(0, limit)
    .map((item, index) => toPopularSector(item, index + 1));
}

function isEligibleSector(item: KrxIndexItem): boolean {
  const name = item.IDX_NM ?? '';
  const closePrice = toNumber(item.CLSPRC_IDX);
  const tradingValue = toNumber(item.ACC_TRDVAL);

  return SECTOR_INDEX_NAMES.has(name) && closePrice > 0 && tradingValue > 0;
}

function toNumber(value?: string): number {
  return Number(value?.replaceAll(',', '').replaceAll('%', '') ?? 0) || 0;
}
