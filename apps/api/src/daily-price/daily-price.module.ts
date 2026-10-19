import { Module } from '@nestjs/common';
import { KrxTradingClient } from '../popular-stocks/clients/krx-trading.client.js';
import { DailyPriceController } from './daily-price.controller.js';
import { DailyPriceService } from './daily-price.service.js';

@Module({
  controllers: [DailyPriceController],
  providers: [DailyPriceService, KrxTradingClient],
  exports: [DailyPriceService],
})
export class DailyPriceModule {}
