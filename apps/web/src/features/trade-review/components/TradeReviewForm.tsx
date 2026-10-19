import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TradeReviewRequest } from '@underscore/shared'
import { TradeReviewProvider } from '../context/TradeReviewProvider'
import { useRequestTradeReview } from '../hooks/useRequestTradeReview'
import { BuySection, SellSection, StockSection } from './sections'
import { TradeReviewConfirmSheet } from './TradeReviewConfirmSheet'

export const TradeReviewForm = () => {
  const navigate = useNavigate()
  const [pendingRequest, setPendingRequest] = useState<TradeReviewRequest | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const reviewRequest = useRequestTradeReview()

  const openConfirm = (request: TradeReviewRequest) => {
    setPendingRequest(request)
    setIsConfirmOpen(true)
  }

  // 분석 중에는 닫지 않습니다. 다시 열었을 때 지난 실패 문구가 남지 않도록 요청 상태도 함께 초기화합니다.
  const closeConfirm = () => {
    if (reviewRequest.isPending) return
    setIsConfirmOpen(false)
    reviewRequest.reset()
  }

  const requestReview = () => {
    if (!pendingRequest || reviewRequest.isPending) return
    reviewRequest.mutate(pendingRequest, {
      onSuccess: (review) => navigate('/ai/review', { state: { review } }),
    })
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
        errorMessage={reviewRequest.error?.message}
        onClose={closeConfirm}
        onConfirm={requestReview}
      />
    </TradeReviewProvider>
  )
}
