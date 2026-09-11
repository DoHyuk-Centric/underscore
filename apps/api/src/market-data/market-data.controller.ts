import { Controller, Get, Query } from '@nestjs/common';
import { KRXStock } from '@underscore/shared';
import { MarketDataService } from './market-data.service.js';
import { PopularStockService } from './popular-stock.service.js';

@Controller('market-data')
export class MarketDataController {
  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly popularStockService: PopularStockService,
  ) {}

  @Get('search')
  search(@Query('q') query: string = ''): KRXStock[] {
    return this.marketDataService.search(query);
  }

  @Get('popular/stocks')
  popularStocks() {
    return this.popularStockService.getPopularStocks();
  }
}
