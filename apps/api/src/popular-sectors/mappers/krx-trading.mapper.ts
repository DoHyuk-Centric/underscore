import type { PopularSector } from '@underscore/shared';

export type KrxIndexItem = {
  BAS_DD?: string;
  IDX_CLSS?: string;
  IDX_NM?: string;
  CLSPRC_IDX?: string;
  CMPPREVDD_IDX?: string;
  FLUC_RT?: string;
  OPNPRC_IDX?: string;
  HGPRC_IDX?: string;
  LWPRC_IDX?: string;
  ACC_TRDVOL?: string;
  ACC_TRDVAL?: string;
  MKTCAP?: string;
};

export const SECTOR_INDEX_NAMES = new Set([
  'KRX 자동차',
  'KRX 반도체',
  'KRX 헬스케어',
  'KRX 은행',
  'KRX 에너지화학',
  'KRX 철강',
  'KRX 방송통신',
  'KRX 건설',
  'KRX 증권',
  'KRX 기계장비',
  'KRX 보험',
  'KRX 운송',
  'KRX 경기소비재',
  'KRX 필수소비재',
  'KRX K콘텐츠',
  'KRX 정보기술',
  'KRX 유틸리티',
]);

function toNumber(value?: string): number {
  return Number(value?.replaceAll(',', '').replaceAll('%', '') ?? 0) || 0;
}

export function toPopularSector(item: KrxIndexItem, rank: number): PopularSector {
  return {
    rank,
    name: (item.IDX_NM ?? '').replace(/^KRX\s+/, ''),
    changeRate: toNumber(item.FLUC_RT),
    tradingValue: toNumber(item.ACC_TRDVAL),
    baseDate: item.BAS_DD ?? '',
  };
}
