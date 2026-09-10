import { SearchField, type SearchFieldProps } from '@toss/tds-mobile'

export type SearchBarProps = SearchFieldProps

export function SearchBar(props: SearchBarProps) {
  return <SearchField placeholder="종목명을 입력해 주세요" {...props} />
}
