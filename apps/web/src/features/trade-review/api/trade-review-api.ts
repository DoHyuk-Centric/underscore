import type { TradeReviewRequest } from '@underscore/shared'
import { http } from '../../../lib/http'

// AI가 근거·결과·공시를 정리하는 데 시간이 걸려 기본 타임아웃(5초)보다 길게 기다립니다.
const TRADE_REVIEW_TIMEOUT_MS = 60_000

export async function requestTradeReview(request: TradeReviewRequest): Promise<void> {
  await http.post('/trade-review', request, { timeout: TRADE_REVIEW_TIMEOUT_MS })
}
