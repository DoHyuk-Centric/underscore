import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import type { DailyPrice } from '@underscore/shared';
import { getYesterdayKstBasDt } from '../common/utils/kst-date.util.js';
import { DailyPriceService } from './daily-price.service.js';

@Controller('market-data/stocks')
export class DailyPriceController {
  constructor(private readonly dailyPriceService: DailyPriceService) {}

  @Get(':stockCode/daily-price')
  getDailyPrice(
    @Param('stockCode') stockCode: string,
    @Query('date') date = '',
  ): Promise<DailyPrice> {
    if (!/^\d{8}$/.test(date)) {
      throw new BadRequestException('date는 YYYYMMDD 형식이어야 해요.');
    }

    // KRX 일별 매매정보는 다음 날 공개되므로 어제까지만 조회할 수 있습니다.
    if (date > getYesterdayKstBasDt()) {
      throw new BadRequestException('아직 시세가 집계되지 않은 날이에요.');
    }

    return this.dailyPriceService.getDailyPrice(stockCode, date);
  }
}
