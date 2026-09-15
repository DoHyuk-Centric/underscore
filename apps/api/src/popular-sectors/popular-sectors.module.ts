import { Module } from '@nestjs/common';
import { KrxIndexClient } from './clients/krx-index.client.js';
import { PopularSectorService } from './popular-sector.service.js';
import { PopularSectorsController } from './popular-sectors.controller.js';
import { PopularSectorCache } from './popular-sector.cache.js';

@Module({
  controllers: [PopularSectorsController],
  providers: [PopularSectorService, PopularSectorCache, KrxIndexClient],
})
export class PopularSectorsModule {}