import { Controller, Get } from '@nestjs/common';
import { PopularStockService } from './popular-stock.service.js';

@Controller('market-data/popular')
export class PopularStocksController {
  constructor(private readonly popularStockService: PopularStockService) {}

  @Get('stocks')
  popularStocks() {
    return this.popularStockService.getPopularStocks();
  }
}
