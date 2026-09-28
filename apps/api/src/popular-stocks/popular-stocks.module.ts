import { Module } from '@nestjs/common';
import { MarketDataEventsModule } from '../market-data-events/market-data-events.module.js';
import { KrxTradingClient } from './clients/krx-trading.client.js';
import { PopularStockCache } from './popular-stock.cache.js';
import { PopularStocksController } from './popular-stocks.controller.js';
import { PopularStockService } from './popular-stock.service.js';

@Module({
  imports: [MarketDataEventsModule],
  controllers: [PopularStocksController],
  providers: [PopularStockService, PopularStockCache, KrxTradingClient],
})
export class PopularStocksModule {}
