import { Module } from '@nestjs/common';
import { KrxListedClient } from './clients/krx-listed.client.js';
import { KrxStockMapper } from './mappers/krx-stock.mapper.js';
import { StockSearchController } from './stock-search.controller.js';
import { StockSearchService } from './stock-search.service.js';
import { StockStore } from './stock.store.js';

@Module({
  controllers: [StockSearchController],
  providers: [StockSearchService, KrxListedClient, KrxStockMapper, StockStore],
})
export class StockSearchModule {}
