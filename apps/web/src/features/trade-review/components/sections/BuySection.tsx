import { useFormContext, useWatch } from 'react-hook-form'
import { describeEntries, type TradeReviewFormValues } from '../../trade-review-form'
import { FormSection } from '../FormSection'
import { TradeEntryList } from '../TradeEntryList'
import { BuySummary } from '../TradeSummary'

export const BuySection = () => {
  const { control } = useFormContext<TradeReviewFormValues>()
  const buys = useWatch({ control, name: 'buys' })

  return (
    <FormSection
      step={2}
      title="매수"
      description="분할 매수했다면 건별로 추가해주세요."
      summary={describeEntries(buys)}
    >
      <TradeEntryList side="buys" />
      <BuySummary />
    </FormSection>
  )
}
