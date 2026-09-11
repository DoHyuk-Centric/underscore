import { Injectable } from '@nestjs/common';
import { KRXStock } from '@underscore/shared';

@Injectable()
export class StockStore {
  private stocks: KRXStock[] = [];

  replace(stocks: KRXStock[]): void {
    this.stocks = stocks;
  }

  search(query: string): KRXStock[] {
    const normalized = query.trim().toLowerCase().replace(/\s+/g, '');
    if (!normalized) return [];

    return this.stocks.filter((stock) =>
      [stock.name, stock.stockCode, stock.corpName].some((field) =>
        field.toLowerCase().replace(/\s+/g, '').includes(normalized),
      ),
    );
  }
}
