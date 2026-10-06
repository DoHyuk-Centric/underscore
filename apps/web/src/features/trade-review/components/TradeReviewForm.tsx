import { useRef, useState } from 'react'
import type { TradeReviewRequest } from '@underscore/shared'
import { http } from '../../../lib/http'
import { TradeReviewProvider } from '../context/TradeReviewProvider'
import { BuySection, SellSection, StockSection } from './sections'
import { TradeReviewConfirmSheet } from './TradeReviewConfirmSheet'

export const TradeReviewForm = () => {
  const [pendingRequest, setPendingRequest] = useState<TradeReviewRequest | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const isRequesting = useRef(false)

  const openConfirm = (request: TradeReviewRequest) => {
    setPendingRequest(request)
    setIsConfirmOpen(true)
  }

  const requestReview = async () => {
    if (!pendingRequest || isRequesting.current) return

    isRequesting.current = true
    setReviewError(null)

    try {
      await http.post('/trade-review', pendingRequest, { timeout: 60000 })
      setIsConfirmOpen(false)
    } catch {
      setReviewError('AI 분석을 요청하지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      isRequesting.current = false
    }
  }

  return (
    <TradeReviewProvider onComplete={openConfirm}>
      <StockSection />
      <BuySection />
      <SellSection />
      {reviewError && <p role="alert">{reviewError}</p>}
      <TradeReviewConfirmSheet
        open={isConfirmOpen}
        request={pendingRequest}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={requestReview}
      />
    </TradeReviewProvider>
  )
}
