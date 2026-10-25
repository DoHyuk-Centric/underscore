import { useFormContext, useWatch } from 'react-hook-form'
import { fromDateKey } from '../../trade-date'
import type { TradeReviewFormValues } from '../../trade-review-form'
import { FormSection } from '../FormSection'
import { TradeEntryList } from '../TradeEntryList'
import { SellSummary } from '../TradeSummary'

export const SellSection = () => {
  const { control } = useFormContext<TradeReviewFormValues>()
  const buys = useWatch({ control, name: 'buys' })
  // 매도는 첫 매수일 이후로만 고를 수 있습니다.
  const firstBuyDate = fromDateKey(buys.map((entry) => entry.date).filter(Boolean).sort()[0] ?? '')

  return (
    <FormSection step={3} title="매도" description="첫 매수일 이후 날짜만 고를 수 있어요.">
      <TradeEntryList side="sells" minDate={firstBuyDate} />
      <SellSummary />
    </FormSection>
  )
}
