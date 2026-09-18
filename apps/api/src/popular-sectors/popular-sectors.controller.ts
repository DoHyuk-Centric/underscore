import { Controller, Get, Param } from '@nestjs/common';
import { PopularSectorService } from './popular-sector.service.js';
import { SectorStockService } from './sector-stock.service.js';

@Controller('market-data/popular')
export class PopularSectorsController {
  constructor(
    private readonly popularSectorService: PopularSectorService,
    private readonly sectorStockService: SectorStockService,
  ) {}

  @Get('sectors')
  getPopularSectors() {
    return this.popularSectorService.getPopularSectors();
  }

  @Get('sectors/:name/stocks')
  getSectorStocks(@Param('name') name: string) {
    return this.sectorStockService.getSectorStocks(name);
  }
}