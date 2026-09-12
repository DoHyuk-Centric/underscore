import { Controller, Get, Query } from '@nestjs/common';
import { KRXStock } from '@underscore/shared';
import { StockSearchService } from './stock-search.service.js';

@Controller('market-data')
export class StockSearchController {
  constructor(private readonly stockSearchService: StockSearchService) {}

  @Get('search')
  search(@Query('q') query = ''): KRXStock[] {
    return this.stockSearchService.search(query);
  }
}
