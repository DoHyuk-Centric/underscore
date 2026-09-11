import { SearchEmptyState } from './SearchEmptyState'
import { SearchExamples } from './SearchExamples'

export function SearchHint() {
  return (
    <SearchEmptyState icon="?" title="검색어는 최소 2글자를 적어주세요">
      <SearchExamples />
    </SearchEmptyState>
  )
}
