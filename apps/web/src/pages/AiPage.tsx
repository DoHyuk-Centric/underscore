import { TradeReviewForm } from '../features/trade-review/components/TradeReviewForm'

const AiPage = () => {
  return (
    <main className="flex min-h-full flex-col gap-3 bg-[#f7f8fa] pb-7">
      <header className="bg-white px-8 pt-5 pb-6">
        <p className="m-0 mb-2.5 text-xs leading-4.5 font-semibold tracking-[-0.2px] text-[#63758b]">판단 리플레이</p>
        <h1 className="m-0 text-[clamp(22px,6vw,26px)] leading-[1.4] font-bold tracking-[-1px] break-keep text-[#191f28]">
          지난 거래,
          <br />
          AI와 함께 복기해볼까요?
        </h1>
        <p className="m-0 mt-2 text-[13px] leading-5.25 tracking-[-0.35px] break-keep text-[#8b95a1]">
          실제 그날의 시세 안에서 거래한 기록만 남길 수 있어요.
        </p>
      </header>

      <TradeReviewForm />

      <p className="m-0 mt-2 px-8 text-center text-[11px] leading-4.5 break-keep text-[#8b95a1]">
        AI는 매수·매도를 추천하지 않아요. 남긴 근거와 실제 결과를 비교해 정리해드려요.
      </p>
    </main>
  )
}

export default AiPage
