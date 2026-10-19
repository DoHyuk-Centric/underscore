import type { ReactNode } from 'react'
import { Button } from '@toss/tds-mobile'
import { Check } from 'lucide-react'
import { useTradeReview } from '../context/TradeReviewContext'
import type { TradeReviewStep } from '../hooks/useTradeReviewSteps'

export type FormSectionStatus = 'active' | 'done' | 'locked'

type FormSectionProps = {
  step: TradeReviewStep
  title: string
  description?: string
  summary?: ReactNode
  children: ReactNode
}

// 단계형 입력의 한 섹션입니다. 진행 중일 때만 입력과 "다음" 버튼을 펼치고, 끝난 단계는 요약과 수정 버튼만 보여줍니다.
export const FormSection = ({ step, title, description, summary, children }: FormSectionProps) => {
  const { statusOf, goToStep, isChecking, sectionRefs } = useTradeReview()
  const status = statusOf(step)
  const isActive = status === 'active'
  const isDone = status === 'done'

  return (
    <section
      ref={sectionRefs[step]}
      aria-label={title}
      className={`mx-2 scroll-mt-3 rounded-[20px] bg-white px-6 ${isActive ? 'pt-5 pb-5' : 'py-4'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className={`mt-px grid size-5.5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
              status === 'locked' ? 'bg-[#f2f4f6] text-[#b0b8c1]' : 'bg-[#e8f3ff] text-[#3182f6]'
            }`}
          >
            {isDone ? <Check className="size-3.5" strokeWidth={3} /> : step}
          </span>
          <div className="min-w-0">
            <h2
              className={`m-0 text-[17px] leading-6 font-bold tracking-[-0.4px] ${
                status === 'locked' ? 'text-[#b0b8c1]' : 'text-[#191f28]'
              }`}
            >
              {title}
            </h2>
            {isActive && description && (
              <p className="m-0 mt-0.5 text-[13px] leading-5 tracking-[-0.3px] break-keep text-[#8b95a1]">
                {description}
              </p>
            )}
            {isDone && summary && (
              <div className="mt-0.5 truncate text-[13px] leading-5 tracking-[-0.3px] text-[#6b7684]">{summary}</div>
            )}
          </div>
        </div>
        {isDone && (
          <button
            type="button"
            className="shrink-0 rounded-lg border-0 bg-[#f2f4f6] px-3 py-1.5 text-[13px] font-semibold text-[#4e5968] cursor-pointer active:bg-[#e5e8eb]"
            onClick={() => goToStep(step)}
          >
            수정
          </button>
        )}
      </div>
      {isActive && (
        <div className="mt-3">
          {children}
          <div className="mt-4">
            <Button type="submit" display="full" size="large" loading={isChecking}>
              다음
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
