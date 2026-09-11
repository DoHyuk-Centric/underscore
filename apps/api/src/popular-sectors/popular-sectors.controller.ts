import { Controller, Get } from '@nestjs/common';
import { PopularSectorService } from './popular-sector.service.js';

@Controller('market-data/popular')
export class PopularSectorsController {
  constructor(
    private readonly popularSectorService: PopularSectorService,
  ) {}

  @Get('sectors')
  getPopularSectors() {
    return this.popularSectorService.getPopularSectors();
  }
}