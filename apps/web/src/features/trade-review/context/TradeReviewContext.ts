import { createContext, useContext, type RefObject } from 'react'
import type { KRXStock } from '@underscore/shared'
import type { FormSectionStatus } from '../components/FormSection'
import type { TradeReviewStep } from '../hooks/useTradeReviewSteps'

type TradeReviewContextValue = {
  stock: KRXStock | null
  selectStock: (stock: KRXStock) => void
  isChecking: boolean
  statusOf: (step: TradeReviewStep) => FormSectionStatus
  goToStep: (step: TradeReviewStep) => void
  sectionRefs: Record<TradeReviewStep, RefObject<HTMLElement>>
}

export const TradeReviewContext = createContext<TradeReviewContextValue | null>(null)

export const useTradeReview = () => {
  const value = useContext(TradeReviewContext)
  if (!value) throw new Error('useTradeReview는 TradeReviewProvider 안에서만 사용할 수 있어요.')
  return value
}
