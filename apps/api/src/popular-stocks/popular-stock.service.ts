import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { PopularStock } from '@underscore/shared';
import { getYesterdayKstBasDt } from '../common/utils/kst-date.util.js';
import { KrxTradingClient } from './clients/krx-trading.client.js';
import { PopularStockCache } from './popular-stock.cache.js';
import { rankPopularStocks } from './popular-stock.ranker.js';

const MAX_LOOKBACK_DAYS = 10;

@Injectable()
export class PopularStockService {
  private readonly logger = new Logger(PopularStockService.name);
  private pending: Promise<PopularStock[]> | null = null;

  constructor(
    private readonly krxTradingClient: KrxTradingClient,
    private readonly popularStockCache: PopularStockCache,
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

    // 날짜 이동 계산에는 UTC를 사용해 실행 환경의 시간대 영향을 줄입니다.
    const date = new Date(
      `${checkedDate.slice(0, 4)}-${checkedDate.slice(4, 6)}-${checkedDate.slice(6, 8)}T00:00:00Z`,
    );

    try {
      for (let offset = 0; offset < MAX_LOOKBACK_DAYS; offset++) {
        const baseDate = date
          .toISOString()
          .slice(0, 10)
          .replaceAll('-', '');

        const day = date.getUTCDay();
        date.setUTCDate(date.getUTCDate() - 1);

        if (day === 0 || day === 6) continue;

        const items =
          await this.krxTradingClient.fetchAllDailyTrade(baseDate);

        // 정상 응답이지만 데이터가 없으면 이전 날짜로 이동합니다.
        if (items.length === 0) continue;

        const stocks = rankPopularStocks(items);

        // 원본이 있는데 모두 제외됐다면 휴장일로 취급하지 않습니다.
        if (stocks.length === 0) {
          throw new Error(
            `인기 종목 필터링 결과가 없습니다. 기준일=${baseDate}, 원본=${items.length}건`,
          );
        }

        this.popularStockCache.set({
          checkedDate,
          baseDate,
          stocks,
        });

        this.logger.log(
          `인기 종목 ${stocks.length}건 캐싱 완료 (${baseDate})`,
        );

        return stocks;
      }

      throw new Error(
        `최근 ${MAX_LOOKBACK_DAYS}일 내 거래 데이터가 없습니다.`,
      );
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