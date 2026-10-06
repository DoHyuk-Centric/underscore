import { useState, type ReactNode } from 'react'
import type { KRXStock, TradeReviewRequest } from '@underscore/shared'
import { FormProvider } from 'react-hook-form'
import { useTradeReviewForm } from '../hooks/useTradeReviewForm'
import { useTradeReviewSteps } from '../hooks/useTradeReviewSteps'
import { TradeReviewContext } from './TradeReviewContext'

type TradeReviewProviderProps = {
  onComplete: (request: TradeReviewRequest) => void
  children: ReactNode
}

export const TradeReviewProvider = ({ onComplete, children }: TradeReviewProviderProps) => {
  const method = useTradeReviewForm()
  const [stock, setStock] = useState<KRXStock | null>(null)
  const { handleNext, ...steps } = useTradeReviewSteps(method, { onComplete })

  const selectStock = (selected: KRXStock) => {
    setStock(selected)
    method.setValue('stockCode', selected.stockCode, { shouldValidate: true, shouldTouch: true })
  }

  return (
    <FormProvider {...method}>
      <TradeReviewContext.Provider value={{ stock, selectStock, ...steps }}>
        <form noValidate className="flex flex-col gap-3" onSubmit={handleNext}>
          {children}
        </form>
      </TradeReviewContext.Provider>
    </FormProvider>
  )
}
