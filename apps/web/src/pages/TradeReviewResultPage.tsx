import { Button } from '@toss/tds-mobile'
import { ArrowLeft } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { TradeReview } from '@underscore/shared'
import { TradeReviewResult } from '../features/trade-review/components/TradeReviewResult'

// 복기 결과는 아직 저장하지 않아서, 입력 화면에서 넘겨준 결과가 없으면(새로고침 등) 입력 화면으로 돌아갑니다.
const TradeReviewResultPage = () => {
  const navigate = useNavigate()
  const review = (useLocation().state as { review?: TradeReview } | null)?.review

  if (!review) {
    return <Navigate to="/ai" replace />
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#f7f8fa] pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#f0f1f3] bg-white px-3 py-1">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#191f28] active:bg-[#f2f4f6]"
        >
          <ArrowLeft size={22} />
        </button>
        <strong className="text-[17px] font-bold text-[#191f28]">판단 리플레이</strong>
      </header>

      <div className="pt-3">
        <TradeReviewResult review={review} />
      </div>

      <div className="px-5 pt-5">
        <Button display="full" size="large" variant="weak" onClick={() => navigate('/ai', { replace: true })}>
          다른 거래 복기하기
        </Button>
        <p className="m-0 mt-3 text-center text-[11px] leading-4.5 break-keep text-[#8b95a1]">
          AI는 매수·매도를 추천하지 않아요. 남긴 근거와 확인된 사실을 비교해 정리했어요.
        </p>
      </div>
    </main>
  )
}

export default TradeReviewResultPage
