import { useState } from 'react'
import type { TradeReviewRequest } from '@underscore/shared'
import { TradeReviewProvider } from '../context/TradeReviewProvider'
import { useRequestTradeReview } from '../hooks/useRequestTradeReview'
import { BuySection, SellSection, StockSection } from './sections'
import { TradeReviewConfirmSheet } from './TradeReviewConfirmSheet'

export const TradeReviewForm = () => {
  const [pendingRequest, setPendingRequest] = useState<TradeReviewRequest | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const reviewRequest = useRequestTradeReview()

  const openConfirm = (request: TradeReviewRequest) => {
    setPendingRequest(request)
    setIsConfirmOpen(true)
  }

  // 다시 열었을 때 지난 실패 문구가 남지 않도록 요청 상태도 함께 초기화합니다.
  const closeConfirm = () => {
    setIsConfirmOpen(false)
    reviewRequest.reset()
  }

  const requestReview = () => {
    if (!pendingRequest || reviewRequest.isPending) return
    reviewRequest.mutate(pendingRequest, { onSuccess: () => setIsConfirmOpen(false) })
  }

  return (
    <TradeReviewProvider onComplete={openConfirm}>
      <StockSection />
      <BuySection />
      <SellSection />
      <TradeReviewConfirmSheet
        open={isConfirmOpen}
        request={pendingRequest}
        isRequesting={reviewRequest.isPending}
        errorMessage={reviewRequest.isError ? 'AI 분석을 요청하지 못했어요. 잠시 후 다시 시도해주세요.' : undefined}
        onClose={closeConfirm}
        onConfirm={requestReview}
      />
    </TradeReviewProvider>
  )
}
