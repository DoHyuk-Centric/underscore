import { useFormContext, useWatch } from 'react-hook-form'
import { averagePrice, formatNumber, sumQuantity, type TradeReviewFormValues } from '../trade-review-form'

export const BuySummary = () => {
  const { control } = useFormContext<TradeReviewFormValues>()
  const buys = useWatch({ control, name: 'buys' })
  const quantity = sumQuantity(buys)
  const average = averagePrice(buys)

  if (quantity === 0) return null

  return (
    <SummaryRow
      items={[
        ['총 매수', `${formatNumber(quantity)}주`],
        ['평균 단가', average === null ? '-' : `${formatNumber(average)}원`],
      ]}
    />
  )
}

export const SellSummary = () => {
  const { control } = useFormContext<TradeReviewFormValues>()
  const [buys, sells] = useWatch({ control, name: ['buys', 'sells'] })
  const sold = sumQuantity(sells)

  if (sold === 0) return null

  const remaining = sumQuantity(buys) - sold

  return (
    <SummaryRow
      items={[
        ['총 매도', `${formatNumber(sold)}주`],
        ['남은 수량', remaining === 0 ? '전량 매도' : `${formatNumber(remaining)}주`],
      ]}
    />
  )
}

const SummaryRow = ({ items }: { items: [string, string][] }) => (
  <dl className="m-0 mt-4 grid grid-cols-2 rounded-2xl bg-[#f9fafb] py-3">
    {items.map(([label, value]) => (
      <div key={label} className="px-4 not-first:border-l not-first:border-[#e5e8eb]">
        <dt className="text-xs text-[#8b95a1]">{label}</dt>
        <dd className="m-0 mt-0.5 text-[15px] font-semibold tabular-nums text-[#333d4b]">{value}</dd>
      </div>
    ))}
  </dl>
)
