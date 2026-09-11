import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import type { PopularStock } from '@underscore/shared';
import { getYesterdayKstBasDt } from '../common/utils/kst-date.util.js';
import { KrxTradingClient } from './clients/krx-trading.client.js';
import { PopularStockCache } from './popular-stock.cache.js';
import { rankPopularStocks } from './popular-stock.ranker.js';

@Injectable()
export class PopularStockService {
  private readonly logger = new Logger(PopularStockService.name);

  constructor(
    private readonly krxTradingClient: KrxTradingClient,
    private readonly popularStockCache: PopularStockCache,
  ) {}

  async getPopularStocks(): Promise<PopularStock[]> {
    const baseDate = getYesterdayKstBasDt();
    const cached = this.popularStockCache.get(baseDate);
    if (cached) return cached;

    const items = await this.krxTradingClient.fetchAllDailyTrade(baseDate);
    const stocks = rankPopularStocks(items);
    if (stocks.length === 0) throw new Error('인기 종목 데이터가 비어 있습니다.');

    this.popularStockCache.set(baseDate, stocks);
    this.logger.log(`인기 종목 ${stocks.length}건 캐싱 완료 (${baseDate})`);
    return stocks;
  }

  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async refreshDaily(): Promise<void> {
    this.popularStockCache.clear();
    await this.getPopularStocks();
  }
}
