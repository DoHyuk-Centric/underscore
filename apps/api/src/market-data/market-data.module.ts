import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service.js';
import { MarketDataController } from './market-data.controller.js';
import { KrxApiClient } from './clients/krx-api.client.js';
import { KrxStockMapper } from './mappers/krx-stock.mapper.js';
import { StockStore } from './stock.store.js';

@Module({
  controllers: [MarketDataController],
  providers: [MarketDataService, KrxApiClient, KrxStockMapper, StockStore],
  exports: [MarketDataService],
})
export class MarketDataModule {}
