import { isAxiosError } from 'axios'
import { tradeReviewSchema, type TradeReview, type TradeReviewRequest } from '@underscore/shared'
import { http } from '../../../lib/http'

// 공시를 모으고 AI가 복기를 쓰는 데 시간이 걸려 기본 타임아웃(5초)보다 길게 기다립니다.
const TRADE_REVIEW_TIMEOUT_MS = 90_000

export async function requestTradeReview(request: TradeReviewRequest): Promise<TradeReview> {
  try {
    const response = await http.post('/trade-review', request, { timeout: TRADE_REVIEW_TIMEOUT_MS })
    return tradeReviewSchema.parse(response.data)
  } catch (error) {
    // 그날 시세와 맞지 않는 거래처럼 서버가 이유를 알려준 경우 그 문구를 그대로 보여줍니다.
    const message = isAxiosError(error) ? error.response?.data?.message : undefined
    throw new Error(typeof message === 'string' ? message : 'AI 분석을 요청하지 못했어요. 잠시 후 다시 시도해주세요.')
  }
}
