import type { PopularStock } from '@underscore/shared';

export type KrxTradingItem = {
  ISU_CD?: string;
  ISU_NM?: string;
  MKT_NM?: string;
  TDD_CLSPRC?: string;
  CMPPREVDD_PRC?: string;
  FLUC_RT?: string;
  ACC_TRDVOL?: string;
  ACC_TRDVAL?: string;
};

function toNumber(value?: string): number {
  return Number(value?.replaceAll(',', '').replaceAll('%', '') ?? 0) || 0;
}

export function toPopularStock(item: KrxTradingItem, rank: number): PopularStock {
  return {
    rank,
    stockCode: item.ISU_CD ?? '',
    name: item.ISU_NM ?? '',
    market: item.MKT_NM as PopularStock['market'],
    price: toNumber(item.TDD_CLSPRC),
    change: toNumber(item.CMPPREVDD_PRC),
    changeRate: toNumber(item.FLUC_RT),
    volume: toNumber(item.ACC_TRDVOL),
    tradingValue: toNumber(item.ACC_TRDVAL),
  };
}
