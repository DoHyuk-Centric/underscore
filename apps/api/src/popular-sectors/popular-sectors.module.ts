import { Module } from '@nestjs/common';
import { MarketDataEventsModule } from '../market-data-events/market-data-events.module.js';
import { KrxTradingClient } from '../popular-stocks/clients/krx-trading.client.js';
import { PopularSectorService } from './popular-sector.service.js';
import { PopularSectorsController } from './popular-sectors.controller.js';
import { PopularSectorCache } from './popular-sector.cache.js';

@Module({
  imports: [MarketDataEventsModule],
  controllers: [PopularSectorsController],
  providers: [PopularSectorService, PopularSectorCache, KrxTradingClient],
})
export class PopularSectorsModule {}
