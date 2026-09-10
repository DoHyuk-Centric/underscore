import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { KRXStock } from '@underscore/shared';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KrxApiClient } from './clients/krx-api.client.js';
import { KrxStockMapper } from './mappers/krx-stock.mapper.js';
import { StockStore } from './stock.store.js';

@Injectable()
export class MarketDataService implements OnModuleInit {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(
    private readonly krxApiClient: KrxApiClient,
    private readonly krxStockMapper: KrxStockMapper,
    private readonly stockStore: StockStore,
  ) {}

  async onModuleInit() {
    await this.fetchAndCache();
  }

  private async fetchAndCache() {
    try {
      const items = await this.krxApiClient.fetchListedInfo();
      const stocks = this.krxStockMapper.toStocks(items);

      if (stocks.length === 0) {
        throw new Error('응답에서 파싱된 종목이 없어요');
      }
      this.stockStore.replace(stocks);
      this.logger.log(`종목 ${stocks.length}건 캐싱 완료`);
    } catch (error) {
      this.logger.error('종목 목록 갱신 실패, 기존 캐시를 유지합니다.', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async handleDailyRefresh() {
    await this.fetchAndCache();
  }

  search(query: string): KRXStock[] {
    return this.stockStore.search(query);
  }
}
