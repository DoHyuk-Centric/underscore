import { isAxiosError } from 'axios'
import { dailyPriceSchema, type DailyPrice } from '@underscore/shared'
import { queryOptions } from '@tanstack/react-query'
import { http } from '../../../lib/http'

export async function getDailyPrice(
  stockCode: string,
  date: string,
  signal?: AbortSignal,
): Promise<DailyPrice> {
  try {
    const response = await http.get(`/market-data/stocks/${stockCode}/daily-price`, {
      params: { date },
      signal,
    })

    return dailyPriceSchema.parse(response.data)
  } catch (error) {
    // 휴장일·거래 없음처럼 서버가 이유를 알려준 경우 그 문구를 그대로 보여줍니다.
    const message = isAxiosError(error) ? error.response?.data?.message : undefined
    throw new Error(typeof message === 'string' ? message : '이날 시세를 불러오지 못했어요.')
  }
}

// 지난 날짜의 시세는 바뀌지 않으므로 한 번 받은 값은 계속 재사용합니다.
export const dailyPriceQueryOptions = (stockCode: string, date: string) =>
  queryOptions({
    queryKey: ['daily-price', stockCode, date],
    queryFn: ({ signal }) => getDailyPrice(stockCode, date, signal),
    staleTime: Infinity,
    retry: false,
  })
