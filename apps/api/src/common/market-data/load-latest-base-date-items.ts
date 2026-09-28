import { getYesterdayKstBasDt } from '../utils/kst-date.util.js';

const MAX_LOOKBACK_DAYS = 10;

export type LatestBaseDateItems<T> = {
  baseDate: string;
  items: T[];
};

export async function loadLatestBaseDateItems<T>(
  fetchItems: (baseDate: string) => Promise<T[]>,
): Promise<LatestBaseDateItems<T> | null> {
  const checkedDate = getYesterdayKstBasDt();
  const date = new Date(
    `${checkedDate.slice(0, 4)}-${checkedDate.slice(4, 6)}-${checkedDate.slice(6, 8)}T00:00:00Z`,
  );

  for (let offset = 0; offset < MAX_LOOKBACK_DAYS; offset++) {
    const baseDate = date.toISOString().slice(0, 10).replaceAll('-', '');
    const day = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() - 1);

    if (day === 0 || day === 6) continue;

    const items = await fetchItems(baseDate);
    if (items.length > 0) return { baseDate, items };
  }

  return null;
}
