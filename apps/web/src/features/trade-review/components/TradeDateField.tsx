import { useState, type ReactNode } from 'react'
import { BottomSheet, DatePicker, TextField } from '@toss/tds-mobile'
import { EARLIEST_TRADE_DATE, formatTradeDate, isWeekend, latestTradeDate } from '../trade-date'

type TradeDateFieldProps = {
  label: string
  placeholder: string
  value: Date | null
  minDate?: Date | null
  errorMessage?: string
  help?: ReactNode
  onChange: (date: Date) => void
}

export const TradeDateField = ({
  label,
  placeholder,
  value,
  minDate,
  errorMessage,
  help,
  onChange,
}: TradeDateFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const maxDate = latestTradeDate()

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return
    onChange(date)
    setIsOpen(false)
  }

  return (
    <>
      <TextField.Button
        variant="box"
        label={label}
        labelOption="sustain"
        placeholder={placeholder}
        value={value ? formatTradeDate(value) : ''}
        focused={isOpen}
        hasError={Boolean(errorMessage)}
        help={errorMessage ?? help}
        onClick={() => setIsOpen(true)}
      />
      <BottomSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        header={<BottomSheet.Header>{label}</BottomSheet.Header>}
        headerDescription={
          <BottomSheet.HeaderDescription>시세가 공개된 어제까지, 장이 열린 평일만 고를 수 있어요.</BottomSheet.HeaderDescription>
        }
      >
        <DatePicker
          selectedDate={value ?? undefined}
          initialMonth={value ?? maxDate}
          minSelectableDate={minDate ?? EARLIEST_TRADE_DATE}
          maxSelectableDate={maxDate}
          maxVisibleMonth={maxDate}
          disabledDate={isWeekend}
          onDateChange={handleDateChange}
        />
      </BottomSheet>
    </>
  )
}
