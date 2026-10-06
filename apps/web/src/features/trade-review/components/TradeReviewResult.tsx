import type { ReactNode } from 'react'
import type { EvidenceStrength, TradeReview, TradeReviewSource } from '@underscore/shared'
import { ExternalLink } from 'lucide-react'
import { getChangeRatePresentation } from '../../../lib/change-rate-presentation'
import { formatTradeDate, fromDateKey } from '../trade-date'
import { formatNumber } from '../trade-review-form'

const EVIDENCE_LABEL: Record<EvidenceStrength, { text: string; className: string }> = {
  direct: { text: '직접 근거', className: 'bg-[#e8f3ff] text-[#3182f6]' },
  circumstantial: { text: '같은 기간에 나타난 일', className: 'bg-[#fff4e6] text-[#e5780b]' },
  unavailable: { text: '근거 부족', className: 'bg-[#f2f4f6] text-[#6b7684]' },
}

const formatDateKey = (key: string) => {
  const date = fromDateKey(key)
  return date ? formatTradeDate(date) : key
}

export const TradeReviewResult = ({ review }: { review: TradeReview }) => {
  // 출처 칩에 ID 대신 제목을 보여주려고 ID → 출처로 찾아 둡니다.
  const sourceById = new Map(review.sources.map((source) => [source.sourceId, source]))

  return (
    <div className="flex flex-col gap-3">
      <OutcomeCard review={review} />

      <ResultCard title="근거와 결과">
        <p className="m-0 text-[15px] leading-6.5 break-keep text-[#333d4b]">{review.thesisVsOutcome}</p>
      </ResultCard>

      {review.confirmedFacts.length > 0 && (
        <ResultCard title="확인된 사실">
          <ul className="m-0 grid list-none gap-3 p-0">
            {review.confirmedFacts.map((fact) => (
              <li key={fact.text}>
                <p className="m-0 text-[15px] leading-6 break-keep text-[#333d4b]">{fact.text}</p>
                <SourceChips ids={fact.sourceIds} sourceById={sourceById} />
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      {review.possibleFactors.length > 0 && (
        <ResultCard title="결과에 영향을 줬을 수 있는 요인" description="확인된 원인이 아니라, 함께 볼 만한 가능성이에요.">
          <ul className="m-0 grid list-none gap-4 p-0">
            {review.possibleFactors.map((factor) => (
              <li key={factor.factor}>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-[15px] text-[#191f28]">{factor.factor}</strong>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${EVIDENCE_LABEL[factor.evidenceStrength].className}`}
                  >
                    {EVIDENCE_LABEL[factor.evidenceStrength].text}
                  </span>
                </div>
                <p className="m-0 mt-1 text-sm leading-5.5 break-keep text-[#4e5968]">{factor.reason}</p>
                <SourceChips ids={factor.sourceIds} sourceById={sourceById} />
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      {review.userJudgmentItems.length > 0 && (
        <ResultCard title="내가 판단할 부분" description="AI가 정답을 정하지 않는 부분이에요. 확인된 사실을 보고 직접 돌아봐요.">
          <ul className="m-0 grid list-none gap-3 p-0">
            {review.userJudgmentItems.map((item) => (
              <li key={item.topic} className="rounded-2xl bg-[#f9fafb] px-4 py-3.5">
                <strong className="block text-[15px] leading-6 break-keep text-[#191f28]">{item.topic}</strong>
                <ul className="m-0 mt-2 grid gap-1 pl-4.5 text-sm leading-5.5 text-[#4e5968]">
                  {item.knownFacts.map((fact) => (
                    <li key={fact} className="break-keep">
                      {fact}
                    </li>
                  ))}
                </ul>
                <p className="m-0 mt-2 text-[13px] leading-5 break-keep text-[#8b95a1]">{item.whyUserJudgment}</p>
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      {review.glossary.length > 0 && (
        <ResultCard title="용어 풀이">
          <dl className="m-0 grid gap-3">
            {review.glossary.map((entry) => (
              <div key={entry.term}>
                <dt className="text-sm font-semibold text-[#333d4b]">{entry.term}</dt>
                <dd className="m-0 mt-0.5 text-sm leading-5.5 break-keep text-[#6b7684]">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </ResultCard>
      )}

      {review.sources.length > 0 && (
        <ResultCard title="출처">
          <ul className="m-0 grid list-none gap-2.5 p-0">
            {review.sources.map((source) => (
              <li key={source.sourceId} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 break-keep text-[#4e5968]">
                  {source.title}
                  <span className="ml-1.5 text-xs text-[#8b95a1]">{formatDateKey(source.date)}</span>
                </span>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${source.title} 원문 보기`}
                    className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#3182f6]"
                  >
                    원문
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </ResultCard>
      )}
    </div>
  )
}

const OutcomeCard = ({ review }: { review: TradeReview }) => {
  const { metrics } = review
  const returnRate = getChangeRatePresentation(metrics.returnPercent)

  return (
    <section aria-label="거래 결과" className="mx-2 rounded-[20px] bg-white px-6 py-5">
      <p className="m-0 text-[13px] text-[#8b95a1]">
        {metrics.stockName} · {formatDateKey(metrics.firstBuyDate)} ~ {formatDateKey(metrics.lastSellDate)}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <strong className={`text-[28px] font-bold tracking-[-0.5px] ${returnRate.className}`}>{returnRate.text}</strong>
        <span className={`text-[15px] font-semibold ${returnRate.className}`}>
          {metrics.realizedProfit > 0 ? '+' : ''}
          {formatNumber(metrics.realizedProfit)}원
        </span>
      </div>
      <dl className="m-0 mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-[#f9fafb] py-3 text-center">
        <Metric label="보유 기간" value={metrics.holdingDays === 0 ? '당일' : `${metrics.holdingDays}일`} />
        <Metric label="평균 매수가" value={`${formatNumber(metrics.averageBuyPrice)}원`} />
        <Metric label="평균 매도가" value={`${formatNumber(metrics.averageSellPrice)}원`} />
      </dl>
      {metrics.remainingQuantity > 0 && (
        <p className="m-0 mt-2 text-xs text-[#8b95a1]">
          아직 팔지 않은 {formatNumber(metrics.remainingQuantity)}주는 손익에 넣지 않았어요.
        </p>
      )}
      <p className="m-0 mt-4 text-[15px] leading-6.5 font-medium break-keep text-[#191f28]">{review.summary}</p>
    </section>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-[#8b95a1]">{label}</dt>
    <dd className="m-0 mt-0.5 text-sm font-semibold tabular-nums text-[#333d4b]">{value}</dd>
  </div>
)

const ResultCard = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <section aria-label={title} className="mx-2 rounded-[20px] bg-white px-6 py-5">
    <h2 className="m-0 text-[17px] leading-6 font-bold tracking-[-0.4px] text-[#191f28]">{title}</h2>
    {description && (
      <p className="m-0 mt-0.5 text-[13px] leading-5 break-keep text-[#8b95a1]">{description}</p>
    )}
    <div className="mt-3">{children}</div>
  </section>
)

const SourceChips = ({ ids, sourceById }: { ids: string[]; sourceById: Map<string, TradeReviewSource> }) => (
  <div className="mt-1.5 flex flex-wrap gap-1">
    {ids.map((id) => (
      <span key={id} className="rounded-md bg-[#f2f4f6] px-1.5 py-0.5 text-[11px] text-[#6b7684]">
        {sourceById.get(id)?.title ?? id}
      </span>
    ))}
  </div>
)
