import { Injectable } from '@nestjs/common';
import type { PopularStock } from '@underscore/shared';

export interface PopularStockSnapshot {
  checkedDate: string;
  baseDate: string;
  stocks: PopularStock[];
}

@Injectable()
export class PopularStockCache {
  private snapshot: PopularStockSnapshot | null = null;

  get(checkedDate: string): PopularStockSnapshot | null {
    return this.snapshot?.checkedDate === checkedDate ? this.snapshot : null;
  }

  getLatest(): PopularStockSnapshot | null {
    return this.snapshot;
  }

  set(snapshot: PopularStockSnapshot): void {
    this.snapshot = snapshot;
  }
}
