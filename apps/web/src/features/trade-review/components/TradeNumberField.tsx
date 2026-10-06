import { forwardRef } from 'react'
import { TextField } from '@toss/tds-mobile'

type TradeNumberFieldProps = {
  label: string
  placeholder: string
  suffix: string
  value: number | undefined
  errorMessage?: string
  onChange: (value: number | undefined) => void
  onBlur?: () => void
}

const MAX_DIGITS = 12

// 숫자만 받아 천 단위 쉼표로 보여주고, 폼에는 숫자 값으로 넘깁니다.
export const TradeNumberField = forwardRef<HTMLInputElement, TradeNumberFieldProps>(
  ({ label, placeholder, suffix, value, errorMessage, onChange, onBlur }, ref) => {
    return (
      <TextField
        ref={ref}
        variant="box"
        label={label}
        labelOption="sustain"
        placeholder={placeholder}
        suffix={suffix}
        inputMode="numeric"
        value={value === undefined ? '' : value.toLocaleString('ko-KR')}
        hasError={Boolean(errorMessage)}
        help={errorMessage}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS)
          onChange(digits ? Number(digits) : undefined)
        }}
        onBlur={onBlur}
      />
    )
  },
)
