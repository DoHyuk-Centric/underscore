import { Module } from '@nestjs/common';
import { DailyPriceModule } from '../daily-price/daily-price.module.js';
import { StockDiagnosisModule } from '../stock-diagnosis/stock-diagnosis.module.js';
import { KrxIndexClient } from './krx-index.client.js';
import { TradeReviewController } from './trade-review.controller.js';
import { TradeReviewService } from './trade-review.service.js';

@Module({
  imports: [DailyPriceModule, StockDiagnosisModule],
  controllers: [TradeReviewController],
  providers: [TradeReviewService, KrxIndexClient],
})
export class TradeReviewModule {}
