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

// 정수만 받아 천 단위 쉼표로 보여주고, 폼에는 숫자 값으로 넘깁니다.
// 원화 가격과 주식 수량에는 소수가 없으므로, 소수점이 들어오면 그 뒤는 버립니다.
// (점만 지우면 "270000.5"가 "2700005"로 이어 붙습니다.)
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
          const [integerPart] = event.target.value.split('.')
          const digits = integerPart.replace(/\D/g, '').slice(0, MAX_DIGITS)
          onChange(digits ? Number(digits) : undefined)
        }}
        onBlur={onBlur}
      />
    )
  },
)
