import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export type MarketDataEventType = 'stocks' | 'sectors';
export interface MarketDataEvent {
  type: MarketDataEventType;
}

@Injectable()
export class MarketDataEventsService {
  private readonly subject = new Subject<MarketDataEvent>();

  emit(type: MarketDataEventType): void {
    this.subject.next({ type });
  }

  asObservable() {
    return this.subject.asObservable();
  }
}
