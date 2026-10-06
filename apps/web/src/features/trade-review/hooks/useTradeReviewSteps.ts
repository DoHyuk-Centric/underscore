import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TradeReviewRequest } from '@underscore/shared'
import type { FormSectionStatus } from '../components/FormSection'
import type { TradeReviewFormMethods } from './useTradeReviewForm'
import { useMarketValidation } from './useMarketValidation'

export type TradeReviewStep = 1 | 2 | 3

type UseTradeReviewStepsOptions = {
  onComplete: (request: TradeReviewRequest) => void
}

// 종목 → 매수 → 매도 순서로 한 단계씩 검증하며 진행하고, 마지막 단계를 통과하면 onComplete를 호출합니다.
export const useTradeReviewSteps = (method: TradeReviewFormMethods, { onComplete }: UseTradeReviewStepsOptions) => {
  const validateMarket = useMarketValidation(method)
  const [step, setStep] = useState<TradeReviewStep>(1)
  const [isChecking, setIsChecking] = useState(false)

  // 새 단계가 열리면 그 섹션이 화면 위쪽에 오도록 스크롤합니다.
  const stockSectionRef = useRef<HTMLElement>(null)
  const buySectionRef = useRef<HTMLElement>(null)
  const sellSectionRef = useRef<HTMLElement>(null)
  const sectionRefs = { 1: stockSectionRef, 2: buySectionRef, 3: sellSectionRef }
  const hasMountedRef = useRef(false)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    sectionRefs[step].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // sectionRefs의 ref 객체들은 렌더링마다 같은 값이라 의존성에서 뺍니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const statusOf = (target: TradeReviewStep): FormSectionStatus =>
    target < step ? 'done' : target === step ? 'active' : 'locked'

  const checkCurrentStep = async () => {
    if (step === 1) {
      if (await method.trigger('stockCode')) setStep(2)
      return
    }

    if (step === 2) {
      if ((await method.trigger('buys')) && (await validateMarket('buys'))) setStep(3)
      return
    }

    await method.handleSubmit(async (request) => {
      if (await validateMarket('sells')) onComplete(request)
    })()
  }

  const handleNext = async (event: FormEvent) => {
    event.preventDefault()
    setIsChecking(true)
    try {
      await checkCurrentStep()
    } finally {
      setIsChecking(false)
    }
  }

  return {
    isChecking,
    statusOf,
    goToStep: setStep,
    handleNext,
    sectionRefs,
  }
}
