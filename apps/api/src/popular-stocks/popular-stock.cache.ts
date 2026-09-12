import { Injectable } from '@nestjs/common';
import type { PopularStock } from '@underscore/shared';

@Injectable()
export class PopularStockCache {
  private baseDate = '';
  private stocks: PopularStock[] = [];

  get(baseDate: string): PopularStock[] | null {
    return this.baseDate === baseDate && this.stocks.length > 0
      ? this.stocks
      : null;
  }

  set(baseDate: string, stocks: PopularStock[]): void {
    this.baseDate = baseDate;
    this.stocks = stocks;
  }

  clear(): void {
    this.baseDate = '';
    this.stocks = [];
  }
}
