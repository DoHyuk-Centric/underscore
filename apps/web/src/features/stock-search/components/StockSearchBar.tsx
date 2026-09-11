import { SearchField, type SearchFieldProps } from '@toss/tds-mobile'

export type StockSearchBarProps = SearchFieldProps

export function StockSearchBar(props: StockSearchBarProps) {
  return (
    <SearchField
      placeholder="종목명이나 종목코드를 입력해주세요"
      {...props}
    />
  )
}
