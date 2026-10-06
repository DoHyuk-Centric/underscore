import { useQueryClient } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'
import { getTradeEntryPriceIssues } from '@underscore/shared'
import { dailyPriceQueryOptions } from '../api/daily-price-api'
import type { TradeReviewFormValues, TradeSide } from '../trade-review-form'

// 입력한 가격·수량이 그날 실제 시세로 가능한 거래인지 확인하고, 아니면 해당 칸에 오류를 남깁니다.
export const useMarketValidation = <Output>(
  form: Pick<UseFormReturn<TradeReviewFormValues, unknown, Output>, 'getValues' | 'setError'>,
) => {
  const queryClient = useQueryClient()
  const { getValues, setError } = form

  return async (side: TradeSide) => {
    const stockCode = getValues('stockCode')
    const entries = getValues(side)
    const results = await Promise.allSettled(
      entries.map((entry) => queryClient.fetchQuery(dailyPriceQueryOptions(stockCode, entry.date))),
    )

    let isValid = true
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        setError(`${side}.${index}.date`, { message: (result.reason as Error).message })
        isValid = false
        return
      }

      for (const issue of getTradeEntryPriceIssues(entries[index], result.value)) {
        setError(`${side}.${index}.${issue.field}`, { message: issue.message })
        isValid = false
      }
    })

    return isValid
  }
}
