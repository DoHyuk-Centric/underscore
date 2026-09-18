import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { SectorStock } from '@underscore/shared';
import { getYesterdayKstBasDt } from '../common/utils/kst-date.util.js';
import { KrxTradingClient } from '../popular-stocks/clients/krx-trading.client.js';
import type { KrxTradingItem } from '../popular-stocks/mappers/krx-trading.mapper.js';
import { toSectorStock } from './mappers/sector-stock.mapper.js';
import { SECTOR_CONSTITUENTS } from './sector-constituents.js';

const MAX_LOOKBACK_DAYS = 10;

@Injectable()
export class SectorStockService {
  private readonly logger = new Logger(SectorStockService.name);

  constructor(private readonly krxTradingClient: KrxTradingClient) {}

  async getSectorStocks(sectorName: string): Promise<SectorStock[]> {
    const stockCodes = SECTOR_CONSTITUENTS[sectorName];

    if (!stockCodes) {
      throw new NotFoundException(`알 수 없는 섹터입니다: ${sectorName}`);
    }

    const items = await this.loadLatestTradingItems();
    const codeSet = new Set(stockCodes);

    return items
      .filter((item) => codeSet.has(item.ISU_CD ?? ''))
      .map((item) => toSectorStock(item, 0))
      .sort((a, b) => impactOf(b) - impactOf(a))
      .map((stock, index) => ({ ...stock, rank: index + 1 }));
  }

  private async loadLatestTradingItems(): Promise<KrxTradingItem[]> {
    const checkedDate = getYesterdayKstBasDt();
    const date = new Date(
      `${checkedDate.slice(0, 4)}-${checkedDate.slice(4, 6)}-${checkedDate.slice(6, 8)}T00:00:00Z`,
    );

    for (let offset = 0; offset < MAX_LOOKBACK_DAYS; offset++) {
      const baseDate = date.toISOString().slice(0, 10).replaceAll('-', '');
      const day = date.getUTCDay();
      date.setUTCDate(date.getUTCDate() - 1);

      if (day === 0 || day === 6) continue;

      const items = await this.krxTradingClient.fetchAllDailyTrade(baseDate);
      if (items.length > 0) return items;
    }

    this.logger.error(`최근 ${MAX_LOOKBACK_DAYS}일 내 거래 데이터가 없습니다.`);
    return [];
  }
}

function impactOf(stock: SectorStock): number {
  return Math.abs(stock.marketCap * stock.changeRate);
}
