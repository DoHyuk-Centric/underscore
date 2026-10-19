import { useQuery } from '@tanstack/react-query'
import { dailyPriceQueryOptions } from '../api/daily-price-api'

export const useDailyPrice = (stockCode: string, date: string) => {
  const { data, error, isFetching } = useQuery({
    ...dailyPriceQueryOptions(stockCode, date),
    enabled: Boolean(stockCode) && /^\d{8}$/.test(date),
  })

  return { dailyPrice: data ?? null, error, isFetching }
}
