import type { ReactNode } from 'react'
import { BottomSheet, Button } from '@toss/tds-mobile'
import type { KRXStock, TradeReviewRequest } from '@underscore/shared'
import { getChangeRatePresentation } from '../../../lib/change-rate-presentation'
import { useTradeReview } from '../context/TradeReviewContext'
import { countHoldingDays, formatTradeDate, fromDateKey } from '../trade-date'
import { averagePrice, describeEntries } from '../trade-review-form'

type TradeReviewConfirmSheetProps = {
  open: boolean
  request: TradeReviewRequest | null
  onClose: () => void
  onConfirm: () => void
}

export const TradeReviewConfirmSheet = ({ open, request, onClose, onConfirm }: TradeReviewConfirmSheetProps) => {
  const { stock } = useTradeReview()

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      header={<BottomSheet.Header>이 거래로 분석할까요?</BottomSheet.Header>}
      headerDescription={
        <BottomSheet.HeaderDescription>남긴 근거와 실제 결과를 비교해 복기해드려요.</BottomSheet.HeaderDescription>
      }
      cta={
        <BottomSheet.DoubleCTA
          leftButton={
            <Button type="button" color="light" variant="weak" onClick={onClose}>
              더 수정할게요
            </Button>
          }
          rightButton={
            <Button type="button" onClick={onConfirm}>
              AI 분석 받기
            </Button>
          }
        />
      }
    >
      {request && <TradeReviewSummary stock={stock} request={request} />}
    </BottomSheet>
  )
}

const TradeReviewSummary = ({ stock, request }: { stock: KRXStock | null; request: TradeReviewRequest }) => {
  const buyDates = request.buys.map((entry) => entry.date).sort()
  const sellDates = request.sells.map((entry) => entry.date).sort()
  const firstBuyDate = fromDateKey(buyDates[0])!
  const lastSellDate = fromDateKey(sellDates[sellDates.length - 1])!
  const holdingDays = countHoldingDays(firstBuyDate, lastSellDate)

  const averageBuy = averagePrice(request.buys) ?? 0
  const averageSell = averagePrice(request.sells) ?? 0
  const returnRate = getChangeRatePresentation((averageSell / averageBuy - 1) * 100)

  const rows: [string, ReactNode][] = [
    ['매수', describeEntries(request.buys)],
    ['매도', describeEntries(request.sells)],
    [
      '보유 기간',
      `${formatTradeDate(firstBuyDate)} ~ ${formatTradeDate(lastSellDate)} · ${
        holdingDays === 0 ? '당일' : `${holdingDays}일`
      }`,
    ],
    ['매도분 수익률', <span key="return-rate" className={`font-bold ${returnRate.className}`}>{returnRate.text}</span>],
  ]

  return (
    <div className="px-6 pb-2">
      {stock && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f9fafb] px-4 py-3.5">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[15px] font-bold text-[#3182f6]"
          >
            {stock.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <strong className="block truncate text-base leading-5.5 tracking-[-0.3px] text-[#191f28]">
              {stock.name}
            </strong>
            <span className="block text-xs leading-4.5 text-[#8b95a1]">
              {stock.stockCode} · {stock.market}
            </span>
          </div>
        </div>
      )}
      <dl className="m-0 grid gap-3 px-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-sm text-[#8b95a1]">{label}</dt>
            <dd className="m-0 text-right text-sm font-medium tabular-nums break-keep text-[#333d4b]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
