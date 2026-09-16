import { Controller, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { MarketDataEventsService } from './market-data-events.service.js';

@Controller('market-data')
export class MarketDataEventsController {
  constructor(private readonly events: MarketDataEventsService) {}

  @Sse('events')
  stream(): Observable<{ data: string }> {
    return this.events
      .asObservable()
      .pipe(map((event) => ({ data: JSON.stringify(event) })));
  }
}
