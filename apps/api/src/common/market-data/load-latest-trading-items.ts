import { getYesterdayKstBasDt } from '../utils/kst-date.util.js';
import type { KrxTradingClient } from '../../popular-stocks/clients/krx-trading.client.js';
import type { KrxTradingItem } from '../../popular-stocks/mappers/krx-trading.mapper.js';

const MAX_LOOKBACK_DAYS = 10;

export type LatestTradingItems = {
  baseDate: string;
  items: KrxTradingItem[];
};

export async function loadLatestTradingItems(
  krxTradingClient: KrxTradingClient,
): Promise<LatestTradingItems | null> {
  const checkedDate = getYesterdayKstBasDt();
  const date = new Date(
    `${checkedDate.slice(0, 4)}-${checkedDate.slice(4, 6)}-${checkedDate.slice(6, 8)}T00:00:00Z`,
  );

  for (let offset = 0; offset < MAX_LOOKBACK_DAYS; offset++) {
    const baseDate = date.toISOString().slice(0, 10).replaceAll('-', '');
    const day = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() - 1);

    if (day === 0 || day === 6) continue;

    const items = await krxTradingClient.fetchAllDailyTrade(baseDate);
    if (items.length > 0) return { baseDate, items };
  }

  return null;
}
