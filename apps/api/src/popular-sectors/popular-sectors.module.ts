import { Module } from '@nestjs/common';
import { MarketDataEventsModule } from '../market-data-events/market-data-events.module.js';
import { KrxIndexClient } from './clients/krx-index.client.js';
import { PopularSectorService } from './popular-sector.service.js';
import { PopularSectorsController } from './popular-sectors.controller.js';
import { PopularSectorCache } from './popular-sector.cache.js';

@Module({
  imports: [MarketDataEventsModule],
  controllers: [PopularSectorsController],
  providers: [PopularSectorService, PopularSectorCache, KrxIndexClient],
})
export class PopularSectorsModule {}