import { zodResolver } from '@hookform/resolvers/zod'
import { tradeReviewRequestSchema, type TradeReviewRequest } from '@underscore/shared'
import { useForm } from 'react-hook-form'
import { createEmptyEntry, type TradeReviewFormValues } from '../trade-review-form'

export const useTradeReviewForm = () =>
  useForm<TradeReviewFormValues, unknown, TradeReviewRequest>({
    resolver: zodResolver<TradeReviewFormValues, unknown, TradeReviewRequest>(tradeReviewRequestSchema),
    mode: 'onTouched',
    defaultValues: {
      stockCode: '',
      buys: [createEmptyEntry()],
      sells: [createEmptyEntry()],
    },
  })

export type TradeReviewFormMethods = ReturnType<typeof useTradeReviewForm>
