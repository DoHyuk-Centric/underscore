import { useMutation } from '@tanstack/react-query'
import { requestTradeReview } from '../api/trade-review-api'

export const useRequestTradeReview = () => useMutation({ mutationFn: requestTradeReview })
