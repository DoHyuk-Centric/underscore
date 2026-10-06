import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { getMaxTradeQuantity, getTradeEntryPriceIssues } from '@underscore/shared'
import { useDailyPrice } from '../hooks/useDailyPrice'
import { fromDateKey, toDateKey } from '../trade-date'
import {
  createEmptyEntry,
  formatNumber,
  MAX_TRADE_ENTRIES,
  TRADE_SIDE_LABEL,
  type TradeReviewFormValues,
  type TradeSide,
} from '../trade-review-form'
import { TradeDateField } from './TradeDateField'
import { TradeNumberField } from './TradeNumberField'
import { TradeReasonField } from './TradeReasonField'

const REASON_PLACEHOLDER: Record<TradeSide, string> = {
  buys: '예) 2분기 실적이 컨센서스를 웃돌 거라 봤어요.',
  sells: '예) 목표했던 수익률 10%에 도달해서 팔았어요.',
}

type TradeEntryListProps = {
  side: TradeSide
  minDate?: Date | null
}

export const TradeEntryList = ({ side, minDate }: TradeEntryListProps) => {
  const { control } = useFormContext<TradeReviewFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: side })
  const sideLabel = TRADE_SIDE_LABEL[side]

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id} className={index > 0 ? 'mt-4 border-t border-[#f2f4f6] pt-4' : undefined}>
          <div className="mb-1 flex items-center justify-between">
            <strong className="text-[15px] tracking-[-0.3px] text-[#333d4b]">
              {index + 1}차 {sideLabel}
            </strong>
            {fields.length > 1 && (
              <button
                type="button"
                className="rounded-md border-0 bg-transparent px-1.5 py-1 text-[13px] text-[#8b95a1] cursor-pointer active:bg-[#f2f4f6]"
                onClick={() => remove(index)}
              >
                삭제
              </button>
            )}
          </div>
          <TradeEntryFields side={side} index={index} minDate={minDate} />
        </div>
      ))}

      {fields.length < MAX_TRADE_ENTRIES && (
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border-0 bg-[#f2f4f6] py-3.5 text-[15px] font-semibold text-[#4e5968] cursor-pointer transition-colors active:bg-[#e5e8eb]"
          onClick={() => append(createEmptyEntry())}
        >
          <Plus aria-hidden="true" className="size-4.5" />
          분할 {sideLabel} 추가
        </button>
      )}
    </div>
  )
}

type TradeEntryFieldsProps = {
  side: TradeSide
  index: number
  minDate?: Date | null
}

const TradeEntryFields = ({ side, index, minDate }: TradeEntryFieldsProps) => {
  const { control } = useFormContext<TradeReviewFormValues>()
  const sideLabel = TRADE_SIDE_LABEL[side]
  const [stockCode, watchedEntry] = useWatch({ control, name: ['stockCode', `${side}.${index}`] })
  // 삭제 직후 한 번은 이미 사라진 index로 렌더될 수 있습니다.
  const entry = watchedEntry ?? createEmptyEntry()
  const { dailyPrice, error: dailyPriceError, isFetching } = useDailyPrice(stockCode, entry.date)

  // 서버 시세와 맞지 않는 값은 "다음"을 누르기 전에도 바로 알려줍니다.
  const priceIssues = dailyPrice ? getTradeEntryPriceIssues(entry, dailyPrice) : []
  const issueMessage = (field: 'price' | 'quantity') => priceIssues.find((issue) => issue.field === field)?.message

  const dateHelp = isFetching
    ? '이날 시세를 확인하고 있어요.'
    : dailyPrice
      ? `이날 ${formatNumber(dailyPrice.low)}~${formatNumber(dailyPrice.high)}원 · 종가 ${formatNumber(dailyPrice.close)}원`
      : undefined

  return (
    <div className="-mx-6">
      <Controller
        control={control}
        name={`${side}.${index}.date`}
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <TradeDateField
            label={`${sideLabel} 날짜`}
            placeholder={`언제 ${side === 'buys' ? '샀나요' : '팔았나요'}?`}
            value={fromDateKey(value)}
            minDate={minDate}
            errorMessage={fieldState.error?.message ?? dailyPriceError?.message}
            help={dateHelp}
            onChange={(date) => {
              onChange(toDateKey(date))
              onBlur()
            }}
          />
        )}
      />
      <Controller
        control={control}
        name={`${side}.${index}.price`}
        render={({ field, fieldState }) => (
          <TradeNumberField
            {...field}
            label={`${sideLabel} 가격`}
            placeholder={dailyPrice ? `종가 ${formatNumber(dailyPrice.close)}` : '1주당 가격'}
            suffix="원"
            errorMessage={fieldState.error?.message ?? issueMessage('price')}
          />
        )}
      />
      <Controller
        control={control}
        name={`${side}.${index}.quantity`}
        render={({ field, fieldState }) => (
          <TradeNumberField
            {...field}
            label={`${sideLabel} 수량`}
            placeholder={dailyPrice ? `최대 ${formatNumber(getMaxTradeQuantity(dailyPrice))}주` : '몇 주'}
            suffix="주"
            errorMessage={fieldState.error?.message ?? issueMessage('quantity')}
          />
        )}
      />
      <Controller
        control={control}
        name={`${side}.${index}.reason`}
        render={({ field, fieldState }) => (
          <TradeReasonField
            {...field}
            label={`${sideLabel} 근거${index > 0 ? ' (선택)' : ''}`}
            placeholder={REASON_PLACEHOLDER[side]}
            guide={index > 0 ? '이번 분할 거래만의 이유가 있다면 적어주세요.' : '구체적일수록 복기가 정확해져요.'}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </div>
  )
}
