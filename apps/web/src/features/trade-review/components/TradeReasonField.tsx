import { forwardRef } from 'react'
import { TextArea } from '@toss/tds-mobile'
import { MAX_TRADE_REASON_LENGTH } from '@underscore/shared'

type TradeReasonFieldProps = {
  label: string
  placeholder: string
  value: string
  errorMessage?: string
  guide: string
  onChange: (value: string) => void
  onBlur?: () => void
}

export const TradeReasonField = forwardRef<HTMLTextAreaElement, TradeReasonFieldProps>(
  ({ label, placeholder, value, errorMessage, guide, onChange, onBlur }, ref) => {
    return (
      <TextArea
        ref={ref}
        variant="box"
        label={label}
        labelOption="sustain"
        placeholder={placeholder}
        value={value}
        maxLength={MAX_TRADE_REASON_LENGTH}
        minHeight={96}
        hasError={Boolean(errorMessage)}
        help={
          <span className="flex justify-between gap-2">
            <span>{errorMessage ?? guide}</span>
            <span className="tabular-nums">
              {value.length}/{MAX_TRADE_REASON_LENGTH}
            </span>
          </span>
        }
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    )
  },
)
