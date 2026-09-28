import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { PopularStock } from '@underscore/shared';
import { getYesterdayKstBasDt } from '../common/utils/kst-date.util.js';
import { loadLatestTradingItems } from '../common/market-data/load-latest-trading-items.js';
import { MarketDataEventsService } from '../market-data-events/market-data-events.service.js';
import { KrxTradingClient } from './clients/krx-trading.client.js';
import { PopularStockCache } from './popular-stock.cache.js';
import { rankPopularStocks } from './popular-stock.ranker.js';

@Injectable()
export class PopularStockService {
  private readonly logger = new Logger(PopularStockService.name);
  private pending: Promise<PopularStock[]> | null = null;

  constructor(
    private readonly krxTradingClient: KrxTradingClient,
    private readonly popularStockCache: PopularStockCache,
    private readonly marketDataEvents: MarketDataEventsService,
  ) {}

  async getPopularStocks(): Promise<PopularStock[]> {
    const checkedDate = getYesterdayKstBasDt();
    const cached = this.popularStockCache.get(checkedDate);

    if (cached) return cached.stocks;

    return this.refresh();
  }

  @Cron(CronExpression.EVERY_DAY_AT_2PM, {
    timeZone: 'Asia/Seoul',
  })
  async refreshDaily(): Promise<void> {
    // 기존 캐시를 지우지 않고 갱신합니다.
    try {
      await this.refresh();
    } catch {
      // 상세 오류는 refresh 내부에서 기록합니다.
    }
  }

  private async refresh(): Promise<PopularStock[]> {
    // 동시에 들어온 요청은 같은 조회 작업을 기다립니다.
    if (this.pending) return this.pending;

    this.pending = this.loadLatestStocks();

    try {
      return await this.pending;
    } finally {
      this.pending = null;
    }
  }

  private async loadLatestStocks(): Promise<PopularStock[]> {
    const checkedDate = getYesterdayKstBasDt();

    try {
      const latest = await loadLatestTradingItems(this.krxTradingClient);

      if (!latest) {
        throw new Error('최근 거래 데이터가 없습니다.');
      }

      const stocks = rankPopularStocks(latest.items);

      // 원본이 있는데 모두 제외됐다면 휴장일로 취급하지 않습니다.
      if (stocks.length === 0) {
        throw new Error(
          `인기 종목 필터링 결과가 없습니다. 기준일=${latest.baseDate}, 원본=${latest.items.length}건`,
        );
      }

      this.popularStockCache.set({
        checkedDate,
        baseDate: latest.baseDate,
        stocks,
      });
      this.marketDataEvents.emit('stocks');

      this.logger.log(
        `인기 종목 ${stocks.length}건 캐싱 완료 (${latest.baseDate})`,
      );

      return stocks;
    } catch (error) {
      this.logger.error(
        '인기 종목 갱신 실패',
        error instanceof Error ? error.stack : String(error),
      );

      const previous = this.popularStockCache.getLatest();

      if (previous) {
        this.logger.warn(
          `기존 인기 종목 데이터를 반환합니다 (${previous.baseDate})`,
        );
        return previous.stocks;
      }

      throw new ServiceUnavailableException(
        '인기 종목 데이터를 일시적으로 불러올 수 없습니다.',
      );
    }
  }
}
