import { Injectable } from '@nestjs/common';
import { KRXStock } from '@underscore/shared';
import { includesHangulFuzzy } from './hangul-fuzzy-match.util.js';
import { STOCK_ALIASES } from './stock-aliases.js';

@Injectable()
export class StockStore {
  private stocks: KRXStock[] = [];

  replace(stocks: KRXStock[]): void {
    this.stocks = stocks;
  }

  search(query: string): KRXStock[] {
    const normalized = query.trim().toLowerCase().replace(/\s+/g, '');
    if (!normalized) return [];

    const results = this.stocks.filter((stock) =>
      [stock.name, stock.stockCode, stock.corpName].some((field) =>
        includesHangulFuzzy(field.toLowerCase().replace(/\s+/g, ''), normalized),
      ),
    );

    this.promoteAliasMatch(results, normalized);
    return results;
  }

  private promoteAliasMatch(results: KRXStock[], normalized: string): void {
    const aliasCode = STOCK_ALIASES[normalized];
    if (!aliasCode) return;

    const existingIndex = results.findIndex((stock) => stock.stockCode === aliasCode);
    if (existingIndex > 0) {
      const [aliasStock] = results.splice(existingIndex, 1);
      results.unshift(aliasStock);
      return;
    }
    if (existingIndex === 0) return;

    const aliasStock = this.stocks.find((stock) => stock.stockCode === aliasCode);
    if (aliasStock) results.unshift(aliasStock);
  }
}
