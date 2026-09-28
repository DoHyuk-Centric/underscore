import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadLatestBaseDateItems } from './load-latest-base-date-items.js';

describe('loadLatestBaseDateItems', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T09:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('주말은 건너뛰고 데이터가 있는 가장 최근 날짜를 찾는다', async () => {
    const dataByDate: Record<string, string[]> = { '20260923': ['삼성전자'] };
    const fetchItems = vi.fn(async (baseDate: string) => dataByDate[baseDate] ?? []);

    const result = await loadLatestBaseDateItems(fetchItems);

    expect(result).toEqual({ baseDate: '20260923', items: ['삼성전자'] });
    expect(fetchItems.mock.calls.map(([baseDate]) => baseDate)).toEqual(['20260925', '20260924', '20260923']);
  });

  it('조회 기간 안에 데이터가 없으면 null을 돌려준다', async () => {
    const fetchItems = vi.fn(async () => [] as string[]);

    await expect(loadLatestBaseDateItems(fetchItems)).resolves.toBeNull();
  });
});
