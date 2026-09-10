import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service.js';

@Module({
  providers: [MarketDataService],
  exports: [MarketDataService],
})
export class MarketDataModule {}
