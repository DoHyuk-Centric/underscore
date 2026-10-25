import { useState } from 'react'
import { BottomSheet } from '@toss/tds-mobile'
import type { KRXStock } from '@underscore/shared'
import { Search } from 'lucide-react'
import { StockSearchBar } from '../../stock-search/components/StockSearchBar'
import { StockSearchResults } from '../../stock-search/components/StockSearchResults'
import { useStockSearch } from '../../stock-search/hooks/useStockSearch'

type StockPickerFieldProps = {
  stock: KRXStock | null
  errorMessage?: string
  onChange: (stock: KRXStock) => void
}

export const StockPickerField = ({ stock, errorMessage, onChange }: StockPickerFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchState = useStockSearch(query)

  const handleSelect = (selected: KRXStock) => {
    onChange(selected)
    setIsOpen(false)
  }

  return (
    <>
      {stock ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f2f4f6] py-3.5 pr-3 pl-4">
          <div className="flex min-w-0 items-center gap-3">
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
          <button
            type="button"
            className="shrink-0 rounded-lg border-0 bg-white px-3 py-1.5 text-[13px] font-semibold text-[#4e5968] cursor-pointer active:bg-[#e5e8eb]"
            onClick={() => setIsOpen(true)}
          >
            변경
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`flex w-full items-center gap-2.5 rounded-2xl border-0 bg-[#f2f4f6] px-4 py-4 text-left cursor-pointer transition-colors active:bg-[#e5e8eb] ${
            errorMessage ? 'outline-2 outline-[#f04452]' : ''
          }`}
          onClick={() => setIsOpen(true)}
        >
          <Search aria-hidden="true" className="size-5 text-[#8b95a1]" />
          <span className="text-[15px] tracking-[-0.3px] text-[#8b95a1]">어떤 종목을 거래했나요?</span>
        </button>
      )}
      {errorMessage && <p className="m-0 mt-2 px-1 text-[13px] text-[#f04452]">{errorMessage}</p>}

      <BottomSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onExited={() => setQuery('')}
        header={<BottomSheet.Header>종목 선택</BottomSheet.Header>}
        hasTextField
      >
        <div className="flex h-[60vh] flex-col px-2">
          <StockSearchBar
            value={query}
            autoFocus
            aria-label="종목명 또는 종목코드 검색"
            placeholder="종목명 또는 종목코드 검색"
            onChange={(event) => setQuery(event.target.value)}
            onDeleteClick={() => setQuery('')}
          />
          <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
            <StockSearchResults query={query} {...searchState} onSelect={handleSelect} />
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
