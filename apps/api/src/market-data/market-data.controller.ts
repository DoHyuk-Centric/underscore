import { Controller, Get, Query } from '@nestjs/common';
import { KRXStock } from '@underscore/shared';
import { MarketDataService } from './market-data.service.js';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('search')
  search(@Query('q') query: string = ''): KRXStock[] {
    return this.marketDataService.search(query);
  }
}
