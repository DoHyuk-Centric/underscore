import { Injectable, NotFoundException } from '@nestjs/common';
import type { DailyPrice } from '@underscore/shared';
import { KrxTradingClient } from '../popular-stocks/clients/krx-trading.client.js';
import { toNumber, type KrxTradingItem } from '../popular-stocks/mappers/krx-trading.mapper.js';

// 지난 날짜의 시세는 바뀌지 않으므로 날짜별 전 종목 응답을 메모리에 보관합니다.
const MAX_CACHED_DATES = 60;

// 종목 검색(공공데이터포털)과 시세(KRX) 응답의 단축코드 표기가 달라도 같은 종목으로 찾도록 앞의 'A'를 뗍니다.
const normalizeStockCode = (code: string) => code.trim().replace(/^A/, '');

@Injectable()
export class DailyPriceService {
  private readonly itemsByDate = new Map<string, Promise<Map<string, KrxTradingItem>>>();

  constructor(private readonly krxTradingClient: KrxTradingClient) {}

  async getDailyPrice(stockCode: string, date: string): Promise<DailyPrice> {
    const items = await this.loadItems(date);

    if (items.size === 0) {
      throw new NotFoundException('장이 열리지 않은 날이에요.');
    }

    const item = items.get(normalizeStockCode(stockCode));
    const volume = toNumber(item?.ACC_TRDVOL);

    if (!item || volume === 0) {
      throw new NotFoundException('이날은 이 종목의 거래가 없었어요.');
    }

    return {
      stockCode,
      name: item.ISU_NM ?? '',
      date,
      open: toNumber(item.TDD_OPNPRC),
      high: toNumber(item.TDD_HGPRC),
      low: toNumber(item.TDD_LWPRC),
      close: toNumber(item.TDD_CLSPRC),
      changeRate: toNumber(item.FLUC_RT),
      volume,
      tradingValue: toNumber(item.ACC_TRDVAL),
    };
  }

  private loadItems(date: string) {
    const cached = this.itemsByDate.get(date);
    if (cached) return cached;

    const pending = this.krxTradingClient
      .fetchAllDailyTrade(date)
      .then((items) => new Map(items.map((item) => [normalizeStockCode(item.ISU_CD ?? ''), item])));

    pending.catch(() => this.itemsByDate.delete(date));

    if (this.itemsByDate.size >= MAX_CACHED_DATES) {
      const oldestDate = this.itemsByDate.keys().next().value;
      if (oldestDate) this.itemsByDate.delete(oldestDate);
    }
    this.itemsByDate.set(date, pending);

    return pending;
  }
}
