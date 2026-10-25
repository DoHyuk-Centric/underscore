import { useController, useFormContext } from 'react-hook-form'
import { useTradeReview } from '../../context/TradeReviewContext'
import type { TradeReviewFormValues } from '../../trade-review-form'
import { FormSection } from '../FormSection'
import { StockPickerField } from '../StockPickerField'

export const StockSection = () => {
  const { control } = useFormContext<TradeReviewFormValues>()
  const { fieldState } = useController({ control, name: 'stockCode' })
  const { stock, selectStock } = useTradeReview()

  return (
    <FormSection step={1} title="종목" summary={stock && `${stock.name} · ${stock.stockCode}`}>
      <StockPickerField stock={stock} errorMessage={fieldState.error?.message} onChange={selectStock} />
    </FormSection>
  )
}
