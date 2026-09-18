import type { SectorStock } from '@underscore/shared';
import type { KrxTradingItem } from '../../popular-stocks/mappers/krx-trading.mapper.js';

function toNumber(value?: string): number {
  return Number(value?.replaceAll(',', '').replaceAll('%', '') ?? 0) || 0;
}

export function toSectorStock(item: KrxTradingItem, rank: number): SectorStock {
  return {
    rank,
    stockCode: item.ISU_CD ?? '',
    name: item.ISU_NM ?? '',
    market: item.MKT_NM as SectorStock['market'],
    price: toNumber(item.TDD_CLSPRC),
    change: toNumber(item.CMPPREVDD_PRC),
    changeRate: toNumber(item.FLUC_RT),
    marketCap: toNumber(item.MKTCAP),
  };
}
