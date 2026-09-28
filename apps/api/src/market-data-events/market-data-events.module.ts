import { Module } from '@nestjs/common';
import { MarketDataEventsController } from './market-data-events.controller.js';
import { MarketDataEventsService } from './market-data-events.service.js';

@Module({
  controllers: [MarketDataEventsController],
  providers: [MarketDataEventsService],
  exports: [MarketDataEventsService],
})
export class MarketDataEventsModule {}
