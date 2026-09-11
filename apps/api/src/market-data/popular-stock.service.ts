import { Injectable, Logger } from '@nestjs/common';
import type { PopularStock } from '@underscore/shared';
import { getYesterdayKstBasDt } from './utils/kst-date.util.js';
import { KrxTradingClient } from './clients/krx-trading.client.js';
import {
  toPopularStock,
  type KrxTradingItem,
} from './mappers/krx-trading.mapper.js';

@Injectable()
export class PopularStockService {
  private readonly logger = new Logger(PopularStockService.name);

  constructor(private readonly krxTradingClient: KrxTradingClient) {}

  async getPopularStocks(): Promise<PopularStock[]> {
    const baseDate = getYesterdayKstBasDt();
    const items = await this.krxTradingClient.fetchAllDailyTrade(baseDate);

    return items
      .sort(
        (a: KrxTradingItem, b: KrxTradingItem) =>
          this.toNumber(b.ACC_TRDVAL) - this.toNumber(a.ACC_TRDVAL),
      )
      .slice(0, 10)
      .map((item: KrxTradingItem, index: number) =>
        toPopularStock(item, index + 1),
      );
  }

  private toNumber(value?: string): number {
    return Number(value?.replaceAll(',', '').replaceAll('%', '') ?? 0) || 0;
  }
}
