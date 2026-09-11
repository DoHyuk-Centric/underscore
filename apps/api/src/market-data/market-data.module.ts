import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service.js';
import { MarketDataController } from './market-data.controller.js';
import { KrxApiClient } from './clients/krx-api.client.js';
import { KrxStockMapper } from './mappers/krx-stock.mapper.js';
import { StockStore } from './stock.store.js';
import { KrxTradingClient } from './clients/krx-trading.client.js';
import { PopularStockService } from './popular-stock.service.js';

@Module({
  controllers: [MarketDataController],
  providers: [
    MarketDataService,
    PopularStockService,
    KrxApiClient,
    KrxTradingClient,
    KrxStockMapper,
    StockStore,
  ],
  exports: [MarketDataService, PopularStockService],
})
export class MarketDataModule {}
