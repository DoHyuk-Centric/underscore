import type { KrxTradingClient } from '../../popular-stocks/clients/krx-trading.client.js';
import type { KrxTradingItem } from '../../popular-stocks/mappers/krx-trading.mapper.js';
import { loadLatestBaseDateItems, type LatestBaseDateItems } from './load-latest-base-date-items.js';

export type LatestTradingItems = LatestBaseDateItems<KrxTradingItem>;

export function loadLatestTradingItems(
  krxTradingClient: KrxTradingClient,
): Promise<LatestTradingItems | null> {
  return loadLatestBaseDateItems((baseDate) => krxTradingClient.fetchAllDailyTrade(baseDate));
}
