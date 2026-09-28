import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { KRXStock } from '@underscore/shared';
import { loadLatestBaseDateItems } from '../common/market-data/load-latest-base-date-items.js';
import { KrxListedClient } from './clients/krx-listed.client.js';
import { KrxStockMapper } from './mappers/krx-stock.mapper.js';
import { StockStore } from './stock.store.js';

@Injectable()
export class StockSearchService implements OnModuleInit {
  private readonly logger = new Logger(StockSearchService.name);

  constructor(
    private readonly krxListedClient: KrxListedClient,
    private readonly krxStockMapper: KrxStockMapper,
    private readonly stockStore: StockStore,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refresh();
  }

  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async refreshDaily(): Promise<void> {
    await this.refresh();
  }

  search(query: string): KRXStock[] {
    return this.stockStore.search(query);
  }

  private async refresh(): Promise<void> {
    try {
      const latest = await loadLatestBaseDateItems((baseDate) =>
        this.krxListedClient.fetchListedInfo(baseDate),
      );
      if (!latest) throw new Error('최근 영업일의 종목 데이터가 없습니다.');

      const stocks = this.krxStockMapper.toStocks(latest.items);
      if (stocks.length === 0) throw new Error('종목 데이터가 비어 있습니다.');
      this.stockStore.replace(stocks);
      this.logger.log(`종목 ${stocks.length}건 캐싱 완료 (기준일 ${latest.baseDate})`);
    } catch (error) {
      this.logger.error('종목 목록 갱신 실패', error);
    }
  }
}
